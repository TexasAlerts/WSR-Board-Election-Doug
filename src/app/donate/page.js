import Link from 'next/link';

export default function DonatePage() {
  return (
    <div className="space-y-0">
      <section className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card">
            <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-6">
              Thank You for Your Support
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Thank you to everyone who contributed during the campaign.
              Donations are no longer being accepted.
            </p>
            <p className="text-gray-600 mb-8">
              Want to stay connected? Create an account to participate in polls,
              share ideas, and engage with your councilmember-elect.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/register" className="btn-primary">
                Create an Account
              </Link>
              <Link href="/get-involved" className="btn-outline">
                Engage
              </Link>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="card bg-gray-50/50 mt-8">
            <p className="text-sm text-gray-600 leading-relaxed">
              Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
              <br />
              Robert Bye, Campaign Treasurer
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
