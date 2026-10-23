// Server Component
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FiFileText, FiArrowLeft } from 'react-icons/fi';

export const metadata = {
  title: 'Page Not Found · Chat with PDF',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 text-center">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
        <FiFileText className="w-6 h-6" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
        404 Error
      </span>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Page not found</h1>
      <p className="text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed">
        The document, chat thread, or page you were looking for doesn&apos;t exist or has been removed.
      </p>

      <Link href="/documents">
        <Button variant="primary" size="md" leftIcon={<FiArrowLeft className="w-4 h-4" />}>
          Back to Documents
        </Button>
      </Link>
    </div>
  );
}
