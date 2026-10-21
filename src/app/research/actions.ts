"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QUESTIONS, SURVEY_SLUG } from "@/lib/survey";
import { sourceFrom } from "@/lib/attribution";

const PAGE = `/research/${SURVEY_SLUG}`;

/**
 * Saves one anonymous answer to the records survey.
 *
 * Only answers that are one of the listed options are kept, so the results
 * can never show a free text answer somebody typed into a crafted request.
 * A hidden field a person cannot see catches the simplest bots.
 */
export async function submitSurvey(formData: FormData) {
  if (String(formData.get("website") ?? "") !== "") redirect(`${PAGE}?thanks=1#results`);

  const answers: Record<string, string> = {};
  for (const q of QUESTIONS) {
    const v = String(formData.get(q.id) ?? "");
    if (q.options.includes(v)) answers[q.id] = v;
  }

  if (Object.keys(answers).length < QUESTIONS.length - 2) {
    redirect(
      `${PAGE}?error=${encodeURIComponent("Please answer at least eight of the ten questions, so your answers can be counted.")}#survey`
    );
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const { from_page, from_site } = sourceFrom(formData);

  const supabase = await createClient();
  const { error } = await supabase.from("survey_responses").insert({
    survey: SURVEY_SLUG,
    answers,
    email: email && email.includes("@") && email.length <= 200 ? email : null,
    from_page,
    from_site,
  });

  if (error) {
    redirect(`${PAGE}?error=${encodeURIComponent("Your answers did not save. Please try once more.")}#survey`);
  }
  redirect(`${PAGE}?thanks=1#results`);
}
