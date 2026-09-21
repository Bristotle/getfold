/**
 * Head-to-head pages.
 *
 * Two rules, inherited from /compare and not negotiable.
 *
 * Every claim about the other product is taken from its own public site on
 * the date given in `checked`, and the page says where. Where their site
 * does not say, the page says so rather than guessing low.
 *
 * And every page names who should choose the other product. The "who this
 * is for" line under each option is the line an assistant lifts into its
 * own answer, and a page where one side wins every line is an advert that
 * nobody quotes.
 */

export type Comparison = {
  slug: string;
  /** The other product, or "Excel". */
  them: string;
  title: string;
  description: string;
  /** Date the other product's public material was read. */
  checked: string;
  /** One paragraph: what the choice actually comes down to. */
  verdict: string;
  /** What the other product is, in its own terms. */
  about: string;
  /** Their pricing as published, or that it is not. */
  theirPricing: string;
  /** Rows: the same question answered for both. */
  rows: { question: string; them: string; fold: string }[];
  chooseThem: { title: string; text: string };
  chooseFold: { title: string; text: string };
  faq: { q: string; a: string }[];
  sources: { label: string; url: string }[];
  keywords: string[];
};

const FOLD_PRICING =
  "Published on the pricing page: GHS 149 a month up to 100 members, GHS 299 for 101 to 400, GHS 499 for 401 to 1,000, and a circuit rate for more than one society. Thirty days free with no card.";

export const COMPARISONS: Comparison[] = [
  {
    slug: "asoriba-alternative",
    them: "Asoriba",
    title: "Asoriba alternative: Fold compared for Ghanaian churches",
    description:
      "Asoriba and Fold side by side for a church in Ghana: member app, branches, giving, denominational returns, pricing and data export, with who should choose which.",
    checked: "2026-09-21",
    verdict:
      "Asoriba is the better choice if you want a branded app in your members' hands, NFC or USSD check-in, and a product that also runs in Nigeria, Kenya and South Africa. Fold is the better choice if your church files a denominational return, uses its own membership categories, wants a price in cedis on the website, and wants to know exactly how its records are kept apart from other churches'.",
    about:
      "Asoriba is a church management platform from Asoriba Inc., in partnership with Interswitch, combining web software, a free member app for iOS and Android, and digital giving, for churches in Ghana, Nigeria, South Africa and Kenya. Its site lists member management, communication by SMS, email and push, financial management with ledgers, branch management, attendance with headcount analytics, NFC check-in and USSD, and giving through the app.",
    theirPricing:
      "Free for churches with 50 members and below. Beyond that, no amounts are published on the site; you ask.",
    rows: [
      {
        question: "Denominational structure and return",
        them: "Not mentioned on the site. Churches are managed as branches of an organisation.",
        fold: "Built around societies, circuits, presbyteries and dioceses, with the quarterly return produced from the register.",
      },
      {
        question: "Member facing app",
        them: "Yes. A free app with devotionals, sermons, event notices, prayer requests and giving.",
        fold: "No. Members give through the church, and receive texts. Fold is for the people who run the church.",
      },
      {
        question: "Branches",
        them: "Yes. Multiple branches managed remotely from one platform.",
        fold: "Yes. Any depth, with figures rolling up and oversight from above read only.",
      },
      {
        question: "Giving",
        them: "Through the member app. Fees not published on the site.",
        fold: "Mobile money through Paystack at 1.95%, no share to Fold, settled to the church's own account.",
      },
      {
        question: "Attendance",
        them: "Headcount analytics, NFC device check-in and USSD.",
        fold: "By class or group from a phone, or as a headcount per service. No hardware.",
      },
      {
        question: "Pricing",
        them: "Free to 50 members; otherwise not published.",
        fold: FOLD_PRICING,
      },
      {
        question: "Export your register",
        them: "Not stated on the site.",
        fold: "Whole register as CSV at any time, including the day you leave.",
      },
      {
        question: "How churches are kept apart",
        them: "Not stated on the site.",
        fold: "Row-level security in the database, with the actual rule quoted on the security page.",
      },
    ],
    chooseThem: {
      title: "Choose Asoriba if",
      text: "you want your members to have a branded app with sermons and devotionals, you run branches in more than one country, or NFC and USSD check-in matter to you. They have been at this for a decade and those parts of the product are mature.",
    },
    chooseFold: {
      title: "Choose Fold if",
      text: "you are a society, congregation or assembly inside a denomination with a return to file, you want your own membership categories, you want the price in cedis before you call anyone, and you want to be able to leave with your records at any time.",
    },
    faq: [
      {
        q: "Is Asoriba free?",
        a: "Asoriba's site says it is free for churches with 50 members and below. Pricing above that is not published; the site asks you to get in touch.",
      },
      {
        q: "Does Fold have a member app like Asoriba?",
        a: "No. Fold is built for the people who run the church: the secretary, treasurer, class leaders and pastor. Members receive texts and give by mobile money; they do not need an app.",
      },
      {
        q: "Can I move from Asoriba to Fold?",
        a: "If you can export your member list from Asoriba as a spreadsheet, Fold imports it reading your own column headings. If not, the Large Society plan includes moving your register across.",
      },
    ],
    sources: [{ label: "Asoriba, features and pricing statements on asoriba.com", url: "https://www.asoriba.com/" }],
    keywords: ["Asoriba alternative", "Asoriba vs Fold", "church software like Asoriba Ghana"],
  },
  {
    slug: "churchcare-alternative",
    them: "Faith ChurchCare",
    title: "Faith ChurchCare alternative: Fold compared for Ghana",
    description:
      "Faith ChurchCare and Fold side by side: plans in cedis, member limits, WhatsApp and SMS, events, pastoral care, denominational returns and export, with who should choose which.",
    checked: "2026-09-21",
    verdict:
      "Faith ChurchCare is the better choice if WhatsApp broadcasts, event RSVPs and pastoral care logs are the centre of what you need, and you are one church or a few campuses. Fold is the better choice if you file a denominational return, want your own membership categories, or are a church of under a hundred paying attention to the monthly cost.",
    about:
      "Faith ChurchCare describes itself as the complete church management platform for Ghana, trusted by 120 or more churches, with member management, giving and tithes with PDF receipts, events with RSVPs, WhatsApp and SMS broadcasts, reports, pastoral care, branch and department management and role based access. Support is on WhatsApp from a Ghana based team.",
    theirPricing:
      "Published: Starter GHS 200 a month up to 150 members, Growth GHS 350 up to 500 members with WhatsApp and SMS, Pro GHS 500 for unlimited members with multi campus, role based access and audit log. No contracts.",
    rows: [
      {
        question: "Denominational structure and return",
        them: "Not mentioned. Branches, campuses and departments.",
        fold: "Built around societies, circuits and dioceses, with the return produced from the register.",
      },
      {
        question: "Messaging",
        them: "Bulk WhatsApp and SMS from the Growth plan, with automatic birthday and anniversary greetings.",
        fold: "SMS in the church's own sender name on every plan, with birthdays, welcomes and thank yous. No WhatsApp.",
      },
      {
        question: "Events and RSVPs",
        them: "Yes, with attendance marked on the day.",
        fold: "Services and attendance, by class or headcount. No event RSVP feature.",
      },
      {
        question: "Pastoral care",
        them: "Prayer requests, pastoral visits and care notes on the Growth plan.",
        fold: "Who has drifted from their own attendance pattern, and birthdays, on the dashboard. No visit log.",
      },
      {
        question: "Giving",
        them: "Offerings and tithes recorded, PDF receipts, pledges. Mobile money collection not described on the site.",
        fold: "Mobile money through Paystack at 1.95%, recorded against the member automatically, settled to the church.",
      },
      {
        question: "Pricing, small church",
        them: "GHS 200 a month, up to 150 members, 2 admin accounts.",
        fold: "GHS 149 a month, up to 100 members, unlimited team members.",
      },
      {
        question: "Pricing, mid size",
        them: "GHS 350 a month, up to 500 members, 10 admin accounts.",
        fold: "GHS 299 a month, 101 to 400 members; GHS 499, 401 to 1,000.",
      },
      {
        question: "Audit log and export",
        them: "Audit log and data export on the Pro plan, GHS 500.",
        fold: "Activity log and full register export on every plan.",
      },
    ],
    chooseThem: {
      title: "Choose Faith ChurchCare if",
      text: "your church runs on WhatsApp broadcasts, you want events with RSVPs, and a pastoral care log of visits and prayer requests is central. Those are built and Fold does not have them.",
    },
    chooseFold: {
      title: "Choose Fold if",
      text: "you are inside a denomination with a return to file and categories of your own, you want mobile money giving recorded against members automatically, or you are under a hundred members and GHS 149 against GHS 200 matters every month.",
    },
    faq: [
      {
        q: "How much does Faith ChurchCare cost?",
        a: "As published on its site: GHS 200 a month for up to 150 members, GHS 350 for up to 500, and GHS 500 for unlimited members and multi campus. Fold's plans start at GHS 149 for up to 100 members.",
      },
      {
        q: "Does Fold send WhatsApp messages?",
        a: "No. Fold sends SMS in the church's own sender name, because SMS reaches every phone including those without data. Faith ChurchCare offers WhatsApp broadcasts on its Growth plan.",
      },
    ],
    sources: [{ label: "Faith ChurchCare, features and pricing on churchcare.online", url: "https://www.churchcare.online/" }],
    keywords: ["ChurchCare alternative", "Faith ChurchCare vs Fold", "church software Ghana comparison"],
  },
  {
    slug: "planning-center-ghana",
    them: "Planning Center",
    title: "Planning Center in Ghana: what works, and Fold compared",
    description:
      "Planning Center is free for its People database and strong for worship planning, but its Giving works only in the US, Canada, Australia and New Zealand. What that means for a Ghanaian church, and how Fold compares.",
    checked: "2026-09-21",
    verdict:
      "Planning Center is the better choice if what you need is worship service planning, volunteer scheduling and a member database, you are comfortable paying in dollars for add-ons, and you will handle giving some other way. Fold is the better choice if giving by mobile money, a denominational return and a price in cedis are the point.",
    about:
      "Planning Center is an American church software suite whose People database, Church Center app and the essential tiers of Calendar, Services, Registrations, Groups and Check-ins are free, with pay per use add-ons. Its Services product for planning worship and scheduling teams is widely regarded as the best of its kind.",
    theirPricing:
      "People is free. Other products have a free tier and paid tiers in US dollars; add-ons such as text credits at $0.02 per text. Giving charges 2.15% plus $0.30 per card transaction in the US, and is available in the United States, Canada, Australia and New Zealand only.",
    rows: [
      {
        question: "Giving in Ghana",
        them: "Not available. Giving supports four countries, none in Africa. No mobile money.",
        fold: "Mobile money through Paystack at 1.95%, settled to the church's own MTN, Telecel or AirtelTigo number.",
      },
      {
        question: "Worship planning and teams",
        them: "Services: set lists, arrangements, team scheduling. Excellent.",
        fold: "Not built. Fold does not plan services.",
      },
      {
        question: "Denominational return",
        them: "No. Reports are built for an independent congregation.",
        fold: "Membership by your categories, attendance, vital records and income, for any period.",
      },
      {
        question: "Currency and price",
        them: "US dollars. Free tiers generous; paid tiers and text credits in USD.",
        fold: "Cedis, published, from GHS 149 a month.",
      },
      {
        question: "Works on a weak connection",
        them: "Designed for reliable broadband and a member app.",
        fold: "Static pages, small payloads, built for a phone on the edge of coverage.",
      },
      {
        question: "SMS to members",
        them: "Yes, from a US toll free number, $0.02 per text.",
        fold: "Yes, from the church's own Ghanaian sender name.",
      },
    ],
    chooseThem: {
      title: "Choose Planning Center if",
      text: "your worship team needs Services, your church is one independent congregation with no return to file, and you will collect giving another way. The free tiers are real and the product is mature.",
    },
    chooseFold: {
      title: "Choose Fold if",
      text: "mobile money giving, a denominational structure and return, and cedi pricing are what you are choosing software for. Planning Center cannot do the first at all in Ghana.",
    },
    faq: [
      {
        q: "Can a church in Ghana use Planning Center Giving?",
        a: "No. Planning Center Giving is available in the United States, Canada, Australia and New Zealand, and does not support mobile money. Its People database and Services product work anywhere.",
      },
      {
        q: "Can I use Planning Center Services with Fold?",
        a: "There is no integration, but nothing stops a church planning worship in Services and keeping its register, giving and return in Fold. Many churches will run exactly that pair.",
      },
    ],
    sources: [{ label: "Planning Center pricing and supported regions", url: "https://www.planningcenter.com/pricing" }],
    keywords: ["Planning Center Ghana", "Planning Center alternative Africa", "Planning Center mobile money"],
  },
  {
    slug: "church-software-vs-excel",
    them: "Excel",
    title: "Church software vs Excel: when a spreadsheet is enough",
    description:
      "A spreadsheet is the right church register for some churches and the wrong one for others. The honest line between them, what breaks first, and what moving to software actually changes.",
    checked: "2026-09-21",
    verdict:
      "Excel is enough while one person keeps the register, the church is under about fifty, giving is cash, and the return is filed from memory as much as from the sheet. It stops being enough the first time two people need to edit it, mobile money arrives without names, or the return is late because the sheet was on a laptop that was elsewhere.",
    about:
      "Excel, or Google Sheets, is where most Ghanaian churches that have left the book keep their register: a sheet of members with a column per detail, sometimes a second sheet of tithes, sometimes attendance. It costs nothing, everybody has it, and it is a genuine improvement on the book.",
    theirPricing: "Free, or already paid for. That is the strongest argument for it and it is a real one.",
    rows: [
      {
        question: "Several people keeping it",
        them: "One file, one owner. Two copies drift apart within a month.",
        fold: "One register, each person with their own role: the class leader their class, the treasurer the giving.",
      },
      {
        question: "Mobile money giving",
        them: "A wallet statement typed in by hand, matched to members by phone number and memory.",
        fold: "Recorded against the member the moment it succeeds, with a reference.",
      },
      {
        question: "The quarterly return",
        them: "COUNTIF and an evening. Works when the sheet is complete and the person who built the formulas is still there.",
        fold: "Produced for any period from the records. No formulas to inherit.",
      },
      {
        question: "Noticing absence",
        them: "Possible with a column per Sunday and a careful eye. Nobody does it.",
        fold: "Each member compared with their own pattern; the drifters listed.",
      },
      {
        question: "Data protection",
        them: "A file on a personal laptop, emailed and copied, with no record of who has it.",
        fold: "One place, a role per person, an activity log, and separation from other churches enforced by the database.",
      },
      {
        question: "Cost",
        them: "Free.",
        fold: FOLD_PRICING,
      },
      {
        question: "Leaving",
        them: "You already have the file.",
        fold: "Export the whole register as CSV at any time, back into Excel.",
      },
    ],
    chooseThem: {
      title: "Stay on Excel if",
      text: "one person keeps the register and will for years, the church is under fifty, giving is cash counted on Sunday, and the return has never been late. Do not buy software to fix a problem you do not have.",
    },
    chooseFold: {
      title: "Move to software if",
      text: "more than one person needs the register, mobile money has arrived, a class leader should see their class and nothing else, or the return has been late because the file was somewhere else. Import the sheet as it is; nothing is retyped.",
    },
    faq: [
      {
        q: "Can I import my Excel register into church software?",
        a: "Into Fold, yes: save it as CSV and upload it. Fold reads your own column headings, shows which rows could not be used, and imports the rest. The original file stays with you.",
      },
      {
        q: "What is the first thing that breaks in an Excel church register?",
        a: "Two copies. The secretary's laptop and the treasurer's phone each have a version, and by the next return nobody knows which is right. The second is mobile money: gifts arrive as a wallet statement with no names.",
      },
    ],
    sources: [],
    keywords: ["church software vs Excel", "church membership spreadsheet", "Excel church register"],
  },
];

export function getComparison(slug: string) {
  return COMPARISONS.find((c) => c.slug === slug);
}
