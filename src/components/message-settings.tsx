import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { DEFAULT_TEMPLATES } from "@/lib/messaging";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateMessageSettings } from "@/app/(dashboard)/messages/actions";

/**
 * The three automatic messages, and the name they go out under.
 *
 * Each switch says exactly when it fires and what it costs, because a
 * pastor turning these on is agreeing to text their congregation and
 * spend credits, and both should be plain before they click rather than
 * discovered afterwards.
 */
const AUTOMATIONS = [
  {
    name: "welcome" as const,
    field: "tplWelcome",
    title: "Welcome a new member",
    when: "Sent the moment somebody is added to the register, if they have a phone number and you tick the box on the form.",
    placeholders: "{name} {church}",
    fallback: DEFAULT_TEMPLATES.welcome,
  },
  {
    name: "thanks" as const,
    field: "tplThanks",
    title: "Thank someone for a tithe or offering",
    when: "Sent the moment a gift is recorded against a member who has a phone number.",
    placeholders: "{name} {church} {amount} {type}",
    fallback: DEFAULT_TEMPLATES.thanks,
  },
  {
    name: "birthday" as const,
    field: "tplBirthday",
    title: "Wish a member happy birthday",
    when: "Sent at seven in the morning on their birthday, from the date of birth on the register. Once a year, never twice.",
    placeholders: "{name} {church}",
    fallback: DEFAULT_TEMPLATES.birthday,
  },
];

export function MessageSettings({
  senderId,
  welcome,
  thanks,
  birthday,
  templates,
  canManage,
}: {
  senderId: string | null;
  welcome: boolean;
  thanks: boolean;
  birthday: boolean;
  templates: { welcome: string | null; thanks: string | null; birthday: string | null };
  canManage: boolean;
}) {
  const current = { welcome, thanks, birthday };

  if (!canManage) {
    return (
      <Card>
        <h2 className="text-base font-bold text-foreground">
          Automatic messages
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Only the pastor or an administrator can change which messages go out
          automatically.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-base font-bold text-foreground">
        Automatic messages
      </h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        All three are off until you turn them on. Each one sends a text to a
        member, so each one costs a message and speaks in your church&apos;s
        name.
      </p>

      <form action={updateMessageSettings} className="mt-6 flex flex-col gap-6">
        <div className="max-w-sm">
          <Input
            label="Send messages as"
            name="senderId"
            defaultValue={senderId ?? ""}
            maxLength={11}
            placeholder="SHEKINAH"
            hint="Up to 11 characters, letters and numbers. This is the name your members see instead of a phone number, so use something they will recognise."
          />
          <div className="mt-3 flex gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3.5">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-warning-text">
              <Info size={16} strokeWidth={2} />
            </span>
            <p className="text-xs leading-relaxed text-foreground/85">
              The first message from a new name is held while the network
              approves it. It will look like it sent, and it will not arrive.
              Send one to your own phone and wait before you rely on it for a
              whole congregation.
            </p>
          </div>
        </div>

        <ul className="m-0 flex list-none flex-col gap-3 border-t border-border p-0 pt-5">
          {AUTOMATIONS.map((a) => (
            <li
              key={a.name}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <label className="flex cursor-pointer gap-3">
                <input
                  type="checkbox"
                  name={a.name}
                  defaultChecked={current[a.name]}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {a.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {a.when}
                  </span>
                </span>
              </label>

              <div className="mt-3.5 border-t border-border pt-3.5">
                <label
                  htmlFor={a.field}
                  className="text-xs font-medium text-foreground"
                >
                  What it says
                </label>
                <textarea
                  id={a.field}
                  name={a.field}
                  rows={3}
                  maxLength={320}
                  defaultValue={templates[a.name] ?? ""}
                  placeholder={a.fallback}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                />
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Leave it empty to use the wording shown. Use{" "}
                  <code className="rounded bg-surface-soft px-1 font-numeric">
                    {a.placeholders}
                  </code>{" "}
                  and we fill them in. Keep it under 160 characters or it
                  counts as two messages.
                </p>
              </div>
            </li>
          ))}
        </ul>

        <SubmitButton className="self-start" pendingLabel="Saving…">
          Save these settings
        </SubmitButton>
      </form>
    </Card>
  );
}
