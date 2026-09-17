/**
 * The brand's four colours, for anything that shows a set of things.
 *
 * Purple leads, then teal, amber and pink, and a list of items takes them
 * in turn so neighbouring cards never share one. The plain class is for a
 * rule or a dot, the -text class is the only one that goes on type, and
 * -soft is a tint behind it. See globals.css for the contrast numbers.
 */
export const ACCENTS = [
  { rule: "bg-primary", text: "text-primary",    soft: "bg-primary-soft", icon: "bg-primary/10 text-primary" },
  { rule: "bg-teal",    text: "text-teal-text",  soft: "bg-teal-soft",    icon: "bg-teal-soft text-teal-text" },
  { rule: "bg-amber",   text: "text-amber-text", soft: "bg-amber-soft",   icon: "bg-amber-soft text-amber-text" },
  { rule: "bg-pink",    text: "text-pink-text",  soft: "bg-pink-soft",    icon: "bg-pink-soft text-pink-text" },
] as const;

export const accentAt = (i: number) => ACCENTS[i % ACCENTS.length];
