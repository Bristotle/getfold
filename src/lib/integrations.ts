/**
 * "Does Fold work with ..." pages.
 *
 * One per thing a church already uses. Each says what the thing is, how it
 * connects to Fold, what it costs and what it cannot do, so a treasurer
 * asking "does it work with MTN" gets a yes with the terms attached
 * rather than a yes.
 */

export type Integration = {
  slug: string;
  name: string;
  /** For the "Fold + MTN Mobile Money" heading. */
  short: string;
  kind: "wallet" | "processor" | "file" | "sms";
  title: string;
  description: string;
  /** What it is, for a reader who does not know. First sentence quotable. */
  what: string;
  /** How it works with Fold, as prose. */
  how: string[];
  /** Setup, as steps. */
  steps: string[];
  /** Plain facts a church wants: cost, timing, limits. */
  facts: { label: string; value: string }[];
  faq: { q: string; a: string }[];
  keywords: string[];
  related: { label: string; href: string }[];
};

const WALLET_STEPS = [
  "In Fold, open Payouts and choose where giving should settle: a mobile money number or a bank account. The church's own, in its name.",
  "Fold registers that destination with Paystack as the church's subaccount. Nothing is paid to Fold.",
  "On the Giving page, record a mobile money gift with the member's number and amount. The network texts the member a code, the code is entered in Fold, and the gift goes through.",
  "The gift is recorded against the member and the fund the moment it succeeds, and the money settles to the church's number, less the 1.95 percent fee, usually the next working day.",
];

const WALLET_FACTS = [
  { label: "Processor fee", value: "1.95% per gift, no monthly fee, no minimum" },
  { label: "Fold's share", value: "Zero. The church's subaccount is set to a 0% split" },
  { label: "Settles to", value: "The church's own wallet or bank account" },
  { label: "Settlement time", value: "Usually the next working day" },
  { label: "E-Levy", value: "None. Abolished April 2025" },
  { label: "Recorded", value: "Against the member and fund, automatically, with a reference" },
];

export const INTEGRATIONS: Integration[] = [
  {
    slug: "mtn-mobile-money",
    name: "MTN Mobile Money",
    short: "MTN MoMo",
    kind: "wallet",
    title: "Does Fold work with MTN Mobile Money? Yes, for giving and settlement",
    description:
      "Members give from any MTN MoMo wallet, the gift is recorded against their name, and the money settles to the church's own MTN number less a 1.95 percent fee. How it works, what it costs, and how to set it up.",
    what:
      "MTN Mobile Money is Ghana's largest mobile money service, and the wallet most church members already give from, so any church giving system has to accept it and most churches want to settle to it.",
    how: [
      "Fold does not connect to MTN directly. It uses Paystack, a licensed payment processor, which accepts MTN MoMo payments and settles them to an MTN number or bank account the church names. That is the same arrangement a church would make on its own with Paystack; Fold sets it up and connects each payment to the register.",
      "The part most churches do not expect: MTN does not send a payment prompt. It sends the payer a code by text, 'Enter code 1234 to pay GHS 50.00 to Fold Church Giving', and the payer types the code into Fold to approve. Fold shows a box for exactly that.",
    ],
    steps: WALLET_STEPS,
    facts: WALLET_FACTS,
    faq: [
      {
        q: "Can the church settle to its MTN MoMo merchant number?",
        a: "The church names any MTN number in its own name as the settlement destination, personal or merchant. Paystack sends settlements there.",
      },
      {
        q: "Why does the payer get a code instead of a prompt?",
        a: "Because that is how MTN Ghana authorises payments through a processor: an OTP by text rather than a push prompt. The member types it into Fold and the payment completes.",
      },
      {
        q: "What name does the member see on the payment?",
        a: "Fold Church Giving, which is the trading name registered with Paystack for all churches on Fold. The church's own name appears in the thank you text and on the record.",
      },
    ],
    keywords: ["MTN mobile money church giving", "church software MTN MoMo Ghana", "MoMo tithe payment church"],
    related: [
      { label: "How to set up mobile money giving for your church", href: "/blog/how-to-set-up-mobile-money-giving-for-your-church" },
      { label: "Giving fee calculator", href: "/tools/giving-fee-calculator" },
    ],
  },
  {
    slug: "telecel-cash",
    name: "Telecel Cash",
    short: "Telecel Cash",
    kind: "wallet",
    title: "Does Fold work with Telecel Cash? Yes, for giving and settlement",
    description:
      "Members give from a Telecel Cash wallet and the church can settle to a Telecel number. Same 1.95 percent fee, same automatic record against the member.",
    what:
      "Telecel Cash, formerly Vodafone Cash, is the mobile money service of Telecel Ghana, and Fold accepts gifts from it and settles to it through Paystack in the same way as MTN.",
    how: [
      "Telecel Cash payments through Paystack are authorised on the payer's phone, and the gift is recorded in Fold the moment Paystack confirms it, against the member and the fund they chose.",
      "A church whose treasurer or account is on Telecel names a Telecel number as the settlement destination and receives every gift there, whichever network the member paid from.",
    ],
    steps: WALLET_STEPS,
    facts: WALLET_FACTS,
    faq: [
      {
        q: "Can members on MTN give to a church that settles to Telecel?",
        a: "Yes. The member pays from their own network; the church receives on the network it chose. Paystack sits between the two.",
      },
      {
        q: "Is the fee different for Telecel?",
        a: "No. Paystack charges 1.95 percent on mobile money whichever network the payment comes from.",
      },
    ],
    keywords: ["Telecel Cash church giving", "Vodafone Cash church payment", "church software Telecel Ghana"],
    related: [
      { label: "What mobile money costs a church", href: "/blog/what-mobile-money-costs-a-church" },
      { label: "Giving fee calculator", href: "/tools/giving-fee-calculator" },
    ],
  },
  {
    slug: "airteltigo-money",
    name: "AirtelTigo Money",
    short: "AirtelTigo Money",
    kind: "wallet",
    title: "Does Fold work with AirtelTigo Money? Yes, for giving and settlement",
    description:
      "Members give from an AirtelTigo Money wallet and the church can settle to an AirtelTigo number, through Paystack, at 1.95 percent, recorded against the member automatically.",
    what:
      "AirtelTigo Money is the mobile money service of AirtelTigo, and Fold accepts gifts from it and settles to it through Paystack in the same way as the other two networks.",
    how: [
      "A member on AirtelTigo pays from their wallet, authorises on their phone, and the gift appears in Fold against their name with a reference.",
      "The settlement destination can be an AirtelTigo number in the church's name, and every gift from every network arrives there.",
    ],
    steps: WALLET_STEPS,
    facts: WALLET_FACTS,
    faq: [
      {
        q: "Does a church need a wallet on every network?",
        a: "No. One settlement destination on any network, or a bank account, receives gifts from members on all three.",
      },
    ],
    keywords: ["AirtelTigo Money church giving", "church software AirtelTigo Ghana", "AT Money tithe"],
    related: [
      { label: "Digital giving in Fold", href: "/features/digital-giving" },
      { label: "Giving fee calculator", href: "/tools/giving-fee-calculator" },
    ],
  },
  {
    slug: "paystack",
    name: "Paystack",
    short: "Paystack",
    kind: "processor",
    title: "Fold and Paystack: how church giving is processed and settled",
    description:
      "Paystack processes every mobile money and card gift made through Fold, charges 1.95 percent, and settles to the church's own account through a subaccount with a zero percent split. What that means and why it was chosen.",
    what:
      "Paystack is a payment processor licensed in Ghana that accepts mobile money and card payments and settles them to a named account, and it is the processor behind every mobile money gift made through Fold.",
    how: [
      "Fold holds one Paystack account under the trading name Fold Church Giving. Each church on Fold gets a subaccount naming the church's own settlement destination, with the platform's share set to zero. When a member gives, Paystack charges the fee and settles the rest to the church. Fold never holds the money.",
      "Paystack tells Fold the moment a payment succeeds, over a signed webhook, and Fold records the gift against the member and fund and queues the thank you text. Every payment carries a reference, so a treasurer can match any line on a Paystack statement to a line in Fold.",
      "It was chosen because it is licensed by the Bank of Ghana, its Ghana fee is flat with no minimum, it supports all three mobile money networks and cards, and it publishes its pricing. Hubtel and others are comparable; the differences are small enough that the flat fee and the subaccount model decided it.",
    ],
    steps: [
      "Nothing to sign up for. Fold's Paystack account is already in place.",
      "On the Payouts page, the church names its settlement destination and Fold creates the subaccount.",
      "Gifts settle to the church, usually the next working day, and appear in Fold as they succeed.",
    ],
    facts: [
      { label: "Fee", value: "1.95% per mobile money or local card gift" },
      { label: "Minimum fee", value: "None" },
      { label: "Monthly fee", value: "None" },
      { label: "Fold's share", value: "0%" },
      { label: "Regulated by", value: "Bank of Ghana, as a payment service provider" },
      { label: "Networks", value: "MTN, Telecel and AirtelTigo for giving; cards for Fold subscriptions" },
    ],
    faq: [
      {
        q: "Can a church use its own Paystack account with Fold?",
        a: "Not at present. Fold uses one account with a subaccount per church, which is what lets every church settle to its own destination without each one applying to Paystack.",
      },
      {
        q: "What does Fold see of a member's payment details?",
        a: "The phone number used and the amount. Fold never sees or stores card numbers or wallet PINs; those go to Paystack directly.",
      },
      {
        q: "What happens if Paystack is down on Sunday?",
        a: "Gifts fail cleanly and the member sees a message saying so. Cash recorded on the count sheet is unaffected, and mobile money can be tried again later.",
      },
    ],
    keywords: ["Paystack church giving Ghana", "Paystack subaccount church", "church software Paystack integration"],
    related: [
      { label: "Security: how money and data are separated", href: "/security" },
      { label: "What is a subaccount?", href: "/glossary/subaccount" },
    ],
  },
  {
    slug: "excel",
    name: "Excel and Google Sheets",
    short: "Excel",
    kind: "file",
    title: "Fold and Excel: import your register, export it any time",
    description:
      "Bring a membership register from Excel or Google Sheets into Fold in an afternoon, and export everything back to a spreadsheet whenever you want. What the file needs and what happens to the columns Fold does not know.",
    what:
      "Most Ghanaian churches that have moved off a book keep their register in Excel, and Fold reads that file as its starting point: export from Excel as CSV, import into Fold, and the register you have kept for years is the one you continue with.",
    how: [
      "The import reads your own column headings rather than making you fit a template: one row per member with a name, and whatever else is there, phone, sex, date of birth, residence, member type, class or group. You are shown what was read and which rows could not be used, you fix those in the sheet and upload again, and nothing is duplicated.",
      "The export goes the other way, at any time, as a CSV that Excel and Google Sheets open directly: every member and every field, with phone numbers written so Excel keeps the leading zero. It is the guarantee that choosing Fold never means being unable to leave it. Giving and attendance are printed from the reports page; a CSV of those is not built yet.",
    ],
    steps: [
      "In Excel or Google Sheets, save the register as CSV (comma separated values).",
      "In Fold, open Members and choose Import. Upload the file.",
      "Fold reads your column headings. Check what was read and which rows, if any, could not be used.",
      "Fix any rejected rows in the sheet and upload again. Nothing is imported twice.",
    ],
    facts: [
      { label: "Import format", value: "CSV, from Excel, Google Sheets or Numbers" },
      { label: "Required column", value: "Name. Everything else optional" },
      { label: "Export", value: "The whole register as CSV, any time" },
      { label: "Re-uploads", value: "Safe. Nothing is duplicated" },
    ],
    faq: [
      {
        q: "Can I import a register that is a Word document or a photo?",
        a: "Not directly. It needs to be a spreadsheet first. On the Large Society plan we move a paper or Word register across for you.",
      },
      {
        q: "Will my Excel columns be lost?",
        a: "Fold reads your own headings, and tells you which rows it could not use so you can fix and re-upload. The original file stays with you.",
      },
      {
        q: "Can I export giving as well as members?",
        a: "Not as a CSV yet. Giving and attendance are produced as printable reports for any period. A spreadsheet export of both is on the list, and the register itself exports today.",
      },
    ],
    keywords: ["import church members from Excel", "church register Excel to software", "export church data CSV"],
    related: [
      { label: "Import from Excel", href: "/help/members/import-from-excel" },
      { label: "Moving your register from a book", href: "/blog/moving-your-register-from-a-book" },
    ],
  },
  {
    slug: "arkesel-sms",
    name: "Arkesel SMS",
    short: "Arkesel",
    kind: "sms",
    title: "Fold and Arkesel: texts sent in your church's own name",
    description:
      "Every text Fold sends, birthdays, thank yous, welcomes and reminders, goes through Arkesel with the church's own sender name. What a sender name is, how it is approved, and what a text costs.",
    what:
      "Arkesel is a Ghanaian SMS provider that delivers messages to all networks with a registered sender name, and it is how Fold sends a church's texts so they arrive from the church's name rather than from a number or from Fold.",
    how: [
      "A sender name is up to 11 letters, such as EBENEZERMTH, registered once and approved by the networks. Until it is approved, Arkesel accepts the message and holds it, which is why the first text from a new church can take a day to arrive. Fold's setup checklist asks for the sender name early for exactly that reason.",
      "Fold queues each message with the church's sender name and sends it on the schedule the message needs: a thank you a few minutes after a gift succeeds, a birthday on the morning, a reminder when the church asks. What was sent, what is waiting and what failed is on the Messages page.",
    ],
    steps: [
      "During setup, choose a sender name of up to 11 letters and numbers, usually a short form of the church's name.",
      "Fold registers it with Arkesel. Approval by the networks usually takes a working day.",
      "Switch on the automatic messages you want: birthdays, welcomes, giving thank yous. Each is off until you turn it on.",
      "Send to an individual, a group or the whole register from Members or Groups.",
    ],
    facts: [
      { label: "Sender name", value: "Up to 11 characters, the church's own" },
      { label: "Networks", value: "MTN, Telecel, AirtelTigo" },
      { label: "Length", value: "160 characters per credit; longer texts use two" },
      { label: "Automatic messages", value: "Off by default, each a separate switch" },
    ],
    faq: [
      {
        q: "Why has our first text not arrived?",
        a: "A new sender name is held by the networks for approval, usually for a working day. The message shows as sent in Fold because Arkesel accepted it. Once the name is approved, texts arrive within seconds.",
      },
      {
        q: "Can members reply to the texts?",
        a: "No. A sender name is one way. Put the pastor's or the office's number in the text where a reply is wanted.",
      },
      {
        q: "Can we use WhatsApp instead?",
        a: "Not through Fold at present. SMS reaches every phone including ones without data, which is why it is the channel Fold uses.",
      },
    ],
    keywords: ["church SMS Ghana sender name", "Arkesel church software", "bulk SMS church Ghana"],
    related: [
      { label: "31 church SMS examples", href: "/examples/church-sms-messages" },
      { label: "Communication in Fold", href: "/features/communication" },
    ],
  },
];

export function getIntegration(slug: string) {
  return INTEGRATIONS.find((i) => i.slug === slug);
}
