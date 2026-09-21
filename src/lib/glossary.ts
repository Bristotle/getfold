/**
 * The church administration glossary.
 *
 * One page per term, each answering "what is a ..." in its first sentence,
 * because that sentence is the part a search engine or an assistant lifts.
 * The rest explains how the term is used in a Ghanaian church, where it
 * differs between denominations, and where it shows up in Fold.
 *
 * Definitions are written for a church that never becomes a customer. A
 * definition that only makes sense as a pitch gets quoted nowhere.
 *
 * Every term is also an anchor: posts, help articles and feature pages
 * link to these rather than re-explaining the word each time.
 */

export type Term = {
  slug: string;
  term: string;
  /** Plain language, one sentence, stands alone. */
  definition: string;
  /** The rest of the entry. */
  detail: string[];
  /** Denominations where the word is used, if it is not universal. */
  usedBy?: string;
  /** Other glossary slugs. */
  related: string[];
  /** Where on the site this term is put to work. */
  see: { label: string; href: string }[];
};

export const TERMS: Term[] = [
  // ------------------------------------------------------------ structure
  {
    slug: "society",
    term: "Society",
    definition:
      "A society is the local congregation of the Methodist Church, the church you attend on Sunday, and the unit that keeps its own register and files its own return.",
    detail: [
      "Several societies make up a circuit, several circuits a diocese. A society is led by a minister, who may be responsible for more than one society, and by its society stewards and leaders' meeting. Members belong to a Bible class within the society, each with a class leader.",
      "The society is the level at which the register is kept, giving is counted and the quarterly statistical return is prepared. That makes it the unit most church software has to understand and most does not.",
    ],
    usedBy: "The Methodist Church Ghana, AME Zion and other Methodist churches.",
    related: ["circuit", "diocese", "bible-class", "class-leader", "society-steward"],
    see: [
      { label: "Church software for Methodist societies", href: "/for/methodist-churches" },
      { label: "How to prepare a statistical return", href: "/blog/how-to-prepare-your-statistical-return" },
    ],
  },
  {
    slug: "circuit",
    term: "Circuit",
    definition:
      "A circuit is a group of Methodist societies under one superintendent minister, and the level that receives each society's quarterly return.",
    detail: [
      "The circuit holds its own quarterly meeting, employs its ministers, and pools assessments from its societies. The Methodist Church Ghana has 337 circuits across 20 dioceses.",
      "For a church secretary the circuit matters because it is who the return goes to, and who asks when it is late.",
    ],
    usedBy: "Methodist churches.",
    related: ["society", "diocese", "superintendent-minister", "statistical-return"],
    see: [
      { label: "Branches and figures that roll up", href: "/features/branch-management" },
    ],
  },
  {
    slug: "diocese",
    term: "Diocese",
    definition:
      "A diocese is a regional division of a church under a bishop, made up of circuits or deaneries, which are in turn made up of societies or parishes.",
    detail: [
      "Methodist, Anglican and Catholic churches in Ghana all use the word, with different things beneath it: circuits for Methodists, deaneries for Anglicans and Catholics. The Methodist Church Ghana has 20 dioceses; the Catholic Church in Ghana has 20 dioceses including four archdioceses.",
      "Figures a diocese asks for are the sum of what its congregations recorded. When each congregation keeps its own register, the diocesan figure is arithmetic; when they do not, it is a phone campaign.",
    ],
    related: ["circuit", "deanery", "parish", "society"],
    see: [
      { label: "Headquarters over regions over districts", href: "/features/branch-management" },
    ],
  },
  {
    slug: "presbytery",
    term: "Presbytery",
    definition:
      "A presbytery is a regional court of a Presbyterian church, made up of ministers and elders from the congregations and districts within its area.",
    detail: [
      "In the Presbyterian Church of Ghana a congregation reports to a district, the district to a presbytery, and the presbytery to the General Assembly. The Evangelical Presbyterian Church, Ghana uses the same four courts: congregational session, district session, presbytery synod, General Assembly.",
      "In the Church of Pentecost and ICGC the word means something different: the body of elders and ministers that governs an assembly or the whole church, not a region.",
    ],
    usedBy: "Presbyterian, E.P., Pentecost and ICGC churches, with different meanings.",
    related: ["session", "presbyter", "congregation", "district"],
    see: [
      { label: "Church software for Presbyterian congregations", href: "/for/presbyterian-churches" },
    ],
  },
  {
    slug: "session",
    term: "Session",
    definition:
      "The Session is the governing body of a Presbyterian congregation, made up of the minister, the catechist and the elected presbyters.",
    detail: [
      "It admits members, oversees discipline, approves the budget and receives the reports the congregation sends upward. The session clerk keeps its minutes and is usually the person who compiles the congregational return.",
    ],
    usedBy: "Presbyterian and E.P. churches.",
    related: ["presbytery", "presbyter", "catechist"],
    see: [{ label: "Roles and what each can see", href: "/help/team/what-each-role-can-do" }],
  },
  {
    slug: "parish",
    term: "Parish",
    definition:
      "A parish is the local congregation of the Anglican or Catholic church, with a defined area, a parish priest, and its own registers of baptism, confirmation, marriage and burial.",
    detail: [
      "Parishes are grouped into deaneries and deaneries into dioceses. A Catholic parish is run day to day with a parish pastoral council and often divided into outstations and small Christian communities; an Anglican parish is governed locally by its vestry and churchwardens.",
      "The Catholic Church in Ghana has 798 parishes served by 7,413 catechists.",
    ],
    usedBy: "Anglican and Catholic churches.",
    related: ["deanery", "diocese", "vestry", "churchwarden", "catechist", "outstation"],
    see: [
      { label: "Church software for Anglican parishes", href: "/for/anglican-churches" },
      { label: "Church software for Catholic parishes", href: "/for/catholic-parishes" },
    ],
  },
  {
    slug: "deanery",
    term: "Deanery",
    definition:
      "A deanery is a group of neighbouring parishes within a diocese, coordinated by a dean, so that priests in one area can plan pastoral work together.",
    detail: [
      "The Archdiocese of Accra has eight deaneries. A deanery does not usually keep records of its own; it asks its parishes for theirs.",
    ],
    usedBy: "Anglican and Catholic churches.",
    related: ["parish", "diocese"],
    see: [{ label: "Branches with figures that roll up", href: "/features/branch-management" }],
  },
  {
    slug: "local-assembly",
    term: "Local assembly",
    definition:
      "A local assembly is the congregation of a Pentecostal church such as the Church of Pentecost, Assemblies of God or ICGC, led day to day by a presiding elder or pastor.",
    detail: [
      "Assemblies are grouped into districts under a district pastor, and districts into areas or regions. In the Church of Pentecost the pastor is often responsible for several assemblies at once, and each assembly is led by its presiding elder with a local presbytery of elders, deacons and deaconesses.",
    ],
    usedBy: "Pentecostal churches.",
    related: ["district", "presiding-elder", "elder", "deacon"],
    see: [
      { label: "Church software for Pentecostal assemblies", href: "/for/pentecostal-churches" },
      { label: "Church software for Assemblies of God", href: "/for/assemblies-of-god" },
    ],
  },
  {
    slug: "district",
    term: "District",
    definition:
      "A district is a group of congregations under one minister or pastor, used by Presbyterian, Pentecostal, Adventist and Assemblies of God churches as the level directly above the local church.",
    detail: [
      "A Pentecost district pastor moves between the assemblies in the district. A Presbyterian district minister chairs the district session. An Adventist district pastor is the ordained minister responsible for a cluster of churches that do not each have their own.",
      "Whatever it is called, it is the person who phones the local church when a report is late.",
    ],
    related: ["local-assembly", "congregation", "presbytery", "conference"],
    see: [{ label: "Oversight from above, read only", href: "/features/leadership-management" }],
  },
  {
    slug: "congregation",
    term: "Congregation",
    definition:
      "A congregation is the local church, the people who worship together in one place, and in Presbyterian usage the formal unit that reports to a district.",
    detail: [
      "Every denomination has a word for it: society, parish, assembly, local church, congregation. The word changes; the work of keeping its register does not.",
    ],
    related: ["society", "parish", "local-assembly"],
    see: [{ label: "Members, in your church's own words", href: "/features/member-management" }],
  },
  {
    slug: "conference",
    term: "Conference",
    definition:
      "A conference is the highest governing body of a Methodist church, and in the Seventh-day Adventist Church the regional body that local churches belong to.",
    detail: [
      "The Methodist Church Ghana's Conference meets annually with equal numbers of lay and clergy representatives. An Adventist local church belongs to a conference or mission (the Southern Ghana Union Conference alone had 1,092 churches and 201,831 members in June 2024), which belongs to a union, which belongs to the General Conference.",
    ],
    usedBy: "Methodist, AME Zion and Adventist churches.",
    related: ["district", "diocese"],
    see: [{ label: "Church software for Adventist churches", href: "/for/seventh-day-adventist" }],
  },
  {
    slug: "outstation",
    term: "Outstation",
    definition:
      "An outstation is a smaller congregation attached to a parish or mother church, usually in a nearby village, served by a catechist and visited by the priest on a rota.",
    detail: [
      "Outstations keep their own attendance and giving but are counted inside the parish return. A parish with six outstations is, for record keeping, seven congregations.",
    ],
    usedBy: "Catholic and some Anglican and Presbyterian churches.",
    related: ["parish", "catechist"],
    see: [{ label: "Branches with figures that roll up", href: "/features/branch-management" }],
  },
  {
    slug: "bible-class",
    term: "Bible class",
    definition:
      "A Bible class is the small group every Methodist member belongs to, usually eight to twenty people, led by a class leader who is responsible for their pastoral care.",
    detail: [
      "The class is how a society of four hundred stays known. The class leader takes attendance, collects class dues, visits the sick and notices absence before anybody else does. Class membership is recorded on the register and reported in the return.",
    ],
    usedBy: "Methodist and AME Zion churches, where AME Zion says simply class.",
    related: ["class-leader", "society", "home-cell"],
    see: [{ label: "Groups and classes", href: "/features/group-management" }],
  },
  {
    slug: "home-cell",
    term: "Home cell",
    definition:
      "A home cell is a small group of members who meet in a home during the week for Bible study, prayer and fellowship, used by Pentecostal and charismatic churches as the unit of pastoral care.",
    detail: [
      "It does the job a Bible class does in a Methodist society: a leader who knows a dozen people by name. Some churches call it a cell, a home fellowship, a care group or a life group.",
    ],
    related: ["bible-class", "local-assembly"],
    see: [{ label: "Groups and classes", href: "/features/group-management" }],
  },

  // -------------------------------------------------------------- offices
  {
    slug: "class-leader",
    term: "Class leader",
    definition:
      "A class leader is the lay member responsible for a Bible class in a Methodist society: taking attendance, visiting members, collecting class dues and reporting to the leaders' meeting.",
    detail: [
      "It is the oldest office in Methodism after the preacher, and still the one that decides whether a member who stops coming is noticed in two weeks or two years. The Methodist Church Ghana counts 34,403 lay leaders across its societies.",
      "In software, a class leader should see their own class and not the whole church's giving. Most systems cannot make that distinction.",
    ],
    usedBy: "Methodist and AME Zion churches.",
    related: ["bible-class", "society-steward", "local-preacher"],
    see: [
      { label: "Leadership and roles", href: "/features/leadership-management" },
      { label: "Church software for class leaders", href: "/for/class-leaders" },
    ],
  },
  {
    slug: "society-steward",
    term: "Society steward",
    definition:
      "A society steward is a lay officer of a Methodist society responsible for its finances, property and the smooth running of worship, working alongside the minister.",
    detail: [
      "The stewards count the offering, bank it, keep the society's accounts and present them to the leaders' meeting. Where a society has a treasurer as well, the steward oversees.",
    ],
    usedBy: "Methodist churches.",
    related: ["class-leader", "treasurer", "society"],
    see: [{ label: "Church software for church treasurers", href: "/for/church-treasurers" }],
  },
  {
    slug: "superintendent-minister",
    term: "Superintendent minister",
    definition:
      "A superintendent minister is the Methodist minister in charge of a circuit and its societies, chairing the circuit quarterly meeting and supervising the other ministers stationed there.",
    detail: [
      "In Assemblies of God the corresponding titles are district pastor, regional superintendent and, at the top, general superintendent.",
    ],
    usedBy: "Methodist churches; Assemblies of God uses superintendent for regional and national leaders.",
    related: ["circuit", "society"],
    see: [{ label: "Church software for pastors", href: "/for/pastors" }],
  },
  {
    slug: "presbyter",
    term: "Presbyter",
    definition:
      "A presbyter is an elected lay elder of a Presbyterian congregation, ordained to serve on the Session and share in its pastoral and governing work.",
    detail: [
      "Presbyters are elected by the congregation for a term, usually with responsibility for a section of the membership or an area of the church's life. In the Church of Pentecost the word is used for the body, the presbytery, rather than the person.",
    ],
    usedBy: "Presbyterian and E.P. churches.",
    related: ["session", "elder", "catechist"],
    see: [{ label: "Church software for Presbyterian congregations", href: "/for/presbyterian-churches" }],
  },
  {
    slug: "catechist",
    term: "Catechist",
    definition:
      "A catechist is a trained lay minister who leads worship, teaches the faith and runs a congregation or outstation where there is no resident priest or minister.",
    detail: [
      "In the Presbyterian and E.P. churches the catechist is an agent of the church, often in charge of a congregation and its records. In the Catholic Church the catechist prepares people for the sacraments and leads the outstation between the priest's visits. Ghana's Catholic Church counts 7,413 of them.",
    ],
    usedBy: "Catholic, Presbyterian, E.P. and Anglican churches.",
    related: ["outstation", "session", "parish"],
    see: [{ label: "Roles and what each can see", href: "/help/team/what-each-role-can-do" }],
  },
  {
    slug: "presiding-elder",
    term: "Presiding elder",
    definition:
      "A presiding elder is the lay leader in charge of a local assembly of the Church of Pentecost, responsible for it between the district pastor's visits.",
    detail: [
      "In AME Zion the same title means something else: the minister who supervises a district of churches on behalf of the bishop.",
    ],
    usedBy: "The Church of Pentecost; AME Zion with a different meaning.",
    related: ["local-assembly", "elder", "deacon"],
    see: [{ label: "Church software for Pentecostal assemblies", href: "/for/pentecostal-churches" }],
  },
  {
    slug: "elder",
    term: "Elder",
    definition:
      "An elder is a mature member appointed or elected to share in the spiritual leadership of a congregation, whether as a Pentecostal assembly elder, an Adventist church elder or a Presbyterian presbyter.",
    detail: [
      "The Adventist church elects a first elder who leads the congregation when the pastor, who usually serves a district of several churches, is elsewhere.",
    ],
    related: ["presiding-elder", "deacon", "presbyter"],
    see: [{ label: "Leadership and roles", href: "/features/leadership-management" }],
  },
  {
    slug: "deacon",
    term: "Deacon",
    definition:
      "A deacon, or deaconess, is a member appointed to practical service in a congregation: ushering, welfare, preparing for communion, and in many churches counting and banking the offering.",
    detail: [
      "In Baptist churches the deacons are the governing body under the pastor. In Assemblies of God they form the church board with a chair, secretary and treasurer. In the Church of Pentecost they sit on the local presbytery with the elders.",
    ],
    related: ["elder", "usher", "treasurer"],
    see: [{ label: "Church software for Baptist churches", href: "/for/baptist-churches" }],
  },
  {
    slug: "churchwarden",
    term: "Churchwarden",
    definition:
      "A churchwarden is one of two lay officers of an Anglican parish, elected annually, responsible for the church's property, finances and order in worship.",
    detail: [
      "One is usually chosen by the priest, the other by the congregation. Together with the vestry they are the parish's lay leadership.",
    ],
    usedBy: "Anglican churches.",
    related: ["vestry", "parish"],
    see: [{ label: "Church software for Anglican parishes", href: "/for/anglican-churches" }],
  },
  {
    slug: "vestry",
    term: "Vestry",
    definition:
      "The vestry is the elected council of an Anglican parish, chaired by the parish priest, that manages its finances, property and affairs.",
    detail: [
      "In a Catholic parish the corresponding body is the parish pastoral council, with a finance council beside it.",
    ],
    usedBy: "Anglican churches.",
    related: ["churchwarden", "parish"],
    see: [{ label: "Church software for Anglican parishes", href: "/for/anglican-churches" }],
  },
  {
    slug: "local-preacher",
    term: "Local preacher",
    definition:
      "A local preacher is a trained lay member accredited to lead worship and preach across the societies of a circuit, without being ordained.",
    detail: [
      "The Methodist Church Ghana has 11,861 of them, and on many Sundays a society hears a local preacher rather than its minister. The preaching plan that assigns them is one of the circuit's quarterly documents.",
    ],
    usedBy: "Methodist churches.",
    related: ["class-leader", "circuit"],
    see: [{ label: "Church software for Methodist societies", href: "/for/methodist-churches" }],
  },
  {
    slug: "church-clerk",
    term: "Church clerk",
    definition:
      "A church clerk is the officer of a Baptist or Adventist church who keeps the membership register, records baptisms and transfers, takes minutes and prepares the reports the church sends to its association or conference.",
    detail: [
      "The Adventist church clerk's quarterly report to the conference is the return of that denomination. In Methodist and Presbyterian churches the same work belongs to the society or congregational secretary.",
    ],
    usedBy: "Baptist and Adventist churches.",
    related: ["church-secretary", "statistical-return", "transfer"],
    see: [{ label: "Church software for church secretaries", href: "/for/church-secretaries" }],
  },
  {
    slug: "church-secretary",
    term: "Church secretary",
    definition:
      "The church secretary is the person who keeps the congregation's register, minutes and correspondence, and compiles its returns, usually as a volunteer alongside a full time job.",
    detail: [
      "Society secretary, congregational secretary, assembly secretary, parish secretary, church clerk: the title varies and the evening spent on the quarterly return does not.",
    ],
    related: ["church-clerk", "statistical-return", "register"],
    see: [
      { label: "Church software for church secretaries", href: "/for/church-secretaries" },
      { label: "Keeping the church register", href: "/blog/church-record-keeping-guide-ghana" },
    ],
  },
  {
    slug: "treasurer",
    term: "Church treasurer",
    definition:
      "The church treasurer keeps the congregation's accounts: recording tithes, offerings and other income, paying what is owed, and reporting the figures to the leadership and to the level above.",
    detail: [
      "The treasurer's difficulty in Ghana since about 2020 is that money now arrives two ways, cash on Sunday and mobile money all week, and the return needs both in one figure.",
    ],
    related: ["society-steward", "tithe", "offering", "fund"],
    see: [
      { label: "Church software for church treasurers", href: "/for/church-treasurers" },
      { label: "Financial management", href: "/features/financial-management" },
    ],
  },
  {
    slug: "usher",
    term: "Usher",
    definition:
      "An usher is a member who welcomes people at the door, seats them, takes the headcount and collects the offering during a service.",
    detail: [
      "The ushers' headcount is where most churches' attendance figure comes from, which is why it should be written down the same day, by service, rather than remembered at the end of the quarter.",
    ],
    related: ["attendance", "deacon", "first-time-visitor"],
    see: [{ label: "Record a service", href: "/help/attendance/record-a-service" }],
  },

  // ------------------------------------------------------------- records
  {
    slug: "register",
    term: "Church register",
    definition:
      "The church register is the official list of a congregation's members with their details, membership status, class or group, and the dates of their baptism, confirmation, marriage and death.",
    detail: [
      "It was a bound book, then an Excel file, and in either form it goes wrong the same way: it lives with one person and is out of date the day they hand it over. The Data Protection Act, 2012 (Act 843) treats a church keeping a register as a data controller.",
    ],
    related: ["member-type", "vital-records", "church-secretary", "data-controller"],
    see: [
      { label: "Keeping the church register: a guide", href: "/blog/church-record-keeping-guide-ghana" },
      { label: "Moving your register from a book", href: "/blog/moving-your-register-from-a-book" },
    ],
  },
  {
    slug: "statistical-return",
    term: "Statistical return",
    definition:
      "A statistical return is the report a congregation sends to the level above it, usually quarterly or annually, giving its membership by category, attendance, baptisms, marriages, deaths and income by type.",
    detail: [
      "Every denomination has one under some name: the Methodist quarterly return to the circuit, the Presbyterian congregational return, the Adventist church clerk's report, the Baptist association return. It is the single document that makes a register worth keeping properly, because every figure on it is a count of something the register already holds.",
      "Prepared from a book it takes an evening. Prepared from a register kept up to date it takes a click, because it is only arithmetic.",
    ],
    related: ["register", "attendance", "vital-records", "member-type"],
    see: [
      { label: "How to prepare a statistical return, step by step", href: "/blog/how-to-prepare-your-statistical-return" },
      { label: "A printable statistical return template", href: "/tools/statistical-return-template" },
      { label: "Your return in Fold", href: "/help/reports/statistical-return" },
    ],
  },
  {
    slug: "member-type",
    term: "Member type",
    definition:
      "A member type is the category a church places each person in, such as full member, catechumen, junior member or adherent, which decides what they may do and how they are counted on the return.",
    detail: [
      "The categories are the denomination's own: Methodists count full members, catechumens, junior members and adherents; Presbyterians count communicants; Baptists and Pentecostals count baptised members and new converts. Software that imposes its own list produces a return in the wrong words.",
    ],
    related: ["catechumen", "adherent", "communicant", "register"],
    see: [{ label: "Member types and classes", href: "/help/members/member-types-and-classes" }],
  },
  {
    slug: "catechumen",
    term: "Catechumen",
    definition:
      "A catechumen is a person under instruction for baptism or confirmation who is not yet a full member of the church.",
    detail: [
      "Catechumens are counted separately on the return, and their movement into full membership is one of the figures a circuit or presbytery watches. The class that instructs them is the catechumen class.",
    ],
    related: ["member-type", "confirmation", "adherent"],
    see: [{ label: "Member types and classes", href: "/help/members/member-types-and-classes" }],
  },
  {
    slug: "adherent",
    term: "Adherent",
    definition:
      "An adherent is a person who attends a church regularly and is counted as part of it, without having been received into membership.",
    detail: [
      "Most returns ask for adherents as a separate line, because they are the pool from which next year's catechumens come.",
    ],
    related: ["member-type", "catechumen", "first-time-visitor"],
    see: [{ label: "Member types and classes", href: "/help/members/member-types-and-classes" }],
  },
  {
    slug: "communicant",
    term: "Communicant",
    definition:
      "A communicant is a confirmed member entitled to receive Holy Communion, and the category most Presbyterian and Anglican returns count as full membership.",
    detail: [
      "A communicant roll is the list of those members, revised at set times; a member who has been absent for long enough may be moved off it, which is why attendance matters to the roll and not only to the headcount.",
    ],
    usedBy: "Presbyterian, Anglican and Catholic churches.",
    related: ["member-type", "confirmation"],
    see: [{ label: "Member types and classes", href: "/help/members/member-types-and-classes" }],
  },
  {
    slug: "confirmation",
    term: "Confirmation",
    definition:
      "Confirmation is the rite by which a baptised person, usually in their teens, publicly affirms their faith and is admitted to full membership and to communion.",
    detail: [
      "It is recorded on the register with its date and the officiating bishop or minister, and reported on the return alongside baptisms.",
    ],
    related: ["baptism", "vital-records", "communicant"],
    see: [{ label: "Vital records", href: "/help/reports/vital-records" }],
  },
  {
    slug: "baptism",
    term: "Baptism",
    definition:
      "Baptism is the sacrament of entry into the church, recorded in the baptismal register with the person's name, date of birth, parents, sponsors, date and minister.",
    detail: [
      "The baptismal register is the one church record people come back for decades later, for a passport, a marriage or a scholarship. It is the reason a church's records have to survive a change of secretary.",
    ],
    related: ["vital-records", "confirmation", "register"],
    see: [{ label: "Vital records", href: "/help/reports/vital-records" }],
  },
  {
    slug: "vital-records",
    term: "Vital records",
    definition:
      "Vital records are a church's registers of baptisms, confirmations, marriages and burials, each an official record of the event with its date and the minister who conducted it.",
    detail: [
      "They are records of record, not conveniences: a baptismal certificate is accepted as evidence of a person's name and birth. They are also the source of four lines on every return.",
    ],
    related: ["baptism", "confirmation", "register", "statistical-return"],
    see: [{ label: "Vital records in Fold", href: "/help/reports/vital-records" }],
  },
  {
    slug: "transfer",
    term: "Transfer of membership",
    definition:
      "A transfer is the formal movement of a member from one congregation to another, with a letter from the sending church so the receiving church can enter them on its register.",
    detail: [
      "Without the letter a member is either counted twice or not at all. A church that records transfers in and out can tell its return why membership changed, which is the question the level above always asks.",
    ],
    related: ["register", "church-clerk", "member-type"],
    see: [{ label: "Transfers and visitors", href: "/help/members/transfers-and-visitors" }],
  },
  {
    slug: "first-time-visitor",
    term: "First-time visitor",
    definition:
      "A first-time visitor is somebody attending a church for the first time, recorded with a phone number so they can be welcomed during the week and invited back.",
    detail: [
      "The visitor who is phoned on Tuesday comes back on Sunday; the one who is not usually does not. It is the cheapest growth a church has, and it depends entirely on writing the number down.",
    ],
    related: ["adherent", "usher", "attendance"],
    see: [
      { label: "Transfers and visitors", href: "/help/members/transfers-and-visitors" },
      { label: "Church SMS examples, including welcome texts", href: "/examples/church-sms-messages" },
    ],
  },
  {
    slug: "attendance",
    term: "Attendance",
    definition:
      "Attendance is the count of people present at a service, taken by the ushers or by class, and recorded by date and service so the return can give an average.",
    detail: [
      "The useful figure is not one Sunday but the average over the quarter, measured against the number of services actually held. A church that records attendance per service can see who has quietly stopped coming; one that records a quarterly total cannot.",
    ],
    related: ["usher", "statistical-return", "bible-class"],
    see: [
      { label: "Noticing when a member stops coming", href: "/blog/noticing-when-a-member-stops-coming" },
      { label: "A printable attendance sheet", href: "/tools/attendance-sheet" },
    ],
  },

  // --------------------------------------------------------------- money
  {
    slug: "tithe",
    term: "Tithe",
    definition:
      "A tithe is a tenth of a member's income given to their church, recorded against the member's name so the church can issue a receipt or a statement.",
    detail: [
      "It differs from an offering in being tied to a person and a period. Most Ghanaian churches keep a tithe book or tithe cards for exactly that reason, and it is the first thing that moves to mobile money because a member can pay it from anywhere.",
    ],
    related: ["offering", "fund", "mobile-money-giving", "treasurer"],
    see: [
      { label: "Digital giving", href: "/features/digital-giving" },
      { label: "Record a contribution", href: "/help/giving/record-a-contribution" },
    ],
  },
  {
    slug: "offering",
    term: "Offering",
    definition:
      "An offering is money given during a service, collected by the ushers and counted afterwards, usually recorded as a total for the service rather than against individual members.",
    detail: [
      "Churches often take more than one: the main offering, a thanksgiving offering, a special appeal. Each is a separate line on the count sheet and, if the church uses funds, goes to a separate fund.",
    ],
    related: ["tithe", "fund", "harvest", "usher"],
    see: [{ label: "A printable offering count sheet", href: "/tools/offering-count-sheet" }],
  },
  {
    slug: "harvest",
    term: "Harvest",
    definition:
      "Harvest is the annual thanksgiving service at which members and groups make a special gift, often the largest single day of giving in a church's year.",
    detail: [
      "It is usually recorded as its own fund so the treasurer can report the harvest total separately, and often announced by group or class, which is why churches want the figures by group as well as in total.",
    ],
    related: ["offering", "fund"],
    see: [{ label: "Funds", href: "/help/giving/funds" }],
  },
  {
    slug: "fund",
    term: "Fund",
    definition:
      "A fund is a named purpose that giving is recorded against, such as the building fund, the welfare fund or the harvest, so a church can report how much came in for each and what it was spent on.",
    detail: [
      "The return usually asks for income by type, and a church that records each gift against a fund has the answer without a second book.",
    ],
    related: ["tithe", "offering", "harvest", "welfare"],
    see: [{ label: "Funds in Fold", href: "/help/giving/funds" }],
  },
  {
    slug: "welfare",
    term: "Welfare",
    definition:
      "Welfare is a church's fund and scheme for supporting members in bereavement, illness or hardship, usually financed by regular dues and paid out on set terms.",
    detail: [
      "Welfare dues are recorded per member like tithe, because eligibility depends on being paid up. It is one of the reasons churches ask for per-member giving records rather than totals.",
    ],
    related: ["fund", "tithe"],
    see: [{ label: "Funds in Fold", href: "/help/giving/funds" }],
  },
  {
    slug: "mobile-money-giving",
    term: "Mobile money giving",
    definition:
      "Mobile money giving is a member paying their tithe or offering from their MTN, Telecel or AirtelTigo wallet to the church, either to a merchant number or through a payment processor.",
    detail: [
      "Ghana had 26.7 million active mobile money accounts in 2025, more than the adult population, and transaction values reached GHS 4.54 trillion. Through a processor such as Paystack the fee is 1.95 percent, so a GHS 100 tithe settles as GHS 98.05, and every payment carries a reference the treasurer can match.",
    ],
    related: ["tithe", "settlement", "subaccount", "payment-processor"],
    see: [
      { label: "How to set up mobile money giving for your church", href: "/blog/how-to-set-up-mobile-money-giving-for-your-church" },
      { label: "What mobile money costs a church", href: "/blog/what-mobile-money-costs-a-church" },
      { label: "Giving fee calculator", href: "/tools/giving-fee-calculator" },
    ],
  },
  {
    slug: "payment-processor",
    term: "Payment processor",
    definition:
      "A payment processor is a licensed company such as Paystack or Hubtel that sits between a payer and a church, accepts mobile money or card payments, takes a fee, and settles the balance to the church's account.",
    detail: [
      "The advantage over a plain merchant number is the reference: every payment is tagged with who paid, how much and for what, so the treasurer does not reconcile a wallet statement by hand.",
    ],
    related: ["mobile-money-giving", "settlement", "subaccount"],
    see: [{ label: "Fold and Paystack", href: "/works-with/paystack" }],
  },
  {
    slug: "settlement",
    term: "Settlement",
    definition:
      "Settlement is the transfer of money a processor has collected on a church's behalf into the church's own mobile money or bank account, less the fee, usually the next working day.",
    detail: [
      "The settlement account is the church's own. Software that collects giving should never hold the money; it should tell the processor where to send it.",
    ],
    related: ["payment-processor", "subaccount", "mobile-money-giving"],
    see: [{ label: "Mobile money in Fold", href: "/help/giving/mobile-money" }],
  },
  {
    slug: "subaccount",
    term: "Subaccount",
    definition:
      "A subaccount is a settlement destination registered with a payment processor under a platform's account, so that money collected for one church settles to that church's own wallet or bank account and to nobody else.",
    detail: [
      "It is how a platform serving many churches keeps their money apart. Each church's subaccount names its own account; the platform's share, if any, is a percentage set on the subaccount. Fold's is zero.",
    ],
    related: ["settlement", "payment-processor"],
    see: [{ label: "Security: how church money and data are separated", href: "/security" }],
  },
  {
    slug: "e-levy",
    term: "E-Levy",
    definition:
      "The E-Levy was Ghana's tax on electronic transfers including mobile money, introduced in May 2022 at 1.5 percent, reduced to 1 percent in January 2023 and repealed with effect from 2 April 2025.",
    detail: [
      "While it applied, it was charged to the sender on transfers above a daily threshold and was one reason churches hesitated over mobile money giving. Its abolition removed that cost; a processor's fee remains.",
    ],
    related: ["mobile-money-giving", "payment-processor"],
    see: [{ label: "What mobile money costs a church", href: "/blog/what-mobile-money-costs-a-church" }],
  },

  // --------------------------------------------------------- data and law
  {
    slug: "data-controller",
    term: "Data controller",
    definition:
      "A data controller is the organisation that decides why and how personal data is processed, which under Ghana's Data Protection Act, 2012 (Act 843) includes a church keeping a membership register.",
    detail: [
      "Religious belief is special personal data under the Act. A church should collect only what it needs, keep it secure, and be able to show a member what it holds about them. The Data Protection Commission expects data controllers to register with it.",
    ],
    related: ["register", "data-processor", "row-level-security"],
    see: [
      { label: "What the Data Protection Act asks of a church", href: "/help/account/data-protection-act" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
  {
    slug: "data-processor",
    term: "Data processor",
    definition:
      "A data processor is a company that handles personal data on a controller's behalf and on its instructions, which is what church management software is to the church that uses it.",
    detail: [
      "The church remains responsible for the data; the processor is responsible for keeping it secure and using it for nothing else. A processor's privacy policy should say who else sees the data and where it is stored.",
    ],
    related: ["data-controller", "row-level-security"],
    see: [{ label: "Privacy policy", href: "/privacy" }],
  },
  {
    slug: "row-level-security",
    term: "Row-level security",
    definition:
      "Row-level security is a database feature that attaches an access rule to every row, so that a query from one church can only ever return that church's rows however the query is written.",
    detail: [
      "It is the difference between separation enforced by the application, which a bug can bypass, and separation enforced by the database, which cannot be bypassed by the application at all. It is the right question to ask any software that holds more than one church's data.",
    ],
    related: ["data-controller", "data-processor", "multi-tenant"],
    see: [
      { label: "How Fold keeps churches apart", href: "/security" },
      { label: "How your data is separated", href: "/help/account/how-your-data-is-separated" },
    ],
  },
  {
    slug: "multi-tenant",
    term: "Multi-tenant",
    definition:
      "Multi-tenant software serves many separate customers, such as many churches, from one system while keeping each one's data invisible to the others.",
    detail: [
      "Almost all church software is multi-tenant. What varies is how the separation is enforced, which is a question worth asking before the register goes in.",
    ],
    related: ["row-level-security", "data-processor"],
    see: [{ label: "Security", href: "/security" }],
  },
  {
    slug: "church-management-software",
    term: "Church management software",
    definition:
      "Church management software is a system for keeping a congregation's register, attendance, giving and reports in one place, usually online, so that several leaders can work from the same records.",
    detail: [
      "It is sometimes shortened to ChMS. In Ghana the tests that matter are whether it understands the denomination's structure and return, whether it takes mobile money, and whether it works on a phone with a weak connection.",
    ],
    related: ["register", "statistical-return", "mobile-money-giving", "multi-tenant"],
    see: [
      { label: "Church management software in Ghana", href: "/blog/church-management-software-in-ghana" },
      { label: "Fold's features", href: "/features" },
    ],
  },
];

export function getTerm(slug: string) {
  return TERMS.find((t) => t.slug === slug);
}

export const sortedTerms = [...TERMS].sort((a, b) => a.term.localeCompare(b.term));
