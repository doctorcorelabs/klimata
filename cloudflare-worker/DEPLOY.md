# Deploying the Chatbot Cloudflare Worker

This document explains how to deploy the `chatbot-worker.ts` to Cloudflare using Wrangler, and how to connect the frontend.

Prerequisites
- Node.js (v16+ recommended)
- npm installed
- A Cloudflare account and a Workers API token (with `Account Workers Admin` permissions) or `wrangler login` access

1) Install Wrangler
```powershell
npm install -g wrangler
```

2) Login (interactive) or set API token
- Interactive (recommended for local deploy):
```powershell
wrangler login
```

- Or use an API token (recommended for CI): create a token in Cloudflare Dashboard and set it as `CLOUDFLARE_API_TOKEN` in your environment or CI secrets.

3) Add your OpenRouter API key as a secret for the Worker
Locally (interactive):
```powershell
wrangler secret put OPENROUTER_API_KEY
# paste your OPENROUTER API key when prompted
```

In CI/CD: store `OPENROUTER_API_KEY` as a GitHub secret and configure your pipeline to create the secret in Cloudflare (see notes below).

4) (Optional) Set `account_id` in `cloudflare-worker/wrangler.toml` or provide it via environment when publishing.

5) Publish locally:
```powershell
# from project root or cloudflare-worker directory
cd cloudflare-worker
wrangler publish
```

6) Use the deployed worker URL in your frontend
- If published as `klimata-chatbot-worker` the default URL will be `https://klimata-chatbot-worker.YOUR_WORKERS_SUBDOMAIN.workers.dev` or shown by `wrangler publish` output.
- Set `VITE_CHATBOT_WORKER_URL` in your frontend `.env`:
```
VITE_CHATBOT_WORKER_URL=https://<YOUR_WORKER_URL>
```
Restart your dev server after changing env.

CI/CD (GitHub Actions) notes
- A minimal workflow to run `wrangler publish` requires `CLOUDFLARE_API_TOKEN` in `secrets`.
- Secrets for `OPENROUTER_API_KEY` should be stored securely; deploying them to Cloudflare can be done via `wrangler secret put` in the workflow, but that requires the token to have appropriate permissions. For many workflows it's safer to manually set the secret in the Cloudflare dashboard or run `wrangler secret put` once from a machine with access.

Automatic secret provisioning in CI
- The included GitHub Actions workflow contains a step that attempts to set `OPENROUTER_API_KEY` in Cloudflare using `wrangler secret put` non-interactively. This requires two GitHub Secrets to be configured in your repository:
	- `CLOUDFLARE_API_TOKEN` — an API token with `Account: Workers Scripts: Edit` and `Account: Workers KV:Edit` (or full Workers admin) permissions so it can `wrangler secret put` and publish.
	- `OPENROUTER_API_KEY` — your OpenRouter API key.

Example: add both secrets in your GitHub repo Settings -> Secrets -> Actions. The workflow will pipe the `OPENROUTER_API_KEY` value into `wrangler secret put` so it can be stored on Cloudflare before publishing.

Security note: grant the minimal permissions needed to the `CLOUDFLARE_API_TOKEN`. If you prefer not to provision secrets from CI, remove the secret step from the workflow and set `OPENROUTER_API_KEY` manually in the Cloudflare dashboard.

Security notes
- Never embed `OPENROUTER_API_KEY` in client-side code.
- Restrict allowed origins in the Worker CORS response for production.
- Consider size limits or offloading large uploads to storage (Cloudflare Images, S3) to avoid very large payloads.

If you want, I can add a GitHub Actions workflow template to this repo that runs `wrangler publish` (you will still need to add `CLOUDFLARE_API_TOKEN` and `OPENROUTER_API_KEY` to repo secrets).