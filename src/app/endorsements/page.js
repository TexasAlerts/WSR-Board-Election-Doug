import Image from 'next/image';
import EndorsementsDynamic from '../../components/EndorsementsDynamic';

export default function EndorsementsPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Logo accent */}
        <Image
          src="/campaign-logo.webp"
          alt="Doug Charles for Prosper Town Council Place 5"
          width={96}
          height={64}
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4 animate-fade-in-down">
            Endorsements
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in">
            Neighbors supporting <strong className="text-navy">Common Sense</strong> leadership for <strong className="text-prosper-red">ALL</strong> of Prosper
          </p>
        </div>
      </section>

      <EndorsementsDynamic />
    </div>
  );
}
