import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider/theme-provider";
import Providers from "./providers";
import { ChatBot } from "@/components/chat-bot";
import { Analytics } from '@vercel/analytics/next';
import NextTopLoader from 'nextjs-toploader';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sumit Kumar | GenAI Full Stack Architect",
  description: "Premium AI Engineer portfolio showcasing scalable Enterprise AI, RAG platforms, and modern Full Stack architecture.",
  keywords: ["GenAI Engineer", "Full Stack AI Developer", "Multi-Agent Engineer", "RAG Engineer", "AI Full Stack Developer"],
  openGraph: {
    title: "Sumit Kumar | GenAI Full Stack Architect",
    description: "Premium AI Engineer portfolio showcasing scalable Enterprise AI, RAG platforms, and modern Full Stack architecture.",
    type: "website",
    url: "https://my-portfolio-six-gold-86.vercel.app/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sumit Kumar | GenAI Full Stack Architect",
    description: "Premium AI Engineer portfolio showcasing scalable Enterprise AI, RAG platforms, and modern Full Stack architecture.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sumit Kumar",
  jobTitle: "GenAI Full Stack Architect",
  url: "https://my-portfolio-six-gold-86.vercel.app/",
  sameAs: [
    "https://github.com/sumit0593",
    "https://linkedin.com/in/sumit0593"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader
              color="hsl(var(--primary))"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
              zIndex={1600}
            />
            {children}
            <ChatBot />
            <Analytics />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}