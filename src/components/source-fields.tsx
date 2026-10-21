"use client";

import { useEffect, useState } from "react";

/**
 * Hidden fields saying which page led here, filled in when the page loads.
 *
 * Read only from the browser's own referrer and address bar, and kept
 * nowhere: no cookie, no local storage. If JavaScript does not run the
 * fields stay empty and the form works exactly as before. Read on the
 * server by sourceFrom() in src/lib/attribution.ts.
 */
export function SourceFields() {
  const [v, setV] = useState({
    from_page: "",
    from_site: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
  });

  useEffect(() => {
    let page = window.location.pathname;
    let site = "";
    let params = new URLSearchParams(window.location.search);
    try {
      if (document.referrer) {
        const r = new URL(document.referrer);
        if (r.host === window.location.host) {
          // Came from another of our pages, such as a blog post's "Start
          // your free trial": that page is the one that converted.
          page = r.pathname;
          if (!params.get("utm_source")) params = r.searchParams;
        } else {
          site = r.hostname.replace(/^www\./, "");
        }
      }
    } catch {
      // A referrer we cannot parse tells us nothing; leave it out.
    }
    // Set after mount, from the browser, which is the only place these
    // values exist. There is nothing to render on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setV({
      from_page: page,
      from_site: site,
      utm_source: params.get("utm_source") ?? "",
      utm_medium: params.get("utm_medium") ?? "",
      utm_campaign: params.get("utm_campaign") ?? "",
    });
  }, []);

  return (
    <>
      {Object.entries(v).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </>
  );
}
