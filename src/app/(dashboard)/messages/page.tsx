import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { DataList, DataRow, TableWrap, metaLine } from "@/components/ui/data-list";
import { Card, CardLabel, CardStat } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { MessageSettings } from "@/components/message-settings";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { providerStatus } from "@/lib/messaging";
import { sendQueued } from "./actions";

type Row = {
  id: string;
  type: string;
  recipient: string;
  body: string;
  status: string;
  error: string | null;
  sent_at: string | null;
  created_at: string;
  members: { full_name: string } | { full_name: string }[] | null;
};

const TYPE_LABELS: Record<string, string> = {
  welcome: "Welcome",
  contribution_receipt: "Giving receipt",
  absence_followup: "We miss you",
};

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-success/10 text-success-text",
  queued: "bg-primary/10 text-primary",
  failed: "bg-danger/10 text-danger-text",
  no_provider: "bg-surface-soft text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  sent: "Sent",
  queued: "Queued",
  failed: "Failed",
  no_provider: "Not sent",
};

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const one = <T,>(v: T | T[] | null): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : v;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const canSend = can(membership.role, "people.write");
  const status = providerStatus();

  const supabase = await createClient();
  const { data, error: loadError } = await supabase
    .from("notifications")
    .select(
      "id, type, recipient, body, status, error, sent_at, created_at, members ( full_name )"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: org } = await supabase
    .from("organizations")
    .select(
      "sms_sender_id, sms_welcome_enabled, sms_thanks_enabled, sms_birthday_enabled, sms_template_welcome, sms_template_thanks, sms_template_birthday"
    )
    .eq("id", membership.organization.id)
    .maybeSingle();

  const settings = (org ?? {}) as {
    sms_sender_id?: string | null;
    sms_welcome_enabled?: boolean;
    sms_thanks_enabled?: boolean;
    sms_birthday_enabled?: boolean;
    sms_template_welcome?: string | null;
    sms_template_thanks?: string | null;
    sms_template_birthday?: string | null;
  };

  const rows = (data ?? []) as Row[];
  const unsent = rows.filter((r) => r.status !== "sent").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Texts sent to members, a welcome when they join, a receipt when they
          give, a birthday greeting on the day, and a gentle check-in when
          they haven&rsquo;t been seen.
        </p>
      </div>

      <MessageSettings
        senderId={settings.sms_sender_id ?? null}
        welcome={Boolean(settings.sms_welcome_enabled)}
        thanks={Boolean(settings.sms_thanks_enabled)}
        birthday={Boolean(settings.sms_birthday_enabled)}
        templates={{
          welcome: settings.sms_template_welcome ?? null,
          thanks: settings.sms_template_thanks ?? null,
          birthday: settings.sms_template_birthday ?? null,
        }}
        canManage={can(membership.role, "org.manage")}
      />

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success-text">
          {message}
        </p>
      )}
      {loadError && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">
          Could not load messages: {loadError.message}
        </p>
      )}

      {!status.configured && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">
            No SMS provider connected yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Messages are still being written down, you can see below exactly
            what would go out, and nothing is lost. They will send as soon as a
            provider is configured.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Set <code className="rounded bg-surface-soft px-1.5 py-0.5 font-numeric text-xs">SMS_PROVIDER</code>{" "}
            to <code className="rounded bg-surface-soft px-1.5 py-0.5 font-numeric text-xs">arkesel</code>,{" "}
            <code className="rounded bg-surface-soft px-1.5 py-0.5 font-numeric text-xs">hubtel</code> or{" "}
            <code className="rounded bg-surface-soft px-1.5 py-0.5 font-numeric text-xs">twilio</code> in{" "}
            <code className="rounded bg-surface-soft px-1.5 py-0.5 font-numeric text-xs">.env</code>, along with
            its keys. Missing right now:{" "}
            <span className="font-medium text-foreground">
              {status.missing.join(", ")}
            </span>
            .
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardLabel>Messages recorded</CardLabel>
          <CardStat>{rows.length}</CardStat>
        </Card>
        <Card>
          <CardLabel>Waiting to send</CardLabel>
          <CardStat>{unsent}</CardStat>
        </Card>
        <Card>
          <CardLabel>Provider</CardLabel>
          <CardStat className="text-xl">
            {status.provider ?? "None"}
          </CardStat>
        </Card>
      </div>

      {canSend && unsent > 0 && (
        <form action={sendQueued}>
          <SubmitButton disabled={!status.configured}>
            Send {unsent} waiting message{unsent === 1 ? "" : "s"}
          </SubmitButton>
          {!status.configured && (
            <span className="ml-3 text-xs text-muted-foreground">
              Connect a provider first.
            </span>
          )}
        </form>
      )}

      {status.configured && (
        <p className="rounded-lg border border-border bg-surface-soft px-3 py-2 text-xs text-muted-foreground">
          <strong className="text-foreground">&ldquo;Sent&rdquo; means accepted by {status.provider}</strong>, not
          confirmed delivered. The first message from a new sender name is
          held for review, it can take an hour or so to arrive, with no
          error shown. After that, messages from{" "}
          <span className="font-numeric">{process.env.SMS_SENDER_ID}</span> go
          straight out.
        </p>
      )}

      <Card className="p-0">
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No messages yet. Add a member with a phone number, or record giving
            against one, and the text will appear here.
          </p>
        ) : (
          <>
            <DataList>
              {rows.map((r) => (
                <DataRow
                  key={r.id}
                  title={one(r.members)?.full_name ?? r.recipient}
                  meta={metaLine(
                    TYPE_LABELS[r.type] ?? r.type,
                    dateFmt.format(new Date(r.created_at)),
                    r.error ?? undefined
                  )}
                  trailing={
                    <span
                      className={`whitespace-nowrap rounded px-2 py-1 text-xs font-semibold ${
                        STATUS_STYLES[r.status] ?? STATUS_STYLES.no_provider
                      }`}
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  }
                />
              ))}
            </DataList>
            <TableWrap>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">When</th>
                  <th scope="col" className="px-5 py-3 font-semibold">To</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Kind</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Message</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-muted-foreground">
                      {dateFmt.format(new Date(r.created_at))}
                    </td>
                    <td className="px-5 py-3 text-foreground">
                      {one(r.members)?.full_name ?? "-"}
                      <span className="block font-numeric text-xs text-muted-foreground">
                        {r.recipient}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {TYPE_LABELS[r.type] ?? r.type}
                    </td>
                    <td className="max-w-md px-5 py-3 text-muted-foreground">
                      {r.body}
                      {r.error && (
                        <span className="block text-xs text-danger-text">
                          {r.error}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`whitespace-nowrap rounded px-2 py-1 text-xs font-semibold ${
                          STATUS_STYLES[r.status] ?? STATUS_STYLES.no_provider
                        }`}
                      >
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </TableWrap>
          </>
        )}
      </Card>
    </div>
  );
}
