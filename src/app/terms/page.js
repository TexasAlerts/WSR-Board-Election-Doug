import Script from 'next/script';

export const metadata = {
  title: 'Terms of Use — Doug Charles — Prosper Town Council, Place 5',
  description:
    'Terms of use for the Doug Charles personal website, including content moderation, user submissions, SMS terms, and political advertising compliance.',
  alternates: { canonical: '/terms' },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dougcharles.com' },
    { '@type': 'ListItem', position: 2, name: 'Terms of Use', item: 'https://www.dougcharles.com/terms' },
  ],
};

export default function TermsOfUse() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Script id="terms-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <h1 className="text-3xl sm:text-4xl font-bold text-navy">Terms of Use</h1>
      <p className="text-charcoal">
        <strong>Effective Date:</strong> January 2026
      </p>
      <p className="text-charcoal">
        <strong>Last Updated:</strong> February 24, 2026
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Introduction</h2>
        <p>
          Welcome to the personal website for Doug Charles, Prosper Town Council Place 5 ("the
          Campaign," "we," "us," or "our"). By accessing or using this website at dougcharles.com
          (the "Site"), you agree to be bound by these Terms of Use. If you do not agree with these
          terms, please do not use this Site.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Nature of This Website</h2>
        <p>
          <strong>
            This is a personal communication platform operated by Doug Charles and his campaign
            committee, not a government public forum.
          </strong>{' '}
          Doug Charles is the incoming member of the Prosper Town Council, Place 5. This website is separate from
          and not affiliated with the Town of Prosper government. The Campaign reserves
          all rights afforded to private speakers under the First Amendment.
        </p>
        <p>
          Nothing on this Site constitutes official government communication. Any views, positions,
          or statements expressed are those of Doug Charles personally and do not represent the
          Town of Prosper or any government entity.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Official Government Disclaimer</h2>
        <p>
          Doug Charles is the incoming member of the Prosper Town Council, Place 5 (to be sworn in May 2026).
          This website is maintained by Doug Charles in his personal capacity and through his
          campaign committee. It is <strong>NOT</strong> an official website of the Town of Prosper.
        </p>
        <p>
          All content, views, positions, and opinions expressed on this website are those of
          Doug Charles personally and do not represent:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>The Town of Prosper</li>
          <li>The Prosper Town Council</li>
          <li>Any official government policy, position, or decision</li>
          <li>The State of Texas or any state agency</li>
        </ul>
        <p>
          Official Town of Prosper communications are published at{' '}
          <a href="https://www.prospertx.gov" target="_blank" rel="noopener noreferrer" className="text-navy underline hover:text-prosper-red">
            www.prospertx.gov
          </a>. All official council agendas, minutes, and actions are available through the
          Town&apos;s official channels.
        </p>
        <p>
          This website operates under Texas Election Code Chapter 255 as political advertising.
          Campaign finance reports are filed with the Town of Prosper Town Secretary&apos;s Office
          as required by Texas law. Campaign Treasurer: Robert Bye.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Comment and Content Moderation Policy</h2>
        <p>
          This Site may include features that allow users to submit content, including but not
          limited to endorsements, questions, ideas, and comments. By submitting content, you
          acknowledge and agree that:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            The Campaign reserves the sole and absolute right to approve, edit, decline, or remove
            any user-submitted content at our discretion.
          </li>
          <li>Submission of content does not guarantee publication or display on the Site.</li>
          <li>
            The Campaign may moderate content based on any criteria we deem appropriate, including
            but not limited to relevance, tone, and alignment with the website's messaging.
          </li>
        </ul>
        <p className="mt-4">
          <strong>Content that may be removed includes, but is not limited to:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Spam, commercial advertising, or promotional content</li>
          <li>Obscene, vulgar, or profane language</li>
          <li>Threats, harassment, or personal attacks</li>
          <li>Content that is defamatory, libelous, or infringes on others' rights</li>
          <li>Off-topic or irrelevant material</li>
          <li>Misinformation or content we believe to be false or misleading</li>
          <li>Any content that violates applicable law</li>
        </ul>
        <p className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <strong>Important:</strong> As a private forum, we are not required to publish
          content critical of the Campaign or its positions. Content moderation decisions are within
          our sole discretion and are not subject to appeal.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">User Submissions</h2>
        <p>
          By submitting any content to this Site (including endorsements, questions, ideas, or other
          materials), you:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Grant the Campaign a non-exclusive, royalty-free, perpetual, worldwide license to use,
            display, reproduce, modify, and distribute your submission in connection with website
            activities and community engagement
          </li>
          <li>
            Represent that your submission is original, accurate, and does not violate any
            third-party rights
          </li>
          <li>
            Consent to the public display of your name in connection with approved endorsements or
            other published content
          </li>
          <li>Acknowledge that you will not receive compensation for your submission</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">SMS/Text Messaging Terms</h2>
        <p>
          By opting in to receive SMS messages from Doug Charles for Town of Prosper Town Council Place 5, you agree
          to the following:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Program name:</strong> Doug Charles for Town of Prosper Town Council Place 5
          </li>
          <li>
            <strong>Product description:</strong> Community updates, alerts, event notifications,
            donation solicitations, and verification codes related to Doug Charles, Prosper
            Town Council Place 5
          </li>
          <li>
            <strong>Message frequency:</strong> May vary based on activity
          </li>
          <li>
            <strong>Message and data rates:</strong> Standard message and data rates may apply
            depending on your carrier and plan. Carriers are not liable for delayed or undelivered
            messages.
          </li>
          <li>
            <strong>Opt-out:</strong> You may opt out at any time by replying STOP to any message.
            You will receive confirmation that you have been unsubscribed and no further messages
            will be sent.
          </li>
          <li>
            <strong>Help:</strong> Reply HELP to any message or contact{' '}
            <a href="mailto:doug@dougcharles.com" className="text-navy underline">
              doug@dougcharles.com
            </a>{' '}
            for support
          </li>
          <li>
            <strong>Consent:</strong> Consent to receive text messages is not a condition of
            purchase or registration
          </li>
          <li>
            <strong>Donations:</strong> Donation solicitations may be included in messages.
            Donations are secured through the designated payment processor.
          </li>
          <li>
            <strong>Privacy:</strong> Your mobile information will not be sold or shared with third
            parties for promotional or marketing purposes. See our{' '}
            <a href="/privacy" className="text-navy underline">
              Privacy Policy
            </a>
            .
          </li>
        </ul>
        <p>
          Supported carriers include major US carriers. Service may not be available on all
          carriers.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Intellectual Property</h2>
        <p>
          All content on this Site, including text, graphics, logos, images, and software, is the
          property of the Campaign or its licensors and is protected by copyright, trademark, and
          other intellectual property laws. You may not reproduce, distribute, modify, or create
          derivative works from any content on this Site without our express written permission.
        </p>
        <p>You may share links to this Site and its pages for non-commercial purposes.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Disclaimer of Warranties</h2>
        <p>
          This Site is provided "as is" and "as available" without any warranties of any kind,
          either express or implied. The Campaign does not warrant that the Site will be
          uninterrupted, error-free, or free of viruses or other harmful components.
        </p>
        <p>
          The Campaign makes no representations or warranties regarding the accuracy, completeness,
          or reliability of any content on the Site, including user-submitted content.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, the Campaign, its officers, volunteers, and agents
          shall not be liable for any direct, indirect, incidental, consequential, or punitive
          damages arising from your use of or inability to use this Site.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Political Contributions</h2>
        <p>
          Any contributions made through this Site are subject to applicable Texas campaign finance
          laws. By making a contribution, you represent that:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You are a U.S. citizen or lawful permanent resident</li>
          <li>
            The contribution is from your own personal funds and not from a corporation, labor
            organization, or other prohibited source
          </li>
          <li>You are at least 18 years old</li>
          <li>You understand that contributions are not tax-deductible</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Third-Party Links</h2>
        <p>
          This Site may contain links to third-party websites. These links are provided for your
          convenience only. The Campaign does not endorse, control, or assume responsibility for the
          content, privacy policies, or practices of any third-party websites.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Governing Law</h2>
        <p>
          These Terms of Use shall be governed by and construed in accordance with the laws of the
          State of Texas, without regard to its conflict of law provisions. Any disputes arising
          from these terms or your use of the Site shall be resolved in the courts of Collin County,
          Texas.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Changes to These Terms</h2>
        <p>
          We may update these Terms of Use from time to time. Any changes will be posted on this
          page with an updated "Last Updated" date. Your continued use of the Site after any changes
          constitutes your acceptance of the new terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Contact Us</h2>
        <p>If you have questions about these Terms of Use, please contact us:</p>
        <p>
          <strong>Doug Charles for Town of Prosper Town Council Place 5</strong>
          <br />
          Email:{' '}
          <a href="mailto:doug@dougcharles.com" className="text-navy underline">
            doug@dougcharles.com
          </a>
          <br />
          Website:{' '}
          <a href="https://www.dougcharles.com" className="text-navy underline">
            dougcharles.com
          </a>
        </p>
      </section>

      <section className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-sm text-charcoal/70">
          Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
          <br />
          Robert Bye, Campaign Treasurer
        </p>
      </section>
    </div>
  );
}
