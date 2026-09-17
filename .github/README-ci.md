# Setting up the checks

The workflow in `.github/workflows/checks.yml` needs five repository
secrets before its `live` job can run. Settings, Secrets and variables,
Actions, New repository secret, one each:

| Secret | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase, Project settings, API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, the service role key |
| `DIRECT_URL` | Supabase, Project settings, Database, the direct connection string |
| `CRON_SECRET` | Vercel, the same value the deployment holds |

Copy each straight from its dashboard into GitHub. Nothing goes through
chat, a message or a file in the repo.

Until they are set, the `build` job runs on every push and the `live` job
fails at its first step, which is the correct behaviour: a missing secret
should be loud.
