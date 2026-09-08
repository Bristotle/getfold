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
];

export function getDenomination(slug: string) {
  return DENOMINATIONS.find((d) => d.slug === slug);
}
