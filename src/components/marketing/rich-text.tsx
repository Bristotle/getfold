import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Inline links inside post text, written as [words](/path).
 *
 * Until this existed no blog post contained a single internal link, because
 * the block type had no way to make one. Eight articles about the register,
 * the return and mobile money, and none of them pointed at the feature page,
 * the help article or the other post on the same subject. A search engine
 * reads that as eight orphans; a reader reads it as a dead end.
 *
 * Only paths on this site are turned into links. An absolute URL is left
 * as text, so a post cannot be made to send readers off site by accident,
 * and nothing here is HTML, so nothing can be injected through it.
 */
const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

export function RichText({ text }: { text: string }): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  LINK.lastIndex = 0;
  while ((m = LINK.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <Link
        key={m.index}
        href={m[2] as "/"}
        className="rounded font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {m[1]}
      </Link>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/** The same text with the link markup removed, for structured data. */
export function plainText(text: string): string {
  return text.replace(LINK, "$1");
}
