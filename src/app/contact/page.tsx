import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, Clock, MessageSquare } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SubmitButton } from "@/components/ui/submit-button";
import { submitEnquiry } from "@/app/contact-actions";
import { SectionBg } from "@/components/marketing/section-bg";

export const metadata: Metadata = {
  title: "Contact Fold, church software support in Ghana",
  description:
    "Talk to a person about bringing your church register, attendance and giving into one place. We reply within a day.",
};

const fieldClass =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  // Neither is invented. A number that does not ring, or an address that
  // bounces, is worse than no number at all on a page asking a church to
  // trust you. Set the env vars and these appear.
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const hours = process.env.NEXT_PUBLIC_CONTACT_HOURS;

  const methods = [
    phone && {
      Icon: Phone,
      label: "Call or text",
      value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
      note: "A person answers, not a menu.",
    },
    email && {
      Icon: Mail,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      note: "We reply within a day.",
    },
    hours && {
      Icon: Clock,
      label: "Hours",
      value: hours,
      href: null,
      note: "Ghana time.",
    },
  ].filter(Boolean) as {
    Icon: typeof Phone;
    label: string;
    value: string;
    href: string | null;
    note: string;
  }[];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main">
        {/* ---------- hero ---------- */}
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Contact
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              We are here to help
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              A real person reads every message. Whether you are ready to move
              your register across or just want to know if this fits how your
              church works, ask.
            </p>
          </div>
        </section>

        {/* ---------- how to reach us ---------- */}
        <section className="relative isolate overflow-hidden bg-surface">
          <SectionBg variant="orbs" />
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  How to reach us
                </h2>

                {methods.length > 0 ? (
                  <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
                    {methods.map(({ Icon, label, value, href, note }) => (
                      <li
                        key={label}
                        className="flex items-start gap-4 rounded-xl border border-border bg-background p-4"
                      >
                        <span
                          aria-hidden="true"
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
                        >
                          <Icon size={19} strokeWidth={1.7} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {label}
                          </p>
                          {href ? (
                            <a
                              href={href}
                              className="mt-0.5 block break-words rounded font-numeric text-base font-bold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            >
                              {value}
                            </a>
                          ) : (
                            <p className="mt-0.5 font-numeric text-base font-bold text-foreground">
                              {value}
                            </p>
                          )}
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {note}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-5 flex items-start gap-4 rounded-xl border border-border bg-background p-4">
                    <span
                      aria-hidden="true"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
                    >
                      <MessageSquare size={19} strokeWidth={1.7} />
                    </span>
                    <div>
                      <p className="text-base font-bold text-foreground">
                        Use the form
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        It reaches us directly, and we reply within a day.
                      </p>
                    </div>
                  </div>
                )}

                {/*
                  The Pricing item in the nav lands here, so this has to
                  answer the pricing question honestly rather than leave
                  somebody hunting. What it must never do is imply a figure
                  we have not settled.
                */}
                <div
                  id="pricing"
                  className="mt-6 scroll-mt-24 rounded-xl border border-border bg-background p-5"
                >
                  <h3 className="text-sm font-bold text-foreground">
                    What does Fold cost?
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Every church starts with 30 days free, with no card and
                    nothing to cancel. After that it is from GHS 149 a month
                    for the whole church, billed quarterly.
                  </p>
                  <p className="mt-3">
                    <Link
                      href="/pricing"
                      className="rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      See the bands
                    </Link>
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-primary/25 bg-primary-soft p-5">
                  <h3 className="text-sm font-bold text-foreground">
                    Moving from a book or a spreadsheet?
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Say so in your message and we will do the import with you,
                    including your Bible classes and groups. Most churches are
                    set up the same day they send their file.
                  </p>
                </div>
              </div>

              {/* ---------- form ---------- */}
              <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground">
                  Send us a message
                </h2>

                {sent && (
                  <p
                    role="status"
                    className="mt-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success-text"
                  >
                    Thank you. We have your message and will reply within a day.
                  </p>
                )}
                {error && (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger-text"
                  >
                    {error}
                  </p>
                )}

                <form action={submitEnquiry} className="mt-5 flex flex-col gap-4">
                  <div aria-hidden="true" className="absolute left-[-9999px]">
                    <label htmlFor="c-website">Leave this empty</label>
                    <input
                      id="c-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  <input type="hidden" name="source" value="contact-page" />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="c-name" className="text-xs font-medium text-foreground">
                        Your name
                      </label>
                      <input
                        id="c-name"
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Rev. Kwesi Mensah"
                        className={fieldClass}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="c-church" className="text-xs font-medium text-foreground">
                        Church{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <input
                        id="c-church"
                        name="church"
                        autoComplete="organization"
                        placeholder="Ebenezer Methodist Society"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="c-email" className="text-xs font-medium text-foreground">
                        Email
                      </label>
                      <input
                        id="c-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@yourchurch.org"
                        className={fieldClass}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="c-phone" className="text-xs font-medium text-foreground">
                        Phone{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <input
                        id="c-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="0244 000 000"
                        className={`${fieldClass} font-numeric`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="c-message" className="text-xs font-medium text-foreground">
                      How can we help?
                    </label>
                    <textarea
                      id="c-message"
                      name="message"
                      rows={5}
                      placeholder="We are a society of about 300 members. We keep the register in a book and the returns take a whole evening every quarter…"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                  </div>

                  <SubmitButton size="lg" pendingLabel="Sending…">
                    Send message
                  </SubmitButton>

                  <p className="text-center text-xs text-muted-foreground">
                    We reply within a day. Your details are never shared or sold.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
