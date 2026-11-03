<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep reminder scheduling and message generation in a browser-safe domain module with date-based tests; previewing an email must never send it or record a send.
- Activate real email delivery only after the owned sender domain is configured; do not fabricate delivery history or build custom managed-email queues.
