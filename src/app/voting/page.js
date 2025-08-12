import Link from 'next/link';

export const metadata = {
  title: 'Voting Info | Windsong HOA Election',
};

export default function Voting() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl sm:text-4xl font-bold">Make Your Voice Count</h1>
      <p>
        This election is more than filling two seats—it’s about setting the tone for homeowner-led governance in the near future. With the right leaders, these first homeowner‑elected seats can establish a culture of accountability, transparency, and unity.
      </p>
      <section>
        <h2 className="text-2xl font-bold mb-2">Key Dates</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Meet the Candidates – Aug 14 @ 6 PM:</strong> Ask your questions, hear real answers, hold us accountable.</li>
          <li><strong>Voting Opens – Aug 20:</strong> Vote online via Vote HOA Now — your chance to shape our future.</li>
          <li><strong>Voting Closes – Sept 2:</strong> Don’t wait — make sure your voice is counted.</li>
          <li><strong>Results Announced – Sept 3 Special Meeting:</strong> Attend to hear who will represent us.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-2">Voting Rules</h2>
        <p>One vote per home address by a Title Owner. Look for your email from <strong>Vote HOA Now</strong> with your unique voting link. If you don’t receive it, contact HOA management for assistance.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-2">Why This Election Matters</h2>
        <p>These two homeowner‑elected seats join three developer‑appointed members. While a developer majority remains today, <strong>your vote sets the tone</strong> for full homeowner governance in the near future. Accountability, transparency, and unity start with who you elect now.</p>
      </section>
      {/* Role of a Board Member section moved to homepage for unique emphasis */}
    </div>
  );
}