import { toE164 } from "@/lib/messaging";
import { ROLE_LABELS } from "@/lib/permissions";
import type { DirectoryRow } from "@/lib/platform";

/**
 * Who to reach at a church, with the buttons to reach them.
 *
 * Call opens the phone's dialler, WhatsApp opens a chat with the opening
 * line already written, Email opens a draft. All three go out from the
 * founder's own phone or mailbox, so the church hears from a person at
 * Fold, not from a system.
 */

const link =
  "inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-xs font-semibold text-foreground hover:bg-surface-soft";

function opener(church: string, name: string | null) {
  const first = name?.trim().split(/\s+/)[0];
  return `Hello${first ? ` ${first}` : ""}, this is Emmanuel from Fold. I am calling about ${church}'s account: how is it going, and is there anything we can help with?`;
}

function Reach({
  church,
  name,
  phone,
  email,
}: {
  church: string;
  name: string | null;
  phone: string | null;
  email: string | null;
}) {
  const e164 = toE164(phone);
  return (
    <span className="flex flex-wrap gap-2">
      {e164 && (
        <>
          <a href={`tel:${e164}`} className={link}>
            Call
          </a>
          <a
            href={`https://wa.me/${e164.slice(1)}?text=${encodeURIComponent(opener(church, name))}`}
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            WhatsApp
          </a>
        </>
      )}
      {email && (
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(`${church} on Fold`)}&body=${encodeURIComponent(opener(church, name))}`}
          className={link}
        >
          Email
        </a>
      )}
    </span>
  );
}

export function ChurchContacts({ church }: { church: DirectoryRow }) {
  const leaders = church.leaders ?? [];
  return (
    <ul className="divide-y divide-border">
      {leaders.map((l) => (
        <li key={`${l.email}-${l.role}`} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
          <span className="min-w-0">
            <span className="block font-semibold text-foreground">
              {l.name ?? l.email ?? "No name given"}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {ROLE_LABELS[l.role] ?? l.role} · {l.email ?? "no email"}
              {l.phone ? (
                <>
                  {" "}· <span className="font-numeric">{l.phone}</span>
                </>
              ) : (
                " · no phone on their profile"
              )}
            </span>
          </span>
          <Reach church={church.name} name={l.name} phone={l.phone} email={l.email} />
        </li>
      ))}
      {church.church_phone && (
        <li className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <span className="min-w-0">
            <span className="block font-semibold text-foreground">The church&rsquo;s number</span>
            <span className="block text-xs text-muted-foreground">
              Given when it was set up · <span className="font-numeric">{church.church_phone}</span>
            </span>
          </span>
          <Reach church={church.name} name={null} phone={church.church_phone} email={null} />
        </li>
      )}
      {leaders.length === 0 && !church.church_phone && (
        <li className="py-2 text-muted-foreground">No pastor, administrator or phone number on record.</li>
      )}
    </ul>
  );
}
