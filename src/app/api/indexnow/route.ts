import { NextResponse } from "next/server";
import { notifyIndexNow } from "@/lib/indexnow";

/**
 * Submits every public URL in the sitemap to IndexNow.
 *
 * Behind CRON_SECRET, because anyone able to call it can make us announce
 * URLs to search engines under our name. Run it after publishing, by hand
 * or from the deploy.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const xml = await (await fetch("https://www.getfold.org/sitemap.xml", { cache: "no-store" })).text();
  const paths = [...xml.matchAll(/<loc>https:\/\/www\.getfold\.org([^<]*)<\/loc>/g)].map((m) => m[1] || "/");

  const result = await notifyIndexNow(paths);
  return NextResponse.json({ submitted: paths.length, ...result });
}
