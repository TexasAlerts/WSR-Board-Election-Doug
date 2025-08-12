import Link from 'next/link';

export const metadata = {
  title: 'Role of a Board Member | Windsong HOA Election',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function BoardRole() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center justify-center bg-lagoon text-white rounded-full w-12 h-12"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase"><rect width="20" height="14" x="4" y="9" rx="2"/><path d="M20 5v4M8 5v4"/></svg></span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-lagoon">Role of a Board Member</h1>
      </div>
      <div className="text-base sm:text-lg space-y-5">
        <p><strong>Board members are stewards of our shared home.</strong> They oversee budgets and reserves, set policy, guide maintenance and vendor performance, communicate decisions, and listen—truly listen—to homeowners. It’s collaborative work that balances today’s needs with tomorrow’s plans. When board members do it well, homeowners feel informed, heard, and confident about where we’re headed. That’s the Windsong we all want to live in.</p>
        <p>For more, <a href="/docs/board-member-101.pdf" target="_blank" rel="noopener noreferrer" className="text-lagoon underline">download the official HOA Board Member overview (PDF)</a>.</p>
        <div className="mt-6 text-base sm:text-lg">
          <span className="font-bold text-coral">Why Doug?</span> <span className="font-semibold">Experience, service, and commitment.</span> <br/>
          <span className="block mt-2">With <span className="font-bold">25+ years of executive leadership</span> and deep civic service—including Prosper’s Planning &amp; Zoning Commission and prior HOA boards—Doug brings <span className="text-lagoon font-semibold">fiscal discipline, transparency, and a collaborative spirit</span> to every role. He believes <span className="italic">leadership is about listening, stewardship, and putting homeowners first</span>.</span>
          <span className="block mt-2">Doug’s commitments as your board member:</span>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li><span className="font-semibold">Transparency</span> in every decision and contract</li>
            <li><span className="font-semibold">Fiscal responsibility</span>—protecting our reserves and investments</li>
            <li><span className="font-semibold">Open communication</span> and regular updates</li>
            <li><span className="font-semibold">Listening first</span> to all homeowners, not just a select few</li>
            <li><span className="font-semibold">A vision for unity</span> as Windsong transitions to full homeowner governance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
