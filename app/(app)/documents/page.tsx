// Server Component
import { listDocuments } from '@/lib/api';
import { DocumentsWorkspace } from '@/components/documents/DocumentsWorkspace';

export const metadata = {
  title: 'Documents · Chat with PDF',
  description: 'Manage and chat with uploaded PDF documents',
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10) || 1;

  const { documents, pagination } = await listDocuments(page, 10);

  return (
    <div className="flex-1 w-full bg-zinc-50">
      <DocumentsWorkspace documents={documents} pagination={pagination} />
    </div>
  );
}
