import {
  Rocket,
  Users,
  ClipboardCheck,
  Coins,
  FileBarChart,
  ShieldCheck,
  Lock,
  type LucideIcon,
} from "lucide-react";

/**
 * Category icons, kept out of src/lib/help.ts so the content file stays
 * plain data and can be edited by somebody who does not know React.
 */
const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  users: Users,
  clipboard: ClipboardCheck,
  coins: Coins,
  reports: FileBarChart,
  shield: ShieldCheck,
  lock: Lock,
};

export function HelpIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = ICONS[name] ?? Rocket;
  return <Icon size={size} strokeWidth={1.7} />;
}
