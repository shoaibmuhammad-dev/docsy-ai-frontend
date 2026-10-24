import { getSessionToken } from "@/lib/session";

// Browser -> this Route Handler -> Express. The handler reads the httpOnly
// session cookie (the browser's JavaScript can't), adds the Bearer header, and
// pipes Express's Server-Sent Events straight back without touching them.

const sseHeaders = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no", // stop proxies from buffering the stream
};

// The client only has to understand one format: failures that happen before
// the stream starts are sent as a normal "error" event.
const sseError = (message: string) =>
  new Response(`event: error\ndata: ${JSON.stringify({ message })}\n\n`, {
    status: 200,
    headers: sseHeaders,
  });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;

  const baseUrl = process.env.API_URL;
  if (!baseUrl)
    return sseError("The server is not configured (API_URL is missing)");

  const token = await getSessionToken();
  if (!token) return sseError("Your session has expired. Please log in again.");

  const body = (await request.json().catch(() => null)) as {
    content?: unknown;
  } | null;
  const content = typeof body?.content === "string" ? body.content : "";
  if (!content.trim()) return sseError("Message cannot be empty");

  let upstream: Response;
  try {
    upstream = await fetch(
      `${baseUrl}/chats/${encodeURIComponent(chatId)}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ content }),
        cache: "no-store",
        // When the browser aborts (the Stop button), this cancels the request to
        // Express too, which stops the Gemini generation and saves your quota
        signal: request.signal,
      },
    );
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    console.error("[chat stream] could not reach the API:", error);
    return sseError("Could not reach the server. Please try again");
  }

  // Errors before streaming starts (bad id, validation, expired token...)
  if (!upstream.ok || !upstream.body) {
    const payload = await upstream.json().catch(() => null);
    return sseError(
      upstream.status === 401
        ? "Your session has expired. Please log in again."
        : (payload?.error ?? payload?.message ?? "Something went wrong"),
    );
  }

  return new Response(upstream.body, { status: 200, headers: sseHeaders });
}
