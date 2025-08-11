import Link from 'next/link';

export const metadata = {
  title: 'Voting Info | Windsong HOA Election',
};

export default function Voting() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl sm:text-4xl font-bold">Make Your Voice Count</h1>
      <p>
        This election is about more than filling two seats – it will set the tone for homeowner‑led governance for years to come. Your vote will establish a culture of accountability, transparency and unity.
      </p>
      <section>
        <h2 className="text-2xl font-bold mb-2">Key Dates</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="bg-lagoon-light text-lagoon px-3 py-1 rounded-full font-semibold uppercase text-xs sm:text-sm">Aug 14 – Meet the Candidates @ 6 PM</div>
          <div className="bg-lagoon-light text-lagoon px-3 py-1 rounded-full font-semibold uppercase text-xs sm:text-sm">Aug 20 – Voting Opens</div>
          <div className="bg-lagoon-light text-lagoon px-3 py-1 rounded-full font-semibold uppercase text-xs sm:text-sm">Sept 2 – Voting Closes</div>
          <div className="bg-lagoon-light text-lagoon px-3 py-1 rounded-full font-semibold uppercase text-xs sm:text-sm">Sept 3 – Results Announced</div>
          <div className="bg-lagoon-light text-lagoon px-3 py-1 rounded-full font-semibold uppercase text-xs sm:text-sm">1 Vote Per Address (Title Owner)</div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-2">Voting Rules</h2>
        <p>One vote per home address by a Title Owner. Each Title Owner will receive a unique link via email from <strong>Vote HOA Now</strong>. If you don’t receive it, email <a href="mailto:hoa@windsong.org" className="underline">hoa@windsong.org</a> for assistance.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-2">Why This Election Matters</h2>
        <p>These two homeowner‑elected seats join three developer‑appointed members. While a developer majority remains today, voting now lays the foundation for a fully homeowner‑led board. Your vote can accelerate our transition to full representation.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-2">Role of a Board Member</h2>
        <p>Board members are stewards of our shared home. They oversee budgets and reserves, set policy, guide maintenance and vendor performance, communicate decisions and listen—truly listen—to homeowners. It’s collaborative work that balances today’s needs with tomorrow’s plans. When board members do it well, homeowners feel informed, heard and confident about where we’re headed.</p>
        <p className="mt-2">My career in financial services and civic service prepares me to perform these duties with excellence. When evaluating candidates, ask: <em>Who will be a steward of your investment and a champion of our community?</em></p>
        <p className="mt-2"><Link href="/docs/board-member-101.pdf" target="_blank" rel="noopener noreferrer" className="text-lagoon underline">Download the official HOA Board Member overview (PDF)</Link></p>
      </section>
    </div>
  );
}