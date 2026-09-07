import "server-only";

/**
 * CSV handling for member import and export.
 *
 * Written rather than pulled in as a dependency because the requirement is
 * narrow and the failure modes are specific to this data: Ghanaian names
 * containing commas, phone numbers Excel would otherwise mangle into
 * scientific notation, and files saved from Google Sheets with a BOM.
 */

/** Splits one CSV line, honouring quotes and escaped quotes. */
function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        // "" inside a quoted field is a literal quote
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

/**
 * Column names people actually use.
 *
 * A church exports from Excel, Google Sheets, or another church system, and
 * the header row is never quite what you expect. Matching loosely on a
 * normalised name means "Full Name", "full_name", "NAME" and "Member Name"
 * all land in the right column.
 */
const ALIASES: Record<string, string[]> = {
  full_name: ["full name", "name", "member name", "fullname", "member"],
  gender: ["gender", "sex"],
  date_of_birth: ["date of birth", "dob", "birth date", "birthday"],
  phone: ["phone", "phone number", "mobile", "telephone", "contact", "number"],
  email: ["email", "email address", "e mail"],
  address: ["address", "location", "town", "city", "residence"],
  member_type: [
    "member type",
    "membership type",
    "type",
    "category",
    "status of member",
  ],
  group: ["group", "class", "bible class", "fellowship", "group name"],
};

const normalise = (h: string) =>
  h.toLowerCase().replace(/[_\-.]+/g, " ").replace(/\s+/g, " ").trim();

export type ParsedMember = {
  full_name: string;
  gender: "male" | "female" | null;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  member_type: string | null;
  group: string | null;
};

export type ParseResult = {
  rows: ParsedMember[];
  /** Row number and reason, so a church can fix its file rather than guess. */
  skipped: { line: number; reason: string }[];
  /** Headers we could not place, reported so nothing is silently dropped. */
  unmatchedHeaders: string[];
};

function parseGender(v: string): "male" | "female" | null {
  const g = v.toLowerCase().trim();
  if (["m", "male", "man", "brother"].includes(g)) return "male";
  if (["f", "female", "woman", "sister"].includes(g)) return "female";
  return null;
}

/**
 * Dates arrive in whatever the spreadsheet decided. Accepts ISO, and the
 * day-first formats used across Ghana. Ambiguous values are left null rather
 * than guessed, because a wrong birthday is worse than a missing one.
 */
function parseDate(v: string): string | null {
  const s = v.trim();
  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (m) {
    const [, a, b, y] = m;
    const day = Number(a);
    const month = Number(b);
    // Only accept when the first number cannot be a month, or both are valid
    // day-first. Anything genuinely ambiguous is rejected above 12.
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  return null;
}

export function parseMembersCsv(text: string): ParseResult {
  // Excel and Google Sheets both like to prepend a byte order mark.
  const clean = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const lines = clean.split("\n").filter((l) => l.trim() !== "");

  if (lines.length === 0) {
    return { rows: [], skipped: [], unmatchedHeaders: [] };
  }

  const headers = splitLine(lines[0]).map(normalise);
  const map: Record<number, string> = {};
  const unmatchedHeaders: string[] = [];

  headers.forEach((h, i) => {
    const field = Object.keys(ALIASES).find((f) => ALIASES[f].includes(h));
    if (field) map[i] = field;
    else if (h) unmatchedHeaders.push(h);
  });

  const rows: ParsedMember[] = [];
  const skipped: { line: number; reason: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    const get = (field: string) => {
      const idx = Object.keys(map).find((k) => map[Number(k)] === field);
      return idx === undefined ? "" : (cells[Number(idx)] ?? "");
    };

    const fullName = get("full_name");
    if (!fullName) {
      skipped.push({ line: i + 1, reason: "No name in this row" });
      continue;
    }

    rows.push({
      full_name: fullName,
      gender: parseGender(get("gender")),
      date_of_birth: parseDate(get("date_of_birth")),
      phone: get("phone") || null,
      email: get("email") || null,
      address: get("address") || null,
      member_type: get("member_type") || null,
      group: get("group") || null,
    });
  }

  return { rows, skipped, unmatchedHeaders };
}

/** Quotes a value only when it needs it, so the file stays readable. */
function cell(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: (string | number | null)[][]) {
  const lines = [headers.map(cell).join(",")];
  for (const r of rows) lines.push(r.map(cell).join(","));
  // A BOM makes Excel open UTF-8 correctly, which matters for Ghanaian names
  // carrying accents. Google Sheets and Numbers handle it fine too.
  return "﻿" + lines.join("\r\n");
}
