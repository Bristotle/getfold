import { Check } from "lucide-react";
import { submitEnquiry } from "@/app/contact-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { SectionBg } from "@/components/marketing/section-bg";

/**
 * The enquiry section.
 *
 * A coloured band so it reads as the end of the argument rather than another
 * paragraph of it, with the form on a white card because a form on a tinted
 * ground is harder to read and harder to trust.
 *
 * Every promise on the left is one we can actually keep. There is no phone
 * number because inventing one would be worse than omitting it: set
 * NEXT_PUBLIC_CONTACT_PHONE and the call box appears.
 */
const PROMISES = [
  "A real person reads every message, not a bot",
  "We will set your church up with you if you would rather not do it alone",
  "Bring your existing register and we will help you import it",
  "No obligation. Try it for 30 days and walk away if it is not for you",
];

const fieldClass =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40";

export function Contact({
  sent,
  error,
}: {
  sent?: boolean;
  error?: string;
}) {
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;

  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden scroll-mt-8 bg-primary text-primary-foreground"
    >
      {/*
        Plain purple, deliberately. The photograph opens the page on the
        hero and closes it on the final band; a third use here, one section
        above the second, made the page read as wallpaper rather than as
        bookends. The form stays on a white card where a form belongs.
      */}
      <SectionBg variant="mesh" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        {/* ---------- the case ---------- */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
            Your next step
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Bring your church into one place
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-primary-foreground/85">
            Tell us about your church and we will get you set up, including
            moving across the register you already keep. It costs nothing to
            find out whether this fits how you work.
          </p>

          <ul className="m-0 mt-8 flex list-none flex-col gap-3.5 p-0">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-foreground/20"
                >
                  <Check size={13} strokeWidth={2.5} />
                </span>
                <span className="text-[15px] leading-relaxed text-primary-foreground/90">
                  {p}
                </span>
              </li>
            ))}
          </ul>

          {phone && (
            <div className="mt-8 rounded-xl bg-primary-foreground/10 p-5">
              <p className="text-sm text-primary-foreground/80">
                Would rather talk?
              </p>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="mt-1 block rounded font-numeric text-2xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                {phone}
              </a>
              <p className="mt-1 text-sm text-primary-foreground/70">
                A person answers, not a menu.
              </p>
            </div>
          )}
        </div>

        {/* ---------- the form ---------- */}
        <div className="rounded-2xl bg-surface p-6 text-foreground shadow-[0_20px_50px_-24px_rgba(26,16,51,0.5)] sm:p-8">
          <h3 className="text-lg font-bold">Tell us about your church</h3>

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
            {/* Honeypot: hidden from people, irresistible to bots. */}
            <div aria-hidden="true" className="absolute left-[-9999px]">
              <label htmlFor="website">Leave this empty</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-name"
                  className="text-xs font-medium text-foreground"
                >
                  Your name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Rev. Kwesi Mensah"
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-church"
                  className="text-xs font-medium text-foreground"
                >
                  Church{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <input
                  id="contact-church"
                  name="church"
                  autoComplete="organization"
                  placeholder="Ebenezer Methodist Society"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-email"
                  className="text-xs font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@yourchurch.org"
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-phone"
                  className="text-xs font-medium text-foreground"
                >
                  Phone{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0244 000 000"
                  className={`${fieldClass} font-numeric`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="contact-message"
                className="text-xs font-medium text-foreground"
              >
                What would you like to know?
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                placeholder="We are a society of about 300 members and still keep everything in a book…"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>

            <SubmitButton size="lg" pendingLabel="Sending…">
              Send us a message
            </SubmitButton>

            <p className="text-center text-xs text-muted-foreground">
              We reply within a day. Your details are never shared or sold.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
