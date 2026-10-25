import "server-only";
import { redirect } from "next/navigation";
import { ApiRequestError, apiFetch } from "@/lib/http";
import {
  ApiError,
  Chat,
  Message,
  Pagination,
  PdfDocument,
  User,
} from "./types";

// ---------------------------------------------------------------------------
// Same function names and return shapes as the old mock, now calling the real
// Express API. Pages and Server Actions keep working without changes.
// ---------------------------------------------------------------------------

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  // For data loaded by a page: an invalid session sends the user to the route
  // that clears the cookie and goes to /login. Don't use this inside a
  // try/catch (a Server Action's, for example): redirect() works by throwing.
  redirectOnUnauthorized?: boolean;
}

async function request<T>(
  path: string,
  { redirectOnUnauthorized = false, ...options }: RequestOptions = {},
): Promise<T> {
  try {
    return await apiFetch<T>(path, options);
  } catch (error) {
    if (!(error instanceof ApiRequestError)) throw error;

    if (error.status === 401) {
      if (redirectOnUnauthorized) redirect("/session/expired");
      throw new ApiError("Your session has expired. Please log in again.");
    }

    throw new ApiError(error.message);
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthResult {
  user: User;
  token: string; // the API's JWT; the action stores it in the httpOnly cookie
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function authRequest(path: string, body: unknown): Promise<AuthResult> {
  try {
    return await apiFetch<AuthResult>(path, {
      method: "POST",
      body,
      auth: false,
    });
  } catch (error) {
    if (!(error instanceof ApiRequestError)) throw error;

    // Here a 401 means wrong credentials, not an expired session
    if (error.status === 401) throw new ApiError("Incorrect email or password");
    if (error.status === 409)
      throw new ApiError(error.message, { email: [error.message] });
    throw new ApiError(error.message);
  }
}

// POST /auth/signup
export async function signup(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  // Same field-level errors your forms already display
  const fieldErrors: Record<string, string[]> = {};
  if (name.trim().length < 2 || name.trim().length > 50) {
    fieldErrors.name = ["Name must be between 2 and 50 characters"];
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    fieldErrors.email = ["Enter a valid email address"];
  }
  if (password.length < 8 || password.length > 72) {
    fieldErrors.password = ["Password must be between 8 and 72 characters"];
  }
  if (Object.keys(fieldErrors).length > 0) {
    throw new ApiError("Validation failed", fieldErrors);
  }

  return authRequest("/auth/signup", {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });
}

// POST /auth/login
export async function login(
  email: string,
  password: string,
): Promise<AuthResult> {
  const fieldErrors: Record<string, string[]> = {};
  if (!EMAIL_PATTERN.test(email.trim())) {
    fieldErrors.email = ["Enter a valid email address"];
  }
  if (!password) {
    fieldErrors.password = ["Password is required"];
  }
  if (Object.keys(fieldErrors).length > 0) {
    throw new ApiError("Validation failed", fieldErrors);
  }

  return authRequest("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });
}

// GET /auth/me
// Accepts the response shapes an /auth/me endpoint commonly returns:
//   { success, data: { user: {...} } }   (what the auth setup uses)
//   { success, data: {...user fields} }
//   { success, user: {...} }
export async function getCurrentUser(): Promise<User> {
  const data = await request<{ user?: User } & Partial<User>>("/auth/me", {
    redirectOnUnauthorized: true,
  });

  const user =
    data.user ?? (data.id && data.email ? (data as User) : undefined);

  if (!user) {
    // Fail loudly instead of rendering a header with no user
    console.error(
      "[api] /auth/me returned an unexpected shape:",
      JSON.stringify(data),
    );
    throw new ApiError(
      "Could not load your profile. Unexpected response from /auth/me",
    );
  }

  return user;
}

// GET /documents
export async function listDocuments(
  page = 1,
  limit = 10,
): Promise<{ documents: PdfDocument[]; pagination: Pagination }> {
  const result = await request<{
    documents: PdfDocument[];
    pagination: Pagination;
  }>(`/documents?page=${page}&limit=${limit}`, {
    redirectOnUnauthorized: true,
  });

  // Asked for a page past the end (for example after deleting the last item on it)
  const { totalPages } = result.pagination;
  if (result.documents.length === 0 && totalPages >= 1 && page > totalPages) {
    return listDocuments(totalPages, limit);
  }

  return result;
}

async function fetchDocument(
  id: string,
  redirectOnUnauthorized: boolean,
): Promise<PdfDocument> {
  const { document } = await request<{ document: PdfDocument }>(
    `/documents/${encodeURIComponent(id)}`,
    {
      redirectOnUnauthorized,
    },
  );
  return document;
}

// GET /documents/:id
export async function getDocument(id: string): Promise<PdfDocument> {
  return fetchDocument(id, true);
}

// POST /documents (multipart, the field must be named "file")
export async function createDocument(file: File): Promise<PdfDocument> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const { document } = await request<{ document: PdfDocument }>("/documents", {
    method: "POST",
    body: formData,
  });
  return document;
}

// DELETE /documents/:id
export async function deleteDocument(
  id: string,
): Promise<{ success: boolean }> {
  await request(`/documents/${encodeURIComponent(id)}`, { method: "DELETE" });
  return { success: true };
}

// GET /documents/:id/url (a temporary signed link, valid for about an hour)
export async function getDocumentFileUrl(id: string): Promise<{ url: string }> {
  const { url } = await request<{ url: string; expiresIn: number }>(
    `/documents/${encodeURIComponent(id)}/url`,
  );
  return { url };
}

// GET /chats
export async function listChats(): Promise<Chat[]> {
  const { chats } = await request<{ chats: Chat[] }>("/chats", {
    redirectOnUnauthorized: true,
  });
  return chats;
}

// POST /chats
export async function createChat(documentIds: string[]): Promise<Chat> {
  const { chat } = await request<{ chat: Chat }>("/chats", {
    method: "POST",
    body: { documentIds },
  });
  return chat;
}

// GET /chats/:id (the API returns the chat and its messages; the documents are
// loaded separately because the chat only stores their ids)
export async function getChat(
  id: string,
): Promise<{ chat: Chat; messages: Message[]; documents: PdfDocument[] }> {
  const { chat, messages } = await request<{ chat: Chat; messages: Message[] }>(
    `/chats/${encodeURIComponent(id)}`,
    { redirectOnUnauthorized: true },
  );

  const documents = await Promise.all(
    chat.documentIds.map((documentId) =>
      fetchDocument(documentId, false).catch(() => null),
    ),
  );

  return {
    chat,
    messages,
    documents: documents.filter(
      (document): document is PdfDocument => document !== null,
    ),
  };
}

// DELETE /chats/:id
export async function deleteChat(id: string): Promise<{ success: boolean }> {
  await request(`/chats/${encodeURIComponent(id)}`, { method: "DELETE" });
  return { success: true };
}
