import type { Metadata } from "next";
import "./globals.css";
import { Sidebar, Header, MobileNav } from "@/components/layout";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AI Designer - Engineering Design Platform",
  description: "AI-powered design platform for engineering construction buildings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased">
        <Providers>
          <div className="min-h-screen">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex gap-6">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block flex-shrink-0">
                  <Sidebar />
                </div>

                {/* Main Content */}
                <main className="flex-1 min-w-0 space-y-5">
                  <Header />
                  {children}
                </main>
              </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
