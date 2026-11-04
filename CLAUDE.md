# Deploying

Use `tools/deploy/deploy.sh`; it needs no `wrangler login` or `stripe login`.

- `tools/deploy/deploy.sh check` verifies credentials and Stripe prices without deploying.
- `tools/deploy/deploy.sh preview` deploys a preview.
- `tools/deploy/deploy.sh production` deploys live. Run it only when the user explicitly asks.

Credentials are in `~/.config/miraverse/deploy.env`. Never print, read or commit that file. If it is missing, ask the user to run `tools/deploy/deploy.sh setup` in their own terminal.

`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are Cloudflare Pages secrets, so a deploy does not need them locally.
