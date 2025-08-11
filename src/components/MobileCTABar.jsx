import Link from 'next/link';

export default function MobileCTABar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4 flex justify-around sm:hidden z-50">
      <Link
        href="/#get-involved"
        className="bg-lagoon text-white px-4 py-2 rounded-full text-sm"
      >
        Get Involved
      </Link>
      <Link
        href="/?form=endorsement#get-involved"
        className="bg-coral text-white px-4 py-2 rounded-full text-sm"
      >
        Endorse Doug
      </Link>
    </div>
  );
}
