/**
 * Skeleton loading components for CLS optimization
 * Shows placeholder UI while content loads
 */

/**
 * Card skeleton for Q&A and endorsement cards
 * @returns {React.JSX.Element}
 */
export function CardSkeleton() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/4 mt-4"></div>
    </div>
  );
}

/**
 * Endorsement card skeleton with avatar
 * @returns {React.JSX.Element}
 */
export function EndorsementSkeleton() {
  return (
    <div className="card h-full animate-pulse" aria-hidden="true">
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
}

/**
 * Home page skeleton with Q&A and endorsement sections
 * @returns {React.JSX.Element}
 */
export function HomeSkeleton() {
  return (
    <div role="status" aria-label="Loading content">
      <span className="sr-only">Loading...</span>

      {/* Q&A Section Skeleton */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-300"></div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-80 mx-auto"></div>
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="h-12 bg-gray-200 rounded-lg w-40 mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Endorsements Section Skeleton */}
      <section className="priorities-gradient -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-300"></div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-56 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <EndorsementSkeleton key={i} />
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="h-12 bg-gray-200 rounded-lg w-48 mx-auto"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
