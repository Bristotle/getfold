/**
 * Church SMS examples.
 *
 * Thirty texts a Ghanaian church actually sends, each under 160 characters
 * so it goes as one message and one credit, with a line on why it works.
 * That line is the part that gets lifted into an answer, so it says
 * something specific rather than "it is friendly".
 *
 * Placeholders in curly braces are what Fold fills in when a church sends
 * the message from the product; a church copying the text by hand fills
 * them in itself.
 */

export type SmsExample = {
  text: string;
  why: string;
};

export type SmsCategory = {
  slug: string;
  name: string;
  intro: string;
  examples: SmsExample[];
};

export const SMS_CATEGORIES: SmsCategory[] = [
  {
    slug: "visitors",
    name: "Welcoming a first-time visitor",
    intro:
      "Sent on Monday or Tuesday, from the church's name, to the number the visitor wrote on Sunday. The visitor who is contacted in the week comes back; the one who is not usually does not.",
    examples: [
      {
        text: "Akwaaba {first_name}! Thank you for worshipping with us at {church} on Sunday. We hope you felt at home. Service is 9am next Sunday. Do come again.",
        why: "Names the person, names the church, gives the next service time. Nothing to reply to, nothing to decide.",
      },
      {
        text: "Hello {first_name}, it was a joy to have you at {church} on Sunday. If there is anything we can pray about with you this week, just reply. God bless you.",
        why: "Offers something the visitor might want before asking for anything. A reply, if it comes, is the beginning of a relationship.",
      },
      {
        text: "{first_name}, thank you for visiting {church}. Our Bible study is Wednesday at 6pm at the church hall, and everyone is welcome. Hope to see you.",
        why: "A midweek invitation gives a second chance to return before next Sunday, and a smaller room is easier to walk into than a full church.",
      },
      {
        text: "Dear {first_name}, welcome to the {church} family. Your class leader, {leader}, will call you this week to say hello. God bless you.",
        why: "Tells the visitor a real person will follow up, and tells the class leader by implication that they now have to.",
      },
    ],
  },
  {
    slug: "giving",
    name: "Thanking a member for giving",
    intro:
      "A thank you for a tithe or offering, sent a few minutes after a mobile money gift succeeds, or after Sunday's count. It confirms the money arrived and that somebody noticed.",
    examples: [
      {
        text: "Thank you {first_name}. Your tithe of GHS {amount} to {church} has been received and recorded. May God bless the work of your hands.",
        why: "Confirms the amount, so the member knows the mobile money went to the right place, and says it was recorded, which is what a tithe payer wants to hear.",
      },
      {
        text: "{church} has received your offering of GHS {amount}. Thank you for your faithfulness. Ref {reference}.",
        why: "Short, with a reference the member can quote if a question ever arises. Reads like a receipt because it is one.",
      },
      {
        text: "Thank you for your gift to the {fund} at {church}. GHS {amount} received on {date}. Your giving builds this house.",
        why: "Names the fund, so a member who gave to the building fund knows it was not counted as tithe.",
      },
      {
        text: "{first_name}, your harvest thanksgiving of GHS {amount} has been received with gratitude. {church} thanks God for you.",
        why: "Harvest gifts are often the largest of the year and often announced publicly; a private thank you the same day matters.",
      },
    ],
  },
  {
    slug: "birthdays",
    name: "Birthdays and anniversaries",
    intro:
      "Sent on the morning of the day, from the register's date of birth. The year is never mentioned, because the year is the part nobody wants announced.",
    examples: [
      {
        text: "Happy birthday {first_name}! {church} celebrates you today. May this new year of your life be full of God's goodness. Medaase for being part of our family.",
        why: "Warm without being long. The Twi word lands as the church's own voice rather than a system's.",
      },
      {
        text: "{first_name}, on your birthday {church} prays Numbers 6:24-26 over you: the Lord bless you and keep you. Have a wonderful day.",
        why: "A blessing from scripture is what a pastor would say in person, and it is what members forward to family.",
      },
      {
        text: "Happy wedding anniversary to {first_name} and {spouse}! {church} thanks God for your marriage and prays for many more years together.",
        why: "Names both spouses, which the register can only do if it records the marriage. A reason to keep vital records properly.",
      },
    ],
  },
  {
    slug: "reminders",
    name: "Service and meeting reminders",
    intro:
      "Sent the evening before, or the morning of. Time, place and one reason to come. A reminder with three announcements in it is a newsletter, and nobody reads a newsletter on a phone.",
    examples: [
      {
        text: "Reminder: {church} worship service tomorrow at 9am. Rev. {minister} preaches on 'The God who provides'. Bring a friend.",
        why: "The sermon title gives a reason beyond habit, and 'bring a friend' is the invitation most members need permission for.",
      },
      {
        text: "Leaders' meeting tonight at 7pm at the church office. Agenda: harvest planning and the quarterly return. Please be on time.",
        why: "Agenda in the text means people arrive prepared, and 'quarterly return' tells the secretary to bring the figures.",
      },
      {
        text: "Bible class meets Wednesday 6pm. {leader}'s class is studying Romans 8 this week. See you there.",
        why: "Sent to one class only, from the class leader's list. A church of four hundred should not text everyone about one class.",
      },
      {
        text: "Holy Communion this Sunday at {church}. Service begins at 8:30am. Communicant members please come early.",
        why: "Tells communicants specifically, which is only possible when the register records who is a communicant.",
      },
      {
        text: "Watch night service: 31 Dec, 9pm to past midnight at {church}. Come and cross over with your church family.",
        why: "One of the two nights a year the whole congregation comes. The reminder is about the time, not the persuasion.",
      },
    ],
  },
  {
    slug: "absence",
    name: "A member who has not been seen",
    intro:
      "Sent by the class leader or pastor, to one person, after two or three absences from somebody who usually comes. Never sent in bulk and never with a hint of reproach.",
    examples: [
      {
        text: "Hello {first_name}, we have missed you at {church} these past weeks. Is everything alright? Your class leader {leader} would love to hear from you.",
        why: "Asks after the person rather than about the absence. The reply will say whether it is illness, travel, a grievance or simply drift.",
      },
      {
        text: "{first_name}, {church} has been thinking of you. If you are unwell or travelling, let us know how we can support you. We hope to see you soon.",
        why: "Offers the two most common reasons for absence as acceptable answers, so the member does not have to explain.",
      },
      {
        text: "Dear {first_name}, this is Rev. {minister}. I noticed we have not seen you for a while and wanted to check on you personally. Call me any time on {phone}.",
        why: "From the minister by name, with a number. The most effective absence message there is, and only possible when the minister is told in time.",
      },
    ],
  },
  {
    slug: "announcements",
    name: "Announcements",
    intro:
      "Funerals, harvest, a change of venue, a visiting preacher. One announcement per text, with the who, when and where, and the total number of texts a month kept low enough that people still read them.",
    examples: [
      {
        text: "{church} announces the passing of {name} of {leader}'s class. One week observance: Sunday after service. Funeral details to follow. Please pray for the family.",
        why: "Announces the fact and the first event, promises the rest, and asks for one thing. Funerals are the announcement members most want by text.",
      },
      {
        text: "Harvest thanksgiving is Sunday {date} at {church}. Groups and classes will present their offerings. Come and give thanks for the year.",
        why: "Two weeks' notice lets classes organise, which is what raises the total. The text is to the members; the class leader's follow up is where the work happens.",
      },
      {
        text: "This Sunday {church} hosts Rev. {guest} of {guest_church} as guest preacher. Service at 9am. Invite someone.",
        why: "A guest preacher is an easy invitation for members to extend to friends, so the text says so.",
      },
      {
        text: "Change of venue: Sunday service at {church} will be held at {venue} this week only, at the usual time of 9am.",
        why: "Says 'this week only' and repeats the usual time, so nobody turns up at the wrong place next Sunday.",
      },
      {
        text: "{church} welfare: contributions for {name}'s hospital bills can be given on Sunday or by MoMo to {number}, reference 'welfare'. Thank you.",
        why: "Gives a mobile money option with a reference, so the treasurer can tell welfare gifts from tithe when the statement arrives.",
      },
      {
        text: "Youth fellowship this Saturday 4pm at {church}. Games, worship and a talk on 'Faith at work'. Bring a friend under 30.",
        why: "Names the audience, so a text sent to the whole church still reads as aimed rather than broadcast.",
      },
    ],
  },
  {
    slug: "pledges",
    name: "Pledges and dues",
    intro:
      "Gentle, specific and with a way to pay in the text. A pledge reminder that gives the balance and a mobile money number gets paid; one that says 'please redeem your pledges' does not.",
    examples: [
      {
        text: "{first_name}, thank you for your pledge of GHS {pledged} to the {fund}. GHS {paid} received; balance GHS {balance}. Pay on Sunday or by MoMo to {number}.",
        why: "States the pledge, what has been paid and what remains. A member who sees the arithmetic pays; one who has to ask does not.",
      },
      {
        text: "Reminder from {church}: welfare dues for {month} are GHS {amount}. Pay on Sunday or by MoMo to {number}. Being paid up keeps you covered.",
        why: "Says what being paid up is for, which is the reason welfare dues exist and the reason people pay them.",
      },
      {
        text: "Building fund update: GHS {raised} raised of GHS {target}. Thank you {church}! Every gift moves us closer. MoMo {number}, reference 'building'.",
        why: "Progress towards a target is the most motivating figure a church can text, and it costs nothing to share.",
      },
    ],
  },
  {
    slug: "seasons",
    name: "Christmas, Easter and the new year",
    intro:
      "Sent to everyone, once. The one time a year a text to the whole register is right, because the message is the same for all of them.",
    examples: [
      {
        text: "Merry Christmas from {church}! Christmas Day service at 9am. Thank you for a year of faithfulness. God bless you and your family.",
        why: "Greeting, service time, thanks. Three things in three sentences, none of them a request.",
      },
      {
        text: "He is risen! {church} wishes you a blessed Easter. Easter Sunday service at 8:30am, followed by fellowship. Come and celebrate.",
        why: "Opens with the proclamation the day is about, which is what members will reply with.",
      },
      {
        text: "Happy new year from {church}! Thank you for 2025. Our theme for 2026: '{theme}'. First service Sunday {date} at 9am. Afehyia pa!",
        why: "The year's theme in the first text of the year is how most Ghanaian churches announce it, and the Twi greeting is expected.",
      },
    ],
  },
];

export const SMS_COUNT = SMS_CATEGORIES.reduce((n, c) => n + c.examples.length, 0);
