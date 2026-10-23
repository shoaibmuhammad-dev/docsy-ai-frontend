// Server Component
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Chat with PDF · Intelligent document analysis with page citations',
  description:
    'Upload PDFs and chat with an AI assistant with clickable citation markers, split-screen PDF reader, and real-time streaming.',
  openGraph: {
    title: 'Chat with PDF',
    description:
      'Upload PDFs and chat with an AI assistant with clickable citation markers, split-screen PDF reader, and real-time streaming.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chat with PDF',
    description:
      'Upload PDFs and chat with an AI assistant with clickable citation markers, split-screen PDF reader, and real-time streaming.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-[14px] text-zinc-900 bg-zinc-50 antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
