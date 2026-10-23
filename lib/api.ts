import 'server-only';
import {
  User,
  PdfDocument,
  Pagination,
  Chat,
  Message,
  ApiError,
} from './types';
import {
  initialUser,
  initialDocuments,
  initialChats,
  initialMessages,
} from './mock-data';

interface DevFlags {
  slowNetwork: boolean;
  failNextRequest: boolean;
  forceEmptyState: boolean;
  forceStreamError: boolean;
}

interface MockStore {
  user: User;
  documents: PdfDocument[];
  chats: Chat[];
  messages: Record<string, Message[]>;
  devFlags: DevFlags;
}

declare global {
  var __CHAT_WITH_PDF_STORE__: MockStore | undefined;
}

function getStore(): MockStore {
  if (!globalThis.__CHAT_WITH_PDF_STORE__) {
    globalThis.__CHAT_WITH_PDF_STORE__ = {
      user: { ...initialUser },
      documents: JSON.parse(JSON.stringify(initialDocuments)),
      chats: JSON.parse(JSON.stringify(initialChats)),
      messages: JSON.parse(JSON.stringify(initialMessages)),
      devFlags: {
        slowNetwork: false,
        failNextRequest: false,
        forceEmptyState: false,
        forceStreamError: false,
      },
    };
  }
  return globalThis.__CHAT_WITH_PDF_STORE__;
}

function checkAndAutoAdvanceDocuments(store: MockStore) {
  const now = Date.now();
  store.documents.forEach((doc) => {
    if (doc.status === 'processing') {
      const createdTime = new Date(doc.createdAt).getTime();
      if (now - createdTime >= 6000) {
        if (doc.title.toLowerCase().includes('fail')) {
          doc.status = 'failed';
          doc.errorMessage = 'Document parsing failed: file structure corrupted or exceeds limits';
        } else {
          doc.status = 'ready';
        }
      }
    }
  });
}

async function simulateLatency(): Promise<void> {
  const store = getStore();

  if (store.devFlags.failNextRequest) {
    store.devFlags.failNextRequest = false;
    throw new ApiError('Simulated request failure from dev toolbar');
  }

  const min = store.devFlags.slowNetwork ? 2000 : 300;
  const max = store.devFlags.slowNetwork ? 3000 : 700;
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

// Dev toolbar flags helpers
export async function getDevFlags(): Promise<DevFlags> {
  return { ...getStore().devFlags };
}

export async function setDevFlag(flag: keyof DevFlags, value: boolean): Promise<DevFlags> {
  const store = getStore();
  store.devFlags[flag] = value;
  return { ...store.devFlags };
}

export async function resetAllMockData(): Promise<void> {
  globalThis.__CHAT_WITH_PDF_STORE__ = {
    user: { ...initialUser },
    documents: JSON.parse(JSON.stringify(initialDocuments)),
    chats: JSON.parse(JSON.stringify(initialChats)),
    messages: JSON.parse(JSON.stringify(initialMessages)),
    devFlags: {
      slowNetwork: false,
      failNextRequest: false,
      forceEmptyState: false,
      forceStreamError: false,
    },
  };
}

// POST /auth/signup
export async function signup(
  name: string,
  email: string,
  password: string
): Promise<User> {
  await simulateLatency();

  const fieldErrors: Record<string, string[]> = {};
  if (!name || name.trim().length < 2) {
    fieldErrors.name = ['Name must be at least 2 characters'];
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = ['Enter a valid email address'];
  }
  if (!password || password.length < 8 || password.length > 72) {
    fieldErrors.password = ['Password must be between 8 and 72 characters'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new ApiError('Validation failed', fieldErrors);
  }

  const store = getStore();
  store.user = {
    id: `usr-${Date.now().toString(36)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
  };

  return { ...store.user };
}

// POST /auth/login
export async function login(email: string, password: string): Promise<User> {
  await simulateLatency();

  const fieldErrors: Record<string, string[]> = {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = ['Enter a valid email address'];
  }
  if (!password) {
    fieldErrors.password = ['Password is required'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new ApiError('Validation failed', fieldErrors);
  }

  // Realistic check: if wrong email/password
  if (password === 'wrong' || password === 'invalid') {
    throw new ApiError('Incorrect email or password');
  }

  const store = getStore();
  // Update mock user email
  store.user.email = email.trim().toLowerCase();
  return { ...store.user };
}

// GET /auth/me
export async function getCurrentUser(): Promise<User> {
  await simulateLatency();
  const store = getStore();
  return { ...store.user };
}

// GET /documents
export async function listDocuments(
  page = 1,
  limit = 10
): Promise<{ documents: PdfDocument[]; pagination: Pagination }> {
  await simulateLatency();
  const store = getStore();
  checkAndAutoAdvanceDocuments(store);

  if (store.devFlags.forceEmptyState) {
    return {
      documents: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 1,
      },
    };
  }

  const total = store.documents.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const paginatedDocs = store.documents.slice(startIndex, startIndex + limit);

  return {
    documents: JSON.parse(JSON.stringify(paginatedDocs)),
    pagination: {
      page: currentPage,
      limit,
      total,
      totalPages,
    },
  };
}

// GET /documents/:id
export async function getDocument(id: string): Promise<PdfDocument> {
  await simulateLatency();
  const store = getStore();
  checkAndAutoAdvanceDocuments(store);

  const doc = store.documents.find((d) => d.id === id);
  if (!doc) {
    throw new ApiError('Document not found');
  }
  return JSON.parse(JSON.stringify(doc));
}

// POST /documents
export async function createDocument(file: {
  name: string;
  size: number;
}): Promise<PdfDocument> {
  await simulateLatency();
  const store = getStore();
  checkAndAutoAdvanceDocuments(store);

  // Maximum 5 documents per user
  if (store.documents.length >= 5) {
    throw new ApiError(
      'Document limit reached (5 of 5). Please delete an existing document to upload a new one.'
    );
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new ApiError('File exceeds maximum size of 10 MB');
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    throw new ApiError('Only PDF files are supported');
  }

  const newDocId = `doc-${Date.now().toString(36)}`;
  const isFailFile = file.name.toLowerCase().includes('fail');
  const pageCount = isFailFile ? 112 : Math.floor(Math.random() * 25) + 3;

  const newDoc: PdfDocument = {
    id: newDocId,
    title: file.name,
    status: 'processing',
    pageCount,
    createdAt: new Date().toISOString(),
  };

  store.documents.unshift(newDoc);

  // Auto transition to ready or failed after 6 seconds
  setTimeout(() => {
    const docToUpdate = store.documents.find((d) => d.id === newDocId);
    if (docToUpdate && docToUpdate.status === 'processing') {
      if (isFailFile) {
        docToUpdate.status = 'failed';
        docToUpdate.errorMessage =
          'This PDF has 112 pages. The maximum allowed is 100 pages.';
      } else {
        docToUpdate.status = 'ready';
      }
    }
  }, 6000);

  return JSON.parse(JSON.stringify(newDoc));
}

// DELETE /documents/:id
export async function deleteDocument(id: string): Promise<{ success: boolean }> {
  await simulateLatency();
  const store = getStore();

  const index = store.documents.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new ApiError('Document not found');
  }

  store.documents.splice(index, 1);

  // Also remove this document from chats
  store.chats.forEach((chat) => {
    chat.documentIds = chat.documentIds.filter((docId) => docId !== id);
  });

  return { success: true };
}

// GET /documents/:id/url
export async function getDocumentFileUrl(id: string): Promise<{ url: string }> {
  await simulateLatency();
  const store = getStore();
  const doc = store.documents.find((d) => d.id === id);
  if (!doc) {
    throw new ApiError('Document not found');
  }
  // Return simulated document file URL
  return { url: `/mock-files/${id}.pdf` };
}

// GET /chats
export async function listChats(): Promise<Chat[]> {
  await simulateLatency();
  const store = getStore();

  if (store.devFlags.forceEmptyState) {
    return [];
  }

  return JSON.parse(JSON.stringify(store.chats));
}

// POST /chats
export async function createChat(documentIds: string[]): Promise<Chat> {
  await simulateLatency();
  const store = getStore();

  if (!documentIds || documentIds.length === 0) {
    throw new ApiError('Select at least one document to start a chat');
  }

  if (documentIds.length > 5) {
    throw new ApiError('Maximum 5 documents can be selected for a single chat');
  }

  const selectedDocs = store.documents.filter((d) =>
    documentIds.includes(d.id)
  );

  const title =
    selectedDocs.length === 1
      ? `Chat with ${selectedDocs[0].title.replace(/\.pdf$/i, '')}`
      : `Comparative Analysis (${selectedDocs.length} documents)`;

  const newChat: Chat = {
    id: `chat-${Date.now().toString(36)}`,
    title,
    documentIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.chats.unshift(newChat);
  store.messages[newChat.id] = [];

  return JSON.parse(JSON.stringify(newChat));
}

// GET /chats/:id
export async function getChat(
  id: string
): Promise<{ chat: Chat; messages: Message[]; documents: PdfDocument[] }> {
  await simulateLatency();
  const store = getStore();
  checkAndAutoAdvanceDocuments(store);

  const chat = store.chats.find((c) => c.id === id);
  if (!chat) {
    throw new ApiError('Chat not found');
  }

  const messages = store.messages[id] || [];
  const documents = store.documents.filter((d) =>
    chat.documentIds.includes(d.id)
  );

  return {
    chat: JSON.parse(JSON.stringify(chat)),
    messages: JSON.parse(JSON.stringify(messages)),
    documents: JSON.parse(JSON.stringify(documents)),
  };
}

// DELETE /chats/:id
export async function deleteChat(id: string): Promise<{ success: boolean }> {
  await simulateLatency();
  const store = getStore();

  const index = store.chats.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new ApiError('Chat not found');
  }

  store.chats.splice(index, 1);
  delete store.messages[id];

  return { success: true };
}

// Save message helper (used by streaming route handler)
export function appendChatMessage(
  chatId: string,
  message: Message
): void {
  const store = getStore();
  if (!store.messages[chatId]) {
    store.messages[chatId] = [];
  }
  store.messages[chatId].push(message);

  const chat = store.chats.find((c) => c.id === chatId);
  if (chat) {
    chat.updatedAt = new Date().toISOString();
  }
}
