import "../styles/global.css";

/**
 * RootLayout wraps all pages in the application.  Importing our global
 * stylesheet here ensures that Tailwind and custom CSS variables defined
 * in `styles/global.css` are applied across the entire site.  Without
 * this import the pages render without styling, which was the cause of
 * the unstyled page the user reported.  The body element is given
 * sensible defaults for background and text colour using CSS variables
 * defined in the global stylesheet.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}