# Chat with PDF

A production-grade Next.js App Router application for uploading PDFs and chatting with documents using streaming markdown answers, verified page-level clickable citations, and a synchronized PDF reading panel.

## Features

- **Split-Screen Workspace**: Chat panel and synchronized PDF viewer with draggable divider (desktop) or segmented tabs (mobile/tablet).
- **Interactive Citation Pills**: Clicking `[1]`, `[2]`, or Sources chips smoothly scrolls the PDF viewer to the exact page and pulses a citation highlight ring for 2 seconds.
- **Real-Time Streaming**: Server-Sent Events (SSE) route handler streaming tokens token-by-token with live markdown rendering, blinking caret, and AbortController stop support.
- **Documents Dashboard**: Drag-and-drop PDF upload with progress animation, quota enforcement (5 documents limit), multi-select document comparison, and background processing status polling.
- **Zero-Dependency Mock Architecture**: Everything persists in memory via `globalThis` in `lib/api.ts`, making it easy to swap in real endpoints.
- **Collapsible Dev Toolbar**: Floating controls to test slow networks (2.5s simulated latency), trigger errors, expire cookies, preview empty states, and reset data.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## File Structure

```
├── app/
│   ├── (app)/
│   │   ├── chats/[chatId]/
│   │   │   ├── loading.tsx               # 3-zone chat workspace loading skeleton
│   │   │   └── page.tsx                  # Server Component loading thread + docs
│   │   ├── documents/
│   │   │   ├── loading.tsx               # Table rows skeleton
│   │   │   └── page.tsx                  # Server Component with paginated docs
│   │   ├── error.tsx                     # Error boundary with retry button
│   │   └── layout.tsx                    # Protected app shell (checks session cookie)
│   ├── (auth)/
│   │   ├── login/page.tsx                # Sign in card with error banner
│   │   └── signup/page.tsx               # Sign up with password complexity hints
│   ├── actions/
│   │   ├── auth.ts                       # Server Actions: login, signup, logout
│   │   ├── chats.ts                      # Server Actions: createChat, deleteChat
│   │   ├── dev.ts                        # Server Actions: dev toolbar mock toggles
│   │   └── documents.ts                  # Server Actions: upload, deleteDocument
│   ├── api/
│   │   └── chats/[chatId]/messages/
│   │       └── route.ts                  # SSE Streaming Route Handler
│   ├── globals.css                       # Tailwind import only
│   ├── layout.tsx                        # Root layout with Inter font
│   ├── not-found.tsx                     # 404 handler
│   └── page.tsx                          # Landing page with interactive preview
├── components/
│   ├── auth/                             # LoginForm, SignupForm (useActionState)
│   ├── chat/                             # ChatWorkspace, ChatSidebar, MessageItem,
│   │                                     # CitationPill, MarkdownContent, MessageComposer
│   ├── dev/                              # DevToolbar (collapsible testing controls)
│   ├── documents/                        # DocumentsWorkspace, UploadDropzone,
│   │                                     # DocumentRow, MultiSelectActionBar, Poller
│   ├── layout/                           # AppHeader with user profile dropdown
│   ├── pdf/                              # PdfViewer (strict props contract)
│   └── ui/                               # Button, Field, Badge, Card, Modal,
│                                         # ConfirmDialog, DropdownMenu, Toast,
│                                         # Skeleton, Spinner, EmptyState
├── hooks/
│   ├── useChatStream.ts                  # SSE ReadableStream consumer with abort
│   └── useMediaQuery.ts                  # Responsive window breakpoint detection
└── lib/
    ├── api.ts                            # Server-only data access layer (mock)
    ├── format.ts                         # Relative time, date, and file size helpers
    ├── mock-data.ts                      # Seed documents and multi-turn chats
    ├── session.ts                        # Next.js cookies session helpers
    ├── types.ts                          # Exact TypeScript API contracts
    └── utils.ts                          # clsx and tailwind-merge helper
```

---

## Connecting Your Real Backend & APIs

Every mock call is isolated and labeled with the exact REST endpoint it replaces. Below are the specific files to update:

### 1. Data Access Layer (`lib/api.ts`)
Replace the in-memory `globalThis` store in `lib/api.ts` with calls to your backend:
- `signup()` &rarr; `POST /auth/signup`
- `login()` &rarr; `POST /auth/login`
- `getCurrentUser()` &rarr; `GET /auth/me`
- `listDocuments()` &rarr; `GET /documents`
- `getDocument(id)` &rarr; `GET /documents/:id`
- `createDocument(file)` &rarr; `POST /documents` (multipart upload or presigned URL)
- `deleteDocument(id)` &rarr; `DELETE /documents/:id`
- `getDocumentFileUrl(id)` &rarr; `GET /documents/:id/url`
- `listChats()` &rarr; `GET /chats`
- `createChat(documentIds)` &rarr; `POST /chats`
- `getChat(id)` &rarr; `GET /chats/:id`
- `deleteChat(id)` &rarr; `DELETE /chats/:id`

### 2. Streaming Route Handler (`app/api/chats/[chatId]/messages/route.ts`)
Replace the simulated word-delay generator with your real LLM / RAG streaming endpoint (e.g. proxying to your backend or embedding pipeline). Forward the `ReadableStream` chunks with `event: token` and `event: done`.

### 3. PDF Viewer (`components/pdf/PdfViewer.tsx`)
As documented in the file comment (`// REPLACE INTERNALS WITH react-pdf, KEEP THIS PROPS CONTRACT`), keep the exact props contract:
```typescript
interface PdfViewerProps {
  fileUrl: string;
  pageCount: number;
  currentPage: number;
  highlightPage?: number;
  onPageChange: (page: number) => void;
}
```
Replace the simulated A4 page rectangles with `<Document file={fileUrl}>` and `<Page pageNumber={...}>` from `react-pdf` or your preferred WebViewer canvas.

### 4. Authentication Session (`lib/session.ts` and `app/actions/auth.ts`)
Replace the plain `"mock-token"` cookie with your real JWT/session token or OAuth session validation.
# docsy-ai-frontend
