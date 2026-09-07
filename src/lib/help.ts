/**
 * The help centre.
 *
 * Typed data rather than a hosted help desk, for the same reason the blog
 * is: it renders as static HTML, it costs nothing to serve, and it works on
 * a weak connection. A church looking something up on a Sunday morning
 * should not be waiting on a third party's JavaScript.
 *
 * Every article describes what the product actually does. Where a thing is
 * genuinely not built yet, the article says so plainly rather than
 * describing a screen that does not exist, because a help centre that lies
 * costs more support time than no help centre at all.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "list"; items: string[] }
  | { type: "note"; text: string };

export type Article = {
  slug: string;
  title: string;
  summary: string;
  body: Block[];
};

export type Category = {
  slug: string;
  title: string;
  description: string;
  /** Key into the icon map in the help pages. */
  icon: string;
  articles: Article[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    description:
      "Create your church, bring in your register, and get your team logged in.",
    icon: "rocket",
    articles: [
      {
        slug: "create-your-church",
        title: "Create your church account",
        summary:
          "What happens between signing up and having a church you can add people to.",
        body: [
          {
            type: "p",
            text: "Signing up creates you as a person. Creating the church is the next step, and it is the one that gives you somewhere to put members, services and giving.",
          },
          {
            type: "steps",
            items: [
              "Go to Sign up and enter your name, email and a password of at least six characters.",
              "If email confirmation is switched on, open the message we send and click the link, then log in.",
              "You land on the onboarding screen. Enter your church name and choose the structure that matches your denomination.",
              "Save. You are now the pastor account for that church, and everything else in Fold becomes available.",
            ],
          },
          {
            type: "note",
            text: "The first account to create a church becomes its pastor. That account holds the church and is the only one that can appoint another pastor, so create it yourself rather than asking an assistant to do it for you.",
          },
        ],
      },
      {
        slug: "your-first-week",
        title: "What to do in your first week",
        summary:
          "The shortest path from an empty church to a dashboard worth looking at.",
        body: [
          {
            type: "p",
            text: "You do not need to enter everything before Fold is useful. This order gets you to something worth showing your leadership within a week.",
          },
          {
            type: "steps",
            items: [
              "Create your Bible classes, fellowships or groups first, so members can be filed correctly as they go in.",
              "Add the people who come every week, or import them if any of your register is already typed.",
              "Record this Sunday's service, even if it is only a head count of men and women.",
              "Enter the offering and any tithes counted that day.",
              "Invite the one or two people who will be doing this with you.",
            ],
          },
          {
            type: "p",
            text: "After a month you will have a statistical return that assembles itself. After several weeks of naming who attended, the insights page begins telling you who has quietly stopped coming.",
          },
        ],
      },
      {
        slug: "install-on-your-phone",
        title: "Install Fold on your phone",
        summary:
          "Add Fold to the home screen so it opens full screen like any other app.",
        body: [
          {
            type: "p",
            text: "There is no app store download. Fold installs from the browser, which means no waiting on a large file over mobile data and no update to chase later.",
          },
          {
            type: "h2",
            text: "On Android, using Chrome",
          },
          {
            type: "steps",
            items: [
              "Open getfold.org and log in.",
              "Tap the three dots at the top right.",
              "Tap Add to Home screen, then Install.",
            ],
          },
          { type: "h2", text: "On iPhone, using Safari" },
          {
            type: "steps",
            items: [
              "Open getfold.org and log in.",
              "Tap the share button, the square with an arrow coming out of it.",
              "Scroll down and tap Add to Home Screen.",
            ],
          },
          {
            type: "note",
            text: "It has to be Safari on an iPhone. Chrome on iOS cannot add to the home screen.",
          },
        ],
      },
      {
        slug: "trouble-logging-in",
        title: "You cannot log in",
        summary: "The four things that usually cause it, in order of likelihood.",
        body: [
          {
            type: "list",
            items: [
              "You have not confirmed your email yet. Look for our message, including in spam, and click the link before trying again.",
              "You signed up with a different address. Try the other one you use.",
              "You have forgotten the password. Use Forgot your password on the login page. The reset link goes to the address you signed up with.",
              "Somebody removed your access. Ask the pastor or an administrator at your church to check the team page.",
            ],
          },
          {
            type: "note",
            text: "We deliberately give the same answer whether or not an address has an account when you request a reset. That stops anyone using the form to work out which of your members are registered.",
          },
        ],
      },
    ],
  },
  {
    slug: "members",
    title: "Members and the register",
    description:
      "Adding people, importing a register you already keep, classes, transfers and visitors.",
    icon: "users",
    articles: [
      {
        slug: "add-a-member",
        title: "Add a member",
        summary: "The one required field, and what everything else is for.",
        body: [
          {
            type: "steps",
            items: [
              "Open Members and choose Add member.",
              "Enter the name. That is the only field you must fill in.",
              "Add a phone number if you have one, in the form 0244 000 000. You need it later for text messages.",
              "Choose a member type and a class or fellowship if you have set those up.",
              "Save.",
            ],
          },
          {
            type: "p",
            text: "Resist filling in every field at the start. Each one you add is a field somebody has to complete four hundred times, and a mostly empty column tells you nothing. A name and a phone number is a working register.",
          },
        ],
      },
      {
        slug: "import-from-excel",
        title: "Import your register from Excel or CSV",
        summary:
          "Bring across a list you already keep, without renaming your columns.",
        body: [
          {
            type: "p",
            text: "Fold reads your own column headings rather than making you match a template. Save your sheet as CSV from Excel or Google Sheets, then upload it.",
          },
          {
            type: "steps",
            items: [
              "In Excel or Google Sheets, choose File, then Save as or Download, and pick CSV.",
              "Open Members in Fold and choose Import.",
              "Upload the file. You are shown what was read and which rows could not be used.",
              "Fix any rejected rows in your sheet and upload again. Nothing is duplicated.",
            ],
          },
          { type: "h2", text: "Two things to check in your sheet first" },
          {
            type: "list",
            items: [
              "Format the phone column as text, or Excel drops the leading zero and 0244000000 becomes 244000000.",
              "Write dates as 1990-04-03. A date written 03/04/1990 is March in some systems and April in others, so where a date is ambiguous we leave it empty rather than guess wrongly.",
            ],
          },
          {
            type: "note",
            text: "Create your classes and fellowships before importing. Members then drop straight into the right one instead of needing to be filed afterwards.",
          },
        ],
      },
      {
        slug: "export-your-members",
        title: "Export your members",
        summary: "Take your whole register out as a file you can open anywhere.",
        body: [
          {
            type: "steps",
            items: [
              "Open Members.",
              "Choose Export.",
              "The file downloads as CSV, which opens in Excel, Numbers or Google Sheets.",
            ],
          },
          {
            type: "p",
            text: "Phone numbers are written so Excel keeps the leading zero, and the file carries the marker that tells Excel to read Ghanaian names and characters correctly.",
          },
          {
            type: "note",
            text: "You can do this at any time, including on the day you decide to leave. Software that makes leaving difficult is relying on something other than being good.",
          },
        ],
      },
      {
        slug: "member-types-and-classes",
        title: "Member types, classes and fellowships",
        summary:
          "Why the lists are yours to name rather than a fixed set we chose.",
        body: [
          {
            type: "p",
            text: "A Methodist society, a Presbyterian congregation and an independent assembly do not use the same words, and none of them matches the small group model most church software assumes. So member types in Fold are the ones you enter: Full Member, Catechumen, Covenant Member, Adherent, whatever your denomination actually says.",
          },
          {
            type: "steps",
            items: [
              "Open Groups to create a Bible class, fellowship or other group.",
              "Give it a name and, if you want, a leader.",
              "Assign members to it from the member's own page, or during an import.",
            ],
          },
          {
            type: "p",
            text: "Classes matter beyond tidiness. Your statistical return breaks membership down by class, and a class leader sees their own class rather than the whole church.",
          },
        ],
      },
      {
        slug: "transfers-and-visitors",
        title: "Transfers and visitors",
        summary: "Recording someone arriving from, or leaving for, another church.",
        body: [
          {
            type: "p",
            text: "A transfer is a member moving between churches with a letter. A visitor is somebody who came but has not joined. They are separate records because they mean different things on a return.",
          },
          {
            type: "steps",
            items: [
              "Open Transfers to record a member leaving for another church, or arriving from one.",
              "Open Visitors to record somebody who attended without joining.",
              "A visitor can be turned into a member later without retyping their details.",
            ],
          },
          {
            type: "note",
            text: "Only the pastor and administrators can manage transfers, because a transfer changes who counts as a member of your church.",
          },
        ],
      },
    ],
  },
  {
    slug: "attendance",
    title: "Attendance",
    description:
      "Recording services, marking who came, and finding members who have drifted away.",
    icon: "clipboard",
    articles: [
      {
        slug: "record-a-service",
        title: "Record a service",
        summary: "A head count takes about ten seconds and is enough to start.",
        body: [
          {
            type: "steps",
            items: [
              "Open Attendance and choose New service.",
              "Set the date and the kind of service.",
              "Enter the head count. One figure for men and one for women is enough.",
              "Save.",
            ],
          },
          {
            type: "p",
            text: "That alone gives you attendance averages and fills the attendance part of your statistical return. Naming individuals is optional and can start whenever you are ready.",
          },
        ],
      },
      {
        slug: "mark-who-attended",
        title: "Mark who attended by name",
        summary:
          "The extra couple of minutes that lets Fold tell you who has stopped coming.",
        body: [
          {
            type: "steps",
            items: [
              "Open the service you recorded.",
              "Search for a name and tap it, or work down the list.",
              "Save once at the end.",
            ],
          },
          {
            type: "p",
            text: "The whole service saves in one go rather than one request per person, which is why this works standing at the back of a service on a weak signal.",
          },
          {
            type: "note",
            text: "It does not have to be complete to be useful. Even marking only the regulars will tell you most of what you need.",
          },
        ],
      },
      {
        slug: "who-has-stopped-coming",
        title: "Find members who have quietly stopped coming",
        summary: "What the insights page is comparing, and why it needs history.",
        body: [
          {
            type: "p",
            text: "Open Insights. Fold compares each member against their own previous pattern, not against the congregation average. Somebody who has always come twice a year is not drifting; somebody who came almost every week and has not been seen for six weeks is.",
          },
          {
            type: "p",
            text: "Attendance is measured against the services your church actually held, not against the number of Sundays in the period. A church that did not meet for two weeks does not get handed a list of forty people who have done nothing unusual.",
          },
          {
            type: "note",
            text: "This one genuinely needs time. Until there are several weeks of named attendance there is no pattern to drift from, and the page will have little to say. Any software that promises otherwise is guessing.",
          },
        ],
      },
    ],
  },
  {
    slug: "giving",
    title: "Giving and funds",
    description:
      "Tithes, offerings, funds, mobile money, and who is allowed to see any of it.",
    icon: "coins",
    articles: [
      {
        slug: "record-a-contribution",
        title: "Record a tithe or offering",
        summary: "Cash is the default, because that is how most people give.",
        body: [
          {
            type: "steps",
            items: [
              "Open Giving and choose Record contribution.",
              "Choose the type: tithe, offering, or one of your own funds.",
              "Enter the amount in cedis and the date.",
              "Attach it to a member if it is a tithe, or leave it anonymous for a general offering.",
              "Save.",
            ],
          },
          {
            type: "p",
            text: "Cash is selected by default on every giving form. Mobile money sits beside it for the members ready for it and stays out of the way when you are not using it.",
          },
        ],
      },
      {
        slug: "funds",
        title: "Set up and use funds",
        summary:
          "Keeping a building project or a harvest separate from general offerings.",
        body: [
          {
            type: "p",
            text: "A fund is any pot you want counted on its own: a building project, a harvest, a welfare fund. Contributions are attached to one, and the fund's total is recalculated from the contributions themselves rather than kept as a number somebody has to remember to update.",
          },
          {
            type: "steps",
            items: [
              "Open Funds and choose New fund.",
              "Name it and, if it has one, set a target.",
              "When recording a contribution, choose that fund.",
            ],
          },
          {
            type: "note",
            text: "Moving a contribution to a different fund, editing its amount, or deleting it all correct both funds' totals automatically. You never have to fix a total by hand.",
          },
        ],
      },
      {
        slug: "mobile-money",
        title: "Take a gift by mobile money",
        summary:
          "Prompting a member's phone so the gift lands against their name.",
        body: [
          {
            type: "p",
            text: "Displaying a church MoMo number on a screen works, but nothing tells you who sent what or which fund it was for. Taking it through Fold prompts the member's own phone and records the gift against their name and fund.",
          },
          {
            type: "steps",
            items: [
              "Record the contribution and choose mobile money as the method.",
              "Enter the member's number. MTN, Telecel and AirtelTigo are all supported.",
              "The member approves the prompt on their handset.",
              "Nothing counts as given until they approve, so your books match the money.",
            ],
          },
          {
            type: "note",
            text: "Check the fee before you rely on it for small offerings. Processors charge roughly 1.95 per cent, but some apply a minimum of about 30 pesewas per transaction, which on a GHS 5 offering is six per cent.",
          },
        ],
      },
      {
        slug: "who-can-see-giving",
        title: "Who can see what your church gives",
        summary: "The short answer is leadership and your finance officer, nobody else.",
        body: [
          {
            type: "list",
            items: [
              "The pastor can see all giving.",
              "An administrator can see all giving.",
              "A finance officer can see and record giving.",
              "An elder, a minister or a class leader cannot open the giving records at all.",
            ],
          },
          {
            type: "p",
            text: "This is enforced by the database itself, not by hiding a menu item. Somebody who went round the interface entirely would still be refused, because the rule lives in Postgres rather than in the page.",
          },
        ],
      },
    ],
  },
  {
    slug: "reports",
    title: "Reports and returns",
    description:
      "The statistical return your circuit asks for, and the figures behind it.",
    icon: "reports",
    articles: [
      {
        slug: "statistical-return",
        title: "Produce your statistical return",
        summary:
          "Membership, attendance, vital records and income for any period, ready to print.",
        body: [
          {
            type: "steps",
            items: [
              "Open Reports.",
              "Choose the period, for example 1 January to 30 September.",
              "The return fills itself in from what your team already recorded.",
              "Print it, or save it as a PDF from the print dialogue.",
            ],
          },
          { type: "h2", text: "What it contains" },
          {
            type: "list",
            items: [
              "Total active members, split by male and female, and broken down by class",
              "Members who joined in the period",
              "Average attendance across the services actually held",
              "Baptisms, confirmations and weddings recorded in the period",
              "Total income, split by tithe, offering and fund",
            ],
          },
          {
            type: "note",
            text: "Nothing is entered twice. Every figure comes from a record somebody already made during the quarter, which is why the evening you used to spend assembling this disappears.",
          },
        ],
      },
      {
        slug: "attendance-averages",
        title: "How the attendance average is worked out",
        summary: "Divided by services held, not by the number of Sundays.",
        body: [
          {
            type: "p",
            text: "The average is the total attendance across the period divided by the number of services your church actually recorded, not by the number of Sundays on the calendar.",
          },
          {
            type: "p",
            text: "This matters. A church that lost two Sundays to a funeral or a storm would otherwise have its average quietly understated against a church that met every week, and the two returns would not be comparable.",
          },
        ],
      },
      {
        slug: "vital-records",
        title: "Record baptisms, confirmations and weddings",
        summary: "Enter them the week they happen, not the week the return is due.",
        body: [
          {
            type: "steps",
            items: [
              "Open Records.",
              "Choose the kind: baptism, confirmation, wedding or funeral.",
              "Enter the person, the date and the officiating minister.",
              "Save.",
            ],
          },
          {
            type: "p",
            text: "These flow straight into the statistical return for whatever period they fall in. Entering one the week it happens takes a minute; reconstructing nine months of them in October takes an evening.",
          },
        ],
      },
    ],
  },
  {
    slug: "team",
    title: "Your team and access",
    description:
      "The pastor account, what each role can do, and inviting the people who help you.",
    icon: "shield",
    articles: [
      {
        slug: "the-pastor-account",
        title: "The pastor account and what it controls",
        summary:
          "One account holds the church and delegates everything else.",
        body: [
          {
            type: "p",
            text: "The account that creates the church becomes its pastor. That account holds the church, and it is the only one that can appoint another pastor. Everything else is delegated from it.",
          },
          {
            type: "p",
            text: "This is deliberate. It means nobody can quietly promote themselves to the top of your church, and it means there is always a clear answer to who is responsible for the records.",
          },
          {
            type: "note",
            text: "An administrator can do almost everything a pastor can, including seeing giving. What they cannot do is appoint a pastor. That restriction is enforced by the database, and we test it by trying to break it.",
          },
        ],
      },
      {
        slug: "what-each-role-can-do",
        title: "What each role can do",
        summary: "Six roles, and the line each one cannot cross.",
        body: [
          {
            type: "list",
            items: [
              "Pastor. Everything, including appointing another pastor and seeing all giving.",
              "Administrator. Everything except appointing a pastor. Sees giving.",
              "Finance officer. Records and sees giving. Cannot manage the team.",
              "Minister. Members, attendance and vital records. Cannot see giving.",
              "Elder. Members, attendance and vital records. Cannot see giving.",
              "Class leader. Their own class, and attendance. Cannot see giving.",
            ],
          },
          {
            type: "p",
            text: "Every one of these is backed by a matching rule in the database. The menu reflects the rules; it is not what enforces them.",
          },
        ],
      },
      {
        slug: "invite-your-team",
        title: "Invite, change or remove a team member",
        summary: "Bringing in the people who help you keep the records.",
        body: [
          {
            type: "steps",
            items: [
              "Open Team.",
              "Choose Invite, enter their email and pick the role they should have.",
              "They receive an invitation and set their own password.",
              "To change what somebody can do, change their role on the same page. To remove them, remove their access there.",
            ],
          },
          {
            type: "note",
            text: "Only the pastor and administrators can invite or remove people. Give the narrowest role that lets somebody do their job, and widen it later if they need more.",
          },
        ],
      },
      {
        slug: "reset-a-password",
        title: "Reset a password",
        summary: "For yourself, or for somebody on your team.",
        body: [
          {
            type: "steps",
            items: [
              "On the login page, choose Forgot your password.",
              "Enter the email address the account was created with.",
              "Open the link in the email we send and choose a new password.",
            ],
          },
          {
            type: "p",
            text: "You cannot set another person's password for them, and neither can we. Ask them to use the same link, which goes only to their own inbox.",
          },
        ],
      },
    ],
  },
  {
    slug: "account",
    title: "Account, billing and data",
    description:
      "Your trial, what happens to your records, and your duties under Ghanaian law.",
    icon: "lock",
    articles: [
      {
        slug: "free-trial",
        title: "Your 30 day free trial",
        summary: "What it includes, and what happens at the end of it.",
        body: [
          {
            type: "p",
            text: "Every church gets 30 days free with no card and no commitment. Nothing is withheld during the trial: it is the whole product, not a limited tier, because you cannot judge church software on a slice of it.",
          },
          {
            type: "p",
            text: "There is nothing to cancel. If you decide Fold is not for your church, export your register and walk away.",
          },
        ],
      },
      {
        slug: "leaving-and-deletion",
        title: "Closing your account and what happens to your records",
        summary: "Your data is yours, and it does not linger after you go.",
        body: [
          {
            type: "steps",
            items: [
              "Export your members from the Members page, and your latest return from Reports.",
              "Contact us to close the account.",
              "Everything is deleted within 30 days of the account closing.",
            ],
          },
          {
            type: "note",
            text: "Export first. Once the deletion has run there is nothing to recover.",
          },
        ],
      },
      {
        slug: "data-protection-act",
        title: "Your church and the Data Protection Act",
        summary:
          "Act 843 applies to your register, and registration is your church's duty.",
        body: [
          {
            type: "p",
            text: "Under the Data Protection Act, 2012 (Act 843) your church is a data controller, because it holds personal data about living people for administration, welfare and communication. Data controllers must register with the Data Protection Commission and renew that registration every two years.",
          },
          {
            type: "p",
            text: "Religious belief is also special personal data under the Act, which raises the standard of care expected of anyone holding a church register.",
          },
          {
            type: "note",
            text: "Choosing software that separates your records properly is part of meeting that duty. It is not a substitute for registering, and we cannot register on your church's behalf.",
          },
        ],
      },
      {
        slug: "how-your-data-is-separated",
        title: "How your church's records are kept separate",
        summary: "What actually stops another church reading yours.",
        body: [
          {
            type: "p",
            text: "Every read and write passes through row level security in Postgres. A query for another church's records is refused by the database, not hidden by the page. Somebody bypassing the interface entirely would still get nothing.",
          },
          {
            type: "p",
            text: "The same mechanism enforces roles inside your church. A class leader asking the database directly for the giving records is refused in exactly the same way as one clicking a menu that is not there.",
          },
        ],
      },
    ],
  },
];

export const ALL_ARTICLES = CATEGORIES.flatMap((c) =>
  c.articles.map((a) => ({ ...a, category: c }))
);

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getArticle(categorySlug: string, slug: string) {
  return getCategory(categorySlug)?.articles.find((a) => a.slug === slug);
}

/**
 * Search.
 *
 * Runs on the server against the title, summary and body of every article,
 * so the results page needs no JavaScript and works before hydration. Every
 * term in the query has to match somewhere, which is what stops a two word
 * search returning everything that mentions "church".
 */
export function searchArticles(query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return ALL_ARTICLES.map((a) => {
    const haystack = [
      a.title,
      a.summary,
      a.category.title,
      ...a.body.flatMap((b) =>
        "items" in b ? b.items : "text" in b ? [b.text] : []
      ),
    ]
      .join(" ")
      .toLowerCase();

    if (!terms.every((t) => haystack.includes(t))) return null;
    // A hit in the title is worth more than a hit buried in the body.
    const title = a.title.toLowerCase();
    const score = terms.filter((t) => title.includes(t)).length;
    return { article: a, score };
  })
    .filter((r): r is { article: (typeof ALL_ARTICLES)[number]; score: number } =>
      r !== null
    )
    .sort((a, b) => b.score - a.score)
    .map((r) => r.article);
}
