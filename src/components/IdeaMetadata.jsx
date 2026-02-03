'use client';

const CATEGORIES = [
  { value: 'infrastructure', label: 'Infrastructure', icon: '🛣️' },
  { value: 'community', label: 'Community', icon: '🏘️' },
  { value: 'safety', label: 'Safety', icon: '🛡️' },
  { value: 'environment', label: 'Environment', icon: '🌳' },
  { value: 'general', label: 'General', icon: '📝' },
  { value: 'question', label: 'Questions', icon: '❓' },
];

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  under_review: 'bg-blue-100 text-blue-700',
  planned: 'bg-purple-100 text-purple-700',
  completed: 'bg-navy/10 text-navy',
  declined: 'bg-red-100 text-red-700',
};

export default function IdeaMetadata({ idea }) {
  const categoryInfo = CATEGORIES.find((c) => c.value === idea.category) || CATEGORIES[4];

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium capitalize">
          {categoryInfo.icon} {categoryInfo.label}
        </span>
        <span
          className={`px-3 py-1 text-sm rounded-full font-medium capitalize ${STATUS_COLORS[idea.status] || 'bg-gray-100 text-gray-600'}`}
        >
          {idea.status.replace('_', ' ')}
        </span>
      </div>
      <span className="text-sm text-gray-500">
        {new Date(idea.created_at).toLocaleDateString()}
      </span>
    </div>
  );
}
