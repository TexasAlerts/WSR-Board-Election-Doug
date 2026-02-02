import Image from 'next/image';
import PollDetailDynamic from '../../../components/PollDetailDynamic';
import { getSupabase } from '../../../lib/supabase';

/**
 * Generate metadata for individual poll pages
 * Fetches poll data server-side to create unique SEO tags
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = getSupabase();

  try {
    const { data: poll } = await supabase
      .from('polls')
      .select('title, description')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (poll) {
      return {
        title: `${poll.title} | Community Polls`,
        description: poll.description || `Vote on this community poll: ${poll.title}. Share your voice on issues that matter to Prosper.`,
        openGraph: {
          title: `${poll.title} | Doug Charles for Prosper Town Council`,
          description: poll.description || `Vote on this community poll: ${poll.title}`,
          url: `https://www.dougcharles.com/polls/${id}`,
        },
      };
    }
  } catch (error) {
    // Fall back to default metadata
  }

  return {
    title: 'Community Poll | Doug Charles for Prosper Town Council',
    description: 'Share your voice on issues that matter to Prosper through community polls.',
  };
}

export default function PollDetailPage({ params }) {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden">
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
            Poll Results
          </h1>
          <p className="text-lg text-white/90">
            See how the community has responded
          </p>
        </div>
      </section>

      <PollDetailDynamic pollId={params.id} />
    </div>
  );
}
