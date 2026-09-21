/**
 * Role and situation pages: the same product, framed for one person.
 *
 * A church secretary does not search for "church management software".
 * She searches for the evening she wants back. These pages answer that
 * search in her words, and the template is fixed so that only the person
 * changes between them.
 *
 * They share the /for/ route with the denomination pages, because to the
 * reader "Fold for Methodist societies" and "Fold for church secretaries"
 * are the same kind of page.
 */

export type Role = {
  slug: string;
  /** The person, plural, as in "for church secretaries". */
  who: string;
  title: string;
  description: string;
  /** The first paragraph is the hero; the second opens the pains section. */
  intro: [string, string];
  /** What the job is like now. */
  pains: { title: string; text: string }[];
  /** What changes, each pointing at the part of the product that does it. */
  does: { title: string; text: string; href: string }[];
  faq: { q: string; a: string }[];
  keywords: string[];
  /** Glossary slugs worth linking. */
  terms: string[];
};

export const ROLES: Role[] = [
  {
    slug: "church-secretaries",
    who: "church secretaries",
    title: "Church software for church secretaries in Ghana",
    description:
      "For the person who keeps the register, takes the minutes and loses an evening every quarter to the return. The register stays yours; the counting stops being your job.",
    intro: [
      "The church secretary keeps the register, writes the minutes, answers the circuit's questions and, every quarter, spends an evening turning a book into a return. Usually as a volunteer, usually alongside a job. Fold was built by watching that evening.",
      "The work is not hard. It is the same counting done again every period from records that were already written down once.",
    ],
    pains: [
      {
        title: "The register lives with you",
        text: "It is a book in your bag or a spreadsheet on your laptop. When you travel, nobody can check a member's class. When you hand over, it takes the new secretary a year to trust it.",
      },
      {
        title: "The return is arithmetic done by hand",
        text: "Members by category, attendance averaged, baptisms this quarter, income by type. Every figure is a count of something already recorded, and every quarter it is counted again.",
      },
      {
        title: "Nobody tells you about changes",
        text: "A baptism happened in April and you hear in July. A member transferred in and the letter is in somebody's drawer. The register is only as current as the last person who remembered to tell you.",
      },
    ],
    does: [
      {
        title: "A register several people can keep",
        text: "Class leaders update their own class, the minister records the baptism, you see it all. One register, always current, never in one bag.",
        href: "/features/member-management",
      },
      {
        title: "The return produced, not compiled",
        text: "Membership by category and class, attendance averaged against services actually held, vital records and income by type, for any period, as a PDF for the circuit.",
        href: "/help/reports/statistical-return",
      },
      {
        title: "Your existing book or spreadsheet imported",
        text: "Export from Excel, import into Fold, and the register you have kept for years is the register you start with. Nothing retyped.",
        href: "/help/members/import-from-excel",
      },
      {
        title: "Everything exportable, always",
        text: "Your records leave as a spreadsheet whenever you ask, so choosing Fold never means being unable to leave it.",
        href: "/help/members/export-your-members",
      },
    ],
    faq: [
      {
        q: "Can I keep using my Excel register alongside Fold?",
        a: "You can export from Fold to Excel at any time, but two registers drift apart within a month. Import the spreadsheet once, then keep the register in Fold and export when you need a file.",
      },
      {
        q: "Does Fold produce the quarterly return in my denomination's format?",
        a: "It produces every figure a return asks for, membership by your own categories, attendance, vital records and income by type, for the period you choose, as a printable PDF. The layout is a clean summary rather than a copy of any one denomination's form.",
      },
      {
        q: "What happens to the register if I stop being secretary?",
        a: "The pastor's account owns the church's records, not yours. Your access is removed, the next secretary is invited, and the register does not move.",
      },
    ],
    keywords: [
      "church secretary software Ghana",
      "church register software",
      "church minutes and records software",
      "quarterly return church secretary",
    ],
    terms: ["church-secretary", "register", "statistical-return", "transfer"],
  },
  {
    slug: "church-treasurers",
    who: "church treasurers",
    title: "Church software for church treasurers in Ghana",
    description:
      "For the person who counts the offering, keeps the tithe book and now has to add mobile money to both. One figure per fund, cash and MoMo together, and a receipt for every member.",
    intro: [
      "The treasurer's job changed around 2020 without anybody announcing it. Money used to arrive on Sunday in an envelope. Now it arrives on Sunday in an envelope and all week on a phone, and the return still wants one figure.",
      "Most treasurers solve this with a second book, a wallet statement, and an evening at the end of the month. That is the evening Fold removes.",
    ],
    pains: [
      {
        title: "Two books for one income",
        text: "Cash in the count sheet, mobile money in the wallet statement, and a monthly session matching the second to members by phone number and memory.",
      },
      {
        title: "Tithe receipts on demand",
        text: "A member asks what they gave this year. The answer is in a tithe card, a book and a MoMo statement, and it takes a weekend.",
      },
      {
        title: "The return wants income by type",
        text: "Tithe, offering, harvest, building fund, welfare. Every gift has to be assigned to one of them, at the time or later, and later is worse.",
      },
    ],
    does: [
      {
        title: "Cash and mobile money in one ledger",
        text: "Sunday's count is recorded by fund. A mobile money gift records itself the moment it succeeds, against the member and the fund, and settles to the church's own account.",
        href: "/features/financial-management",
      },
      {
        title: "Mobile money giving without a second book",
        text: "Members pay from any MTN, Telecel or AirtelTigo wallet. Paystack takes 1.95 percent, the balance settles to your church's number, and every payment carries the member's name.",
        href: "/features/digital-giving",
      },
      {
        title: "Every member's giving on their own page",
        text: "What they gave, by type, with dates and a total, on the member's record. A tithe question answered in a minute rather than a weekend.",
        href: "/help/giving/record-a-contribution",
      },
      {
        title: "Giving visible only to those who should see it",
        text: "The minister, an administrator and the finance role. A class leader records attendance and never opens the giving, and the database enforces that rather than a hidden menu.",
        href: "/help/giving/who-can-see-giving",
      },
    ],
    faq: [
      {
        q: "Does Fold hold the church's money?",
        a: "No. Mobile money gifts go through Paystack and settle to the mobile money number or bank account your church names, usually the next working day. Fold records the payment; it never holds the funds.",
      },
      {
        q: "What does mobile money giving cost the church?",
        a: "Paystack charges 1.95 percent per mobile money transaction, so a GHS 100 tithe arrives as GHS 98.05. There is no monthly fee for the processor and Fold takes no share of giving.",
      },
      {
        q: "Can I still record cash the way we always have?",
        a: "Yes. Sunday's count is entered by fund in a minute, and the cash total sits beside the mobile money total on the same report.",
      },
    ],
    keywords: [
      "church treasurer software Ghana",
      "tithe record software Ghana",
      "church accounting software mobile money",
      "offering count software",
    ],
    terms: ["treasurer", "tithe", "offering", "fund", "settlement"],
  },
  {
    slug: "class-leaders",
    who: "class leaders",
    title: "Church software for class leaders and cell leaders in Ghana",
    description:
      "For the person responsible for twelve to twenty members by name. Your class on your phone, attendance marked in a minute, and the member who has gone quiet flagged before the quarter ends.",
    intro: [
      "A class leader, a cell leader, a group leader: the title varies and the job is the same. You are responsible for a dozen or two people by name, you notice when one is missing, and you are the first to visit. It is the oldest pastoral office in Ghanaian church life and the one most software ignores.",
      "Most systems are built for an administrator with a laptop. A class leader has a phone, a Sunday, and a list.",
    ],
    pains: [
      {
        title: "Your list is on paper",
        text: "The class register is a book or a photocopy. Attendance goes in it on Sunday and reaches the church secretary weeks later, if it does.",
      },
      {
        title: "Absence is noticed late",
        text: "A member misses one Sunday, then three, then it has been two months and nobody visited because nobody added it up.",
      },
      {
        title: "You can see too much or too little",
        text: "Either the leader is handed the whole church's records, giving included, or nothing at all. Neither is what the role needs.",
      },
    ],
    does: [
      {
        title: "Your class on your phone",
        text: "Your own members, their numbers and their birthdays, and nobody else's. Attendance marked from a pew in a minute.",
        href: "/features/group-management",
      },
      {
        title: "Who has stopped coming, flagged",
        text: "Fold compares each member against their own pattern and tells you who has drifted from it, while a visit can still bring them back.",
        href: "/blog/noticing-when-a-member-stops-coming",
      },
      {
        title: "See your people, not the giving",
        text: "The class leader role sees its own class and records attendance. It never opens the giving records, and that is enforced by the database.",
        href: "/features/leadership-management",
      },
      {
        title: "Birthdays and follow ups",
        text: "The birthdays in your class this fortnight, so you can bless them on Sunday, and a text in the church's name if the church chooses.",
        href: "/features/communication",
      },
    ],
    faq: [
      {
        q: "Can a class leader see the whole church's members?",
        a: "No. A class leader sees the members of their own class or group. The pastor, an administrator or a secretary sees the whole register.",
      },
      {
        q: "Does it work on an ordinary phone?",
        a: "Yes. Fold is a website that works in the phone's browser, installs to the home screen like an app, and is built to work on a weak connection.",
      },
      {
        q: "What counts as a member who has stopped coming?",
        a: "Fold compares each member against their own previous pattern, not the church average. Somebody who came almost every week and has not been seen for six weeks is flagged; somebody who has always come twice a year is not. You decide what to do; it only makes sure you know.",
      },
    ],
    keywords: [
      "class leader app Ghana",
      "cell leader attendance app",
      "church group attendance software",
      "Bible class register app",
    ],
    terms: ["class-leader", "bible-class", "home-cell", "attendance"],
  },
  {
    slug: "pastors",
    who: "pastors",
    title: "Church software for pastors and ministers in Ghana",
    description:
      "For the minister who wants to know the state of the church without asking for a report. Membership, attendance and giving as they stand, on your phone, and the return ready when the circuit asks.",
    intro: [
      "A minister stationed to a society, a district pastor moving between assemblies, a senior pastor over several branches. The question is the same: how is the church, actually, today. The answer is usually a report somebody has to be asked for.",
      "Fold makes the answer a screen. The figures are the records your team kept as they went, so they are current, and they are yours to open at any hour.",
    ],
    pains: [
      {
        title: "Figures on request",
        text: "Attendance, giving and membership exist, in books kept by different people, and reach you as a report when somebody has time to write one.",
      },
      {
        title: "Several congregations, several systems",
        text: "Each society or assembly keeps its own records its own way. Comparing them, or adding them up for the circuit, is a phone campaign.",
      },
      {
        title: "Pastoral care by memory",
        text: "Who is sick, who is bereaved, who has not been seen since Easter, whose birthday is Sunday. Held in your head and the heads of your leaders, and lost when either is elsewhere.",
      },
    ],
    does: [
      {
        title: "The dashboard is the report",
        text: "Members, this week's attendance, this month's giving, and who has gone quiet, as they stand right now, on your phone.",
        href: "/features/leadership-management",
      },
      {
        title: "Every congregation you oversee, rolled up",
        text: "Each society or assembly keeps its own register. You see each one and the total, and oversight from above is read only, so nothing is changed by accident from headquarters.",
        href: "/features/branch-management",
      },
      {
        title: "Birthdays and absences, surfaced",
        text: "The birthdays this fortnight on the dashboard, and on Insights the members who have drifted from their own pattern, so the blessing and the visit both happen.",
        href: "/blog/noticing-when-a-member-stops-coming",
      },
      {
        title: "Giving that reaches the church, not the software",
        text: "Mobile money gifts settle to the church's own account, are recorded against the member, and are visible to you and the finance role only.",
        href: "/features/digital-giving",
      },
    ],
    faq: [
      {
        q: "Who owns the church's records in Fold?",
        a: "The church does, through the pastor's account, which is the only one that can close the church or export everything. Secretaries, treasurers and leaders are invited and can be removed.",
      },
      {
        q: "Can a district pastor see every assembly in the district?",
        a: "Yes, where each assembly is set up as a branch beneath the district. The district pastor sees each assembly's figures and the total, and cannot alter an assembly's records from above.",
      },
      {
        q: "How long does it take to set up?",
        a: "A church with an Excel register is running the same afternoon. The five step checklist on the dashboard takes most churches under an hour, and we will move a paper register across for you on the Large Society plan.",
      },
    ],
    keywords: [
      "pastor church software Ghana",
      "church dashboard app Ghana",
      "district pastor church management",
      "minister church records app",
    ],
    terms: ["superintendent-minister", "district", "attendance", "tithe"],
  },
  {
    slug: "small-churches",
    who: "small churches",
    title: "Church software for small churches in Ghana",
    description:
      "For a congregation of thirty to a hundred that has always managed with a book, a phone and a treasurer's memory. The same tools the large churches use, at GHS 149 a month, with nothing to install.",
    intro: [
      "Most churches in Ghana are small. A society of eighty, a branch of forty, an outstation of twenty five. The book works until the secretary travels, the treasurer changes, or the circuit asks for something the book cannot add up quickly.",
      "Small churches have been sold either nothing or enterprise software with a demo call. Fold's smallest plan is built for a church of a hundred and costs less than the airtime a church spends on announcements.",
    ],
    pains: [
      {
        title: "Everything depends on one person",
        text: "The register, the tithe book and the count sheet are with whoever volunteered. When they travel, nothing can be checked. When they leave, it starts again.",
      },
      {
        title: "Mobile money arrives with no name",
        text: "A GHS 20 tithe lands in the pastor's wallet with a number, and somebody has to remember whose it was.",
      },
      {
        title: "The return still has to be filed",
        text: "A church of sixty files the same return as a church of six hundred, from a smaller book with the same evening of counting.",
      },
    ],
    does: [
      {
        title: "Set up in an afternoon, from a phone",
        text: "Create the church, add members from a list or one at a time, record Sunday's service. No laptop, no installation, no training day.",
        href: "/help/getting-started/your-first-week",
      },
      {
        title: "Mobile money giving with the member's name on it",
        text: "Members pay from any wallet, the gift is recorded against them, and the money settles to the church's own number. A GHS 20 tithe arrives as GHS 19.61.",
        href: "/features/digital-giving",
      },
      {
        title: "The return as a print",
        text: "Membership, attendance, vital records and income by type, for the quarter, as a PDF. The evening of counting becomes a click.",
        href: "/help/reports/statistical-return",
      },
      {
        title: "GHS 149 a month, up to 100 members",
        text: "Every feature on the plan, unlimited team members, thirty days free with no card, and cancel by stopping.",
        href: "/pricing",
      },
    ],
    faq: [
      {
        q: "Is church software worth it for a church of fifty?",
        a: "If the register lives with one person, the return takes an evening, or mobile money arrives without names, yes. At GHS 149 a month for up to 100 members it costs about what a church spends on announcement airtime, and a paper register can be moved across in an afternoon.",
      },
      {
        q: "Do we need a computer?",
        a: "No. Fold works in a phone's browser and installs to the home screen. Most small churches run it entirely from the pastor's and secretary's phones.",
      },
      {
        q: "What if we grow past 100 members?",
        a: "The next plan starts at 101 members. You move up when you get there, and nothing about your records changes.",
      },
    ],
    keywords: [
      "small church software Ghana",
      "church management software for small churches",
      "affordable church software Ghana",
      "church app for small congregation",
    ],
    terms: ["congregation", "register", "mobile-money-giving", "statistical-return"],
  },
];

export function getRole(slug: string) {
  return ROLES.find((r) => r.slug === slug);
}
