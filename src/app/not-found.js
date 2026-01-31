import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found | Doug Charles for Prosper Town Council',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-navy mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't exist.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
        <Link href="/about" className="btn-outline">
          About Doug
        </Link>
        <Link href="/get-involved" className="btn-outline">
          Get Involved
        </Link>
      </div>
    </div>
  );
}
