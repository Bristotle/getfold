/**
 * Blog content.
 *
 * Kept as typed data rather than MDX on purpose. MDX would add a toolchain,
 * a bundle, and a build step for what is currently a handful of articles,
 * and the brief was that this site should be fast. Move to MDX when
 * somebody other than a developer needs to publish.
 *
 * Every article answers a question a Ghanaian church actually has. None of
 * them is a thinly disguised advertisement, because a page that pretends to
 * be advice and turns out to be a pitch loses the reader for good.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

export type Post = {
  slug: string;
  title: string;
  category: string;
  date: string;
  /** ISO, for the machine-readable date and for sorting. */
  published: string;
  excerpt: string;
  body: Block[];
};

export const POSTS: Post[] = [
  {
    slug: "church-management-software-in-ghana",
    title: "Church management software in Ghana: an honest comparison",
    category: "Choosing software",
    date: "September 2026",
    published: "2026-09-07",
    excerpt:
      "Every guide to this is written by one of the vendors, including this one. So here is the version that names what each product is genuinely good at, including the ones that beat us.",
    body: [
      {
        type: "p",
        text: "Search for church management software in Ghana and you will find guides written by the companies selling it. This one is no different, we make Fold, and you should read it knowing that. What we can do is write the version that would survive you checking it, which means naming what our competitors are better at.",
      },
      { type: "h2", text: "What actually matters here" },
      {
        type: "p",
        text: "Before the products, the criteria. Most lists judge on feature counts, which tells you very little. Four things decide whether church software survives its first year in Ghana:",
      },
      {
        type: "list",
        items: [
          "Does it treat cash as normal? Most giving here is cash. Software that treats it as the awkward case was designed for somewhere else.",
          "Does it fit how your church is organised? A society in a circuit is not the same shape as an independent assembly, and neither is a small group.",
          "Does it work on a phone on a weak signal? The person recording a service is standing at the back of it holding a handset.",
          "Can you pay for it, in cedis, without a card?",
        ],
      },
      {
        type: "p",
        text: "A fifth one nobody lists: can you get your data out again. Software that makes leaving difficult is relying on something other than being good.",
      },
      { type: "h2", text: "Shepherd" },
      {
        type: "p",
        text: "The strongest local product, and the one we watch most closely. WhatsApp check-in is genuinely clever, because WhatsApp is where Ghanaian churches already talk. They support mobile money, they price in cedis from GHS 99 with a free tier up to 50 members, and their youth tracking follows Ghana's education stages, which nobody else models.",
      },
      {
        type: "p",
        text: "Choose Shepherd if WhatsApp is how your church communicates, or if you want to see a price before you speak to anyone. What it does not do is denominational structure: no circuit, no society, no Bible class, no quarterly return.",
      },
      { type: "h2", text: "Asoriba" },
      {
        type: "p",
        text: "The most established, running since 2016 with over a thousand churches and genuine international press. Branch management is a first class part of the product rather than a roadmap item, and members get a branded app.",
      },
      {
        type: "p",
        text: "Choose Asoriba if you want an app in your members' hands and you are running several branches today. Pricing is behind a page rather than on the homepage, so budget for a conversation.",
      },
      { type: "h2", text: "ChurchCast" },
      {
        type: "p",
        text: "Ghanaian, built around custom branded apps with sermons, devotionals and a feed, plus multi campus support. They publish their giving fees plainly, mobile money at 1.7 per cent and cards at 2.15 per cent, which more vendors should do.",
      },
      {
        type: "p",
        text: "Choose ChurchCast if a branded app is the point of the exercise. Treat the engagement percentages on their homepage the way you would treat any unfalsifiable number.",
      },
      { type: "h2", text: "DaChurchMan and Msoft" },
      {
        type: "p",
        text: "Both go wide: payroll, HR, asset registers, full accounting, church stores. DaChurchMan runs thirteen modules and Msoft seventeen, across Ghana, Nigeria and Kenya.",
      },
      {
        type: "p",
        text: "Choose either if you need the church office run as a business as well as a congregation. Neither publishes a price, so both mean a demo and a negotiation, which suits a large organisation and frustrates a small one.",
      },
      { type: "h2", text: "The international products" },
      {
        type: "p",
        text: "Planning Center, Breeze, ChurchTrac and Tithe.ly are mature and well built, and it is worth being fair about them rather than using them as a strawman. ChurchTrac from USD 29 a month is genuinely cheap and puts every feature on every tier. Breeze is unusually easy to teach to volunteers.",
      },
      {
        type: "p",
        text: "The catch is real though. They assume card giving, they bill in dollars, they assume a connection that does not drop, and they model one independent congregation. A church here typically buys one, uses a tenth of it, and keeps the book anyway.",
      },
      { type: "h2", text: "Fold" },
      {
        type: "p",
        text: "Ours. Built around denominational structure: societies, circuits, Bible classes, catechumens, class leaders, and the statistical return that assembles itself from what your team recorded through the quarter. Cash is the default and mobile money sits beside it. Thirty days free with no card, and the whole product rather than a limited tier.",
      },
      {
        type: "p",
        text: "What we do not have, plainly: no WhatsApp integration, no member facing app, no multi branch yet, and no payroll or accounting. If any of those is the reason you are looking, one of the products above is a better answer than ours, and we would rather tell you now than after you have moved four hundred members across.",
      },
      {
        type: "quote",
        text: "If your church files a return to a circuit, a presbytery, a diocese or a district, you are the church nobody else in this list is building for.",
      },
      { type: "h2", text: "How to actually decide" },
      {
        type: "p",
        text: "Do not decide on a feature table, including ours. Take the thing that costs your church the most time this quarter, whether that is the return, the register, chasing giving, or knowing who has stopped coming, and ask each vendor to show you that one job end to end. Then ask how you would get your data out. The answers to those two questions will separate the field faster than any list.",
      },
    ],
  },
  {
    slug: "statistical-return-without-a-spreadsheet",
    title: "How to produce your statistical return without a spreadsheet",
    category: "Church admin",
    date: "September 2026",
    published: "2026-09-05",
    excerpt:
      "Most societies rebuild the same return every quarter from a notebook, a cash book and someone's memory. Here is why it takes so long, and what has to change for it to take minutes instead.",
    body: [
      {
        type: "p",
        text: "Ask a church secretary what the worst evening of the quarter is and you will usually get the same answer. It is the one spent assembling the return: counting the register by hand, adding up the cash book, working out an average attendance from a column of Sunday figures, and chasing the class leaders who have not sent theirs in.",
      },
      {
        type: "p",
        text: "The work is not hard. It is that the same facts are recorded in four different places, by four different people, in four different formats, and nothing adds them up for you.",
      },
      { type: "h2", text: "Why it takes a whole evening" },
      {
        type: "p",
        text: "A return usually asks for four kinds of figure, and each one comes from somewhere else:",
      },
      {
        type: "list",
        items: [
          "Membership, from the register, which is a book or a spreadsheet that may not reflect who has actually left",
          "Attendance, from the Sunday counts, which have to be averaged across the period",
          "Vital records, baptisms and confirmations, often only in the minister's own notes",
          "Income, from the cash book, split by tithe, offering and anything raised for a project",
        ],
      },
      {
        type: "p",
        text: "None of those is difficult on its own. The evening disappears into reconciling them: deciding whether the person who transferred out in July still counts, finding the Sunday somebody forgot to write down, and adding a column of figures twice because the first total did not look right.",
      },
      { type: "h2", text: "The fix is not a better spreadsheet" },
      {
        type: "p",
        text: "The instinct is to build a smarter spreadsheet, and it does help for a while. But a spreadsheet still depends on somebody entering the same fact twice, once when it happens and again when the return is due, and that second entry is where the evening goes and where the mistakes creep in.",
      },
      {
        type: "p",
        text: "The change that actually matters is recording each fact once, at the moment it happens, in a form that can be counted later. Attendance recorded on the Sunday. Giving recorded when it is counted. A baptism recorded the week it happens rather than remembered in October.",
      },
      { type: "h2", text: "What that looks like in practice" },
      {
        type: "p",
        text: "If the register, the attendance and the giving all live in the same place, the return stops being a task and becomes a question you ask: what were the figures between January and September? Membership by class, the average across the services you actually held, baptisms and confirmations in the period, and income split by type.",
      },
      {
        type: "p",
        text: "One thing worth insisting on: the average should be calculated against services actually held, not against the number of Sundays in the period. A church that did not meet on two Sundays has a different average from one that did, and a system that divides by the calendar quietly understates every church that lost a week to a funeral or a storm.",
      },
      {
        type: "quote",
        text: "Record each fact once, when it happens. Everything else is arithmetic, and arithmetic is what a computer is for.",
      },
      { type: "h2", text: "Where to start if you are still on paper" },
      {
        type: "p",
        text: "Do not try to move ten years of records. Start with the people who come every week, this Sunday's head count, and this month's giving. One quarter later you will have a return that assembles itself, and you can add the history at your own pace, or never.",
      },
    ],
  },
  {
    slug: "moving-your-register-from-a-book",
    title: "Moving your church register from a book to a computer",
    category: "Church admin",
    date: "September 2026",
    published: "2026-09-04",
    excerpt:
      "Churches lose their records to floods, fires, and the one person who knew where everything was. Moving the register is less work than it looks, and there is a right order to do it in.",
    body: [
      {
        type: "p",
        text: "Most churches have their register in a hardback book, and it works, until it does not. The book is in the vestry when the person who needs it is at home. It gets wet. The handwriting from 1998 is nobody's now. And the class leader who kept the real list of who still attends has moved away.",
      },
      { type: "h2", text: "Do not start by typing everything" },
      {
        type: "p",
        text: "The most common mistake is treating this as a data entry project: sitting down with the book and typing four hundred names before using the software for anything. It takes weeks, it is dull, and churches abandon it halfway through with half a register in two places, which is worse than where they started.",
      },
      { type: "p", text: "A better order:" },
      {
        type: "list",
        items: [
          "Start with the people who come every week. That is your working register, and it is usually a fraction of the book",
          "Add your classes and fellowships, and who leads each one, before adding members, so people can be filed correctly as they go in",
          "Record this Sunday's service. The system starts being useful immediately rather than after the typing is done",
          "Add the rest of the book gradually, or when a person next comes up, a wedding, a transfer, a funeral",
        ],
      },
      { type: "h2", text: "If part of it is already typed" },
      {
        type: "p",
        text: "Many churches have a partial list in Excel from some earlier effort. That is worth more than it looks. Export it as CSV and import it, rather than retyping. Good software reads your column headings rather than making you rename them, and tells you which rows it could not use so you can fix them.",
      },
      {
        type: "p",
        text: "Two things to watch when exporting from Excel. Phone numbers lose their leading zero unless the column is formatted as text, so 0244 becomes 244. And dates written as 03/04/1990 are ambiguous, that is March in some systems and April in others. Where a date matters, write it as 1990-04-03, which cannot be misread.",
      },
      { type: "h2", text: "Decide what you actually need to record" },
      {
        type: "p",
        text: "There is a temptation to capture everything: occupation, marital status, education, next of kin. Resist it at the start. Every field you add is a field somebody has to fill in four hundred times, and a mostly-empty column tells you nothing.",
      },
      {
        type: "p",
        text: "A name and a phone number is a working register. Add a member type if your denomination distinguishes them. Everything else can wait until you know you will use it.",
      },
      { type: "h2", text: "Keep the book" },
      {
        type: "p",
        text: "Do not throw it away, and do not stop writing in it on the first Sunday. Run both for a month. When the computer has not lost anything and the return came out right, the book becomes the archive it should have been all along.",
      },
    ],
  },
  {
    slug: "what-mobile-money-costs-a-church",
    title: "What mobile money actually costs a church in Ghana",
    category: "Giving",
    date: "September 2026",
    published: "2026-09-03",
    excerpt:
      "The headline rate is not the number that matters. For churches collecting many small offerings, the minimum fee per transaction can cost more than the percentage.",
    body: [
      {
        type: "p",
        text: "Mobile money is the obvious way for a church to accept giving from members who are not in the building, and providers advertise a straightforward percentage. What that headline rate does not tell you is what it costs on the amounts churches actually collect.",
      },
      { type: "h2", text: "The percentage is the easy part" },
      {
        type: "p",
        text: "Rates in Ghana cluster closely. At the time of writing the major processors charge around 1.95 per cent on mobile money, and the differences between them are small enough that price alone should not decide it.",
      },
      {
        type: "p",
        text: "On a GHS 500 tithe, that is about ten cedis. Reasonable, and comparable to what handling and banking cash costs in time.",
      },
      { type: "h2", text: "The minimum fee is what to look at" },
      {
        type: "p",
        text: "Some processors apply a minimum charge per transaction, often around 30 pesewas. On a large tithe that is invisible. On a GHS 5 offering it is six per cent, three times the advertised rate.",
      },
      {
        type: "p",
        text: "This matters more for churches than for most businesses, because a congregation gives in many small amounts rather than a few large ones. Two hundred members giving GHS 10 each is a very different fee bill from two members giving GHS 1,000.",
      },
      {
        type: "quote",
        text: "Model your fees on the amounts your congregation actually gives, not on the headline rate.",
      },
      { type: "h2", text: "What else to check before signing up" },
      {
        type: "list",
        items: [
          "Whether there is a minimum fee, and what it is. This is the number that will surprise you",
          "How long settlement takes. Daily settlement is common; some processors hold funds two or three days",
          "What documents onboarding requires. Some accept a Ghana Card and a personal payout account; others require full business registration, an operating permit and a district assembly licence",
          "Whether the account can accept all three networks, MTN, Telecel and AirtelTigo, or only some",
        ],
      },
      { type: "h2", text: "Keep cash first" },
      {
        type: "p",
        text: "The strongest argument for mobile money is not that it replaces the offering bowl. It is that it catches the giving that would otherwise not happen: the member who is travelling, the one who is ill, the one who forgot to draw cash.",
      },
      {
        type: "p",
        text: "A church that makes mobile money the main path will exclude the members who do not use it, and in most congregations that is still a large number of people, often the oldest and most faithful. Cash should stay the default and mobile money should sit beside it.",
      },
    ],
  },
  {
    slug: "noticing-when-a-member-stops-coming",
    title: "Noticing when a member has quietly stopped coming",
    category: "Pastoral care",
    date: "September 2026",
    published: "2026-09-02",
    excerpt:
      "People rarely leave a church by announcing it. They come less, then not at all, and by the time anyone notices it has been four months. Head counts cannot see it. Here is what can.",
    body: [
      {
        type: "p",
        text: "Almost nobody leaves a church by telling the pastor. They come fortnightly instead of weekly, then monthly, then at Christmas, then not at all. Six months later somebody asks after them and nobody is quite sure when they were last seen.",
      },
      {
        type: "p",
        text: "By that point a visit is a difficult conversation. Four months earlier it would have been a phone call.",
      },
      { type: "h2", text: "Why a head count cannot tell you" },
      {
        type: "p",
        text: "Most churches record attendance as a number: so many men, so many women. It is quick, it is what the return asks for, and it is genuinely useful for spotting whether the congregation is growing.",
      },
      {
        type: "p",
        text: "But a total cannot tell you who is missing. A church of 300 that loses eight regular members and gains eight visitors looks identical on paper, while eight families have quietly drifted away.",
      },
      { type: "h2", text: "The signal is a change, not a level" },
      {
        type: "p",
        text: "The instinct is to look for low attendance. That is the wrong measure, and it produces a list of people who were never very involved in the first place. Someone who has always come twice a year is not drifting. They are simply someone who comes twice a year.",
      },
      {
        type: "p",
        text: "What matters is a change against a person's own pattern. Someone who came almost every week for six months and has not been seen for six weeks is a different case entirely, and that is the one worth a phone call.",
      },
      {
        type: "quote",
        text: "Compare each member against their own history, not against the congregation's average.",
      },
      { type: "h2", text: "Measure against services actually held" },
      {
        type: "p",
        text: "One detail that is easy to get wrong: attendance has to be judged against the services the church actually held, not against the number of weeks. If your church did not meet for two Sundays, everybody's attendance looks worse, and a naive calculation will hand the pastor a list of forty people who have done nothing unusual.",
      },
      { type: "h2", text: "What it costs to start" },
      {
        type: "p",
        text: "The only new work is naming who attended, rather than only counting. On paper that is a slow job. Done on a phone, with a searchable list and one save at the end, it takes a couple of minutes at the back of the service, and it need not be perfect. Even the regulars alone will tell you most of what you need.",
      },
      {
        type: "p",
        text: "And there is no shortcut on time. You cannot know who is drifting until there is a pattern to drift from, which means a few weeks of recording before anything useful appears. That is worth saying plainly, because software that promises otherwise is guessing.",
      },
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

export const sortedPosts = [...POSTS].sort((a, b) =>
  b.published.localeCompare(a.published)
);
