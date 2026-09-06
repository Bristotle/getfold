/**
 * Labels for the Postgres enums in prisma/schema.prisma.
 *
 * The `value` of every entry must stay in sync with its enum — Postgres
 * rejects anything else on insert. Kept in one place so a new service type
 * or payment method is added once, not in each form.
 */

export const SERVICE_TYPES = [
  { value: "sunday_service", label: "Sunday service" },
  { value: "bible_class", label: "Bible class" },
  { value: "prayer_meeting", label: "Prayer meeting" },
  { value: "communion_service", label: "Communion service" },
  { value: "youth_service", label: "Youth service" },
  { value: "children_service", label: "Children's service" },
  { value: "other", label: "Other" },
] as const;

// Naming varies by denomination — a Methodist "Bible class" and a
// Pentecostal "fellowship" are the same structural thing. The enum stays
// broad; the group's free-text `name` carries the church's own wording.
export const GROUP_TYPES = [
  { value: "bible_class", label: "Bible class" },
  { value: "fellowship", label: "Fellowship" },
  { value: "choir", label: "Choir" },
  { value: "ministry", label: "Ministry" },
  { value: "other", label: "Other" },
] as const;

export const CONTRIBUTION_TYPES = [
  { value: "tithe", label: "Tithe" },
  { value: "offering", label: "Offering" },
  { value: "pledge", label: "Pledge" },
  { value: "donation", label: "Donation" },
  { value: "other", label: "Other" },
] as const;

// Cash first, deliberately: it is the default way most congregations give,
// and the product must never assume mobile money is available.
export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "momo", label: "Mobile money" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
] as const;

export const VITAL_RECORD_TYPES = [
  { value: "baptism", label: "Baptism" },
  { value: "confirmation", label: "Confirmation" },
  { value: "wedding", label: "Wedding" },
  { value: "death", label: "Death" },
] as const;

export const TRANSFER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export const labelFor = (
  list: ReadonlyArray<{ value: string; label: string }>,
  value: string | null
) => list.find((i) => i.value === value)?.label ?? value ?? "—";

export const values = (list: ReadonlyArray<{ value: string }>) =>
  list.map((i) => i.value);
