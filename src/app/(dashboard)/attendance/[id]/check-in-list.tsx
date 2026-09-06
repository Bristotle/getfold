"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Member = {
  id: string;
  full_name: string;
  group_name: string | null;
};

/**
 * Marking who attended a service.
 *
 * The first version rendered a separate form per member and did a full page
 * reload on every tick. For a congregation of a few hundred that is a few
 * hundred round trips on a Ghanaian mobile connection, which made the
 * feature unusable at the size where it matters most.
 *
 * This keeps the whole roll in local state and saves once. Only the
 * difference is sent, so a service where two people changed costs two rows
 * rather than the entire register.
 */
export function CheckInList({
  recordId,
  members,
  initiallyPresent,
  canWrite,
  saveAction,
}: {
  recordId: string;
  members: Member[];
  initiallyPresent: string[];
  canWrite: boolean;
  saveAction: (formData: FormData) => void;
}) {
  const initial = useMemo(() => new Set(initiallyPresent), [initiallyPresent]);
  const [present, setPresent] = useState<Set<string>>(new Set(initiallyPresent));
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) ||
        (m.group_name ?? "").toLowerCase().includes(q)
    );
  }, [members, query]);

  // Nothing is saved until the button is pressed, so say plainly what is
  // outstanding rather than letting someone navigate away assuming it stuck.
  const added = [...present].filter((id) => !initial.has(id));
  const removed = [...initial].filter((id) => !present.has(id));
  const dirty = added.length + removed.length;

  const toggle = (id: string) => {
    if (!canWrite) return;
    setPresent((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = () => {
    const fd = new FormData();
    fd.set("recordId", recordId);
    fd.set("present", JSON.stringify([...present]));
    startTransition(() => saveAction(fd));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="checkin-search" className="sr-only">
          Search members
        </label>
        <input
          id="checkin-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or class"
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <span
          className="font-numeric text-sm text-muted-foreground"
          aria-live="polite"
        >
          {present.size} of {members.length} present
        </span>
      </div>

      {canWrite && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="sm"
            onClick={save}
            disabled={pending || dirty === 0}
            aria-busy={pending}
          >
            {pending
              ? "Saving…"
              : dirty === 0
                ? "No changes to save"
                : `Save ${dirty} change${dirty === 1 ? "" : "s"}`}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setPresent(new Set(visible.map((m) => m.id)))}
            disabled={pending}
          >
            {query ? "Select all shown" : "Select everyone"}
          </Button>
          {present.size > 0 && (
            <Button
              type="button"
              size="sm"
              variant="quiet"
              onClick={() => setPresent(new Set())}
              disabled={pending}
            >
              Clear
            </Button>
          )}
          {dirty > 0 && !pending && (
            <span role="status" className="text-xs text-warning-text">
              Not saved yet
            </span>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          {query
            ? `No member matches "${query}".`
            : "No active members yet."}
        </p>
      ) : (
        <ul className="grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => {
            const isPresent = present.has(m.id);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => toggle(m.id)}
                  disabled={!canWrite || pending}
                  aria-pressed={isPresent}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    isPresent
                      ? "border-primary/40 bg-primary/5 font-medium text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{m.full_name}</span>
                    {m.group_name && (
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {m.group_name}
                      </span>
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs",
                      isPresent
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    )}
                  >
                    {isPresent ? "✓" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
