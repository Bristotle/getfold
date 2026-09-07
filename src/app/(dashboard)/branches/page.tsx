import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input, StatusBanner } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { getMembership, listMemberships } from "@/lib/org";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { createBranch, switchOrg } from "./actions";

export const metadata = { title: "Branches, Fold" };

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const all = await listMemberships();
  const current = membership.organization;
  const isBranch = Boolean(current.parent_organization_id);

  // Branches of the church we are currently in.
  const branches = all.filter(
    (m) => m.organization.parent_organization_id === current.id
  );
  const mayManage = can(membership.role, "org.manage");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Branches</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A circuit, district or diocese overseeing several societies. Each
          branch keeps its own register, attendance and giving, and you move
          between them from here.
        </p>
      </div>

      <StatusBanner error={error} message={message} />

      {/* ---------- switcher ---------- */}
      <Card>
        <h2 className="text-base font-bold text-foreground">
          Churches you belong to
        </h2>
        <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
          {all.map((m) => {
            const active = m.organization.id === current.id;
            const child = Boolean(m.organization.parent_organization_id);
            return (
              <li
                key={m.organization.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
                  active
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-surface"
                } ${child ? "sm:ml-6" : ""}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {child && (
                      <span aria-hidden="true" className="text-muted-foreground">
                        ↳{" "}
                      </span>
                    )}
                    {m.organization.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ROLE_LABELS[m.role] ?? m.role}
                    {child ? " · Branch" : ""}
                  </p>
                </div>
                {active ? (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    You are here
                  </span>
                ) : (
                  <form action={switchOrg} className="shrink-0">
                    <input
                      type="hidden"
                      name="orgId"
                      value={m.organization.id}
                    />
                    <Button size="sm" variant="secondary">
                      Switch to this
                    </Button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      {/* ---------- add ---------- */}
      {isBranch ? (
        <Card>
          <h2 className="text-base font-bold text-foreground">
            Adding branches
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {current.name} is itself a branch, so it cannot have branches of
            its own. Switch to the circuit above to add another society.
          </p>
        </Card>
      ) : mayManage ? (
        <Card>
          <h2 className="text-base font-bold text-foreground">
            Add a branch to {current.name}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            It starts empty, with its own register, and inherits your
            denomination. You are added to it with the standing you hold here,
            and you can invite its own team from the Team page once you are
            inside it.
          </p>
          <form action={createBranch} className="mt-5 flex flex-col gap-4 sm:max-w-sm">
            <Input
              label="Branch name"
              name="name"
              required
              placeholder="Ebenezer Society, Adenta"
            />
            <SubmitButton pendingLabel="Adding…">Add branch</SubmitButton>
          </form>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-muted-foreground">
            Only the pastor or an administrator can add a branch.
          </p>
        </Card>
      )}

      {branches.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {branches.length}{" "}
          {branches.length === 1 ? "branch" : "branches"} under {current.name}.
          Each one&apos;s records are separate: figures do not roll up into the
          circuit yet, and a branch cannot see another branch&apos;s register.
        </p>
      )}
    </div>
  );
}
