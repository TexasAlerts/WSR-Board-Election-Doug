import Image from 'next/image';
import IdeaDetailDynamic from '../../../components/IdeaDetailDynamic';

export default function IdeaDetailPage({ params }) {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="bg-gradient-red text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden">
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
          className="absolute top-4 right-4 w-16 sm:w-20 md:w-24 h-auto opacity-40 pointer-events-none brightness-200"
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Community Idea
          </h1>
          <p className="text-lg text-white/90">
            Share your thoughts and join the discussion
          </p>
        </div>
      </section>

      <IdeaDetailDynamic ideaId={params.id} />
    </div>
  );
}
