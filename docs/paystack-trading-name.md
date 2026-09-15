# The name a church member sees on their phone

> **Resolved, 15 September 2026.** Paystack has a self serve **Change
> trading name** form: "Your trading name is the brand your customers know
> you by. It appears in customer-facing communications but does not affect
> your legal business registration or your Merchant Service Agreement."
>
> That is exactly the separation we were asking about. Support answered the
> wrong question twice; the dashboard had it all along. Review takes under
> 24 hours, the account keeps working meanwhile, and approved changes take
> effect automatically.
>
> **The two support drafts below are kept only as a record.** Do not send
> them.

## What to enter

**New trading name**

```
Fold Church Giving
```

Eighteen characters. If Paystack or MTN truncates, it degrades well: "Fold
Church" still reads as a church payment. The compact alternative, if a
limit is enforced, is `Fold Giving` at eleven.

Not plain `Fold`, even though it is our name. A member approving a payment
has one line to decide from, and "Church Giving" tells them what the money
is for. That is worth more to them than our brand is to us.

**Reason for change**

```
We operate Fold (getfold.org), church management software used by Ghanaian
churches to record their members and collect tithes and offerings by mobile
money.

Our customers are churches, but the people who actually approve payments
are their members. When a member gives a tithe, the MTN approval message
names Manuel Technologies, our registered company, which they have never
heard of. Several pastors have raised this with us, and an unfamiliar
company name on a payment request causes hesitation and abandoned
transactions.

Fold Church Giving is the brand those churches and their members know, and
it tells the payer what the payment is for. The legal entity, our business
certificate and our TIN are unchanged.
```

## After it is approved

One variable, in Vercel, production:

```
NEXT_PUBLIC_PAYSTACK_MERCHANT_NAME=Fold Church Giving
```

Then redeploy. The payouts page tells every church what its members will
see, and it reads that variable, so the product stops naming Manuel
Technologies the moment the name actually changes. Setting it before
approval would make the product lie, so wait for the email.

Nothing else changes. The subaccounts, the settlement and the money path
are untouched: this is a label.

---

## Record of the support thread

Two replies from Paystack support, neither answering the question, kept
because the lesson is worth more than the exchange: **ask one question per
message, and look in the dashboard first.**

The first reply settled that a subaccount's name is never shown to the
payer. The second, to a follow up asking whether a display name could
differ from the registered one, came back "the name displayed cannot differ
for each customer", which answers the first question again. The follow up
had four questions in it, which is why.

---

Send as a reply on the existing thread, so Makafui has the context. Keep
the subject line as it is.

---

Hello Makafui,

Thank you, that is clear and it answers the question.

One follow up, on the business name itself rather than the subaccount.

Since the business name is what every payer sees, it has become a customer
facing decision for us rather than an administrative one. Our registered
name, Manuel Technologies, means nothing to the person actually being
asked to approve the payment: they are a member of a church, giving their
tithe, and the name on their phone is a company they have never heard of.
Several pastors have raised it, and we expect a small number of members
abandon the payment at that point.

**Can the name displayed to customers differ from the registered business
name on the account?** A trading name or display name, in other words,
sitting alongside the registered one rather than replacing it.

We ask because our registered name is tied to our business certificate and
our TIN, and we would rather not disturb that. What we would like shown is
something a church member can act on, for example:

- **Fold Church Giving**, or
- **Fold**

If a separate display name is possible, please tell us where to set it and
whether there is a character limit, since the mobile money approval message
is short.

If it is not possible and changing the registered business name is the only
route, please confirm that too, along with what documentation you would
need from us and whether it would interrupt collections while the change is
processed. We are live and taking payments, so timing matters.

For reference, our integration is on the account registered to Manuel
Technologies, and the example transaction from my first message is
`fold_calvary-beth_1789344941316_3v4nky6o`.

Thank you,

Emmanuel Akyeam
Manuel Technologies
getfold.org

---

---

## Second reply, if the field is locked in the dashboard

Send this only if Settings, Business does not let you edit the name. Keep
it to one question. The last one had four, and the answer addressed none of
them.

---

Hello Makafui,

Sorry, I asked that badly. I am not asking for a different name per
customer, and I understand that is not possible.

I am asking about a single name for the whole account.

At the moment every payer sees **Manuel Technologies**, which is our
registered company name. We would like every payer to see **Fold Church
Giving** instead. One name, the same for everybody.

**How do we change the business name shown at checkout?** Is it a setting
we can edit ourselves, or does it need documentation and re-verification
from your side?

Thank you,

Emmanuel Akyeam
Manuel Technologies
getfold.org

---

## Notes before sending

**One question per message.** The first follow up asked four things and got
an answer to none of them. Ask the single thing that decides the outcome,
and ask the next thing after it is answered.

**Ask about the character limit only once the name change is agreed.** The
MTN approval message is short and truncates. "Fold Church Giving" is 18
characters. If they cap it lower, "Fold" is the fallback and still beats
the status quo.

**The question about interrupting collections is the important one.** If
changing the registered name pauses the account even briefly, that is a
decision to make deliberately and not on a Sunday.

**If the answer is a flat no on both counts**, nothing further is worth
chasing. The product already tells churches what their members will see, on
the payouts page, and the thank you text carries the church's own name
seconds later. That is the whole mitigation and it is already built.
