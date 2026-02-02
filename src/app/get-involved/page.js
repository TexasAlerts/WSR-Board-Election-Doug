import Image from 'next/image';
import GetInvolvedDynamic from '../../components/GetInvolvedDynamic';

export default function GetInvolvedPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        {/* Logo accent */}
        <Image
          src="/campaign-logo.webp"
          alt=""
          aria-hidden="true"
          width={96}
          height={64}
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-40 pointer-events-none brightness-200"
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Get Involved
          </h1>
          <p className="text-xl text-white/90">
            Join the movement for <strong>Common Sense</strong> leadership for <strong>ALL</strong> of Prosper
          </p>
        </div>
      </section>

      <GetInvolvedDynamic />
    </div>
  );
}
