import Image from 'next/image';
import GetInvolvedDynamic from '../../components/GetInvolvedDynamic';

export const metadata = {
  title: 'Get Involved - Doug Charles for Prosper',
  description:
    'Volunteer, host an event, request a yard sign, or endorse Doug Charles for Town of Prosper Town Council Place 5. Every action makes a difference.',
  alternates: { canonical: '/get-involved' },
};

export default function GetInvolvedPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        <Image
          src="/campaign-logo.webp"
          alt=""
          aria-hidden="true"
          width={96}
          height={64}
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4">
            Get Involved
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Join the movement for <strong className="text-navy">Common Sense</strong> leadership for{' '}
            <strong className="text-prosper-red">ALL</strong> of Prosper
          </p>
        </div>
      </section>

      <GetInvolvedDynamic />
    </div>
  );
}
