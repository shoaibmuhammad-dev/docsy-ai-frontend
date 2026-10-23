// Client Component (accessible drag-and-drop file upload with progress and validation)
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadDocumentAction } from '@/app/actions/documents';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { FiUploadCloud, FiFile, FiAlertCircle, FiCheck } from 'react-icons/fi';

interface UploadDropzoneProps {
  currentCount: number;
  maxCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function UploadDropzone({
  currentCount,
  maxCount = 5,
  isOpen = true,
  onClose,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const isLimitReached = currentCount >= maxCount;

  const validateAndUpload = async (file: File) => {
    setErrorMessage(null);

    if (isLimitReached) {
      setErrorMessage(
        `Upload disabled: you have reached the maximum allowance of ${maxCount} documents. Delete an existing document to upload a new one.`
      );
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Invalid file type: Only PDF documents (.pdf) are supported.');
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(
        `File exceeds 10 MB limit (${sizeMB} MB). Please choose a smaller document.`
      );
      return;
    }

    // Start simulated upload progress
    setUploadFileName(file.name);
    setUploadProgress(15);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    try {
      const res = await uploadDocumentAction({
        name: file.name,
        size: file.size,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.success) {
        toast({
          type: 'success',
          title: 'Document uploaded',
          description: `"${file.name}" is now processing text vectors and citations.`,
        });
        setTimeout(() => {
          setUploadProgress(null);
          setUploadFileName('');
          router.refresh();
          onClose?.();
        }, 600);
      } else {
        setUploadProgress(null);
        setErrorMessage(res.error || 'Upload failed');
        toast({
          type: 'error',
          title: 'Upload failed',
          description: res.error,
        });
      }
    } catch {
      clearInterval(progressInterval);
      setUploadProgress(null);
      setErrorMessage('A network error occurred during upload.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLimitReached) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLimitReached) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLimitReached && uploadProgress === null && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (
            (e.key === 'Enter' || e.key === ' ') &&
            !isLimitReached &&
            uploadProgress === null
          ) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        tabIndex={isLimitReached || uploadProgress !== null ? -1 : 0}
        role="button"
        aria-label="Upload PDF file dropzone"
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
          isLimitReached
            ? 'bg-zinc-100/70 border-zinc-300 opacity-80 cursor-not-allowed'
            : isDragging
            ? 'border-indigo-600 bg-indigo-50/60 scale-[0.99]'
            : 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/60 cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLimitReached || uploadProgress !== null}
        />

        {uploadProgress !== null ? (
          <div className="w-full max-w-sm flex flex-col items-center text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              {uploadProgress === 100 ? (
                <FiCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <FiFile className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900 truncate max-w-xs">
                {uploadFileName}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {uploadProgress < 100 ? `Uploading document (${uploadProgress}%)` : 'Processing initial headers...'}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-200 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                isLimitReached
                  ? 'bg-zinc-200 text-zinc-400'
                  : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
              }`}
            >
              <FiUploadCloud className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-900">
                {isLimitReached ? (
                  'Upload limit reached (5 of 5 documents)'
                ) : (
                  <>
                    <span className="text-indigo-600 hover:underline">
                      Click to upload
                    </span>{' '}
                    or drag and drop PDF here
                  </>
                )}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {isLimitReached
                  ? 'Free tier quota: delete an existing document to upload another.'
                  : 'PDF up to 10 MB and 100 pages maximum.'}
              </p>
            </div>

            {!isLimitReached && (
              <span className="inline-flex text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
                Press Enter or click to browse
              </span>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700"
        >
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
