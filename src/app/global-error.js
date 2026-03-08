'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ color: '#1B2A4A', fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              We encountered an unexpected error. Please try again.
            </p>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#1B2A4A',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
