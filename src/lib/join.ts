/**
 * Ways to work with Fold.
 *
 * Two honest constraints shaped these pages.
 *
 * We do not know, from one week to the next, whether a given role has a
 * funded opening. So every page invites an application rather than
 * advertising a vacancy, and none of them names a salary, a headcount or a
 * start date we cannot stand behind. For the same reason there is no
 * JobPosting structured data: Google expects that markup to describe a
 * real, dated vacancy, and using it for an open invitation is the sort of
 * thing that costs a domain its rich results.
 *
 * The geography is real. Manuel Technologies is in Ghana, the churches are
 * in Ghana, and most of this work can be done from anywhere in the
 * country. Naming the regions is useful to a reader in Tamale who assumes
 * everything happens in Accra, and it is also what makes these pages
 * findable for "church software sales partner Kumasi" and the like.
 */

export type Opportunity = {
  slug: string;
  title: string;
  /** How it is worked: a partnership, or a role inside the company. */
  kind: "Partnership" | "Role" | "Programme";
  /** One line, used on the index and as the meta description opener. */
  summary: string;
  /** Where this can be done from. */
  location: string;
  /** Commitment, honestly described. */
  commitment: string;
  intro: string[];
  doing: string[];
  looking: string[];
  offer: string[];
  /** Search phrases this page should legitimately answer. */
  keywords: string[];
};

const GHANA_WIDE =
  "Anywhere in Ghana. Accra, Kumasi, Takoradi, Tamale, Cape Coast, Ho, Sunyani, Koforidua.";

export const OPPORTUNITIES: Opportunity[] = [
  {
    slug: "business-partner",
    title: "Business Partner",
    kind: "Partnership",
    summary:
      "Take Fold to the churches and denominational bodies you already work with, and earn on every church that stays.",
    location: GHANA_WIDE,
    commitment: "Your own hours. Works alongside an existing business.",
    intro: [
      "A business partner brings Fold to churches through relationships they already have. If you sell to churches now, whether that is printing, sound equipment, accounting or IT support, you already know the people who decide, and you already know which of them lose an evening to the quarterly return.",
      "This is not a reseller agreement with a stock commitment. There is nothing to buy and nothing to hold.",
    ],
    doing: [
      "Introduce Fold to churches, circuits, presbyteries and dioceses in your network",
      "Sit with a church through setup, or hand that to us if you would rather not",
      "Tell us plainly what those churches need that Fold does not do yet",
    ],
    looking: [
      "An existing relationship with churches in Ghana, of any denomination",
      "Enough patience to explain software to somebody who keeps a register in a book",
      "Honesty about what Fold cannot do. We would rather lose a church than mis-sell one",
    ],
    offer: [
      "A share of what each church pays, for as long as that church stays",
      "Your own account to demonstrate from, at no cost",
      "Training on the product and on the denominational structures it models",
      "A direct line to the people who write the code",
    ],
    keywords: [
      "church software business partner Ghana",
      "church management reseller Ghana",
      "software partnership Accra",
    ],
  },
  {
    slug: "sales-partner",
    title: "Sales Partner",
    kind: "Partnership",
    summary:
      "Work a region on commission. You find the churches, we handle the software and the support.",
    location: GHANA_WIDE,
    commitment: "Commission only. Part time or full time, your choice.",
    intro: [
      "A sales partner works a region: a city, a district, or a denomination's presence in one part of the country. You find the churches and make the case. We build the software, run the support, and pay you on what you bring in.",
      "This suits somebody who already moves among churches, a former church administrator, a lay leader, a student in a Bible college, or anyone who can get an appointment with a presiding elder.",
    ],
    doing: [
      "Identify churches in your region that still keep the register in a book",
      "Demonstrate Fold, in person or over WhatsApp",
      "Help a church through its first Sunday on the system",
      "Keep in touch, because the second quarter is when a church decides to stay",
    ],
    looking: [
      "You can get a meeting with a pastor or a church secretary",
      "You can explain a statistical return without reading from a script",
      "You are in Ghana and can travel within your region",
    ],
    offer: [
      "Commission on every church that signs, and on their renewals",
      "A protected region, so you are not competing with another partner on the same street",
      "Everything you need to demonstrate: an account, a script, and answers to the hard questions",
    ],
    keywords: [
      "church software sales partner Ghana",
      "commission sales Kumasi software",
      "church management sales agent Accra",
    ],
  },
  {
    slug: "brand-partner",
    title: "Brand Partner",
    kind: "Partnership",
    summary:
      "Denominational bodies, associations and church media working with us to reach their own members.",
    location: "Ghana, at the level of a diocese, presbytery, association or media house.",
    commitment: "An agreement between organisations, not an individual role.",
    intro: [
      "A brand partnership is between Fold and an organisation that already serves many churches: a diocese, a presbytery, a district, a ministers' association, a Bible college, or a church media house.",
      "The shape varies. Sometimes it is a rate negotiated for every society under one circuit. Sometimes it is us building the return your denomination actually files, rather than a generic one. Sometimes it is simply a recommendation, honestly given.",
    ],
    doing: [
      "Agree what your member churches need, in your own vocabulary",
      "Set terms for the churches under your oversight",
      "Tell your members about it in your own words, through your own channels",
    ],
    looking: [
      "An organisation with real standing among Ghanaian churches",
      "A willingness to hold us to what we promise your members",
      "Patience, because getting a denomination's return exactly right takes more than one conversation",
    ],
    offer: [
      "Terms for your member churches that no individual church could get alone",
      "Development work on the structures and returns your denomination actually uses",
      "Named credit wherever you want it, and none where you do not",
    ],
    keywords: [
      "church software denominational partnership Ghana",
      "diocese church management system",
      "Methodist Presbyterian church software Ghana",
    ],
  },
  {
    slug: "internship",
    title: "Internship",
    kind: "Programme",
    summary:
      "For students in Ghana who want to build something real, used by real churches, rather than a coursework project.",
    location:
      "Remote from anywhere in Ghana, with time in Accra where it helps.",
    commitment: "Three to six months. Full time or around your timetable.",
    intro: [
      "Most internships hand a student a sandbox. This one does not. An intern here works on the product churches actually use, with their work reviewed properly and shipped when it is ready.",
      "It is a small company, which cuts both ways. There is nobody to hide behind, and there is also nobody between you and the decisions.",
    ],
    doing: [
      "Build features, fix real defects, and see them go live",
      "Write the help articles and test the flows a church will follow",
      "Sit in on a church setup and watch a secretary use what you built",
    ],
    looking: [
      "You are studying, or recently finished, in Ghana",
      "You can write some code, or write clearly, or both",
      "You ask when you are stuck rather than after a week of being stuck",
    ],
    offer: [
      "Work that ships, with your name on the commits",
      "Review from people who will tell you why, not just what",
      "A reference that describes what you actually did",
    ],
    keywords: [
      "software internship Ghana",
      "tech internship Accra students",
      "Next.js internship Ghana",
    ],
  },
  {
    slug: "consultant",
    title: "Consultant",
    kind: "Partnership",
    summary:
      "Church administration consultants who set churches up properly and stay with them through the first quarter.",
    location: GHANA_WIDE,
    commitment: "Per engagement. Fits alongside other consulting work.",
    intro: [
      "Some churches want somebody to sit with them: to type the first two hundred members, to work out which of their classes are still meeting, and to be there on the Sunday the first service is recorded.",
      "That is consulting work, and it is worth paying for. We would rather refer it to somebody who does it well than pretend software alone solves it.",
    ],
    doing: [
      "Move a church's register from a book or a spreadsheet into Fold",
      "Set up classes, fellowships, funds and member types in the church's own words",
      "Train the secretary, the treasurer and the class leaders",
      "Be reachable for the first quarterly return",
    ],
    looking: [
      "Experience of how a Ghanaian church office actually runs",
      "Comfort with spreadsheets, and the patience for a badly kept one",
      "Discretion. You will see membership and giving records",
    ],
    offer: [
      "Referrals to churches that have asked for help",
      "Training on the product, and early sight of what is coming",
      "You set your own fee. We do not take a cut of it",
    ],
    keywords: [
      "church administration consultant Ghana",
      "church data migration Ghana",
      "church management setup consultant Accra",
    ],
  },
  {
    slug: "web-developer",
    title: "Web Developer",
    kind: "Role",
    summary:
      "TypeScript, Next.js and Postgres, on a product where row level security is the security boundary.",
    location: "Remote from anywhere in Ghana.",
    commitment: "Full time or a serious part time arrangement.",
    intro: [
      "Fold is Next.js on the App Router, TypeScript, and Supabase Postgres where row level security does the real work. Prisma runs migrations only and never serves a request, because it bypasses RLS.",
      "The interesting problems here are not framework problems. They are things like making a statistical return assemble itself correctly across a period with missing Sundays, and making a page usable at the back of a service on a weak signal.",
    ],
    doing: [
      "Build features across the stack, from the SQL policy to the form",
      "Write migrations that a database refuses to get wrong, and test them by trying to break them",
      "Keep the marketing pages fast, because they load on Ghanaian mobile data",
    ],
    looking: [
      "Real TypeScript and React. Server components are a plus, not a requirement",
      "Enough SQL to reason about a policy rather than copy one",
      "A habit of testing the security assumption rather than assuming it",
      "Based in Ghana",
    ],
    offer: [
      "A codebase with its reasoning written down, in comments that say why",
      "Ownership of whole features rather than tickets",
      "Direct contact with the churches using what you build",
    ],
    keywords: [
      "Next.js developer job Ghana",
      "TypeScript developer Accra",
      "Postgres Supabase developer Ghana",
    ],
  },
  {
    slug: "mobile-app-developer",
    title: "Mobile App Developer",
    kind: "Role",
    summary:
      "Help decide whether Fold needs a native app at all, and build it properly if the answer is yes.",
    location: "Remote from anywhere in Ghana.",
    commitment: "Full time, or project based to start.",
    intro: [
      "Fold installs from the browser today, with no app store. That is deliberate: a church secretary on mobile data should not have to download forty megabytes to record a service.",
      "So the first question is not how to build the app. It is whether one earns its place, and where a native app genuinely beats what the browser already does: offline attendance in a hall with no signal, a camera for member photographs, push notifications that actually arrive.",
    ],
    doing: [
      "Work out honestly which parts need native and which do not",
      "Build offline first attendance, if that is what the answer turns out to be",
      "Keep parity with the web product rather than forking the logic",
    ],
    looking: [
      "Shipped mobile work, React Native, Flutter or native, we are not precious about it",
      "An instinct for what a weak connection does to an application",
      "Willingness to argue that a feature should not be built",
      "Based in Ghana",
    ],
    offer: [
      "A genuinely open question to answer, not a spec to implement",
      "The say on the architecture, if the case is made",
      "Users you can go and watch, in churches, on Sundays",
    ],
    keywords: [
      "mobile app developer job Ghana",
      "React Native developer Accra",
      "Flutter developer Ghana church app",
    ],
  },
];

export function getOpportunity(slug: string) {
  return OPPORTUNITIES.find((o) => o.slug === slug);
}
