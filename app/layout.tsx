import "../styles/global.css";

/**
 * RootLayout wraps all pages in the application.
 * Make sure the body background matches your Figma/wireframe color.
 */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans antialiased text-black">
        {children}
      </body>
    </html>
  );
}