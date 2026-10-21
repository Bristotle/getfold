/**
 * The 2026 church records survey: original data nobody else in Ghana has.
 *
 * Fold's own usage figures are not used for this, and will not be until
 * enough churches use Fold that no single one could be picked out of a
 * total, and the privacy policy says so in advance. Until then the honest
 * source of original data is to ask: a short anonymous survey of the
 * people who keep church records, published in full once enough answer.
 *
 * Results are hidden until MIN_RESPONSES churches have answered. Below
 * that, a percentage is one or two churches, which is an anecdote dressed
 * as a statistic. The threshold is enforced in survey_results() in the
 * database, not only on the page.
 */

export const SURVEY_SLUG = "church-records-2026";
export const SURVEY_TITLE = "How churches in Ghana keep their records: 2026 survey";
export const MIN_RESPONSES = 30;

export type Question = {
  id: string;
  text: string;
  options: string[];
};

export const QUESTIONS: Question[] = [
  {
    id: "role",
    text: "What is your role in the church?",
    options: ["Pastor or minister", "Church secretary or clerk", "Treasurer or finance", "Class or group leader", "Administrator", "Other"],
  },
  {
    id: "denomination",
    text: "Which family of churches is yours?",
    options: ["Methodist", "Presbyterian", "Anglican", "Catholic", "Church of Pentecost", "Assemblies of God", "Other Pentecostal or Charismatic", "Baptist", "SDA", "Other"],
  },
  {
    id: "size",
    text: "About how many members are on your register?",
    options: ["Under 50", "50 to 149", "150 to 299", "300 to 599", "600 or more"],
  },
  {
    id: "register",
    text: "Where is your membership register kept today?",
    options: ["A book or file", "Excel or Google Sheets", "Church management software", "On a phone or in WhatsApp", "Several places", "We do not keep one"],
  },
  {
    id: "giving",
    text: "How is giving recorded?",
    options: ["A book", "Excel or Google Sheets", "Church management software", "Bank or mobile money statements only", "Not recorded by member"],
  },
  {
    id: "momo",
    text: "Can members give by mobile money?",
    options: ["Yes, to a merchant number or link in the church's name", "Yes, to a personal phone number", "No"],
  },
  {
    id: "return",
    text: "How long does your quarterly statistical return or report take to prepare?",
    options: ["Under an hour", "One to three hours", "Three hours to a day", "More than a day", "We do not prepare one"],
  },
  {
    id: "attendance",
    text: "How is attendance taken?",
    options: ["A head count", "Names of who attended", "Both", "Not recorded"],
  },
  {
    id: "hardest",
    text: "Which part of church records is hardest to keep?",
    options: ["Keeping the register up to date", "Recording giving accurately", "The statistical return", "Following up members who stop coming", "Getting leaders to record things", "Nothing in particular"],
  },
  {
    id: "region",
    text: "Which region is your church in?",
    options: ["Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Western North", "Volta", "Oti", "Northern", "Savannah", "North East", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo"],
  },
];
