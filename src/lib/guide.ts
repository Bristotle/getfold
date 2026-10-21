/**
 * The pillar page at /guide: "Running a church in Ghana".
 *
 * One page that maps every article, help page, tool, comparison and term
 * on the site onto the work a church actually does, so a reader, a search
 * engine and an assistant can all see the whole subject and how the parts
 * connect. Pages that link to each other by topic are found and cited;
 * pages that stand alone are not.
 *
 * Only slugs live here. Titles and summaries come from each collection at
 * render time, so renaming an article can never leave this page stale, and
 * a slug that no longer exists is simply skipped.
 *
 * Each `answer` is the section's question answered in two or three
 * sentences, written to be useful to a church that never uses Fold.
 */

export type GuideTopic = {
  id: string;
  title: string;
  question: string;
  answer: string;
  posts?: string[];
  /** Help categories, by slug. */
  help?: string[];
  features?: string[];
  tools?: string[];
  integrations?: string[];
  compare?: string[];
  terms?: string[];
  /** Any other page on the site, by path. */
  pages?: { href: string; label: string }[];
};

export const GUIDE_ANSWER =
  "Running a church's administration in Ghana comes down to four records kept honestly: the membership register, attendance at each service, giving including mobile money, and the vital events of baptism, marriage and death. Everything else, the quarterly statistical return, the class lists, the welfare and the follow up of members who drift, is produced from those four. Keep each in one place, record it once at the time it happens, and the reports become copying rather than reconstruction.";

export const GUIDE: GuideTopic[] = [
  {
    id: "register",
    title: "Keeping the membership register",
    question: "What should a church register hold, and how do you keep it current?",
    answer:
      "For each member: full name, phone number, date of birth, the class or group they belong to, their membership category, and the date they joined. Record changes when they happen, a transfer, a death, a member who lapses, rather than once a year, and never delete a person: mark them archived so their history of baptism and giving stays with the church.",
    posts: ["church-record-keeping-guide-ghana", "moving-your-register-from-a-book"],
    help: ["members"],
    features: ["member-management", "group-management"],
    tools: ["membership-form"],
    integrations: ["excel"],
    compare: ["church-software-vs-excel"],
    terms: [
      "register", "member-type", "communicant", "catechumen", "adherent",
      "bible-class", "home-cell", "class-leader", "transfer", "first-time-visitor",
    ],
  },
  {
    id: "attendance",
    title: "Attendance and pastoral care",
    question: "How do you take attendance, and notice who has stopped coming?",
    answer:
      "A head count of men and women per service is enough for the statistical return. Marking who attended by name is what lets you notice a regular member who has quietly stopped coming, by comparing each person with their own usual pattern rather than with the congregation. That needs several weeks of named attendance before it says anything useful.",
    posts: ["noticing-when-a-member-stops-coming"],
    help: ["attendance"],
    tools: ["attendance-sheet"],
    terms: ["attendance", "usher", "elder", "presiding-elder", "deacon"],
  },
  {
    id: "giving",
    title: "Tithes, offerings and mobile money",
    question: "How should a church record giving, including mobile money?",
    answer:
      "Count cash with two people present and record it the same day, by fund. For mobile money, give the congregation one merchant number or payment link in the church's name rather than a personal number, so every gift arrives with a reference and lands in the church's own account. Agree the month's total with the treasurer before it goes into any report.",
    posts: ["how-to-set-up-mobile-money-giving-for-your-church", "what-mobile-money-costs-a-church"],
    help: ["giving"],
    features: ["digital-giving", "financial-management"],
    tools: ["offering-count-sheet", "giving-fee-calculator"],
    integrations: ["mtn-mobile-money", "telecel-cash", "airteltigo-money", "paystack"],
    terms: [
      "tithe", "offering", "harvest", "fund", "welfare", "mobile-money-giving",
      "payment-processor", "settlement", "subaccount", "e-levy", "treasurer", "society-steward",
    ],
  },
  {
    id: "returns",
    title: "The statistical return and reports",
    question: "How do you prepare a church statistical return?",
    answer:
      "Every denomination's return asks for the same five things in its own layout: membership, attendance, vital events, movement in and out, and income for the period. If the register, attendance and giving are kept as they happen, the return is a matter of totalling the quarter and copying the figures across, not an evening of reconciling three books.",
    posts: ["how-to-prepare-your-statistical-return", "statistical-return-without-a-spreadsheet"],
    help: ["reports"],
    tools: ["statistical-return-template"],
    terms: ["statistical-return", "vital-records", "baptism", "confirmation"],
    pages: [
      { href: "/church-statistics-ghana", label: "Church statistics in Ghana, with sources" },
      { href: "/research/church-records-2026", label: "How churches in Ghana keep their records: 2026 survey" },
    ],
  },
  {
    id: "structure",
    title: "Branches, circuits and dioceses",
    question: "How do societies, circuits and headquarters share records?",
    answer:
      "Each local church keeps its own register, because it knows its own people. The levels above, a circuit, district, diocese or national office, need totals and the ability to look, not to edit. Keeping that separation is what lets a superintendent see every society's figures without anybody being able to change another church's records.",
    features: ["branch-management", "leadership-management"],
    terms: [
      "society", "circuit", "diocese", "presbytery", "session", "parish", "deanery",
      "local-assembly", "district", "congregation", "conference", "outstation",
      "superintendent-minister", "presbyter", "catechist", "churchwarden", "vestry", "local-preacher",
    ],
  },
  {
    id: "messages",
    title: "Messages to members",
    question: "How should a church text its members?",
    answer:
      "Send under the church's own sender name, keep each text under 160 characters so it costs one message, and only send what a member would want: a welcome, a receipt for their giving, a birthday greeting, a reminder before a meeting. A church that texts too often teaches its members to ignore it.",
    features: ["communication"],
    integrations: ["arkesel-sms"],
    pages: [{ href: "/examples/church-sms-messages", label: "Example church text messages" }],
  },
  {
    id: "choosing",
    title: "Choosing church management software",
    question: "How do you choose church management software in Ghana?",
    answer:
      "Ask three things before features: will it take mobile money and settle to the church's own account, does it speak your denomination's words and produce your return, and can you take your register out again as a spreadsheet if you leave. Try it for a month with your real register before paying, and compare against a well kept spreadsheet, not against nothing.",
    posts: ["church-management-software-in-ghana"],
    compare: ["asoriba-alternative", "churchcare-alternative", "planning-center-ghana", "church-software-vs-excel"],
    terms: ["church-management-software", "data-controller", "data-processor", "row-level-security", "multi-tenant"],
    pages: [
      { href: "/pricing", label: "Pricing in cedis" },
      { href: "/security", label: "How a church's records are kept private" },
    ],
  },
  {
    id: "starting",
    title: "Getting started",
    question: "Where does a church start?",
    answer:
      "With the register. Bring it over first, from a book or a spreadsheet, check the classes and categories are right, and invite the people who will record attendance and giving. Attendance and giving can begin the following Sunday; the statistical return comes free at the end of the quarter.",
    help: ["getting-started", "team", "account"],
    pages: [{ href: "/getting-started", label: "Getting started with Fold" }],
  },
];
