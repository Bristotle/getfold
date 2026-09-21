/**
 * Denomination landing pages.
 *
 * The whole positioning is that Fold is built around denominational
 * structure, and until now nothing on the site was findable by a church
 * searching for its own denomination. These pages are that positioning
 * made searchable.
 *
 * Every structure and title below was checked against the denomination's
 * own published material, not written from memory. Getting a Ghanaian
 * pastor's own vocabulary wrong on a page claiming to speak it would do
 * more damage than having no page at all: it is the one mistake a reader
 * spots in the first sentence.
 *
 * Where a denomination is already well served by somebody else, the page
 * still exists, because a church looking for an alternative deserves to
 * find one, and because not every society is on any given rollout.
 */

export type Denomination = {
  slug: string;
  /** How the church refers to itself. */
  name: string;
  /** Short form used in running copy. */
  short: string;
  title: string;
  description: string;
  /** Levels of oversight, largest first. */
  hierarchy: string[];
  /** What a local congregation is called. */
  unit: string;
  /** Small groups inside the congregation, if any. */
  groups: string;
  /** Offices a church would expect to see in a roles list. */
  offices: string[];
  /** Membership categories in that church's own words. */
  memberTypes: string[];
  /** The report the congregation has to file, and to whom. */
  returnName: string;
  returnTo: string;
  intro: string[];
  keywords: string[];
};

export const DENOMINATIONS: Denomination[] = [
  {
    slug: "methodist-churches",
    name: "The Methodist Church Ghana",
    short: "Methodist",
    title: "Church software for Methodist societies in Ghana",
    description:
      "Built around the society, the circuit and the diocese, with Bible classes, class leaders and the quarterly return already understood. Cash first.",
    hierarchy: ["Diocese", "Circuit", "Society"],
    unit: "society",
    groups: "Bible classes, each with its own class leader",
    offices: [
      "Superintendent Minister",
      "Society Steward",
      "Class Leader",
      "Local Preacher",
      "Society Secretary",
    ],
    memberTypes: ["Full Member", "Catechumen", "Junior Member", "Adherent"],
    returnName: "quarterly statistical return",
    returnTo: "the circuit",
    intro: [
      "A Methodist society is not a congregation with small groups bolted on. It is a society inside a circuit inside a diocese, organised into Bible classes each with a class leader who knows their own people, and it files a return that nobody outside Methodism would recognise.",
      "Almost every church system sold in Ghana models a single independent congregation. Fold does not. The society, the circuit, the class and the class leader are what it is built from, and your membership categories are the ones your own society uses.",
    ],
    keywords: [
      "Methodist church software Ghana",
      "Methodist society management system",
      "circuit statistical return software",
      "Bible class register software Ghana",
    ],
  },
  {
    slug: "presbyterian-churches",
    name: "The Presbyterian Church of Ghana",
    short: "Presbyterian",
    title: "Church software for Presbyterian congregations in Ghana",
    description:
      "Built around the congregation, the district and the presbytery, with the Session, presbyters and catechists in the roles you actually use.",
    hierarchy: ["General Assembly", "Presbytery", "District", "Congregation"],
    unit: "congregation",
    groups: "groups, guilds and fellowships",
    offices: [
      "District Minister",
      "Catechist",
      "Presbyter",
      "Session Clerk",
      "Congregational Secretary",
    ],
    memberTypes: ["Communicant Member", "Catechumen", "Junior Member", "Adherent"],
    returnName: "congregational return",
    returnTo: "the district and presbytery",
    intro: [
      "A Presbyterian congregation answers to a district, which answers to a presbytery, which answers to the General Assembly. Locally it is led by the Session, alongside the catechist and the ordained minister, and the presbyters elected to serve it.",
      "None of that fits a product designed for one independent church with a pastor and some volunteers. Fold is built around the levels you actually have, and the offices your constitution actually names.",
    ],
    keywords: [
      "Presbyterian church software Ghana",
      "PCG congregation management system",
      "presbytery church records software",
      "church session register Ghana",
    ],
  },
  {
    slug: "pentecostal-churches",
    name: "The Church of Pentecost and other Pentecostal churches",
    short: "Pentecostal",
    title: "Church software for Pentecostal assemblies in Ghana",
    description:
      "Built around the local assembly, the district and the area, with presiding elders, elders and deacons in the roles you actually use.",
    hierarchy: ["National", "Area", "District", "Local Assembly"],
    unit: "local assembly",
    groups: "ministries and home cells",
    offices: [
      "District Pastor",
      "Presiding Elder",
      "Elder",
      "Deacon and Deaconess",
      "Assembly Secretary",
    ],
    memberTypes: ["Full Member", "New Convert", "Child", "Adherent"],
    returnName: "district return",
    returnTo: "the district pastor",
    intro: [
      "A local assembly is led day to day by its presiding elder, with the elders, deacons and deaconesses of the Local Presbytery, and it reports up through the district to the area. The pastor is often responsible for several assemblies at once.",
      "That is a different shape from one congregation with one pastor, and it is the shape Fold is built around. A presiding elder sees their assembly. A district pastor moves between the assemblies they oversee.",
    ],
    keywords: [
      "Pentecostal church software Ghana",
      "Church of Pentecost assembly management",
      "local assembly membership software",
      "district pastor church records Ghana",
    ],
  },
  {
    slug: "anglican-churches",
    name: "The Anglican Church in Ghana",
    short: "Anglican",
    title: "Church software for Anglican parishes in Ghana",
    description:
      "Built around the parish, the deanery and the diocese, with the vestry, churchwardens and lay readers in the roles you actually use.",
    hierarchy: ["Province", "Diocese", "Deanery", "Parish"],
    unit: "parish",
    groups: "guilds, societies and fellowships",
    offices: [
      "Parish Priest",
      "Churchwarden",
      "Vestry Member",
      "Lay Reader",
      "Parish Secretary",
    ],
    memberTypes: ["Communicant", "Confirmed Member", "Catechumen", "Adherent"],
    returnName: "parish return",
    returnTo: "the deanery and diocese",
    intro: [
      "An Anglican parish sits in a deanery inside a diocese, is governed locally by its vestry with the churchwardens, and keeps registers of baptism, confirmation, marriage and burial that are records of record, not conveniences.",
      "Fold treats those registers as what they are: vital records, entered when they happen, flowing straight into the return rather than being reconstructed from memory at the end of the year.",
    ],
    keywords: [
      "Anglican church software Ghana",
      "parish management system Ghana",
      "church register baptism confirmation software",
      "diocese church records Ghana",
    ],
  },
  {
    slug: "ame-zion-churches",
    name: "The African Methodist Episcopal Zion Church",
    short: "AME Zion",
    title: "Church software for AME Zion churches in Ghana",
    description:
      "Built around the church, the presiding elder district and the conference, with class leaders, stewards and trustees in the roles you use.",
    hierarchy: ["Conference", "Presiding Elder District", "Church"],
    unit: "church",
    groups: "classes, each with a class leader",
    offices: [
      "Pastor",
      "Presiding Elder",
      "Class Leader",
      "Steward",
      "Trustee",
    ],
    memberTypes: ["Full Member", "Probationer", "Junior Member", "Adherent"],
    returnName: "conference return",
    returnTo: "the presiding elder and conference",
    intro: [
      "AME Zion carries the Methodist class system: members belong to a class, the class has a leader, and the leader knows who has stopped coming long before anyone else does. Above the local church sit the presiding elder district and the annual conference.",
      "Fold is built around that, including the part most software forgets: a class leader should see their own class, and not the whole church's giving.",
    ],
    keywords: [
      "AME Zion church software Ghana",
      "class leader church register software",
      "conference church report software",
      "Methodist episcopal church management Ghana",
    ],
  },
  {
    slug: "baptist-churches",
    name: "Ghana Baptist Convention churches",
    short: "Baptist",
    title: "Church software for Baptist churches in Ghana",
    description:
      "Built for a self governing local church that still reports to its association and convention, with deacons and church clerks in the roles you use.",
    hierarchy: ["Convention", "Association", "Local Church"],
    unit: "local church",
    groups: "departments, units and fellowships",
    offices: [
      "Pastor",
      "Deacon",
      "Church Clerk",
      "Treasurer",
      "Department Head",
    ],
    memberTypes: ["Baptised Member", "New Convert", "Child", "Adherent"],
    returnName: "association return",
    returnTo: "the association and convention",
    intro: [
      "A Baptist church governs itself, which is the point, and still reports membership, baptisms and giving to its association and to the convention. The church clerk carries that, usually alongside a full time job.",
      "Fold does the counting so the clerk does not. Baptisms recorded the week they happen, membership and giving totalled for whatever period the association asks for.",
    ],
    keywords: [
      "Baptist church software Ghana",
      "Ghana Baptist Convention church records",
      "church clerk membership software",
      "baptism register software Ghana",
    ],
  },
  {
    slug: "catholic-parishes",
    name: "The Catholic Church in Ghana",
    short: "Catholic",
    title: "Church software for Catholic parishes in Ghana",
    description:
      "Built around the parish, its outstations and small Christian communities, with the parish pastoral council and catechists in the roles you actually use.",
    hierarchy: ["Diocese", "Deanery", "Parish", "Outstation"],
    unit: "parish",
    groups: "small Christian communities, outstations, societies and sodalities",
    offices: [
      "Parish Priest",
      "Catechist",
      "Parish Pastoral Council Chair",
      "Finance Council Member",
      "Parish Secretary",
    ],
    memberTypes: ["Baptised", "Confirmed", "Catechumen", "Communicant"],
    returnName: "parish annual return",
    returnTo: "the deanery and the diocese",
    intro: [
      "A Catholic parish in Ghana is rarely one congregation. It is a parish church with outstations in the surrounding towns, each served by a catechist between the priest's visits, and divided into small Christian communities that know their own members. Ghana has 798 parishes and 7,413 catechists across 20 dioceses.",
      "Fold treats an outstation as what it is: a congregation with its own attendance and giving whose figures roll into the parish. The sacramental registers are vital records entered when they happen, and the annual return to the diocese is the sum of what the parish already recorded.",
    ],
    keywords: [
      "Catholic parish software Ghana",
      "parish management system Ghana",
      "outstation records software",
      "baptismal register software Catholic Ghana",
    ],
  },
  {
    slug: "assemblies-of-god",
    name: "Assemblies of God, Ghana",
    short: "Assemblies of God",
    title: "Church software for Assemblies of God churches in Ghana",
    description:
      "Built around the local church, the district and the region, with the church board, deacons and the district pastor in the roles you actually use.",
    hierarchy: ["General Council", "Region", "District", "Local Church"],
    unit: "local church",
    groups: "departments, home cells and fellowships",
    offices: [
      "Pastor",
      "District Pastor",
      "Church Board Chair",
      "Deacon",
      "Church Secretary and Treasurer",
    ],
    memberTypes: ["Member", "New Convert", "Child", "Adherent"],
    returnName: "district report",
    returnTo: "the district pastor and the regional office",
    intro: [
      "Assemblies of God, Ghana has over 6,000 local churches and about 700,000 members under a General Council, organised into regions led by regional superintendents and districts led by district pastors. Each local church is governed by its pastor with a church board of deacons, chaired, with a secretary and a treasurer.",
      "That is a real hierarchy with real reporting, and Fold is built for it. The local church keeps its own register and giving, the district pastor sees the churches in the district, and the regional office sees the totals without anyone retyping them.",
    ],
    keywords: [
      "Assemblies of God church software Ghana",
      "AG Ghana church management system",
      "district pastor church records software",
      "church board membership software Ghana",
    ],
  },
  {
    slug: "seventh-day-adventist",
    name: "The Seventh-day Adventist Church in Ghana",
    short: "Adventist",
    title: "Church software for Seventh-day Adventist churches in Ghana",
    description:
      "Built around the local church, the district and the conference, with the church clerk, elders and Sabbath School in the roles you actually use.",
    hierarchy: ["Union", "Conference", "District", "Local Church"],
    unit: "church",
    groups: "Sabbath School classes, departments and companies",
    offices: [
      "District Pastor",
      "First Elder",
      "Church Clerk",
      "Church Treasurer",
      "Sabbath School Superintendent",
    ],
    memberTypes: ["Baptised Member", "Baptismal Class", "Child", "Interest"],
    returnName: "church clerk's quarterly report",
    returnTo: "the conference",
    intro: [
      "An Adventist church is led between the pastor's visits by its first elder, because the pastor usually serves a district of several churches, and its records are kept by the church clerk, who sends the quarterly report to the conference. The Southern Ghana Union Conference alone had 1,092 churches and 201,831 members in June 2024.",
      "Fold is built for the clerk: baptisms and transfers recorded when they happen, Sabbath attendance by week, tithe and offerings by fund, and the quarterly figures produced rather than compiled.",
    ],
    keywords: [
      "Seventh-day Adventist church software Ghana",
      "SDA church clerk software",
      "church clerk quarterly report software",
      "Sabbath School attendance software Ghana",
    ],
  },
  {
    slug: "ep-church",
    name: "The Evangelical Presbyterian Church, Ghana",
    short: "E.P.",
    title: "Church software for E.P. Church congregations in Ghana",
    description:
      "Built around the congregation, the district and the presbytery, with the session, presbyters, catechists and the agent in charge in the roles you actually use.",
    hierarchy: ["General Assembly", "Presbytery", "District", "Congregation"],
    unit: "congregation",
    groups: "groups, unions and fellowships",
    offices: [
      "Agent in Charge",
      "District Minister",
      "Presbyter",
      "Catechist",
      "Session Clerk",
    ],
    memberTypes: ["Communicant Member", "Catechumen", "Junior Member", "Adherent"],
    returnName: "congregational return",
    returnTo: "the district session and the presbytery",
    intro: [
      "The E.P. Church, Ghana governs through four courts: the congregational session, the district session, the presbytery synod and the General Assembly. A congregation is led by its agent in charge, minister or catechist, with the presbyters of the session, and it has over 740 congregations to keep in step.",
      "Fold is built around those courts. The congregation keeps its own register and giving, the district minister sees the congregations in the district, and the presbytery sees the totals, with nothing retyped on the way up.",
    ],
    keywords: [
      "E.P. Church software Ghana",
      "Evangelical Presbyterian church management system",
      "congregational session records software",
      "presbytery church records Ghana",
    ],
  },
  {
    slug: "icgc",
    name: "International Central Gospel Church",
    short: "ICGC",
    title: "Church software for ICGC assemblies in Ghana",
    description:
      "Built around the local assembly, the district and the region, with the pastor, deacons and the district supervising minister in the roles you actually use.",
    hierarchy: ["General Church Council", "Region", "District", "Local Assembly"],
    unit: "local assembly",
    groups: "departments, home cells and ministries",
    offices: [
      "Pastor",
      "District Supervising Minister",
      "Regional Overseer",
      "Deacon",
      "Assembly Administrator",
    ],
    memberTypes: ["Member", "New Convert", "Child", "Visitor"],
    returnName: "district report",
    returnTo: "the district supervising minister",
    intro: [
      "ICGC is organised from the General Church Council and its presbytery through regional church councils, each with a regional overseer, to districts under a district supervising minister, to the local assembly governed by its pastor and elected deacons. Over 450 assemblies report up that chain.",
      "Fold is built for exactly that chain. Each assembly keeps its own register, attendance and giving, the district sees its assemblies, and the region sees the totals.",
    ],
    keywords: [
      "ICGC church software Ghana",
      "International Central Gospel Church management system",
      "local assembly council records software",
      "district supervising minister reports",
    ],
  },
  {
    slug: "charismatic-churches",
    name: "Charismatic and independent churches",
    short: "Charismatic",
    title: "Church software for charismatic churches in Ghana",
    description:
      "Built for a head office with branches, or a single branch that plans to grow, with pastors, elders, deacons and department heads in the roles you use.",
    hierarchy: ["Head Office", "Branch"],
    unit: "branch",
    groups: "departments, cells and ministries",
    offices: [
      "Senior Pastor",
      "Branch Pastor",
      "Elder",
      "Deacon",
      "Head Usher and Department Head",
    ],
    memberTypes: ["Member", "New Convert", "First-time Visitor", "Child"],
    returnName: "monthly report",
    returnTo: "the head office",
    intro: [
      "Pentecostal and charismatic Christians are 31.6 percent of Ghana, the largest Christian grouping in the 2021 census, and most of them belong to a church that is either one branch or a head office with several. The reporting is to the founder or the head office, usually monthly, and the growth question is first-time visitors.",
      "Fold gives a single branch a register, attendance and giving that work from a phone, and a head office a view of every branch with the figures rolled up. Visitors are followed up, members who stop coming are noticed, and the report is a print.",
    ],
    keywords: [
      "charismatic church software Ghana",
      "church branch management software",
      "independent church membership system Ghana",
      "church visitor follow up software",
    ],
  },
];

export function getDenomination(slug: string) {
  return DENOMINATIONS.find((d) => d.slug === slug);
}
