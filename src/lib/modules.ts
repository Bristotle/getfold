/**
 * What Fold does, one page per area of the work.
 *
 * A church comparing systems does not search for "church management
 * software". It searches for the thing it is trying to fix: "church member
 * database Ghana", "record tithes and offerings", "send SMS to church
 * members". One page per area answers the search that actually happens, and
 * gives the footer somewhere honest to point.
 *
 * THE RULE FOR THIS FILE. Every line here describes something the product
 * does today, and was checked against the code before it was written.
 * Where something is not built, it says so on the page rather than being
 * quietly left out, because a church that signs up expecting it and finds
 * it missing costs more than the signup was worth.
 *
 * The names deliberately match how the rest of the market labels these
 * areas, Digital Giving and Member Management and the rest, because that is
 * what a pastor comparing three products has in their head. What differs is
 * underneath, and that is where the copy spends its time.
 */

export type Module = {
  slug: string;
  /** The label a church would recognise, used in the footer. */
  title: string;
  /** One line for the index, the meta description and the footer tooltip. */
  summary: string;
  /** The screen in the app this is about, for "see it in the product". */
  where: string;
  intro: string[];
  /** What it does. Each one verified in the product. */
  does: string[];
  /** What makes ours different from the same box on a competitor's page. */
  different: { title: string; body: string }[];
  /** Said plainly rather than omitted. */
  notYet?: string[];
  faqs: { q: string; a: string }[];
  keywords: string[];
};

export const MODULES: Module[] = [
  {
    slug: "digital-giving",
    title: "Digital Giving",
    summary:
      "Take tithes and offerings by MTN MoMo, Telecel Cash or AirtelTigo, with the money settling into your church's own account.",
    where: "Contributions",
    intro: [
      "Most giving in a Ghanaian church is cash, and Fold is built that way round: cash is the default on every form and nothing here requires mobile money. Digital giving sits beside it for the members who are ready for it.",
      "The part worth understanding before you trust any system with this is where the money lands. In Fold it lands with you.",
    ],
    does: [
      "Request a payment from a member's phone on MTN MoMo, Telecel Cash or AirtelTigo Money.",
      "Record the gift against the member and the fund the moment it succeeds.",
      "Thank the giver by text within the minute, in your church's own name.",
      "Show what is still awaiting approval, so nothing is counted before the money moves.",
      "Reconcile a payment by hand if a confirmation is ever missed.",
    ],
    different: [
      {
        title: "The money never passes through us",
        body: "Each church has its own settlement account with Paystack, so giving is paid directly to you. It does not sit in a Fold balance waiting to be passed on. That is the line between being software and handling your church's money, and it is also why we never ask for your account number: Paystack holds it, we hold a reference code and a label.",
      },
      {
        title: "We take nothing from what your members give",
        body: "Our share of each gift is zero. Fold is paid by the church, on a quarterly invoice, and never out of the offering.",
      },
      {
        title: "It is built for how MTN actually works",
        body: "In Ghana a member is not shown a prompt to accept. They are texted a code, and somebody has to enter it. Fold has a box for that code on every waiting payment, which sounds small and is the difference between a payment completing and sitting unfinished forever.",
      },
    ],
    faqs: [
      {
        q: "Does the money go to Fold first?",
        a: "No. Each church has its own settlement account with Paystack and giving is paid directly into it. It never enters Fold's balance.",
      },
      {
        q: "What percentage do you take from giving?",
        a: "None. Fold takes nothing from what your members give. We are paid by the church on a quarterly invoice.",
      },
      {
        q: "Do you store our mobile money number?",
        a: "No. Paystack holds it. Fold keeps an opaque reference and a label such as MTN ending 4417, and a test fails if a column for an account number is ever added.",
      },
      {
        q: "Can we use Fold without mobile money at all?",
        a: "Yes. Cash is the default on every giving form and mobile money can be ignored entirely. Nothing in the product requires it.",
      },
    ],
    keywords: [
      "church mobile money giving Ghana",
      "collect tithe by MTN MoMo",
      "church online giving Ghana",
      "Paystack church donations",
    ],
  },

  {
    slug: "financial-management",
    title: "Financial Management",
    summary:
      "Tithes, offerings, funds and the figures your circuit asks for, in cedis, without a spreadsheet.",
    where: "Contributions, Funds and Reports",
    intro: [
      "A church treasurer usually keeps three things: a book for giving, a book for the building fund, and a spreadsheet somebody built years ago. The quarter ends and an evening goes into turning all three into one return.",
      "Fold keeps them as one record from the start, so the return is a page you print rather than an evening you lose.",
    ],
    does: [
      "Record tithes, offerings, donations, harvest and welfare, by cash or mobile money.",
      "Attribute a gift to a member, or keep it anonymous, which is normal for an offering.",
      "Run named funds with their own running totals, recomputed by the database rather than trusted to a form.",
      "Show giving for any period, with the tithe figure named separately because that is what a circuit asks for.",
      "Print the statistical return for any period, or save it as a PDF.",
    ],
    different: [
      {
        title: "Only leadership sees the giving",
        body: "The pastor, an administrator and a finance officer. A class leader cannot open the giving records at all, and that is enforced by the database rather than by hiding a menu item. Giving is the most sensitive thing a church records and it should not be visible to everyone with a login.",
      },
      {
        title: "Fund totals are computed, not typed",
        body: "A fund's balance is recalculated by a database trigger whenever a contribution changes. Nothing can drift out of step because somebody edited a figure in the wrong place.",
      },
      {
        title: "Quarterly, because your return is quarterly",
        body: "Billing and reporting both run on the same cycle as the statistical return, so the money conversation happens four times a year rather than twelve, and at the moment the treasurer is already looking at the numbers.",
      },
    ],
    faqs: [
      {
        q: "Can a class leader see how much members gave?",
        a: "No. Giving is visible only to the pastor, an administrator and a finance officer, and the restriction is enforced in the database, not just hidden in the interface.",
      },
      {
        q: "Can we record giving without naming the giver?",
        a: "Yes. Anonymous giving is normal for an offering taken in a bowl, and it is a first-class option rather than a workaround.",
      },
      {
        q: "Does Fold produce a statistical return?",
        a: "Yes, for any period you choose, ready to print or save as a PDF, filled in from the attendance and giving you have already recorded.",
      },
    ],
    keywords: [
      "church financial management Ghana",
      "church tithe and offering record keeping",
      "church treasurer software Ghana",
      "church statistical return",
    ],
  },

  {
    slug: "member-management",
    title: "Member Management",
    summary:
      "One register for your whole church, searchable from a phone, in your denomination's own words.",
    where: "Members",
    intro: [
      "The register is the thing everything else hangs on, and in most churches it is a book, a spreadsheet and somebody's memory. Fold keeps one, and it keeps it in the vocabulary your denomination already uses.",
    ],
    does: [
      "Hold every member with their contact details, date of birth, class or group, and status.",
      "Bring in the register you already keep from Excel or Google Sheets, reading your column headings rather than making you rename them.",
      "Take it away again as a spreadsheet whenever you like.",
      "Record visitors, and follow them up.",
      "Transfer a member to another church, with the receiving church accepting them.",
      "Keep vital records: baptisms, confirmations, marriages and funerals.",
      "Surface this week's birthdays on the dashboard, and text a blessing in the church's name.",
    ],
    different: [
      {
        title: "Your denomination's words, not a fixed list",
        body: "Society, circuit, class, assembly, catechumen. Member types are the ones your church uses. Six denominational structures are modelled and checked against each church's own published material: Methodist, Presbyterian, Pentecostal, Anglican, AME Zion and Baptist.",
      },
      {
        title: "No other church can read yours",
        body: "Each church's records are separated at the database level. A request that went around the application entirely would still be refused. We test that by attacking our own system rather than by asserting it.",
      },
      {
        title: "Every change is recorded",
        body: "Who added a member, who changed a status, who removed a record, and when. The log is written by the database rather than the app, and nobody can edit or delete an entry, including the pastor reading it.",
      },
    ],
    faqs: [
      {
        q: "Can we import our existing member list?",
        a: "Yes, from Excel or Google Sheets. Fold reads your column headings rather than making you rename them, and tells you about any row it could not use.",
      },
      {
        q: "Can we get our data back out?",
        a: "Yes, as a spreadsheet, whenever you like, without asking us.",
      },
      {
        q: "Does it understand Bible classes and societies?",
        a: "Yes. Fold is built around how Ghanaian denominations are actually organised rather than around a single independent congregation.",
      },
    ],
    keywords: [
      "church member database Ghana",
      "church membership management software",
      "church register software Ghana",
      "import church members from Excel",
    ],
  },

  {
    slug: "leadership-management",
    title: "Leadership Management",
    summary:
      "Give your pastor, secretary, treasurer and class leaders their own login, each seeing only what their role needs.",
    where: "Team",
    intro: [
      "Sharing one login is how a church ends up unable to answer who changed something. Fold gives everybody their own, with a role that decides what they can reach.",
    ],
    does: [
      "Invite as many people as you like. There is no per-user charge on any band.",
      "Set a role: pastor, administrator, minister, elder, finance officer or class leader.",
      "Restrict giving to leadership and the finance officer.",
      "Hand the church over to another pastor, which only a pastor can do.",
      "See who did what, and when, in the activity log.",
    ],
    different: [
      {
        title: "Roles are enforced by the database",
        body: "Every capability in the interface has a matching rule in the database. Hiding a button is not a permission, and a system that only hides buttons is one clever URL away from showing a class leader the offering figures.",
      },
      {
        title: "Unlimited team members on every band",
        body: "Including the smallest. Charging per user pushes a church towards a shared login, which is the opposite of what anybody should want.",
      },
      {
        title: "An invitation cannot be claimed by the wrong person",
        body: "Membership is granted by matching a verified email address against a pending invitation, so nobody can register as your treasurer without controlling that mailbox.",
      },
    ],
    faqs: [
      {
        q: "Do you charge per user?",
        a: "No. Every band includes unlimited team members, each with their own login and role.",
      },
      {
        q: "Can we stop some people seeing the giving?",
        a: "Yes. Giving is restricted to the pastor, an administrator and a finance officer, and the restriction is enforced in the database.",
      },
      {
        q: "Can we see who changed a record?",
        a: "Yes. The activity log shows who changed what and when, and no one can edit or delete an entry.",
      },
    ],
    keywords: [
      "church leadership management software",
      "church staff roles and permissions",
      "church admin login Ghana",
    ],
  },

  {
    slug: "branch-management",
    title: "Branch Management",
    summary:
      "Headquarters over regions over districts over assemblies, each keeping its own register, with figures that roll up.",
    where: "Branches",
    intro: [
      "A circuit, a district, a presbytery or a diocese is not one church with a bigger register. It is many churches, each keeping its own records, answering upward.",
      "Fold models that directly, to any depth, rather than flattening it into one congregation with groups.",
    ],
    does: [
      "Create branches beneath a church, to any depth.",
      "Let every branch keep its own register, giving and attendance.",
      "Give leadership above a read-only view of everything beneath them.",
      "Sum members, attendance and giving across every church beneath a given point.",
      "Transfer a member from one branch to another.",
    ],
    different: [
      {
        title: "Oversight is read only, deliberately",
        body: "A regional overseer sees every assembly beneath them and cannot write into one. A district office correcting an assembly's register without the assembly knowing is how trust in a system is lost, so the ability simply does not exist.",
      },
      {
        title: "Depth is not capped",
        body: "Headquarters over regions over districts over assemblies, or whatever your denomination calls those layers. Nothing here assumes two levels.",
      },
      {
        title: "Roll-ups obey the same rules as everything else",
        body: "A total is summed from the churches you are actually entitled to see. If a figure looks short, somebody lacks oversight, and that is the answer rather than a number to be forced.",
      },
    ],
    faqs: [
      {
        q: "Can headquarters edit a branch's records?",
        a: "No. Oversight from above is read only by design. A branch's own leadership is the only one that can change its records.",
      },
      {
        q: "How many levels of branch can we have?",
        a: "As many as your denomination has. Branches go to any depth.",
      },
      {
        q: "Does each branch see only its own data?",
        a: "Yes, plus anything beneath it if its leadership oversees other branches.",
      },
    ],
    keywords: [
      "church branch management software Ghana",
      "multi branch church software",
      "circuit district church management",
    ],
  },

  {
    slug: "group-management",
    title: "Group and Cell Management",
    summary:
      "Bible classes, fellowships, cells and societies, each with its leader and its members.",
    where: "Classes and groups",
    intro: [
      "Most church software borrows a small group model from somewhere else and asks a Methodist society to pretend it is a home group. Fold uses the words your church already uses.",
    ],
    does: [
      "Create classes, fellowships, cells or societies, whatever your church calls them.",
      "Name a leader for each one.",
      "Put members into a group when you import your register, not one at a time afterwards.",
      "See membership by group on the statistical return.",
      "Text a whole group from the register.",
    ],
    different: [
      {
        title: "Your structure, not a borrowed one",
        body: "A Bible class, a class leader and a society are real things with real meanings in a Ghanaian church, and they are not the same as a small group with a facilitator. Fold does not rename them for you.",
      },
      {
        title: "Groups come across in the import",
        body: "Create your classes first and the register import drops each member straight into the right one, instead of leaving somebody to reassign four hundred people by hand.",
      },
    ],
    faqs: [
      {
        q: "Can we use our own names for groups?",
        a: "Yes. Bible class, fellowship, cell, society, whatever your church uses.",
      },
      {
        q: "Can members be assigned to a group during import?",
        a: "Yes. Create the groups first and your import will place members into them.",
      },
    ],
    keywords: [
      "church cell group management software",
      "Bible class management Ghana",
      "church small group software",
    ],
  },

  {
    slug: "communication",
    title: "Communication",
    summary:
      "Text your members from the register, in your church's own name rather than ours.",
    where: "Messages",
    intro: [
      "A church's messages should arrive from the church. Fold sends with your church's sender name, so a member sees the name they know rather than the name of a software company they have never heard of.",
    ],
    does: [
      "Text an individual, a group, or the whole register.",
      "Wish members a happy birthday automatically on the day.",
      "Welcome a new member when they are added, if you choose to.",
      "Thank a member by text when their giving is recorded.",
      "Edit the wording of all three, once, and keep it.",
      "See what was sent, what is waiting, and what failed.",
    ],
    different: [
      {
        title: "It comes from your church's name",
        body: "Not from Fold, and not from the SMS provider. You set your sender name once and every message carries it.",
      },
      {
        title: "Automatic messages are off until you switch them on",
        body: "A welcome text that fires whenever somebody is added spends your standing with your own congregation, and that is not ours to spend. Every automatic message is off by default and each one is a separate switch.",
      },
      {
        title: "Templates are written once",
        body: "Set the wording for birthdays, welcomes and thank-yous during setup or later, and it applies from then on. Nobody is composing the same message for the four hundredth time.",
      },
    ],
    notYet: [
      "WhatsApp is not built. It is where Ghanaian churches already talk, and the honest obstacle is that WhatsApp messages come from the platform's number rather than the church's, which would undo the thing that makes this feature worth having. We would rather solve that properly than ship it quickly.",
      "There is no member-facing app, no devotional feed and no in-app chat. Fold is for the people who run the church.",
    ],
    faqs: [
      {
        q: "Do messages come from our church's name?",
        a: "Yes. You set your church's sender name once and every message carries it, rather than arriving from Fold or from an SMS provider.",
      },
      {
        q: "Are birthday texts automatic?",
        a: "Yes, once you switch them on. They are off by default, along with welcome and thank-you messages, because a church should decide before its members start hearing from it.",
      },
      {
        q: "Does Fold send WhatsApp messages?",
        a: "Not yet. WhatsApp messages would come from the platform's number rather than your church's name, which is the main reason churches want this feature at all, so it is on the roadmap rather than shipped.",
      },
    ],
    keywords: [
      "church SMS Ghana",
      "bulk SMS for churches Ghana",
      "church birthday SMS automatic",
      "send SMS to church members",
    ],
  },
];

export const moduleBySlug = (slug: string) =>
  MODULES.find((m) => m.slug === slug);
