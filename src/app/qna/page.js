import Image from 'next/image';
import Script from 'next/script';
import QnaDynamic from '../../components/QnaDynamic';
import { getSupabase } from '../../lib/supabase';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dougcharles.com' },
    { '@type': 'ListItem', position: 2, name: 'Q&A', item: 'https://www.dougcharles.com/qna' },
  ],
};

export const metadata = {
  title: 'Q&A with Doug - Doug Charles, Prosper Town Council Place 5',
  description:
    'Ask Doug Charles questions about his positions, priorities, and vision for Prosper\'s future. Get direct, honest answers from your incoming Place 5 Town Council member.',
  alternates: { canonical: '/qna' },
  openGraph: {
    title: 'Q&A with Doug - Doug Charles, Prosper Town Council Place 5',
    description: 'Ask Doug Charles questions about his positions, priorities, and vision for Prosper\'s future. Get direct, honest answers from your incoming Place 5 Town Council member.',
    url: 'https://www.dougcharles.com/qna',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: 'https://www.dougcharles.com/dc-preview.webp',
      width: 1200,
      height: 630,
      alt: 'Q&A with Doug Charles — Prosper Town Council'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Q&A with Doug - Doug Charles, Prosper Town Council Place 5',
    description: 'Ask Doug Charles questions about his positions, priorities, and vision for Prosper\'s future.',
    images: ['https://www.dougcharles.com/dc-preview.webp'],
  },
};

// Enable ISR with 60 second revalidation for fresh Q&A data
export const revalidate = 60;

// Server component that fetches questions data
async function getQuestions() {
  const supabase = getSupabase();

  // Return empty during build when Supabase isn't available
  // ISR will fetch real data on first request
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('questions')
      .select('id, name, question, answer, created_at')
      .eq('status', 'approved')
      .not('answer', 'is', null)
      .neq('answer', '')
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

export default async function QnAPage() {
  const initialQuestions = await getQuestions();

  // Generate FAQ JSON-LD structured data
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: initialQuestions.slice(0, 20).map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
        dateCreated: q.created_at,
        author: {
          '@type': 'Person',
          name: 'Doug Charles',
          url: 'https://www.dougcharles.com',
        },
      },
    })),
  };

  return (
    <div className="space-y-0">
      {/* Breadcrumb JSON-LD */}
      <Script id="qna-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* JSON-LD structured data for Q&A */}
      {initialQuestions.length > 0 && (
        <Script
          id="qna-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        {/* Logo accent */}
        <Image
          src="/dc-logo.webp"
          alt=""
          aria-hidden="true"
          width={96}
          height={64}
          sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 144px"
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-4">
            Questions & Answers
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question about my <strong className="text-navy">positions</strong> or <strong className="text-navy">priorities</strong>? Ask here and I'll respond publicly.
          </p>
        </div>
      </section>

      <QnaDynamic initialQuestions={initialQuestions} />
    </div>
  );
}
