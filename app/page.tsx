// Server Component
import Link from 'next/link';
import { hasValidSession } from '@/lib/session';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CitationPill } from '@/components/chat/CitationPill';
import {
  FiFileText,
  FiArrowRight,
  FiMessageSquare,
  FiShield,
  FiTarget,
  FiCheck,
} from 'react-icons/fi';

export const metadata = {
  title: 'Chat with PDF · Intelligent document analysis with page citations',
  description:
    'Upload PDFs and chat with an AI assistant with clickable citation markers, split-screen PDF reader, and real-time streaming.',
};

export default async function LandingPage() {
  const isAuthenticated = await hasValidSession();
  const primaryHref = isAuthenticated ? '/documents' : '/signup';
  const demoHref = isAuthenticated ? '/chats/chat-1' : '/login';

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900">
      {/* Top Bar Contract: Brand, Nav links, Action */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-zinc-900 font-semibold text-sm hover:opacity-85 transition-opacity whitespace-nowrap shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <FiFileText className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold tracking-tight">Chat with PDF</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600">
            <a href="#features" className="hover:text-zinc-900 transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#preview" className="hover:text-zinc-900 transition-colors whitespace-nowrap shrink-0">
              Interactive Preview
            </a>
            <a href="#security" className="hover:text-zinc-900 transition-colors whitespace-nowrap shrink-0">
              Privacy & Security
            </a>
            <Link href={demoHref} className="hover:text-zinc-900 transition-colors whitespace-nowrap shrink-0">
              Live Demo
            </Link>
          </nav>

          {/* Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <Link href="/documents">
                <Button variant="primary" size="sm" rightIcon={<FiArrowRight className="w-3.5 h-3.5" />}>
                  Go to Documents
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm" rightIcon={<FiArrowRight className="w-3.5 h-3.5" />}>
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-14 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span>Real-time semantic retrieval with page-level citations</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
          Chat with any PDF document, backed by verified page citations
        </h1>

        <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Upload research surveys, lease contracts, and dense reports. Ask plain-language questions and inspect answers with clickable citation pills that snap your PDF directly to the source.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={primaryHref} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto text-sm px-6 py-3"
              rightIcon={<FiArrowRight className="w-4 h-4" />}
            >
              Start chatting free
            </Button>
          </Link>
          <Link href={demoHref} className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto text-sm px-6 py-3"
            >
              Explore sample contract demo
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <FiCheck className="w-4 h-4 text-emerald-600" />
            <span>No credit card required</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <FiCheck className="w-4 h-4 text-emerald-600" />
            <span>Up to 100 pages per PDF</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <FiCheck className="w-4 h-4 text-emerald-600" />
            <span>Multi-document cross-examination</span>
          </span>
        </div>
      </section>

      {/* Static Preview Section (Built from real UI components) */}
      <section id="preview" className="px-4 sm:px-6 pb-20 max-w-6xl mx-auto w-full">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
          {/* Mock Window Header */}
          <div className="h-11 bg-zinc-100 border-b border-zinc-200 px-4 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <span className="ml-3 font-semibold text-zinc-800">
                Deep Learning & Transformer Survey 2025.pdf
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200 text-[10px]">
                Ready (34 pages)
              </span>
            </div>
          </div>

          {/* Split View Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Chat side (7 cols) */}
            <div className="lg:col-span-7 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-200 bg-zinc-50/40 space-y-4">
              <div className="space-y-4">
                {/* User Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-md rounded-2xl rounded-tr-xs bg-indigo-600 text-white px-4 py-2.5 shadow-xs text-xs sm:text-sm">
                    What are the key breakthroughs in linear attention mechanisms discussed in Section 3?
                  </div>
                </div>

                {/* Assistant Bubble */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs text-xs sm:text-sm text-zinc-800 space-y-3">
                  <p className="leading-relaxed">
                    Section 3 highlights sub-quadratic variants that mitigate the traditional memory bottleneck{' '}
                    <CitationPill index={1} citation={{ index: 1, docId: 'doc-1', chunkId: '1', page: 7 }} />.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>
                      <strong>State Space Model Hybrids</strong>: Combining structured matrices with selective gating{' '}
                      <CitationPill index={1} citation={{ index: 1, docId: 'doc-1', chunkId: '1', page: 7 }} />.
                    </li>
                    <li>
                      <strong>Hardware-Aware Chunking</strong>: Block-diagonal computations directly on GPU SRAM{' '}
                      <CitationPill index={2} citation={{ index: 2, docId: 'doc-1', chunkId: '2', page: 9 }} />.
                    </li>
                  </ul>
                  <div className="pt-2 border-t border-zinc-100 flex items-center gap-2 flex-wrap text-xs text-zinc-500">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase">Sources:</span>
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-lg border border-zinc-200">
                      [1] Page 7
                    </span>
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-lg border border-zinc-200">
                      [2] Page 9
                    </span>
                  </div>
                </div>
              </div>

              {/* Mock Composer */}
              <div className="relative border border-zinc-200 rounded-xl bg-white p-2.5 flex items-center justify-between text-xs text-zinc-400">
                <span>Ask anything about Transformer Survey...</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <FiArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* PDF side (5 cols) */}
            <div className="lg:col-span-5 bg-zinc-100/90 p-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-xs bg-white rounded-xl shadow-lg border border-zinc-200 p-5 space-y-4 ring-2 ring-indigo-600 ring-offset-2">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase">
                    Cited Page 7
                  </span>
                  <span className="text-[10px] text-zinc-400">Section 3.1 Linear Attention</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-zinc-800 rounded" />
                  <div className="h-2 w-full bg-zinc-200 rounded" />
                  <div className="h-2 w-full bg-zinc-200 rounded" />
                  <div className="h-2 w-4/5 bg-zinc-200 rounded" />
                </div>
                <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg space-y-1.5">
                  <div className="h-2 w-1/3 bg-indigo-300 rounded" />
                  <div className="h-2 w-full bg-indigo-200 rounded" />
                  <div className="h-2 w-2/3 bg-indigo-200 rounded" />
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Deep Learning Survey</span>
                  <span>Page 7 of 34</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-16 px-4 sm:px-6 bg-white border-y border-zinc-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Engineered for precision and document transparency
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500">
              No hallucinations left unchecked. Trace every synthesized word to the original source page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="p-6 space-y-4 shadow-xs hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <FiMessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900">
                Ask in plain language
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Zero prompt engineering needed. Query complex terminology, ask for quantitative comparisons, or request concise bullet summaries from dense 100-page documents.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 space-y-4 shadow-xs hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <FiTarget className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900">
                Answers with page citations
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Interactive citation pills in markdown answers jump directly to cited pages. The split-screen PDF reader pulses and highlights exact target pages automatically.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card id="security" className="p-6 space-y-4 shadow-xs hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <FiShield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900">
                Private & secure
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Your contracts, resumes, and proprietary filings are isolated to your authenticated account. Files are never used for public model training.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="mt-auto py-10 px-4 sm:px-6 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium text-zinc-700">
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white text-[10px]">
              <FiFileText className="w-3 h-3" />
            </div>
            <span>Chat with PDF</span>
            <span className="text-zinc-400 font-normal">· Clean document intelligence</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-zinc-900 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-zinc-900 transition-colors">
              Register
            </Link>
            <Link href={demoHref} className="hover:text-zinc-900 transition-colors">
              Live Demo
            </Link>
          </div>

          <div className="text-zinc-400">
            &copy; {new Date().getFullYear()} Chat with PDF. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
