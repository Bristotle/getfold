import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
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
    title: "Welcome a new member",
    when: "Sent when somebody is added to the register, if they have a phone number.",
  },
  {
    name: "thanks" as const,
    title: "Thank someone for a tithe or offering",
    when: "Sent when a gift is recorded against a member who has a phone number.",
  },
  {
    name: "birthday" as const,
    title: "Wish a member happy birthday",
    when: "Sent on the morning of their birthday, from the date of birth on the register. Once a year, never twice.",
  },
];

export function MessageSettings({
  senderId,
  welcome,
  thanks,
  birthday,
  canManage,
}: {
  senderId: string | null;
  welcome: boolean;
  thanks: boolean;
  birthday: boolean;
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
            <li key={a.name}>
              <label className="flex cursor-pointer gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/30">
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
