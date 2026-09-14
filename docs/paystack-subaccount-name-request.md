# Paystack support request, merchant name on mobile money charges

Send from the email on the Paystack account, to support@paystack.com, or
through the chat on the dashboard. Keep the reference in, they will ask.

---

**Subject:** Can a subaccount's business name appear on the mobile money approval message?

Hello,

We run Fold (getfold.org), church management software for Ghanaian
churches, on Manuel Technologies' Paystack account. Each church we onboard
gets its own subaccount so that giving settles directly to the church's own
mobile money number and never touches our balance.

That part works exactly as we hoped. A live example from our own testing:

- Subaccount: `ACCT_84ygdcqi8w1dkbi`, business name **Calvary Bethel**
- Transaction: `fold_calvary-beth_1789344941316_3v4nky6o`, GHS 10, MTN mobile money, successful
- Settlement went to the subaccount, our balance stayed at GHS 0

The question is about what the payer sees. The approval SMS read:

> Enter code 098055 to pay GHS 5.00 to **Manuel Technologies**. DO NOT SHARE
> with anyone.

The name shown is our integration's business name, not the subaccount's,
even though the subaccount is named Calvary Bethel.

This matters more than it might appear. The payer is a church member giving
a tithe to their own church. Seeing an unfamiliar company name on the
approval request makes a member hesitate, and a few will abandon the
payment or ring the church to ask who Manuel Technologies is. Several
pastors have raised it with us already.

**Three questions:**

1. Is there any way for the subaccount's business name to appear on the
   mobile money approval message instead of the main account's, on a
   per-transaction basis? We did not find a field on the Charge API that
   controls it.

2. If not per-transaction, is there an account level setting, a trading
   name or a payment descriptor, that changes what appears on that message?

3. If neither is possible today, is it on your roadmap? We expect to onboard
   a number of Ghanaian churches over the coming year, and each one will ask
   this question within a day of going live.

Happy to be a test account for anything in progress.

Thank you,

Emmanuel Akyeam
Manuel Technologies
getfold.org

---

## What to do with the answer

**If it can be done per subaccount.** Set it and nothing else changes. We
already store the church name on the subaccount, so there is nothing to
migrate.

**If it is account level only.** Consider whether "Fold" reads better to a
church member than "Manuel Technologies". Neither is the church's own name,
but a member who has heard their pastor mention Fold will recognise it,
while Manuel Technologies means nothing to anybody in the pew. Changing it
is one setting and affects every church at once.

**If it cannot be done at all.** Two mitigations, both already built:

- The thank you text goes out from the church's own sender name within
  seconds of the payment succeeding, so the last thing the member sees is
  their church's name. Worth checking the church has set a sender name and
  switched thank you texts on, because both are off by default.
- Tell churches during onboarding what the member will see, so the pastor
  can mention it once from the pulpit rather than field calls about it.

The third option, giving each church its own full Paystack account rather
than a subaccount, would fix the name and is almost certainly the wrong
trade. Every church would have to pass Paystack's own business verification
before collecting a single cedi, and most Ghanaian congregations will not
get through that. The subaccount model exists precisely so they do not have
to.
