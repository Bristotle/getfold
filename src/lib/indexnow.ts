import "server-only";

/**
 * Tells Bing, and through it Yandex and the others on the protocol, that
 * pages have changed, the moment they have.
 *
 * Google shut its sitemap ping endpoint in 2023 and has no public way to
 * ask for a page to be indexed, short of a person pressing a button in
 * Search Console. Bing's IndexNow is the opposite: an open protocol, a key
 * you mint yourself and host as a text file, and a POST that is honoured
 * within minutes. It costs nothing and it is the difference between a new
 * post appearing on Bing today or in a fortnight.
 *
 * The key is public by design. It proves the request came from someone who
 * can write to this host, which is the only thing the protocol checks.
 */
export const INDEXNOW_KEY = "1b3fa6c8b40b665c6197401f164b28b0";
const HOST = "www.getfold.org";

export async function notifyIndexNow(paths: string[]): Promise<{ ok: boolean; status: number }> {
  if (paths.length === 0) return { ok: true, status: 204 };
  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: paths.map((p) => `https://${HOST}${p}`),
      }),
    });
    return { ok: res.ok || res.status === 202, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
