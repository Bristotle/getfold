/**
 * Product screenshots from a real, seeded church.
 *
 * The marketing site had no picture of the product, which is the one thing
 * on every "looks fake" list that is actually true of a site that lacks it.
 * A mock up would be worse than nothing: it shows a product that does not
 * exist. So this seeds a fictitious Methodist society with invented people,
 * signs in as its pastor with a real browser, screenshots the pages a
 * church actually looks at, and deletes the church and the pastor.
 *
 * Nothing here touches a real church. The pastor is at example.com, which
 * cannot receive mail, and the society is removed at the end whether the
 * screenshots succeeded or not.
 *
 *   npm run build && npx next start -p 3100 &
 *   node scripts/demo-screens.mjs
 *
 * Writes public/screens/*.webp at two widths.
 */
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; })
);
const BASE = process.env.BASE ?? "http://localhost:3100";
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const stamp = Date.now();
const email = `demo-pastor+${stamp}@example.com`;
const password = `Demo${stamp}xyz`;

// ---------------------------------------------------------------- people
const FIRST_F = ["Abena", "Akosua", "Ama", "Adwoa", "Afua", "Yaa", "Esi", "Efua", "Araba", "Adjoa", "Naana", "Maame", "Dede", "Korkor", "Enyonam", "Sena", "Mawusi", "Lamisi", "Ayisha", "Gifty", "Comfort", "Vida", "Dorcas", "Patience", "Mercy", "Grace", "Charity", "Faustina", "Rebecca", "Salome"];
const FIRST_M = ["Kofi", "Kwame", "Kwabena", "Kwaku", "Yaw", "Kojo", "Kwesi", "Kwadwo", "Nii", "Tetteh", "Selorm", "Elikem", "Kwaw", "Ebo", "Fiifi", "Paa", "Emmanuel", "Samuel", "Isaac", "Daniel", "Joseph", "Ernest", "Francis", "Michael", "Richard", "Seth", "Godfred", "Bismark", "Prince", "Eric"];
const LAST = ["Mensah", "Asante", "Owusu", "Boateng", "Appiah", "Osei", "Agyemang", "Darko", "Ofori", "Amoah", "Acheampong", "Adjei", "Quaye", "Tetteh", "Lartey", "Ansah", "Baah", "Nyarko", "Sarpong", "Frimpong", "Gyasi", "Otoo", "Addo", "Okyere", "Yeboah", "Bonsu", "Antwi", "Kusi", "Donkor", "Nkrumah"];
const TYPES = ["Full Member", "Full Member", "Full Member", "Full Member", "Catechumen", "Junior Member", "Adherent"];

function rnd(n) { return Math.floor(Math.random() * n); }
function pick(a) { return a[rnd(a.length)]; }
function iso(d) { return d.toISOString(); }
function daysAgo(n, h = 10) { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h, 0, 0, 0); return d; }
function lastSundays(n) {
  const out = []; const d = new Date(); d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 7) % 7)); // most recent Sunday
  for (let i = 0; i < n; i++) { out.push(new Date(d)); d.setDate(d.getDate() - 7); }
  return out;
}

let orgId, userId, secretaryId;
async function cleanup() {
  if (orgId) await admin.from("organizations").delete().eq("id", orgId);
  if (userId) await admin.auth.admin.deleteUser(userId);
  if (secretaryId) await admin.auth.admin.deleteUser(secretaryId);
}
process.on("SIGINT", async () => { await cleanup(); process.exit(1); });

try {
  // ------------------------------------------------------------ the pastor
  const { data: created, error: uErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: "Rev. Kwesi Mensah" },
  });
  if (uErr) throw uErr;
  userId = created.user.id;

  const asPastor = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { error: sErr } = await asPastor.auth.signInWithPassword({ email, password });
  if (sErr) throw sErr;

  // ------------------------------------------------------------ the church
  const { data: org, error: oErr } = await asPastor.rpc("create_organization", {
    heard_channel: null, heard_detail: null,
    org_name: "Ebenezer Methodist Society, Adenta",
    org_type: "local_church", org_denomination: "Methodist Church Ghana",
    org_phone: "0244 000 000", org_address: "Adenta, Accra",
  });
  if (oErr) throw oErr;
  orgId = typeof org === "string" ? org : org?.id ?? org;
  console.log("church", orgId);

  // Make the setup checklist read as done, so the dashboard shows figures:
  // a sender name, and a second person on the team.
  await admin.from("organizations").update({ sms_sender_id: "EBENEZERMTH", subscription_status: "active" }).eq("id", orgId);
  const { data: sec } = await admin.auth.admin.createUser({
    email: `demo-secretary+${stamp}@example.com`, password, email_confirm: true, user_metadata: { full_name: "Abena Owusu" },
  });
  secretaryId = sec?.user?.id;
  if (secretaryId) await admin.from("organization_members").insert({ organization_id: orgId, profile_id: secretaryId, role: "admin" });

  // ------------------------------------------------------------ classes
  const classNames = ["Class 1, Bro. Owusu", "Class 2, Sis. Mensah", "Class 3, Bro. Appiah", "Class 4, Sis. Boateng", "Class 5, Bro. Darko", "Class 6, Sis. Amoah"];
  const { data: groups } = await admin.from("member_groups")
    .insert(classNames.map((name) => ({ organization_id: orgId, name, type: "bible_class" }))).select("id");
  await admin.from("member_groups").insert([
    { organization_id: orgId, name: "Singing Band", type: "choir" },
    { organization_id: orgId, name: "Women's Fellowship", type: "fellowship" },
    { organization_id: orgId, name: "Methodist Youth Fellowship", type: "fellowship" },
  ]);

  // ------------------------------------------------------------ members
  const people = [];
  const used = new Set();
  for (let i = 0; i < 186; i++) {
    const female = Math.random() < 0.58;
    let name;
    do { name = `${pick(female ? FIRST_F : FIRST_M)} ${pick(LAST)}`; } while (used.has(name));
    used.add(name);
    const age = 14 + rnd(60);
    const dob = new Date(); dob.setFullYear(dob.getFullYear() - age); dob.setMonth(rnd(12)); dob.setDate(1 + rnd(28));
    people.push({
      organization_id: orgId, full_name: name, gender: female ? "female" : "male",
      date_of_birth: dob.toISOString().slice(0, 10),
      phone: `02${pick([4, 0, 5, 7])}${String(4000000 + rnd(5999999))}`,
      member_type: age < 18 ? "Junior Member" : pick(TYPES),
      member_group_id: groups[rnd(groups.length)].id,
      joined_at: iso(daysAgo(30 + rnd(3000))),
      address: pick(["Adenta", "Madina", "Ashaley Botwe", "Frafraha", "Oyibi", "Dodowa Road"]),
    });
  }
  const { data: members, error: mErr } = await admin.from("members").insert(people).select("id, gender, member_type");
  if (mErr) throw mErr;

  // ------------------------------------------------------------ funds
  const { data: funds } = await admin.from("funds").insert([
    { organization_id: orgId, name: "Harvest 2026", target_amount: 60000 },
    { organization_id: orgId, name: "Building Fund", target_amount: 250000 },
    { organization_id: orgId, name: "Welfare" },
  ]).select("id, name");

  // ------------------------------------------------------------ attendance
  const sundays = lastSundays(12);
  const regular = members.filter(() => Math.random() < 0.72);
  for (const [i, sun] of sundays.entries()) {
    const present = regular.filter(() => Math.random() < 0.82 - (i === 3 ? 0.25 : 0));
    const male = present.filter((m) => m.gender === "male").length;
    const female = present.length - male;
    const { data: rec } = await admin.from("attendance_records").insert({
      organization_id: orgId, service_type: "sunday_service", date: sun.toISOString().slice(0, 10),
      male_count: male + rnd(6), female_count: female + rnd(9), recorded_by_profile_id: userId,
      created_at: iso(sun),
    }).select("id").single();
    await admin.from("attendance_check_ins").insert(present.map((m) => ({
      organization_id: orgId, attendance_record_id: rec.id, member_id: m.id, created_at: iso(sun),
    })));
  }

  // ------------------------------------------------------------ giving
  const gifts = [];
  for (const [i, sun] of sundays.entries()) {
    // Sunday offering, cash, one line.
    gifts.push({ organization_id: orgId, type: "offering", amount: 1800 + rnd(900), payment_method: "cash", recorded_by_profile_id: userId, created_at: iso(sun) });
    // Tithes, some cash on Sunday and some mobile money during the week.
    for (const m of members.filter(() => Math.random() < 0.28)) {
      const momo = Math.random() < 0.45;
      const when = momo ? new Date(sun.getTime() + (1 + rnd(5)) * 86400000) : sun;
      gifts.push({
        organization_id: orgId, member_id: m.id, type: "tithe", amount: pick([20, 30, 50, 50, 80, 100, 100, 150, 200, 300, 500]),
        payment_method: momo ? "momo" : "cash", recorded_by_profile_id: momo ? null : userId, created_at: iso(when),
        note: momo ? `MoMo ref FCG${String(100000 + rnd(899999))}` : null,
      });
    }
    if (i === 1) {
      for (const m of members.filter(() => Math.random() < 0.15)) {
        gifts.push({ organization_id: orgId, member_id: m.id, type: "donation", fund_id: funds[0].id, amount: pick([50, 100, 200, 500, 1000]), payment_method: "cash", recorded_by_profile_id: userId, created_at: iso(sun) });
      }
    }
  }
  const { error: gErr } = await admin.from("contributions").insert(gifts);
  if (gErr) throw gErr;

  // ------------------------------------------------------------ vital records
  await admin.from("vital_records").insert([
    { organization_id: orgId, member_id: members[3].id, type: "baptism", date: daysAgo(12).toISOString().slice(0, 10) },
    { organization_id: orgId, member_id: members[9].id, type: "baptism", date: daysAgo(40).toISOString().slice(0, 10) },
    { organization_id: orgId, member_id: members[15].id, type: "confirmation", date: daysAgo(26).toISOString().slice(0, 10) },
    { organization_id: orgId, member_id: members[22].id, type: "wedding", date: daysAgo(54).toISOString().slice(0, 10) },
    { organization_id: orgId, member_id: members[31].id, type: "death", date: daysAgo(70).toISOString().slice(0, 10) },
  ]);

  // ------------------------------------------------------------ screenshots
  mkdirSync("public/screens", { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|onboarding/, { timeout: 30000 });

  // Same height for all, so the thumbnails line up. Pages whose top is a
  // form are scrolled to the thing a church actually looks at: the list.
  const shots = [
    ["dashboard", "/dashboard", 800, null],
    ["members", "/members", 800, "table"],
    ["giving", "/contributions", 800, "table"],
    ["insights", "/insights", 800, null],
    ["reports", "/reports", 800, "h2"],
  ];
  const hideEmail = (p) => p.evaluate((addr) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = walker.nextNode())) { if (n.textContent.includes(addr)) n.textContent = "Rev. Kwesi Mensah"; }
  }, email);
  for (const [name, path, height, scrollTo] of shots) {
    await page.setViewportSize({ width: 1280, height });
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await hideEmail(page);
    if (scrollTo) {
      await page.evaluate((sel) => {
        const el = document.querySelector("main " + sel) ?? document.querySelector(sel);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96 });
      }, scrollTo);
      await page.waitForTimeout(200);
    }
    const png = await page.screenshot({ type: "png" });
    await sharp(png).webp({ quality: 82 }).toFile(`public/screens/${name}.webp`);
    await sharp(png).resize(720).webp({ quality: 78 }).toFile(`public/screens/${name}-720.webp`);
    console.log("shot", name);
  }
  // One phone shot: the dashboard, which is where a pastor opens it.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true });
  const pp = await phone.newPage();
  await pp.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await pp.fill('input[name="email"]', email);
  await pp.fill('input[name="password"]', password);
  await pp.click('button[type="submit"]');
  await pp.waitForURL(/dashboard/, { timeout: 30000 });
  await pp.waitForTimeout(600);
  await hideEmail(pp);
  const ppng = await pp.screenshot({ type: "png" });
  await sharp(ppng).webp({ quality: 82 }).toFile("public/screens/dashboard-phone.webp");
  console.log("shot dashboard-phone");
  await browser.close();
} finally {
  await cleanup();
  console.log("demo church removed");
}
