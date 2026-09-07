import type { Metadata } from "next";
import { LegalLayout, Section } from "@/components/marketing/legal-layout";

export const metadata: Metadata = {
  title: "Privacy policy, Fold",
  description:
    "How Fold handles the personal data churches keep about their members.",
};

/**
 * Written for a church, not a legal department.
 *
 * A church is handing over its members' names, phone numbers and giving
 * records. It deserves to understand what happens to them without a
 * solicitor. This is a starting point and should be reviewed against the
 * Data Protection Act, 2012 (Act 843) before you take real congregations.
 */
export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy policy" updated="7 September 2026">
      <p>
        Fold is church management software operated by Manuel Technologies.
        This policy explains what personal data we hold, why we hold it, and
        what you and your members can ask us to do with it.
      </p>

      <Section heading="Who controls the data">
        <p>
          Your church is the data controller for everything it records in
          Fold: member names, phone numbers, attendance, giving, and vital
          records. Manuel Technologies is the data processor. We store and
          process that information on your instructions, and we do not decide
          what you collect or why.
        </p>
        <p>
          That distinction matters in practice. If a member asks to see or
          delete their record, the request goes to their church, and the
          church uses Fold to act on it.
        </p>
      </Section>

      <Section heading="What we collect">
        <p>
          <strong className="text-foreground">From church staff:</strong> the
          name, email address and password you provide when creating an
          account, and a record of what your account does inside the software.
        </p>
        <p>
          <strong className="text-foreground">About members:</strong> whatever
          your church chooses to record. Typically a name, and optionally
          gender, date of birth, phone number, email, address, membership
          type, group, attendance, contributions and vital records such as
          baptisms.
        </p>
        <p>
          We do not collect data about your members from anywhere except your
          church. There is no tracking of members across other websites, and
          we do not buy or sell data.
        </p>
      </Section>

      <Section heading="How your church’s data is separated">
        <p>
          Each church&rsquo;s records are isolated at the database level using
          Postgres row-level security, not merely hidden in the interface. A
          request carrying one church&rsquo;s credentials cannot read another
          church&rsquo;s rows, and this is enforced by the database itself rather
          than by application code that could contain a mistake.
        </p>
        <p>
          Within a church, access follows the role you assign. A class leader
          cannot read the church&rsquo;s giving records at all.
        </p>
      </Section>

      <Section heading="Who else sees it">
        <p>
          We use a small number of processors, each for one purpose, and each
          receives only what that purpose requires.
        </p>
        <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong className="text-foreground">Supabase</strong> hosts the
            database and handles sign in. Data is stored in the European
            Union, in Ireland.
          </li>
          <li>
            <strong className="text-foreground">Vercel</strong> serves the
            application.
          </li>
          <li>
            <strong className="text-foreground">Paystack</strong> processes
            mobile money payments. It receives the payer&rsquo;s phone number and
            the amount. It never receives your member list.
          </li>
          <li>
            <strong className="text-foreground">Arkesel</strong> delivers text
            messages. It receives the recipient&rsquo;s number and the message.
          </li>
        </ul>
        <p>
          We do not share personal data with anyone else, and we do not
          disclose it to third parties for marketing.
        </p>
      </Section>

      <Section heading="How long we keep it">
        <p>
          For as long as your church keeps its account. Records a church
          archives, such as a member who has left, are retained rather than
          deleted, because a church&rsquo;s history of baptisms, giving and
          attendance is often the reason it adopted the software.
        </p>
        <p>
          When a church closes its account we delete its data within 30 days,
          except where we are required to keep financial records longer.
        </p>
      </Section>

      <Section heading="What you can ask for">
        <p>
          Under the Data Protection Act, 2012 (Act 843), an individual may ask
          to see the personal data held about them, to have it corrected, and
          in some circumstances to have it erased.
        </p>
        <p>
          Members should address such requests to their church. Churches can
          act on them directly in Fold, and may contact us for help at any
          time.
        </p>
      </Section>

      <Section heading="Security">
        <p>
          Connections are encrypted in transit. Passwords are hashed and never
          stored in a readable form, including by us. Access to production
          data is limited to those who need it to operate the service.
        </p>
        <p>
          No system is perfect. If we become aware of a breach affecting your
          church&rsquo;s data we will tell you promptly and explain what happened.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about this policy, or a request about your own data, can
          be sent to Manuel Technologies through{" "}
          <a
            href="https://manueltechnologies.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            manueltechnologies.com
          </a>
          .
        </p>
      </Section>
    </LegalLayout>
  );
}
