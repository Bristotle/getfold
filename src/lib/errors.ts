import "server-only";

/**
 * Turns a database error into something worth showing a church.
 *
 * Thirty five places put `error.message` straight into a redirect URL. It
 * is never useful to the person reading it: "duplicate key value violates
 * unique constraint members_organization_id_phone_key" tells a secretary
 * nothing she can act on, while telling anybody watching the URL bar the
 * name of a table, a column and an index. The URL then goes into browser
 * history and into any referrer header the page sends.
 *
 * Two rules.
 *
 * The common constraint failures get a sentence a person can act on,
 * because they are not faults at all: two members with one phone number, a
 * fund named twice, a service recorded for the same date. Those are things
 * a church does by accident and can fix themselves.
 *
 * Everything else becomes one plain sentence. Nothing is silently
 * swallowed: the real message is still logged where we can read it, and
 * still visible in Supabase's own logs. It simply stops being published to
 * the URL bar of whoever tripped it.
 */
export function friendly(
  error: { message?: string; code?: string } | null | undefined,
  fallback = "That did not save. Please try again, or tell us what you were doing."
): string {
  const message = error?.message ?? "";
  const code = error?.code ?? "";

  /*
    The read only refusal from the trial lifecycle. The trigger writes a
    whole sentence a church can act on, prefixed so it can be recognised;
    the prefix comes off and the sentence is shown as it is.
  */
  if (/^READ_ONLY:/.test(message)) {
    return message.replace(/^READ_ONLY:\s*/, "").replace(/^t/, "T");
  }

  // Postgres codes, which are stable, before message text, which is not.
  if (code === "23505" || /duplicate key|already exists/i.test(message)) {
    if (/phone/i.test(message)) {
      return "Somebody on your register already has that phone number.";
    }
    if (/email/i.test(message)) {
      return "Somebody on your register already has that email address.";
    }
    if (/date|attendance/i.test(message)) {
      return "A service is already recorded for that date. Open it to edit it.";
    }
    return "That already exists. Check the list before adding it again.";
  }

  if (code === "23503" || /foreign key/i.test(message)) {
    return "That refers to something that is no longer there. Refresh the page and try again.";
  }

  if (code === "23514" || /check constraint/i.test(message)) {
    return "One of those values is not allowed. Check the amounts and dates.";
  }

  if (code === "42501" || /permission denied|row-level security/i.test(message)) {
    return "Your role does not allow that.";
  }

  if (/JWT|token is expired|not authenticated/i.test(message)) {
    return "Your session has expired. Sign in again.";
  }

  /*
    Logged, not shown. A real fault is much easier to answer when somebody
    reports it and the server log already says what happened.
  */
  if (message) {
    console.error("[db]", code ? `${code} ` : "", message);
  }
  return fallback;
}
