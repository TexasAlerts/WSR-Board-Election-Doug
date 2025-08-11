"use client";
import Link from 'next/link';

export default function MobileCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t shadow-md p-3 flex gap-2 z-50">
      <Link
        href={{ pathname: '/', query: { form: 'endorsement' }, hash: 'get-involved' }}
        className="flex-1 text-center px-4 py-2 bg-coral text-white rounded-full font-semibold hover:bg-coral/90"
      >
        Endorse Doug
      </Link>
      <Link
        href={{ pathname: '/', hash: 'get-involved' }}
        className="flex-1 text-center px-4 py-2 bg-lagoon-light text-lagoon rounded-full font-semibold hover:bg-lagoon-light/90"
      >
        Get Involved
      </Link>
    </div>
  );
}
