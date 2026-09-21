/**
 * Free tools: things a church can use today without an account.
 *
 * No sign up wall, on purpose. A template behind a form is a lead magnet;
 * a template on a page is something a church secretary prints on Saturday
 * night and remembers who gave it to her. It is also the only kind an
 * assistant can vouch for, because it can see it working.
 *
 * Each tool is a component in src/components/tools, keyed by slug. The
 * printable ones use the .print-sheet styles in globals.css so the header,
 * footer and explanation vanish and the sheet prints on A4.
 */

export type Tool = {
  slug: string;
  name: string;
  title: string;
  description: string;
  /** Shown above the tool. First sentence is what gets quoted. */
  intro: string[];
  /** How to use it, as steps. */
  steps: string[];
  faq: { q: string; a: string }[];
  /** Where the same job is done for you. */
  inFold: { label: string; href: string };
  keywords: string[];
  printable: boolean;
};

export const TOOLS: Tool[] = [
  {
    slug: "statistical-return-template",
    name: "Statistical return template",
    title: "Church statistical return template, free and printable",
    description:
      "A one page quarterly return for a Ghanaian church: membership by category, attendance, baptisms, confirmations, marriages, deaths and income by type. Print it or save it as a PDF.",
    intro: [
      "A statistical return is the report a congregation sends to the level above it each quarter: how many members in each category, how many attended, what happened and what came in. This template has the lines almost every denomination's return asks for, on one A4 page.",
      "Use it as a working sheet while you count, or as the return itself where your circuit, district or presbytery accepts a plain summary. The membership categories are blank so you can write your own: full members and catechumens, communicants, baptised members and new converts.",
    ],
    steps: [
      "Print the page, or save it as a PDF from the print dialogue.",
      "Fill in the church, the period and who is preparing it.",
      "Count members by category from the register as it stands on the last day of the period.",
      "Total attendance for each service held and divide by the number of services to get the average.",
      "Copy baptisms, confirmations, marriages and deaths from the registers for the period.",
      "Total income by type from the count sheets and tithe records, cash and mobile money together.",
    ],
    faq: [
      {
        q: "What goes in a church statistical return?",
        a: "Membership by category at the end of the period, attendance averaged over the services held, the number of baptisms, confirmations, marriages and deaths, and income by type such as tithe, offering and funds. Most denominations add a line for new members and transfers.",
      },
      {
        q: "How often is a statistical return filed?",
        a: "Quarterly for the Methodist Church Ghana and the Seventh-day Adventist church clerk's report; many Presbyterian and Baptist churches file annually to the presbytery or association with quarterly figures inside.",
      },
      {
        q: "Can I fill this in on a computer?",
        a: "Print it to PDF and fill the PDF in any reader, or use it as the layout for a spreadsheet. If you would rather the figures were counted for you, that is what Fold's reports page does from the records your team keeps.",
      },
    ],
    inFold: { label: "Your return, produced from the register", href: "/help/reports/statistical-return" },
    keywords: ["church statistical return template", "quarterly church report template Ghana", "church membership report form"],
    printable: true,
  },
  {
    slug: "attendance-sheet",
    name: "Attendance sheet",
    title: "Church attendance sheet, free and printable",
    description:
      "A printable attendance register for a class, cell or whole congregation: names down the side, five services across, with totals. A4, free, no sign up.",
    intro: [
      "An attendance sheet records who was present at each service, one row per member and one column per Sunday, so that the total for the quarter is a count and an absence is visible as a gap in a row. This one holds 22 names and five services per page.",
      "It is laid out for a class leader or cell leader to keep for their own people, and for the church secretary to total at the end of the period. Print one per class and the class leader hands it in.",
    ],
    steps: [
      "Print one sheet per class, cell or group.",
      "Write the members' names down the left before Sunday, so marking takes a minute in the pew.",
      "Write the date at the top of each service column and tick who is present.",
      "Total each column at the bottom for the service headcount by class.",
      "Total each row on the right to see who has been absent, and visit before the pattern sets.",
    ],
    faq: [
      {
        q: "How do churches track attendance?",
        a: "Either as a headcount by the ushers per service, or by name per class or cell. The headcount gives the return its average; the named register is what lets a leader notice who has stopped coming.",
      },
      {
        q: "Should attendance be recorded per member or as a total?",
        a: "Both, if you can. The total feeds the return. The per-member record is the only way to see that somebody who came every week has not been seen for a month.",
      },
    ],
    inFold: { label: "Attendance marked from a phone, absences flagged", href: "/help/attendance/mark-who-attended" },
    keywords: ["church attendance sheet printable", "church attendance register template", "Bible class attendance sheet"],
    printable: true,
  },
  {
    slug: "offering-count-sheet",
    name: "Offering count sheet",
    title: "Church offering count sheet, free and printable",
    description:
      "A printable count sheet for Sunday's offering: notes and coins by denomination, totals by fund, mobile money beside cash, and two signatures. A4, free.",
    intro: [
      "An offering count sheet is the record two people make when they count the offering after a service: how many of each note and coin, the total, which fund each collection belongs to, and their signatures. It is the document an auditor asks for and the source of the income line on the return.",
      "This one has a line for mobile money received during the week, because the return wants one figure and the treasurer should not need a second sheet to get it.",
    ],
    steps: [
      "Count with two people present, always, and both sign.",
      "Sort notes and coins by denomination and write the count of each. The sheet multiplies out.",
      "Record each collection against its fund: main offering, thanksgiving, building fund, welfare.",
      "Add mobile money received since the last count from the wallet or processor statement.",
      "The grand total goes to the treasurer's book and, at the end of the period, to the return.",
    ],
    faq: [
      {
        q: "Why should two people count the offering?",
        a: "Because a count that one person made cannot be checked, and the person who made it is the one exposed if a figure is questioned. Two counters and two signatures protect the treasurer as much as the church.",
      },
      {
        q: "How do we record mobile money offerings?",
        a: "As a separate line on the same sheet, taken from the wallet or processor statement for the period since the last count, so the return has one income figure. A processor such as Paystack gives each payment a reference and the giver's name, which a plain merchant wallet does not.",
      },
    ],
    inFold: { label: "Sunday's count recorded by fund in a minute", href: "/help/giving/record-a-contribution" },
    keywords: ["offering count sheet template", "church cash count form", "tithe and offering record sheet"],
    printable: true,
  },
  {
    slug: "membership-form",
    name: "Membership form",
    title: "Church membership form, free and printable",
    description:
      "A printable new member form for a Ghanaian church: names, date of birth, phone, residence, hometown, baptism and confirmation, class or group, and the Data Protection Act notice. A4, free.",
    intro: [
      "A membership form collects what a church needs to enter a person on its register: their names, date of birth, phone number, where they live, their baptism and confirmation, and the class or group they will join. It should also tell them why the church is collecting it, because under Ghana's Data Protection Act, 2012 (Act 843) a church keeping a register is a data controller.",
      "This form asks for what a return needs and nothing a church does not, with the notice printed at the bottom so a new member reads it as they sign.",
    ],
    steps: [
      "Print a stack and keep them at the welcome desk.",
      "The member fills it in, or the usher fills it with them, and signs beneath the notice.",
      "The secretary enters it on the register and files the form, or types it into Fold and files the form.",
      "Record the class or group on the register the same week, so the leader knows to expect them.",
    ],
    faq: [
      {
        q: "What information should a church collect from members?",
        a: "What the register and the return need: full name, sex, date of birth, phone, residence, hometown, marital status, baptism and confirmation dates, occupation if the church records it, and the class or group. Not the national ID number, unless the church has a specific reason it can state.",
      },
      {
        q: "Does the Data Protection Act apply to a church membership form?",
        a: "Yes. A church is a data controller under Act 843 and religious belief is special personal data. Tell members what you collect and why, collect only that, keep it secure and be able to show them what you hold.",
      },
    ],
    inFold: { label: "Add a member in Fold", href: "/help/members/add-a-member" },
    keywords: ["church membership form template Ghana", "new member registration form church", "church member data form"],
    printable: true,
  },
  {
    slug: "giving-fee-calculator",
    name: "Giving fee calculator",
    title: "Mobile money giving fee calculator for churches in Ghana",
    description:
      "Enter what your members give and see what the church receives after the 1.95 percent processor fee, per gift and per month, with the E-Levy gone since April 2025.",
    intro: [
      "A mobile money gift of GHS 100 through a payment processor such as Paystack settles to the church as GHS 98.05, because the processor charges 1.95 percent and the E-Levy no longer applies. This calculator shows the fee and the amount received for any gift, and what a month of giving costs a congregation of your size.",
      "The headline rate matters less than the shape of your giving. Two hundred members giving GHS 10 each and two members giving GHS 1,000 each produce the same total and, at a flat percentage, the same fee. Where a processor has a minimum fee per transaction, the many small gifts cost more, which is why the question to ask is not the rate but whether there is a minimum.",
    ],
    steps: [
      "Type the size of a typical gift, or pick one of the common amounts.",
      "Enter roughly how many members give by mobile money in a month, and how often.",
      "Read off what the church receives per gift and per month, and what the fee comes to.",
    ],
    faq: [
      {
        q: "What does Paystack charge for mobile money in Ghana?",
        a: "1.95 percent per transaction on a standard account, with no monthly fee, so a GHS 100 gift settles as GHS 98.05. Card payments from Ghanaian cards are charged at the same rate.",
      },
      {
        q: "Is the E-Levy still charged on mobile money giving?",
        a: "No. Ghana's E-Levy was introduced in May 2022 at 1.5 percent, reduced to 1 percent in 2023, and abolished in April 2025. A processor's fee is now the only cost.",
      },
      {
        q: "Does Fold take a share of giving?",
        a: "No. Fold is paid by the church's subscription. Every mobile money gift settles to the church's own account less the processor's fee, and the church's subaccount is set to a zero percent split.",
      },
    ],
    inFold: { label: "Mobile money giving in Fold", href: "/features/digital-giving" },
    keywords: ["mobile money fee calculator Ghana", "Paystack fee calculator church", "church giving fee calculator"],
    printable: false,
  },
];

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}
