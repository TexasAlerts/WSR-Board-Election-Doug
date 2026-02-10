// Server Component - Fetches endorsements and Q&A on server for better LCP
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

async function getHomeData() {
  const supabase = getSupabase();

  // During build time, Supabase might not be available
  if (!supabase) {
    return {
      endorsements: [],
      questions: [],
    };
  }

  try {
    // Fetch approved endorsements with messages (limit 4 for homepage)
    const { data: endorsements } = await supabase
      .from('endorsements')
      .select('id, name, message, created_at')
      .eq('status', 'approved')
      .not('message', 'is', null)
      .neq('message', '')
      .order('created_at', { ascending: false })
      .limit(4);

    // Fetch approved questions with answers (limit 3 for homepage)
    const { data: questions } = await supabase
      .from('questions')
      .select('id, question, answer, name, created_at')
      .eq('status', 'approved')
      .not('answer', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3);

    return {
      endorsements: endorsements || [],
      questions: questions || [],
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return {
      endorsements: [],
      questions: [],
    };
  }
}

export default async function HomeServer() {
  const { endorsements, questions } = await getHomeData();

  // Don't render anything if no data
  if (questions.length === 0 && endorsements.length === 0) {
    return null;
  }

  return (
    <>
      {/* Q&A Preview Section */}
      {questions.length > 0 && (
        <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="icon-container">
                  <HelpCircle className="w-8 h-8 text-navy" aria-hidden="true" />
                </div>
              </div>
              <h2 className="section-title">Questions & Answers</h2>
              <p className="section-subtitle">Direct answers from Doug on the issues that matter</p>
            </div>

            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="card">
                  <h3 className="font-semibold text-navy text-lg mb-3">{q.question}</h3>
                  <p className="text-gray-700 leading-relaxed">{q.answer}</p>
                  <p className="text-sm text-gray-700 mt-3">— Asked by {q.name}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 space-y-4">
              <Link href="/qna" className="btn-outline">
                View All Q&A
              </Link>
              <p className="text-gray-600 text-sm">
                Have a question?{' '}
                <Link href="/qna" className="text-navy font-medium hover:underline">
                  Submit yours
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Endorsements Preview - Enhanced */}
      {endorsements.length > 0 && (
        <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 accent-line-full"></div>

          <div className="max-w-4xl mx-auto">
            <h2 className="section-title text-center mb-4">Community Support</h2>
            <p className="section-subtitle text-center">Hear from your neighbors</p>

            <div className="grid gap-6 md:grid-cols-2 mt-8">
              {endorsements.map((e) => (
                <div key={e.id} className="card h-full">
                  <div className="quote-enhanced mb-4">
                    <p className="text-gray-700 not-italic">&ldquo;{e.message}&rdquo;</p>
                  </div>
                  <p className="font-semibold text-navy flex items-center gap-3">
                    <span className="w-10 h-10 bg-gradient-to-br from-navy to-navy-light rounded-full flex items-center justify-center text-sm text-white font-bold shadow-sm">
                      {e.name.charAt(0)}
                    </span>
                    {e.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/endorsements" className="btn-outline">
                View All Endorsements
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
