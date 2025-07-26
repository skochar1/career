import "../styles/global.css";

/**
 * RootLayout wraps all pages in the application.
 */

export const metadata = {
  title: 'JobSearch - Find Your Next Opportunity',
  description: 'Discover your next career opportunity with personalized job recommendations',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
