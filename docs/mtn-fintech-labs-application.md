# MTN Fintech Labs application, Fold

Paste-ready answers, in the order an application form usually asks. Every
claim below is true of the live product today and was verified by running
it, not by reading the roadmap. Where something is roadmap, it says so,
because a fintech panel with Hubtel and Zenith on it will ask, and the
answer "not yet, here is exactly what is" beats being caught.

Two things to have ready alongside the form: a login to a seeded demo
church (`node scripts/seed-demo.mjs`), and the nine step proof
(`node scripts/momo-proof.mjs`), which runs in under a minute and prints
the whole money path end to end.

---

## One line

Fold is church management software built in Ghana around how a
denomination actually works, with mobile money giving that settles
directly into each church's own account and never passes through ours.

## The problem

A Ghanaian church keeps its register in a book, its cash in another book,
and its Sunday head counts on a loose sheet, then loses an evening every
quarter reconciling the three into a return for its circuit, presbytery or
district. Giving is overwhelmingly cash, and where a church accepts
mobile money it is usually a MoMo number on a projector, which means
money arrives on a handset with no record of who sent it or what it was
for.

The software sold to fix this was almost all built for a single
independent congregation somewhere else. It assumes card giving, bills in
dollars, assumes a connection that never drops, and has no idea what a
circuit, a society, a Bible class or a catechumen is. Churches buy it,
use a tenth of it, and keep the book.

## What Fold does

The register, attendance, tithes and offerings, funds, vital records and
the statistical return, in one place, in the church's own vocabulary.
Six denominational structures modelled and verified against each
church's own published material: Methodist, Presbyterian, Pentecostal,
Anglican, AME Zion and Baptist. Branches at any depth, headquarters over
regions over districts over assemblies, with oversight from above that
is read only and figures that roll up at every level.

Built for a phone on a weak signal, cash first, priced in cedis and
billed quarterly on the same cycle as the return.

## The embedded finance, specifically

This is the part built for this track, and all of it is live.

**A member pays tithe by mobile money and the money lands in the church's
own account.** Each church holds its own Paystack subaccount, and
Paystack Ghana settles directly to MTN, Telecel or AirtelTigo mobile
money, or to any of 57 banks. Settlement never enters Fold's balance.
That is the line between being software and being an unlicensed money
handler, and it is also what a pastor asks about first.

**The gift is recorded against the member and the fund the moment it
succeeds.** The webhook claims each payment exactly once, so a retry
cannot double count, and the fund's running total is recomputed by a
database trigger rather than trusted to application code.

**A thank you goes to the member's phone within the minute**, in the
church's own name, if the church has switched that on.

**Fold's own subscription is collected the same way.** Quarterly invoices,
a Paystack link that accepts MoMo and card, the webhook marking the
invoice paid and extending the subscription. Deliberately invoices rather
than silent recurring charges, because mobile money mandates in Ghana are
unreliable enough that auto-charging would fail quietly and often.

**We never hold a bank or mobile money number.** Paystack does. Fold keeps
an opaque subaccount code and a label like "MTN ending 2348", and a test
asserts that no account number column exists so a future migration cannot
quietly add one.

Verified end to end against Paystack and the live database, nine steps,
run before writing this: subaccount created, MoMo charge routed to it,
webhook claims the payment, contribution written, fund total recomputed,
replay refused, ledger correct, dashboard correct.

## Where the intelligence is, honestly

**Attrition detection is live and rule based, not machine learning.**
Each member is compared against their own attendance history rather than
the congregation average, measured against services the church actually
held rather than Sundays on a calendar, so a church that lost two weeks
to a funeral is not handed a list of forty people who did nothing
unusual. It needs several weeks of named attendance before it says
anything, and the product says so rather than pretending otherwise.

**Natural language questions over church finances are on the roadmap and
not started.** A treasurer asking "how much did the Youth Fellowship give
in the second quarter" and getting an answer is the obvious next step
once there is enough real data across enough churches to make it worth
building on. We would rather say that plainly than describe a screen that
does not exist.

## Security, because a church's register is personal data

Row level security in Postgres is the boundary, not the interface. Every
church's records are separated at the database, and a request that went
round the application entirely would still be refused. Under the Data
Protection Act, 2012 (Act 843) a church is a data controller and
religious belief is special personal data; we say that on our own site and
build to it.

Rate limited logins, password floor of eight, sessions revoked on
password change, an auth event log that nobody can read through the API,
and a guard script that fails if any table is ever reachable without RLS.

## Where it stands

Live at getfold.org since September 2026. Paystack integration verified
in test mode end to end; live keys pending completion of business
verification with our certificate and TIN, which is in progress.
Sixteen step smoke test against the live project, nine step mobile money
proof, and every database change tested inside a rolled back transaction
before it ships.

Pricing published in cedis: GHS 149, 299 and 499 a month by congregation
size, billed quarterly, with the whole product on every band and a thirty
day trial that needs no card.

## What the programme would accelerate

Three things, in order.

1. **Live mobile money at scale.** The integration is built; what it
   needs is volume, and the first churches to run real tithes through it.
2. **A share of giving as a second revenue line.** Paystack supports a
   percentage or flat split per transaction. We have deliberately left it
   at zero until it is a decision made with churches rather than to them.
3. **WhatsApp as a delivery channel.** Where Ghanaian churches already
   talk. The catch, which we would want to solve properly rather than
   quickly, is that WhatsApp messages come from the platform's number,
   and a church needs its congregation to see the church's name.

## Team

Manuel Technologies, Ghana. Fold is designed, built and supported by the
same people who answer the messages, which is why a question about a
church's register usually gets a fix rather than an apology.

---

## Do not say

Things that would be untrue or unwise on the form.

- Do not call the attrition detection "AI". It is a comparison against a
  baseline. A panel will ask what the model is.
- Do not say mobile money is live. It is built and verified in test mode;
  live keys are pending verification. Say exactly that.
- Do not quote customer numbers. There are none yet, and a fintech panel
  checks.
- Do not claim WhatsApp. It is roadmap.
