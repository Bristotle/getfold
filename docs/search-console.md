# Getting Fold into Google

The site side is done. What is left needs your Google account, so it has
to be you. It takes about ten minutes.

## Before you start

These are already in place and verified on the live site:

- `https://www.getfold.org/sitemap.xml` lists 57 URLs, all returning 200,
  no duplicates, all on the canonical host
- `https://www.getfold.org/robots.txt` points at the sitemap and disallows
  every authenticated route
- Every page emits a canonical tag pointing at itself on `www`
- `getfold.org` redirects to `www.getfold.org` with a 308

That last one matters. Until it was fixed, every page existed twice as far
as Google was concerned and a submission would have split the site's
authority across two copies of itself.

## 1. Create the property

Go to <https://search.google.com/search-console> and sign in with the
Google account you want to own this permanently. Not a personal account
you might lose access to.

Choose **Domain** rather than URL prefix. A domain property covers
`getfold.org`, `www.getfold.org`, `http`, `https` and any subdomain in one
place, which saves you doing this again.

## 2. Verify by DNS, in Namecheap

Google gives you a TXT record. In Namecheap:

1. Domain List, then **Manage** next to getfold.org
2. **Advanced DNS**
3. **Add New Record**, type **TXT Record**
4. Host: `@`
5. Value: the whole `google-site-verification=...` string Google gave you
6. TTL: Automatic
7. Save, then click **Verify** in Search Console

DNS can take a few minutes. If it fails, wait ten and try again rather
than adding a second record.

### If you would rather not touch DNS

There is a meta tag route as a fallback. Take the `content` value from the
tag Google offers, and in Vercel set:

```
NEXT_PUBLIC_GOOGLE_VERIFICATION=<the content value only, not the whole tag>
```

Redeploy, then verify with the **HTML tag** method. This only verifies
`www.getfold.org`, not the domain, so prefer DNS.

## 3. Submit the sitemap

In Search Console, **Sitemaps** in the left menu. Enter:

```
sitemap.xml
```

and submit. Status should reach **Success** with 57 discovered URLs. If it
says "Couldn't fetch", wait an hour and refresh before doing anything
else; that message is usually impatience rather than a fault.

## 4. Ask for the important pages to be crawled

Sitemaps get you queued. **URL Inspection**, paste a URL, then **Request
Indexing** moves a page up. You get a small daily quota, so spend it on
the pages that earn:

1. `https://www.getfold.org/`
2. `https://www.getfold.org/compare`
3. `https://www.getfold.org/blog/church-management-software-in-ghana`
4. `https://www.getfold.org/features`
5. `https://www.getfold.org/blog/statistical-return-without-a-spreadsheet`

Two and three are the ones aimed at Shepherd's ranking article.

## 5. Bing as well, it costs five minutes

<https://www.bing.com/webmasters> lets you import everything straight from
Search Console once step 2 is done. Bing also feeds DuckDuckGo, and its
index is used by several AI assistants, which matters given the FAQ and
help centre are written to be quoted.

## What to expect, honestly

Nothing for a few days. Indexing a new domain usually takes one to two
weeks before pages appear for their own name, and one to three months
before they compete for anything contested. Shepherd's Ghana article has a
head start, and the way past it is the honest comparison plus time, not a
trick.

Check back in Search Console after two weeks and look at **Performance**,
filtered to queries. The first real signal is which questions people
arrive on, and that should feed the next round of help articles.

## Keeping it healthy

- The sitemap regenerates itself. New blog posts, help articles and join
  pages appear in it automatically, so there is nothing to resubmit.
- If **Coverage** reports pages excluded as "Duplicate, Google chose a
  different canonical", tell me. That would mean the canonical work has
  regressed.
- Never submit a URL that is in the robots disallow list. Everything behind
  a login is excluded on purpose.
