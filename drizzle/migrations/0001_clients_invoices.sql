CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) <= 255),
  company text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own clients" ON public.clients FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX clients_user_idx ON public.clients(user_id);

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  number text NOT NULL CHECK (char_length(number) BETWEEN 1 AND 50),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  issue_date date NOT NULL DEFAULT current_date,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own invoices" ON public.invoices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.user_id = auth.uid()));
CREATE INDEX invoices_user_idx ON public.invoices(user_id);

CREATE OR REPLACE FUNCTION public.enforce_invoice_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p text; n int; lim int;
BEGIN
  SELECT plan INTO p FROM public.profiles WHERE id = NEW.user_id;
  lim := CASE COALESCE(p,'starter') WHEN 'starter' THEN 5 WHEN 'pro' THEN 100 ELSE NULL END;
  IF lim IS NOT NULL THEN
    SELECT count(*) INTO n FROM public.invoices WHERE user_id = NEW.user_id;
    IF n >= lim THEN RAISE EXCEPTION 'INVOICE_LIMIT:%', lim; END IF;
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.enforce_invoice_limit() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER invoices_limit BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.enforce_invoice_limit();