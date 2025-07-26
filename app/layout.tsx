import "../styles/global.css";

/**
 * RootLayout wraps all pages in the application.
 */

export const metadata = {
  title: 'JobSearch - Find Your Next Opportunity',
  description: 'Discover your next career opportunity with personalized job recommendations',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
