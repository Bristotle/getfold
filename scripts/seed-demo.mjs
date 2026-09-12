/**
 * Seeds a demo church that looks like a real one.
 *
 * A dashboard with four zeros on it sells nothing. This creates a society
 * with a plausible register, a quarter of services, three months of
 * giving across cash and mobile money, funds with progress, and members
 * whose birthdays fall this week, so every screen has something on it.
 *
 * Usage:  node scripts/seed-demo.mjs demo@example.com 'Password!'
 *
 * Re-runnable: it looks up the account by email and adds a fresh church
 * each time. Delete demo churches from the branches page or with the
 * teardown at the bottom. Never point this at a real church.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("usage: node scripts/seed-demo.mjs <email> <password>");
  process.exit(1);
}

const env = Object.fromEntries(readFileSync(".env","utf8").split("\n")
  .filter(l=>l.includes("=")&&!l.startsWith("#"))
  .map(l=>[l.slice(0,l.indexOf("=")), l.slice(l.indexOf("=")+1).replace(/^["']|["']$/g,"").trim()]));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} });

// ---- account ----
let userId;
const { data: list } = await admin.auth.admin.listUsers();
const existing = list.users.find(u => u.email === email);
if (existing) userId = existing.id;
else {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm:true, user_metadata:{ full_name:"Rev. Kwesi Mensah" } });
  if (error) throw error;
  userId = data.user.id;
  console.log("  created account", email);
}
const as = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth:{persistSession:false} });
const { error: sErr } = await as.auth.signInWithPassword({ email, password });
if (sErr) throw sErr;

// ---- church ----
const { data: org, error: oErr } = await as.rpc("create_organization", {
  org_name: "Ebenezer Methodist Society, Adenta",
  org_type: "local_church", org_denomination: "Methodist",
});
if (oErr) throw oErr;
/*
  Automations stay OFF on a seeded church, and this is not optional.

  The seeded phone numbers look like real MTN numbers because the register
  has to look real, and with birthdays switched on the daily job would text
  a stranger in Kumasi "happy birthday from Ebenezer" at seven in the
  morning. A demo church exists to be looked at, not to send anything. Turn
  them on by hand for a demo that needs to show a text, with your own
  number on the member.
*/
await admin.from("organizations").update({
  sms_sender_id: "EBENEZER",
  sms_birthday_enabled: false, sms_welcome_enabled: false, sms_thanks_enabled: false,
  heard_about_us: "another_church", heard_about_detail: "Wesley Society, Tema",
}).eq("id", org);
console.log("  church:", org);

// ---- classes ----
const classNames = ["Wesley Bible Class", "Aldersgate Class", "Ebenezer Class", "Grace Fellowship", "Youth Fellowship", "Women's Fellowship"];
const { data: classes } = await as.from("member_groups").insert(
  classNames.map(name => ({ organization_id: org, name, type: "bible_class" }))
).select("id, name");

// ---- members: Ghanaian names, realistic spread ----
const first = ["Ama","Kofi","Akosua","Kwame","Abena","Yaw","Adwoa","Kwabena","Efua","Kweku","Esi","Kojo","Araba","Kwasi","Adjoa","Fiifi","Aba","Ekow","Maame","Nana","Afua","Kwadwo","Akua","Kwaku","Yaa","Ato","Baaba","Paapa","Adzo","Kobina"];
const last = ["Mensah","Owusu","Asante","Boateng","Osei","Appiah","Acheampong","Agyeman","Darko","Frimpong","Ofori","Amoah","Antwi","Bonsu","Gyasi","Nkrumah","Opoku","Quaye","Sarpong","Tetteh"];
const types = ["Full Member","Full Member","Full Member","Full Member","Catechumen","Junior Member","Adherent"];
const now = new Date();
const members = [];
for (let i = 0; i < 248; i++) {
  const f = first[i % first.length], l = last[(i * 7) % last.length];
  const female = ["Ama","Akosua","Abena","Adwoa","Efua","Esi","Araba","Adjoa","Aba","Maame","Afua","Akua","Yaa","Baaba","Adzo"].includes(f);
  // a dozen birthdays inside the next fortnight, so the dashboard has names to bless
  let dob;
  if (i < 12) { const d = new Date(now); d.setDate(d.getDate() + (i % 14)); dob = `${1950 + (i * 3) % 50}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
  else { dob = `${1945 + (i * 13) % 60}-${String(1 + (i * 5) % 12).padStart(2,"0")}-${String(1 + (i * 3) % 28).padStart(2,"0")}`; }
  members.push({
    organization_id: org, full_name: `${f} ${l}`, gender: female ? "female" : "male",
    date_of_birth: dob, phone: i % 3 === 0 ? `024${String(4000000 + i * 137).slice(-7)}` : null,
    member_type: types[i % types.length], member_group_id: classes[i % classes.length].id,
    status: "active", joined_at: new Date(now.getFullYear() - (i % 15), (i * 2) % 12, 1).toISOString().slice(0,10),
  });
}
for (let i = 0; i < members.length; i += 100) {
  const { error } = await as.from("members").insert(members.slice(i, i + 100));
  if (error) throw error;
}
const { data: memberRows } = await as.from("members").select("id, phone").eq("organization_id", org);
console.log("  members:", memberRows.length);

// ---- a quarter of Sunday services, attendance climbing gently ----
const services = [];
for (let w = 13; w >= 0; w--) {
  const d = new Date(now); d.setDate(d.getDate() - d.getDay() - w * 7);
  const base = 190 + (13 - w) * 6;
  services.push({ organization_id: org, service_type: "sunday_service", date: d.toISOString().slice(0,10),
    male_count: Math.round(base * 0.42), female_count: Math.round(base * 0.58), recorded_by_profile_id: userId });
}
await as.from("attendance_records").insert(services);
console.log("  services:", services.length);

// ---- funds ----
const { data: funds } = await as.from("funds").insert([
  { organization_id: org, name: "Building Fund", target_amount: "150000.00", description: "New chapel roof and classroom block" },
  { organization_id: org, name: "Harvest 2026", target_amount: "40000.00" },
  { organization_id: org, name: "Welfare Fund", target_amount: null },
]).select("id, name");

// ---- three months of giving, cash mostly, some MoMo ----
const gifts = [];
const withPhone = memberRows.filter(m => m.phone);
for (let w = 13; w >= 0; w--) {
  const d = new Date(now); d.setDate(d.getDate() - d.getDay() - w * 7);
  const created = d.toISOString();
  // tithes from ~35 members a week
  for (let i = 0; i < 35; i++) {
    const m = memberRows[(w * 11 + i * 7) % memberRows.length];
    const momo = withPhone.includes(m) && i % 4 === 0;
    gifts.push({ organization_id: org, member_id: m.id, type: "tithe", amount: (40 + ((w * 7 + i * 13) % 260)).toFixed(2),
      payment_method: momo ? "momo" : "cash", recorded_by_profile_id: userId, created_at: created });
  }
  // the general offering, anonymous
  gifts.push({ organization_id: org, type: "offering", amount: (900 + (w * 37) % 600).toFixed(2), payment_method: "cash", recorded_by_profile_id: userId, created_at: created });
  // building fund, every other week
  if (w % 2 === 0) gifts.push({ organization_id: org, fund_id: funds[0].id, type: "donation", amount: (1500 + (w * 91) % 2000).toFixed(2), payment_method: "cash", recorded_by_profile_id: userId, created_at: created });
  if (w % 3 === 0) gifts.push({ organization_id: org, fund_id: funds[1].id, type: "pledge", amount: (600 + (w * 53) % 900).toFixed(2), payment_method: "momo", recorded_by_profile_id: userId, created_at: created });
}
for (let i = 0; i < gifts.length; i += 200) {
  const { error } = await as.from("contributions").insert(gifts.slice(i, i + 200));
  if (error) throw error;
}
console.log("  contributions:", gifts.length);

// ---- vital records ----
await as.from("vital_records").insert([
  { organization_id: org, member_id: memberRows[5].id, type: "baptism", date: new Date(now.getFullYear(), now.getMonth()-1, 14).toISOString().slice(0,10), note: "Rev. Kwesi Mensah" },
  { organization_id: org, member_id: memberRows[9].id, type: "confirmation", date: new Date(now.getFullYear(), now.getMonth()-2, 3).toISOString().slice(0,10), note: "Rev. Kwesi Mensah" },
  { organization_id: org, member_id: memberRows[14].id, type: "wedding", date: new Date(now.getFullYear(), now.getMonth(), 2).toISOString().slice(0,10), note: "Rev. Kwesi Mensah" },
]);

// ---- a branch, so the roll up shows ----
const { data: branch } = await as.rpc("create_branch", { parent_id: org, branch_name: "Ebenezer Methodist, Oyibi Preaching Point" });
await as.from("members").insert(Array.from({ length: 31 }, (_, i) => ({
  organization_id: branch, full_name: `${first[(i*3)%first.length]} ${last[(i*5)%last.length]}`, status: "active", member_type: "Full Member",
})));
console.log("  branch with 31 members:", branch);

const { data: stats } = await as.rpc("dashboard_stats", { org_id: org });
const { data: roll } = await as.rpc("rollup_stats", { root: org });
console.log(`\n  dashboard: ${stats[0].member_count} members, ${stats[0].week_attendance} this week, GHS ${stats[0].month_tithe} tithe this month`);
console.log(`  roll up:   ${roll[0].churches} churches, ${roll[0].member_count} members`);
console.log(`\n  log in as ${email} at https://www.getfold.org/login`);
