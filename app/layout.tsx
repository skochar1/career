import "../styles/global.css";
import { BodyHydrationFix } from "../components/bodyhydration"; // adjust if needed

/**
 * RootLayout wraps all pages in the application.
 */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans antialiased text-black">
        <BodyHydrationFix />
        {children}
      </body>
    </html>
  );
}
