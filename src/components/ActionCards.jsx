'use client';

import Link from 'next/link';

const actionCards = [
  {
    id: 'updates',
    icon: '📬',
    title: 'Stay Informed',
    description: 'Get campaign news and updates delivered to your inbox',
  },
  {
    id: 'yardsign',
    icon: '🏠',
    title: 'Request a Yard Sign',
    description: 'Show your support in your neighborhood',
  },
  {
    id: 'volunteer',
    icon: '🤝',
    title: 'Volunteer Your Time',
    description: 'Help with door-knocking, calls, and events',
  },
  {
    id: 'meeting',
    icon: '☕',
    title: 'Meet with Doug',
    description: "Schedule a conversation about Prosper's future",
  },
  {
    id: 'endorsement',
    icon: '✓',
    title: 'Endorse Doug',
    description: 'Add your name to the list of supporters',
  },
  {
    id: 'donate',
    icon: '💪',
    title: 'Make a Donation',
    description: 'Help us reach more voters',
    isLink: true,
    href: '/donate',
  },
];

export default function ActionCards({ selectedAction, onCardClick }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {actionCards.map((card) =>
        card.isLink ? (
          <Link
            key={card.id}
            href={card.href}
            className="card h-full text-center cursor-pointer transition-all duration-300 hover:shadow-navy-lg active:scale-[0.98] border-2 border-transparent p-4 sm:p-6"
          >
            <div className="icon-container mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14">
              <span className="text-xl sm:text-2xl">{card.icon}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-navy mb-1 sm:mb-2">
              {card.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-snug">{card.description}</p>
          </Link>
        ) : (
          <button
            key={card.id}
            type="button"
            onClick={() => onCardClick(card)}
            className={`card h-full w-full text-center cursor-pointer transition-all duration-300 hover:shadow-navy-lg active:scale-[0.98] border-2 p-4 sm:p-6 ${
              selectedAction === card.id
                ? 'border-navy bg-navy/5 shadow-navy-md'
                : 'border-transparent'
            }`}
          >
            <div className="icon-container mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14">
              <span className="text-xl sm:text-2xl">{card.icon}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-navy mb-1 sm:mb-2">
              {card.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-snug">{card.description}</p>
          </button>
        )
      )}
    </div>
  );
}
