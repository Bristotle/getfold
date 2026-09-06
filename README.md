# Fold

Configurable church management for Ghanaian churches — Next.js + Supabase.

This is a starter scaffold, not a finished app. It establishes the
architecture decisions that are expensive to change later (multi-tenancy,
auth, data model, brand tokens) so the actual feature-building can move
fast and consistently from here. Hand this repo + this README to Claude
Code and work through the roadmap below.

## Stack

- **Next.js 16** (App Router, Server Components + Server Actions)
- **Supabase** — Postgres, Auth, Storage, all on the free tier to start
- **Prisma** — schema/migrations and typed queries for admin-side work
- **Tailwind v4** — brand tokens defined in `src/app/globals.css`

## Why this architecture

**One Supabase project, multi-tenant, not one project per church.**
Every church is a row in `organizations`. A user's access to a church is
a row in `organization_members` with a role. Postgres Row-Level Security
(`supabase/migrations/0001_init.sql`) enforces that a user can only ever
read/write rows belonging to organizations they're a member of — this is
enforced by the database itself, not by application code remembering to
filter correctly. This is what lets the whole platform run on Supabase's
free tier through hundreds of churches, instead of paying per-tenant
infrastructure costs.

**Two different DB clients, on purpose:**
- `src/lib/supabase/{client,server}.ts` — uses the anon key + the signed-in
  user's session. RLS applies. **Use this for anything rendered to a
  specific user.**
- `prisma/schema.prisma` + Prisma Client — connects with full database
  access and **bypasses RLS**. Use this only for migrations, seed
  scripts, and genuinely platform-level admin tooling. Never use Prisma
  to serve a query straight to a logged-in user's dashboard — it has no
  tenant boundary of its own.

**Configurable data model, not denomination-specific.** `memberType` on
`Member` and `name`/`type` on `MemberGroup` are free text, not hardcoded
enums — a Methodist society's "Full Member / Junior Member / Catechumen /
Adherent" and a Pentecostal assembly's "Covenant Member / New Convert"
both fit without a schema change. `Organization` supports an optional
parent (`parentOrganizationId`) so a denominational hierarchy (Diocese >
Circuit > Society) can exist where relevant, but nothing requires it —
an independent church just has no parent.

## Setup

1. Create a Supabase project at supabase.com (free tier).
2. Copy `.env.example` to `.env` and fill in the four values.
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` →
     Settings > API Keys
   - `DATABASE_URL` → pooled ("Transaction mode", port 6543)
   - `DIRECT_URL` → session pooler (port 5432); migrations run through
     this because the transaction pooler doesn't support them
   - If your database password contains URL-reserved characters
     (`?`, `#`, `@`, `/`, `%`, `:`), percent-encode them or the
     connection string will silently parse wrong — `?` in particular
     starts the query string.
3. `npm install`
4. `npm run prisma:deploy` — creates all tables from
   `prisma/migrations/`.
5. Apply the SQL files in `supabase/migrations/` **in numeric order**
   (Supabase SQL Editor, or `npx prisma db execute --file <path>`):
   - `0002_rls.sql` — profile-creation trigger and every RLS policy.
     **The app is not safe to use without this step.**
   - `0003_onboarding.sql` — `create_organization()`, the only way a new
     user can create their first church (RLS otherwise makes it
     impossible — see the comments in that file).
   - `0004_dashboard_stats.sql` — `dashboard_stats()` aggregates.

   `supabase/APPLY_ME.sql` bundles the tables + RLS into one paste-able
   script if you'd rather not use the CLI.
6. In Supabase, Authentication > Sign In / Providers > Email: turn
   **Confirm email** off for local development, or you'll have to click a
   confirmation link before every test account can sign in. Leave it ON
   in production.
7. `npm run dev` — visit `localhost:3000`

### Team, roles and invitations

`/team` (administrators only) is where people are invited and roles are
assigned. An invitation is keyed by **email address**, not user id, because
the invitee usually has no account yet: invite the address they will sign up
with, and `accept_pending_invitations()` converts it into real membership the
moment they land on `/onboarding`.

Acceptance has the same bootstrap problem as creating the first church —
`organization_members` INSERT requires you to already be an admin of that
org, which an invitee never is — so it goes through a SECURITY DEFINER
function that acts only on invitations matching the caller's own verified
email (`supabase/migrations/0007_invitations.sql`).

A `prevent_last_admin_removal` trigger refuses to demote or remove an
organization's final administrator. That guard lives in the database, not the
UI, so no code path can lock a church out of its own account.

The trigger deliberately stands down when the **organisation itself** is being
deleted: a cascade from `organizations` reaches the last admin's membership
row, and without that exemption an organisation could never be deleted at all.
For the same reason, always delete an org by deleting the `organizations` row
and letting the cascade run — deleting `organization_members` directly will
trip the guard.

### Testing accounts — read before creating one

Never sign up test users with made-up addresses at a real mail domain
(`something@gmail.com`). With "Confirm email" ON, Supabase sends a real
confirmation message, the provider rejects it as non-existent, and the
bounce counts against this project — enough of them and Supabase
restricts the project's email sending.

Safe options, in order of preference:

1. Keep **Confirm email** OFF for the whole of development. No mail is
   sent at all, so nothing can bounce and the hourly send limit never
   applies. Turn it ON before real churches sign up — until then it only
   costs you bounces on fake addresses.
2. Use addresses at a domain you control and can receive at.
3. Create test users directly in `auth.users` with `email_confirmed_at`
   already set, bypassing the mail path entirely.

Before launch, configure a **custom SMTP provider** (Settings > Auth >
SMTP). Supabase's built-in sender is rate-limited to a handful of
messages per hour and is explicitly not intended for production traffic
— real signups will silently fail without it.

### Schema conventions worth knowing

- Ids are native `uuid` (`@db.Uuid`), not text, so they compare directly
  against Supabase's `auth.uid()`. Comparing a `text` id to `auth.uid()`
  fails with `operator does not exist: text = uuid`.
- `id` and `updated_at` have **database-level** defaults
  (`gen_random_uuid()`, `CURRENT_TIMESTAMP`). Prisma normally generates
  these client-side, but this app writes through supabase-js/PostgREST,
  which would otherwise violate their NOT NULL constraints.
- Runtime reads and writes go through supabase-js so RLS applies. Prisma
  is used only for migrations and admin scripts — it connects with full
  privileges and bypasses RLS entirely.

## Brand

Tokens live in `src/app/globals.css` under `@theme`. Direction agreed:
keep the Manuel Technologies purple (`--color-primary`) as an **accent**
— buttons, active states, links — not as a dominant surface color like
the original AI Visibility Checker extension used. Background is a warm
neutral (`--color-background`), not saturated lavender, because the
actual users (pastors, church secretaries, older finance officers) need
this to read as calm and trustworthy, not like a developer tool.
`.font-numeric` (SF Mono) is reserved for attendance counts, GHS amounts,
and IDs — kept from the original brand system because precision matters
in a finance-heavy product.

## Roadmap

### Phase 1 — MVP core ✅ complete
- [x] **Org onboarding flow.** `/onboarding` → `create_organization()`
      RPC → creator becomes `admin`. Note: this MUST go through the
      SECURITY DEFINER function in `supabase/migrations/0003_onboarding.sql`,
      not a direct insert — RLS gives `organizations` no INSERT policy, and
      the `organization_members` INSERT policy requires you to already be an
      admin of the org you're joining, so a plain insert can never bootstrap
      the first church.
- [x] Members: list, add, edit, archive/restore (`/members`,
      `/members/[id]`). Never hard-deleted — archiving keeps contribution
      and attendance history intact. The detail page also shows that
      member's giving history.
- [x] Member groups (Bible classes / fellowships): CRUD + assign members
      (`/groups`, `/groups/[id]`). A member belongs to at most one group.
      Deleting a group keeps its members — `members_member_group_id_fkey`
      is ON DELETE SET NULL.
- [x] Attendance: quick-entry per service type, aggregate M/F counts
      (`/attendance`)
- [x] Contributions: tithe/offering entry, cash by default
      (`/contributions`)
- [x] Visitors: add visitor → one-click "Convert to member" (`/visitors`).
      Conversion copies name/gender/phone onto a new member and stores the
      link in `visitors.converted_member_id` (UNIQUE, so it can't happen
      twice).
- [x] Real dashboard stats via the `dashboard_stats()` RPC
      (SECURITY INVOKER, so RLS still applies)

### Phase 2 — depth ✅ complete
- [x] Funds: target/current amount, linked contributions (`/funds`).
      `current_amount` is NEVER written by app code — the
      `contributions_sync_fund` trigger (supabase/migrations/0005_funds.sql)
      recomputes it from the contributions themselves on every insert,
      update and delete, so it cannot drift.
- [x] Vital records: baptisms, confirmations, weddings, deaths
      (`/records`). The member link is optional — a wedding may involve
      someone who isn't on the register.
- [x] Member transfers: request → pending → approve/reject (`/transfers`).
      Approving sets the member to `transferred_out`; rejecting changes
      nothing. One open request per member. The receiving church does not
      need to use Fold — `to_organization_id` stays null for external
      transfers.
- [x] Statistical return with printable/PDF export (`/reports`).
      `statistical_return(org_id, start, end)` in
      `supabase/migrations/0008_statistical_return.sql` computes membership,
      attendance, vital records, outreach and income for any period; the page
      adds a membership-by-class breakdown and prints via `print:` utilities
      (no PDF library — Cmd/Ctrl-P → Save as PDF).

      **Currently shaped on a Methodist society's return to its circuit.**
      The field names in the function are generic; adapt another
      denomination by changing the LABELS in `reports/page.tsx`, and only
      touch the SQL if a genuinely new figure is required. Confirm the
      sections against the form your churches actually submit before
      relying on it.
- [x] Role-based UI — `src/lib/permissions.ts` defines the capability
      map; nav items, forms and actions all consult it.
      **Important:** the UI is a mirror, not the boundary. Each capability
      has a matching RLS policy, because hiding a button does nothing
      against someone calling PostgREST directly. `0006_finance_roles.sql`
      narrowed contributions and funds so a class leader (and a plain
      member) can no longer read the church's giving at all — previously
      any org member could. If you add a capability, add the policy too.

      | Capability | Roles |
      | --- | --- |
      | `people.write` / `attendance.write` / `records.write` | admin, minister, finance officer, class leader |
      | `finance.view` | admin, minister, finance officer |
      | `finance.write` | admin, finance officer |
      | `transfers.manage` / `people.delete` / `org.manage` | admin |

      A minister can see giving figures but not enter them — handling money
      is deliberately separate from pastoral oversight.

### Phase 3 — optional add-ons (never mandatory — cash/manual stays the
default path for every feature; these layer on top for churches ready
for them)
- [~] Per-member check-in (`/attendance/[id]`) — tick who was present at a
      service. This is the data model a QR scanner would write into; the
      scanner itself is not built. Head counts remain valid on their own,
      and naming people stays optional.
- [~] Member messaging (`/messages`) — welcome on joining, a receipt when
      giving is recorded against a member, and a "we've missed you"
      follow-up driven off the attrition watchlist (skips anyone contacted
      in the last 14 days).

      **Messages are recorded first and delivered second.** Without a
      provider configured they are stored with status "Not sent" rather
      than dropped, so the church can see exactly what would go out and
      send it later. There is **no SMS provider on the Vercel Marketplace**
      — `SMS_PROVIDER` selects arkesel / hubtel / twilio in
      `src/lib/messaging.ts`, and swapping means editing one function.
      WhatsApp is not wired: the channel column exists, the Business API
      does not.
- [~] Mobile money via **Paystack** (Stripe, the only Marketplace payments
      option, does not support MTN MoMo in Ghana). Built, untested against
      the live API — needs `PAYSTACK_SECRET_KEY` (free test key) and
      `SUPABASE_SERVICE_ROLE_KEY` for the webhook.

      Design notes worth keeping:
      - A `payments` row is written **before** calling Paystack, so a lost
        response still leaves something for the webhook to settle against.
      - An initiated charge is **not** a contribution. Only a verified
        `charge.success` creates one, so giving figures never count money
        that did not arrive.
      - Webhook verification is HMAC-**SHA512** over the **raw** body —
        re-serialising the parsed JSON changes the bytes and every
        signature fails. The route reads `request.text()` first.
      - `payments.contribution_id` is UNIQUE and claimed with
        `.is("contribution_id", null)`, so the webhook and the manual
        "Check status" path can race without double-counting money.
      - Amounts convert to pesewas in exactly one place (`toPesewas`); a
        mistake there is a factor-of-100 error in real cash.
- [ ] AI features — in rough order of moat vs. novelty:
      1. [x] Silent attrition detection (`/insights`) —
         `attrition_watchlist()` in `0009_checkins_attrition.sql` compares
         each member's last 6 weeks against the prior 18, **as a share of
         services actually held**, and scores the decline. It flags a
         *change* in someone's own pattern, not low attendance: a member
         who never attended much scores 1 ("Watch"), while one who went
         from 89% to 0% scores 4 ("Needs a visit"). Requires per-member
         check-ins — with head counts alone it has nothing to compare.
         The score is deliberately a plain additive rule, not a model,
         because a pastor deciding whether to visit someone needs to
         understand why the name is on the list.
      2. Natural-language finance queries for treasurers/boards
      3. WhatsApp pastoral-request triage (draft response + urgency
         routing)
      4. Sermon transcription/local-language search
      5. Sermon-to-social-content generation
- [ ] PWA → native app wrapper (iOS/Android) once there's real usage
      justifying it — the PWA manifest is already in place
      (`public/manifest.json`)

## What's deliberately NOT in this scaffold yet

No UI beyond auth + an empty dashboard. No seed data. No tests. This is
intentional — the goal was to get the architecture (tenancy, auth, data
model, brand system) right before writing feature UI, since those are
the decisions that are painful to unwind later. Everything else is
Claude Code's job from here, working through the roadmap above.
