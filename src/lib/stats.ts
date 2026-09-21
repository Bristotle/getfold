/**
 * Church statistics, Ghana.
 *
 * One page holding the numbers anybody writing about the church in Ghana
 * has to look up, each with its source and date, updated on a fixed
 * quarter and dated visibly. The reason for the page is that an assistant
 * saying "according to" needs somewhere to point, and nobody holds that
 * spot for this category.
 *
 * Rules. Every figure has a source a reader can open. A figure whose
 * source has gone is removed, not kept. Nothing is rounded beyond what the
 * source gave. The update date at the top is the date somebody actually
 * checked, not the build date.
 */

export const STATS_UPDATED = "2026-09-21";
export const STATS_NEXT = "2026-12-21";

export type Stat = {
  label: string;
  value: string;
  /** Free text: the year or period the figure is for. */
  asOf: string;
  source: { label: string; url: string };
  note?: string;
};

export type StatSection = {
  slug: string;
  title: string;
  intro: string;
  stats: Stat[];
};

const CENSUS = {
  label: "Ghana Statistical Service, 2021 Population and Housing Census, General Report Volume 3C, via Wikipedia",
  url: "https://en.wikipedia.org/wiki/Religion_in_Ghana",
};
const MCG = { label: "The Methodist Church Ghana, Northern Accra Diocese, the church in figures", url: "https://www.mcgnad.org/" };
const MOMO = {
  label: "Bank of Ghana figures reported by MyJoyOnline, mobile money in 2025",
  url: "https://www.myjoyonline.com/total-mobile-money-transaction-values-grew-by-50-8-to-gh%C2%A24-54trn-in-2025/",
};

export const STAT_SECTIONS: StatSection[] = [
  {
    slug: "religion",
    title: "Religion in Ghana",
    intro:
      "Ghana is 71.3 percent Christian by the 2021 census, and Pentecostal and charismatic Christians are the largest single grouping at 31.6 percent of the whole population, ahead of the older Protestant churches at 17.4 percent and Catholics at 10 percent.",
    stats: [
      { label: "Population counted", value: "30.8 million", asOf: "2021 census", source: CENSUS },
      { label: "Christian", value: "71.3%", asOf: "2021 census", source: CENSUS },
      { label: "Pentecostal or charismatic", value: "31.6%", asOf: "2021 census", source: CENSUS, note: "Of the whole population, not of Christians." },
      { label: "Other Protestant", value: "17.4%", asOf: "2021 census", source: CENSUS, note: "Methodist, Presbyterian, Anglican, Baptist, Adventist and others." },
      { label: "Catholic", value: "10.0%", asOf: "2021 census", source: CENSUS },
      { label: "Other Christian", value: "12.3%", asOf: "2021 census", source: CENSUS },
      { label: "Muslim", value: "19.9%", asOf: "2021 census", source: CENSUS },
      { label: "Traditional religion", value: "3.2%", asOf: "2021 census", source: CENSUS },
      { label: "No religion", value: "1.1%", asOf: "2021 census", source: CENSUS },
    ],
  },
  {
    slug: "denominations",
    title: "The denominations in figures",
    intro:
      "The Methodist Church Ghana publishes the most complete structural count of any Ghanaian denomination: 20 dioceses, 337 circuits and 4,934 societies serving over 874,000 members. The Presbyterian Church of Ghana passed a million members in 2019. Assemblies of God has over 6,000 local churches.",
    stats: [
      { label: "Methodist Church Ghana, members", value: "874,326+", asOf: "Church's own figure", source: MCG },
      { label: "Methodist Church Ghana, dioceses / circuits / societies", value: "20 / 337 / 4,934", asOf: "Church's own figure", source: MCG },
      { label: "Methodist Church Ghana, active pastors", value: "1,058", asOf: "Church's own figure", source: MCG },
      { label: "Methodist Church Ghana, local preachers / lay leaders", value: "11,861 / 34,403", asOf: "Church's own figure", source: MCG },
      {
        label: "Presbyterian Church of Ghana, members",
        value: "1,015,174",
        asOf: "End of 2019",
        source: { label: "PCG Committee on Information Management, Statistics and Planning, 2019, via Wikipedia", url: "https://en.wikipedia.org/wiki/Presbyterian_Church_of_Ghana" },
      },
      {
        label: "Presbyterian Church of Ghana, congregations / presbyteries",
        value: "4,889 / 19",
        asOf: "2019; presbyteries as listed 2026",
        source: { label: "Presbyterian Church of Ghana, presbyteries", url: "https://pcgonline.org/presbyteries/" },
        note: "Two of the 19 presbyteries are overseas.",
      },
      {
        label: "Assemblies of God, Ghana, local churches / members",
        value: "6,000+ / about 700,000",
        asOf: "2023",
        source: { label: "Ghana News Agency, induction of the General Superintendent, February 2023", url: "https://gna.org.gh/2023/02/assemblies-of-god-ghana-to-induct-new-general-superintendent-executive-presbytery-officers/" },
      },
      {
        label: "Catholic Church in Ghana, dioceses / parishes / catechists",
        value: "20 / 798 / 7,413",
        asOf: "Latest published",
        source: { label: "Catholic Church in Ghana, Wikipedia, citing the Episcopal Conference", url: "https://en.wikipedia.org/wiki/Catholic_Church_in_Ghana" },
      },
      {
        label: "Seventh-day Adventist, Southern Ghana Union Conference, churches / members",
        value: "1,092 / 201,831",
        asOf: "30 June 2024",
        source: { label: "Seventh-day Adventist Yearbook, Southern Ghana Union Conference", url: "https://www.adventistyearbook.org/entity?EntityID=13528" },
        note: "One of several Adventist unions in Ghana; the Mid-Ghana Union Conference reported 834 churches and 165,297 members at 30 June 2025.",
      },
      {
        label: "Evangelical Presbyterian Church, Ghana, congregations / members",
        value: "748 / about 600,000",
        asOf: "Latest published",
        source: { label: "Evangelical Presbyterian Church, Ghana, Wikipedia", url: "https://en.wikipedia.org/wiki/Evangelical_Presbyterian_Church,_Ghana" },
        note: "The World Council of Churches lists 787 congregations and 200,000 members; the two figures count membership differently.",
      },
      {
        label: "International Central Gospel Church, assemblies",
        value: "450+",
        asOf: "Latest published",
        source: { label: "International Central Gospel Church, Wikipedia", url: "https://en.wikipedia.org/wiki/International_Central_Gospel_Church" },
      },
    ],
  },
  {
    slug: "mobile-money",
    title: "Mobile money, the channel church giving now uses",
    intro:
      "Ghana had 26.7 million active mobile money accounts in 2025, more than its adult population, and moved GHS 4.54 trillion through them, up 50.8 percent on the year. A processor charges a church 1.95 percent to receive a gift, and the E-Levy on transfers has been gone since April 2025.",
    stats: [
      { label: "Active mobile money accounts", value: "26.7 million", asOf: "2025", source: MOMO },
      { label: "Value of mobile money transactions", value: "GHS 4.54 trillion", asOf: "2025", source: MOMO, note: "Up 50.8 percent on 2024." },
      {
        label: "Paystack fee on mobile money, Ghana",
        value: "1.95%",
        asOf: "2026",
        source: { label: "Paystack Ghana pricing", url: "https://paystack.com/gh/pricing" },
        note: "No monthly fee, no minimum per transaction. A GHS 100 gift settles as GHS 98.05.",
      },
      {
        label: "E-Levy on electronic transfers",
        value: "Abolished",
        asOf: "April 2025",
        source: { label: "Ghana Revenue Authority, Electronic Transfer Levy repealed in April 2025", url: "https://gra.gov.gh/news/portfolio/electronic-transfer-levy-repealed-in-april-2025/" },
        note: "Introduced May 2022 at 1.5 percent, cut to 1 percent in January 2023, repealed with effect from 2 April 2025.",
      },
    ],
  },
  {
    slug: "law",
    title: "The law a church register sits under",
    intro:
      "A church that keeps a membership register is a data controller under Ghana's Data Protection Act, 2012 (Act 843), and religious belief is special personal data under that Act. The Data Protection Commission expects controllers to register with it.",
    stats: [
      {
        label: "Data Protection Act",
        value: "Act 843 of 2012",
        asOf: "In force since 16 October 2012",
        source: { label: "Data Protection Act, 2012 (Act 843), full text hosted by the National Communications Authority", url: "https://nca.org.gh/wp-content/uploads/2020/09/Data-Protection-Act-2012.pdf" },
      },
      {
        label: "Religious belief",
        value: "Special personal data",
        asOf: "Act 843, interpretation section",
        source: { label: "Data Protection Act, 2012 (Act 843)", url: "https://nca.org.gh/wp-content/uploads/2020/09/Data-Protection-Act-2012.pdf" },
        note: "Along with health, ethnic origin, political opinion and others, it may only be processed on narrower grounds.",
      },
    ],
  },
];

export const STAT_COUNT = STAT_SECTIONS.reduce((n, s) => n + s.stats.length, 0);
