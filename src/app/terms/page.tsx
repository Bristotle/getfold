import type { Metadata } from "next";
import { LegalLayout, Section } from "@/components/marketing/legal-layout";

export const metadata: Metadata = {
  title: "Terms and conditions, Fold",
  description: "The terms on which churches use Fold.",
};

/**
 * A starting point, not a substitute for a lawyer.
 *
 * Written plainly because the person agreeing to it is usually a pastor or a
 * church secretary, not a procurement team. Have it reviewed before you take
 * paying churches.
 */
export default function TermsPage() {
  return (
    <LegalLayout title="Terms and conditions" updated="7 September 2026">
      <p>
        These terms govern your church&rsquo;s use of Fold, provided by Manuel
        Technologies. By creating an account you accept them on behalf of your
        church.
      </p>

      <Section heading="The account">
        <p>
          The person who creates a church in Fold holds its primary account
          and is responsible for who else is given access. You may invite
          others and assign each of them a role that determines what they can
          see and do.
        </p>
        <p>
          You are responsible for keeping sign in details private, and for
          removing access when someone leaves the church&rsquo;s staff. Tell us
          promptly if you believe an account has been used without permission.
        </p>
      </Section>

      <Section heading="Your free trial">
        <p>
          New churches get 30 days of full access at no cost. No card details
          are required to start, and there is no obligation to continue. If
          you decide not to, simply stop using it.
        </p>
        <p>
          We will tell you before the trial ends. We will not begin charging
          without your agreement.
        </p>
      </Section>

      <Section heading="Your data belongs to your church">
        <p>
          Everything you record stays yours. We claim no ownership of your
          members, your giving records or your returns, and we do not use them
          to train anything or sell them to anyone.
        </p>
        <p>
          You may export or request a copy of your data at any time, including
          if you decide to leave.
        </p>
      </Section>

      <Section heading="Payments through Fold">
        <p>
          Mobile money contributions are processed by Paystack, not by us.
          Money moves directly between the giver and your church&rsquo;s Paystack
          account, and Paystack&rsquo;s own fees and terms apply to those
          transactions.
        </p>
        <p>
          Fold records what Paystack confirms. A payment is only counted as
          given once Paystack tells us it succeeded. We are not a party to the
          transaction and cannot reverse one.
        </p>
      </Section>

      <Section heading="Text messages">
        <p>
          Messages you send through Fold are delivered by a third party and
          charged against credits your church buys. You are responsible for
          having a reason to contact each recipient, and for honouring anyone
          who asks not to be contacted again.
        </p>
      </Section>

      <Section heading="What we do not promise">
        <p>
          We work to keep Fold available and correct, but we do not promise it
          will be uninterrupted or free of faults. It is provided as it is.
        </p>
        <p>
          Fold is a record of what your church enters. It does not replace
          your own bookkeeping obligations, and the accuracy of a statistical
          return depends on the accuracy of what was recorded.
        </p>
        <p>
          To the extent the law allows, our liability is limited to the
          amount your church paid us in the twelve months before the claim.
        </p>
      </Section>

      <Section heading="Ending the arrangement">
        <p>
          You may stop using Fold whenever you wish. We may suspend an account
          that is being used unlawfully, or to harm others, and we will
          explain why when we do.
        </p>
        <p>
          If we ever discontinue the service we will give reasonable notice and
          a way to take your data with you.
        </p>
      </Section>

      <Section heading="Governing law">
        <p>
          These terms are governed by the laws of the Republic of Ghana.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Manuel Technologies,{" "}
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
