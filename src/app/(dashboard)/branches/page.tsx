import { redirect } from "next/navigation";
import { Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, StatusBanner } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { getMembership, loadTree, type TreeNode } from "@/lib/org";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { createBranch, switchOrg } from "./actions";

export const metadata = { title: "Branches, Fold" };

/**
 * One row of the tree. Indented by depth, with a connector so a district
 * reads as sitting under its region rather than merely after it.
 */
function Row({
  node,
  currentId,
}: {
  node: TreeNode;
  currentId: string;
}) {
  const active = node.organization.id === currentId;
  const overseen = node.role === null;

  return (
    <li
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
        active ? "border-primary/40 bg-primary/5" : "border-border bg-surface"
      }`}
      style={{ marginLeft: `${Math.min(node.depth, 5) * 1.25}rem` }}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {node.depth > 0 && (
            <span aria-hidden="true" className="text-muted-foreground">
              ⤷{" "}
            </span>
          )}
          {node.organization.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {overseen ? (
            <span className="inline-flex items-center gap-1">
              <Eye size={12} strokeWidth={2} aria-hidden="true" />
              Overseen, read only
            </span>
          ) : (
            (ROLE_LABELS[node.role as string] ?? node.role)
          )}
          {node.children.length > 0
            ? ` · ${node.children.length} ${node.children.length === 1 ? "branch" : "branches"}`
            : ""}
        </p>
      </div>
      {active ? (
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          You are here
        </span>
      ) : overseen ? (
        <span className="shrink-0 text-xs text-muted-foreground">
          View from the dashboard roll up
        </span>
      ) : (
        <form action={switchOrg} className="shrink-0">
          <input type="hidden" name="orgId" value={node.organization.id} />
          <Button size="sm" variant="secondary">
            Switch to this
          </Button>
        </form>
      )}
    </li>
  );
}

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const { flat } = await loadTree();
  const current = membership.organization;
  const mayManage = can(membership.role, "org.manage");
  const here = flat.find((n) => n.organization.id === current.id);
  const beneath = here ? countBeneath(here) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Branches</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          A headquarters over regions, a region over districts, a circuit over
          its societies, at any depth. Each church keeps its own register and
          its own team. Whoever leads a church above can see everything
          beneath it, and change nothing.
        </p>
      </div>

      <StatusBanner error={error} message={message} />

      {/* ---------- the tree ---------- */}
      <Card>
        <h2 className="text-base font-bold text-foreground">
          Churches you can see
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {flat.length} in total. Where you hold a role you can work inside
          the church; where you only oversee it, you can look.
        </p>
        <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
          {flat.map((n) => (
            <Row key={n.organization.id} node={n} currentId={current.id} />
          ))}
        </ul>
      </Card>

      {/* ---------- add ---------- */}
      {mayManage ? (
        <Card>
          <h2 className="text-base font-bold text-foreground">
            Add a branch under {current.name}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            A region, a district, a circuit or a society, whichever sits
            beneath this one. It starts empty, inherits your denomination, and
            you are added to it with the standing you hold here.
            {beneath > 0 && (
              <>
                {" "}
                {current.name} already has {beneath}{" "}
                {beneath === 1 ? "church" : "churches"} beneath it.
              </>
            )}
          </p>
          <form action={createBranch} className="mt-5 flex flex-col gap-4 sm:max-w-sm">
            <Input
              label="Branch name"
              name="name"
              required
              placeholder="Tema District, or Community 1 Assembly"
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
    </div>
  );
}

function countBeneath(n: TreeNode): number {
  return n.children.reduce((sum, c) => sum + 1 + countBeneath(c), 0);
}
