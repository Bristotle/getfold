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
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "quote"; text: string }
  /*
    Questions people actually type into a search engine, with the answer in
    the first sentence. Rendered as a visible FAQ at the end of the post and
    emitted as FAQPage structured data from the same array, so the two can
    never drift apart. The wording of the questions comes from real searches
    and "people also ask" boxes, never from imagination: an invented
    question matches nothing.
  */
  | { type: "faq"; items: { q: string; a: string }[] }
  /*
    Where the numbers came from. A figure with a source is a fact; a figure
    without one is a claim, and a reader deciding whether to trust a page
    about their church's money can tell the difference.
  */
  | { type: "sources"; items: { label: string; url: string }[] };

export type Post = {
  slug: string;
  title: string;
  category: string;
  date: string;
  /** ISO, for the machine-readable date and for sorting. */
  published: string;
  /** ISO, when substantively revised. Search engines reward a real date. */
  updated?: string;
  excerpt: string;
  body: Block[];
};

export const POSTS: Post[] = [
  {
    slug: "how-to-prepare-your-statistical-return",
    title: "How to prepare your church's statistical return, step by step",
    category: "Running the church",
    date: "September 2026",
    published: "2026-09-17",
    updated: "2026-09-17",
    excerpt:
      "What the quarterly return asks for, where each figure comes from, and the checklist that turns an evening of reconciling three books into an hour. Written for the society secretary who has to produce it.",
    body: [
      {
        type: "p",
        text: "The Methodist Church Ghana alone has 4,934 societies in 337 circuits, and each society sends its circuit a statistical return every quarter. Add the Presbyterian congregations reporting to districts, the Pentecostal assemblies reporting to district offices, and the Anglican parishes reporting to dioceses, and the return is one of the most widely produced documents in Ghanaian church life. It is also one of the least documented: search for how to prepare one and you find denominational history, not instructions.",
      },
      {
        type: "p",
        text: "The exact form differs by denomination, but the numbers underneath are the same five kinds everywhere. Once you know where each lives, any form is a matter of copying across.",
      },
      { type: "h2", text: "The five things every return asks for" },
      {
        type: "list",
        items: [
          "Membership at the end of the period, usually by class, society or group, and often split by men, women and children.",
          "Attendance across the period, as a total or an average per service, with the number of services held.",
          "Vital events: baptisms, confirmations, marriages and deaths, each a count and often a list of names.",
          "Movement: members received, transferred in, transferred out, and lapsed.",
          "Income: tithes, offerings and named funds for the period, in cedis.",
        ],
      },
      {
        type: "p",
        text: "The first four come from the register; the fifth from the offering book. That split is why the return takes an evening: two sources, kept by two people, reconciled by a third.",
      },
      { type: "h2", text: "Where each figure comes from" },
      { type: "h3", text: "Membership by class" },
      {
        type: "p",
        text: "This is the count of active members on the last day of the quarter, not the number of names in the book. A book accumulates names for years; a return wants the people who are members now. If your register does not mark active against lapsed, that is the first job, because every quarter after inherits it. Count by class, then add the classes. If the total disagrees with the count of active names, somebody is in two classes or none.",
      },
      { type: "h3", text: "Attendance" },
      {
        type: "p",
        text: "Most returns want an average per Sunday, so you need every Sunday's count and the number of Sundays. A head count of men and women is enough. The common mistake is averaging over the calendar rather than over services actually held: a quarter with a funeral week and a harvest Sunday might have eleven services, and dividing by thirteen understates the church by fifteen percent.",
      },
      { type: "h3", text: "Baptisms, confirmations, marriages, deaths" },
      {
        type: "p",
        text: "Dated events, so the only question is whether the date falls inside the quarter. Keep them in one place with a date each and the return is a count of rows between two dates. Churches that keep them as notes in the minister's diary spend longest here.",
      },
      { type: "h3", text: "Transfers" },
      {
        type: "p",
        text: "A transfer is a member moving between congregations of the same denomination, and both ends should record it: a transfer out at the sending church, a transfer in at the receiving one. Across a circuit the totals should balance. They rarely do, because one end forgets, which is precisely why the circuit asks.",
      },
      { type: "h3", text: "Income, including the money that never touched the bowl" },
      {
        type: "p",
        text: "Tithes and offerings for the period, from the offering book or the treasurer's ledger. The figure most often wrong is mobile money. Ghanaians moved GHS 4.54 trillion through mobile money in 2025, up 50.8 percent on the year, across 26.7 million active accounts, and a growing share of church giving arrives that way. It lands on a handset, not in a bowl, so it is frequently absent from the offering book and therefore from the return.",
      },
      { type: "h2", text: "The evening before, in six steps" },
      {
        type: "steps",
        items: [
          "Mark the register: every name active, lapsed, transferred out or deceased. Once done properly, this is five minutes a quarter.",
          "Gather every Sunday's count and the number of services held. A missing Sunday is a question for the class leader, not a guess.",
          "List the quarter's baptisms, confirmations, marriages and deaths with dates, and check the minister's diary against your list.",
          "List transfers in and out, and confirm each transfer out has been received somewhere.",
          "Get income from the treasurer, including mobile money, and agree the total with them before writing it down.",
          "Fill the form, add the classes, and check the total equals the count of active names. If not, stop and find out why.",
        ],
      },
      { type: "h2", text: "Why it takes an evening, and how to make it an hour" },
      {
        type: "p",
        text: "The evening goes on reconciling. The membership book, the class registers and the offering book are three records of one church kept by three people, and every quarter somebody makes them agree. The arithmetic is trivial; the work is finding the class leader with the missing Sunday.",
      },
      {
        type: "p",
        text: "The fix is one record rather than three, so that marking a member transferred out removes her from the class count at the same moment, and recording an offering puts it in the quarter's total at the same moment. A spreadsheet does part of this if one person keeps it. Software built for churches does the rest and produces the return as a page to print.",
      },
      {
        type: "quote",
        text: "If your return took more than an hour this quarter, the time went into reconciling records that should have been one record. That is worth fixing once rather than paying for every quarter.",
      },
      {
        type: "faq",
        items: [
          { q: "What is a church statistical return?", a: "A periodic report, usually quarterly, from a congregation to the level above it: circuit, district, presbytery or diocese. It states membership, attendance, baptisms, marriages, deaths, transfers and income for the period so the denomination can see the state of each church." },
          { q: "Who prepares the statistical return?", a: "Usually the society or church secretary, with attendance from the class leaders and income from the treasurer. The minister signs it before it goes up." },
          { q: "How often is it submitted?", a: "Quarterly in most Ghanaian denominations, including the Methodist Church Ghana, with an annual summary at conference or synod. Some districts also ask for a monthly attendance figure." },
          { q: "Does mobile money giving count?", a: "Yes. Tithes and offerings received by MTN MoMo, Telecel Cash or AirtelTigo Money are income for the period exactly as cash is. They are often left out because they never pass through the offering book." },
          { q: "Can software produce the return automatically?", a: "Yes, if the register, attendance and giving are kept in it. Church management software built for Ghanaian denominations, including Fold, produces the return for any period from records already entered." },
        ],
      },
      {
        type: "sources",
        items: [
          { label: "World Methodist Council, Methodist Church Ghana: members, dioceses, circuits and societies", url: "https://worldmethodistcouncil.org/africa/name/ghana-methodist-church/" },
          { label: "Bank of Ghana via MyJoyOnline, mobile money transaction values grew 50.8% to GHS 4.54 trillion in 2025", url: "https://www.myjoyonline.com/total-mobile-money-transaction-values-grew-by-50-8-to-gh%C2%A24-54trn-in-2025/" },
        ],
      },
    ],
  },
  {
    slug: "church-record-keeping-guide-ghana",
    title: "Keeping the church register: a guide for the church secretary",
    category: "Running the church",
    date: "September 2026",
    published: "2026-09-17",
    updated: "2026-09-17",
    excerpt:
      "What to record for each member, how to keep a register that survives a change of secretary, what the Data Protection Act asks of a church, and when a book, a spreadsheet or software is the right tool.",
    body: [
      {
        type: "p",
        text: "Ghana's 2021 census counted 71.3 percent of the country as Christian, roughly 22 million people, and nearly every one of them is on a register somewhere: a book in a vestry, a spreadsheet on a secretary's laptop, or a system somebody set up and left. The register is the church's memory. The return, the birthday list, the count of who has stopped coming and the letter of transfer all come out of it, and every one of those is only as good as the register underneath. This is how to keep one properly, written for the person who has just been handed it.",
      },
      { type: "h2", text: "Six fields, always filled in" },
      {
        type: "p",
        text: "A register with twelve fields half filled is worse than one with six always filled, because a blank you cannot trust poisons the fields around it. These six earn their place:",
      },
      {
        type: "list",
        items: [
          "Full name as they would write it, family name last, so the register sorts and searches.",
          "A phone number they actually answer, in full: 024 400 0000, not the last six digits somebody remembers. With 26.7 million active mobile money accounts in Ghana, a phone number is also how most members will give.",
          "Date of birth, or at least month and day. This is what makes a birthday text possible, and a birthday text from the church is worth more than it costs.",
          "Class, fellowship, cell or society, in your denomination's own word. Membership is counted by group on every return.",
          "Status: active, lapsed, transferred out or deceased. The most important field, and the one most registers lack.",
          "The date they joined, were received or were baptised. Membership is usually defined by one of these, and a dispute is settled by it.",
        ],
      },
      { type: "h2", text: "Why status matters most" },
      {
        type: "p",
        text: "A book accumulates names for years and never loses one. That is fine as a history and useless as a register, because the return wants the people who are members now. The difference between a book with 400 names and a church with 212 active members is the status field, and without it every quarter's count starts from scratch. Mark every name once, then change a status when something happens: a transfer letter goes out, a funeral is held, a class leader confirms somebody has not been seen for a year. Never delete a name. A member who lapses and returns should find her record waiting, baptism date and all.",
      },
      { type: "h2", text: "Transfers, in both directions" },
      {
        type: "p",
        text: "When a member moves within the denomination, the sending church issues a letter of transfer and marks the record transferred out; the receiving church marks a transfer in. Both should happen, and the circuit checks they balance. The commonest failure is a member attending her new church for a year while still counted at the old one.",
      },
      { type: "h2", text: "What the Data Protection Act asks of a church" },
      {
        type: "p",
        text: "Under the Data Protection Act, 2012 (Act 843), a church that keeps a register is a data controller, and religious belief is special personal data. Three consequences follow, none onerous:",
      },
      {
        type: "list",
        items: [
          "Collect what you need and say why. A member who gave her number for the register should not find it on a fundraising list she never agreed to.",
          "Keep it where only the right people can reach it. A register on a laptop with no password, or forwarded round a WhatsApp group, is exactly what the Act is about.",
          "Show it or delete it on request. A member who leaves can ask what you hold and ask you to remove it, and you should be able to do both.",
        ],
      },
      {
        type: "p",
        text: "The Data Protection Commission expects organisations holding personal data to register with it. Whether your church has is worth raising at the next council meeting.",
      },
      { type: "h2", text: "Book, spreadsheet or software" },
      {
        type: "p",
        text: "A book is cheap, needs no electricity and everyone understands it. Only one person can use it at a time, it cannot be counted without reading every page, and one fire ends the church's memory. If yours is a book, keep a second copy elsewhere and update it quarterly.",
      },
      {
        type: "p",
        text: "A spreadsheet is searchable, countable and free, and works while one person keeps it. It stops working the first time it is emailed and two copies exist. Keep it in Google Sheets rather than on one laptop, and give the pastor access.",
      },
      {
        type: "p",
        text: "Software gives several people one record, counts itself, and produces the return and the birthday list without anyone compiling them, for a quarterly subscription and an evening moving the register across. Choose one that reads your spreadsheet in, lets you export it out, and understands your denomination rather than treating a society as a small group.",
      },
      { type: "h2", text: "Moving from a book" },
      {
        type: "steps",
        items: [
          "Do not type the whole book. Start with last Sunday's congregation, then the Sunday before. Active members first; the rest over a month.",
          "Decide the six fields before you start. Adding a column halfway means going back over every row.",
          "Set a status for every name as you go. This is the one chance to do it cleanly.",
          "Give each class leader their own list to check. They know who has moved and who has died.",
          "Keep the book. A baptism date from 1987 is still a baptism date.",
        ],
      },
      {
        type: "faq",
        items: [
          { q: "What should a church membership register contain?", a: "At minimum: full name, phone number, date of birth, the class or group, status (active, lapsed, transferred or deceased), and the date they joined or were baptised. Address and next of kin are useful if the church keeps them current." },
          { q: "How do you keep church records safe?", a: "Keep a second copy away from the church building, limit access to the pastor, the secretary and named officers, and never forward the whole register through a messaging group. Digital records need a password and a backup on a different device." },
          { q: "Does the Data Protection Act apply to churches in Ghana?", a: "Yes. A church keeping a register is a data controller under Act 843, and religious belief is special personal data. Collect only what you need, keep it secure, and be able to show or delete a member's record on request." },
          { q: "Spreadsheet or software for church members?", a: "A spreadsheet works while one person keeps it. Software makes sense once several people record attendance, giving and members, because it keeps one record and produces the return without compiling. Choose one that imports your spreadsheet and exports it back." },
        ],
      },
      {
        type: "sources",
        items: [
          { label: "Ghana Statistical Service, 2021 Population and Housing Census, religious affiliation", url: "https://census2021.statsghana.gov.gh/" },
          { label: "Bank of Ghana via MyJoyOnline, active mobile money accounts reached 26.7 million in 2025", url: "https://www.myjoyonline.com/total-mobile-money-transaction-values-grew-by-50-8-to-gh%C2%A24-54trn-in-2025/" },
          { label: "Data Protection Act, 2012 (Act 843), Data Protection Commission of Ghana", url: "https://www.dataprotection.org.gh/" },
        ],
      },
    ],
  },
  {
    slug: "how-to-set-up-mobile-money-giving-for-your-church",
    title: "How to set up mobile money giving for your church",
    category: "Giving",
    date: "September 2026",
    published: "2026-09-17",
    updated: "2026-09-17",
    excerpt:
      "A MoMo number on the projector is where most churches start and where the problems begin. The three ways to take mobile money giving, what each costs, what your members will actually see on their phones, and how the money reaches the church.",
    body: [
      {
        type: "p",
        text: "Ghanaians moved GHS 4.54 trillion through mobile money in 2025, half again as much as the year before, across 26.7 million active accounts and nearly half a million agents. A church that does not take mobile money is asking a congregation that pays for everything else on a handset to bring cash for one thing. Most churches know this, and most started the same way: a MoMo number on the projector and a request from the pulpit. It works, in the sense that money arrives. It also arrives on somebody's phone with no record of who sent it or what it was for, and that is where the trouble starts.",
      },
      { type: "h2", text: "Why the number on the projector is a problem" },
      {
        type: "list",
        items: [
          "The money lands in a personal wallet, usually the treasurer's or the pastor's. Separating it from their own money is a weekly manual job and a trust problem waiting to happen.",
          "Nobody knows who gave. A transfer carries a name and a number, but matching thirty of them to the register on a Sunday evening does not get done, so the giving is recorded as anonymous or not at all.",
          "It is invisible to the return. Money that never passed through the offering book is money the quarterly return does not know about.",
          "It depends on one person and one phone.",
        ],
      },
      { type: "h2", text: "Three ways to do it properly" },
      { type: "h3", text: "A merchant mobile money account" },
      {
        type: "p",
        text: "MTN, Telecel and AirtelTigo each offer a merchant account registered to the church, separate from any personal wallet. Members pay to a short code, the money sits in an account the church controls, and a statement comes with it. This fixes the personal wallet problem and gives a record of every transaction. It does not tell you which member gave unless they add a reference, and it does not connect to your register. Setting one up needs the church's registration documents and a visit to the network.",
      },
      { type: "h3", text: "A payment processor" },
      {
        type: "p",
        text: "A processor such as Paystack or Hubtel sits between the member and the church. The member pays through it, it takes a fee, and the balance settles to an account the church names, which can be a mobile money number or a bank account. Every payment carries a reference, so the church can tell who paid what. Paystack charges 1.95 percent on mobile money in Ghana, so a GHS 100 tithe reaches the church as GHS 98.05. Once the church's registration is verified, the processor handles all three networks, so a member on Telecel and one on MTN pay the same way.",
      },
      { type: "h3", text: "Church software with giving built in" },
      {
        type: "p",
        text: "Church management software that includes giving does the processor step for you and connects each payment to the register: the gift is recorded against the member and the fund the moment it succeeds, and appears in the quarterly return without anybody copying it across. Underneath it is usually a processor, so the fee is the processor's fee. The question to ask any vendor is not what percentage they take but whether the money ever passes through their account at all. If it does, they are holding your church's tithes, which is a different relationship from selling you software.",
      },
      { type: "h2", text: "What your members will actually see" },
      {
        type: "p",
        text: "Nobody explains this in advance. When a member pays through a processor on MTN, they do not get a prompt to approve. They get a text: Enter code 098055 to pay GHS 50.00 to <the merchant name>. Somebody has to type that code back, and until it goes in nothing has been paid. After a few minutes the attempt expires.",
      },
      {
        type: "p",
        text: "Two things follow. The person collecting needs somewhere to enter the code and needs to know to ask for it, or the payment sits unfinished while the member believes they have given. And the merchant name on that text is the processor account's registered name, not necessarily your church's. Whoever sets this up should tell you what that name will be, and a thank you text from the church itself a few minutes later does a great deal to close the gap.",
      },
      { type: "h2", text: "What to tell the congregation" },
      {
        type: "steps",
        items: [
          "Say it from the pulpit once, properly: which method, what the text message will say, and that a thank you will follow from the church.",
          "Keep cash exactly as it was. Treating cash as the awkward option loses the people who give most.",
          "Name what the money is for when you ask. A member paying tithe wants it recorded as tithe.",
          "Put it on the notice board and in the bulletin, because half the congregation was talking during the announcement.",
          "Acknowledge it. Money that arrives on a handset and is never thanked is money that stops arriving.",
        ],
      },
      { type: "h2", text: "Reconciling it with the books" },
      {
        type: "p",
        text: "Whichever method you use, the treasurer needs the mobile money total beside the cash total or the return is wrong. With a merchant account that means downloading a statement monthly. With a processor it means the same from its dashboard. With software it means nothing, because the gift was recorded when it succeeded. That difference is the whole argument for the third option, and it is worth more than the fee.",
      },
      {
        type: "faq",
        items: [
          { q: "How do churches in Ghana collect tithes by mobile money?", a: "Three ways: a personal or merchant MoMo number members transfer to, a payment processor such as Paystack or Hubtel that settles to the church's account, or church software with giving built in that records each gift against the member. Most start with a number on the projector and move on when reconciling it becomes a burden." },
          { q: "What does Paystack charge for mobile money in Ghana?", a: "1.95 percent per mobile money transaction, so a GHS 100 gift settles as GHS 98.05. There is no monthly fee on a standard account." },
          { q: "Does the member get a prompt to approve the payment?", a: "On MTN in Ghana, usually not. The member receives a text containing a code, and the code has to be entered to complete the payment. Nothing is paid until it is, and the attempt expires after a few minutes." },
          { q: "Can a church use its own MoMo number for offerings?", a: "Yes, and many do, but a personal wallet mixes church money with somebody's own, records nobody, and is invisible to the offering book. A merchant account is the minimum improvement; a processor or church software adds the record of who gave what." },
        ],
      },
      {
        type: "sources",
        items: [
          { label: "Bank of Ghana via MyJoyOnline, mobile money transaction values, active accounts and agents, 2025", url: "https://www.myjoyonline.com/total-mobile-money-transaction-values-grew-by-50-8-to-gh%C2%A24-54trn-in-2025/" },
          { label: "Paystack, transaction pricing for Ghana", url: "https://paystack.com/gh/pricing" },
          { label: "Graphic Online, offertory and tithe go digital as churches introduce e-payments", url: "https://www.graphic.com.gh/news/general-news/offertory-tithe-go-digital-as-churches-introduce-e-payments.html" },
        ],
      },
    ],
  },
  {
    slug: "church-management-software-in-ghana",
    title: "Best church management software in Ghana (2026)",
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
        text: "What we do not have, plainly: no WhatsApp integration, no member facing app, and no payroll or accounting. Branches exist, a circuit can oversee its societies and each keeps its own register, but figures do not yet roll up into one view and the tree is one level deep, so a national headquarters with regions above districts above assemblies is not served yet. If any of those is the reason you are looking, one of the products above is a better answer than ours, and we would rather tell you now than after you have moved four hundred members across.",
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
