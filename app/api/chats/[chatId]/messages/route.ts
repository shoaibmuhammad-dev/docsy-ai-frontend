import { NextRequest } from 'next/server';
import { getChat, appendChatMessage, getDevFlags } from '@/lib/api';
import { Citation, Message } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;

  let prompt = '';
  try {
    const body = await req.json();
    prompt = body.prompt || '';
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid JSON request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if chat exists
  let chatData;
  try {
    chatData = await getChat(chatId);
  } catch {
    return new Response(JSON.stringify({ message: 'Chat not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const devFlags = await getDevFlags();

  // Save the user message first
  const userMsgId = `msg-u-${Date.now()}`;
  const userMessage: Message = {
    id: userMsgId,
    role: 'user',
    content: prompt,
    citations: [],
    createdAt: new Date().toISOString(),
  };
  appendChatMessage(chatId, userMessage);

  const lowerPrompt = prompt.toLowerCase();
  const shouldError = devFlags.forceStreamError || lowerPrompt.includes('error');
  const isUnknown = lowerPrompt.includes('unknown');

  // Generate realistic response text and citations based on document
  const primaryDoc = chatData.documents[0] || {
    id: 'doc-1',
    title: 'Document',
    pageCount: 10,
  };

  let responseText = '';
  let citations: Citation[] = [];

  if (isUnknown) {
    responseText = 'I couldn\'t find anything relevant to that in the document.';
    citations = [];
  } else if (primaryDoc.title.toLowerCase().includes('resume')) {
    responseText = `Based on ${primaryDoc.title}, the candidate possesses extensive experience leading cross-functional design systems [1].

Key qualifications identified in the resume:
- **Design Leadership**: Spearheaded the enterprise design token taxonomy adopted across 14 product squads [1].
- **Accessibility Compliance**: Achieved WCAG 2.1 AA certification across all core workflows, elevating audit scores by 42% [2].
- **Prototyping & Systems**: Expert in Figma component variants, variable modes, and design-to-code automated synchronizations [2].

Recommended follow-ups include verifying portfolio case study metrics and cross-department references [1][2].`;
    citations = [
      { index: 1, docId: primaryDoc.id, chunkId: `chk-${Date.now()}-1`, page: 1 },
      { index: 2, docId: primaryDoc.id, chunkId: `chk-${Date.now()}-2`, page: 2 },
    ];
  } else if (primaryDoc.title.toLowerCase().includes('lease')) {
    responseText = `According to ${primaryDoc.title}, the clause governing your inquiry is detailed in Section 7 [1].

Important stipulations include:
- **Payment Grace Period**: Rent is due on the 1st of each calendar month, with a 5-day grace period before a $50 late assessment applies [1].
- **Subletting Restrictions**: Unauthorized assignments or short-term rentals (such as Airbnb) are strictly prohibited without prior written consent from the lessor [2].
- **Utility Allocations**: Water and trash disposal are included; electricity and high-speed internet remain the tenant's sole responsibility [3].

All notices must be delivered to the management office in writing [1].`;
    citations = [
      { index: 1, docId: primaryDoc.id, chunkId: `chk-${Date.now()}-1`, page: 3 },
      { index: 2, docId: primaryDoc.id, chunkId: `chk-${Date.now()}-2`, page: 5 },
      { index: 3, docId: primaryDoc.id, chunkId: `chk-${Date.now()}-3`, page: 6 },
    ];
  } else {
    // Technical / general document
    responseText = `Based on our analysis of ${primaryDoc.title}, here is the breakdown regarding your query [1]:

- **Core Mechanism**: The architecture optimizes attention memory overhead from quadratic $\\mathcal{O}(N^2)$ to linear bounds using low-rank approximations [1].
- **Benchmark Findings**: The empirical evaluation demonstrates a **3.4x latency reduction** during generation phases while maintaining perplexity parity [2].
- **Implementation Note**: Chunked gradient checkpointing is recommended when scaling past 32k context lengths to avert GPU out-of-memory errors [3].

Refer to Section 4.3 for mathematical proofs and ablation statistics [2][3].`;
    citations = [
      { index: 1, docId: primaryDoc.id, chunkId: `chk-${Date.now()}-1`, page: Math.min(4, primaryDoc.pageCount) },
      { index: 2, docId: primaryDoc.id, chunkId: `chk-${Date.now()}-2`, page: Math.min(8, primaryDoc.pageCount) },
      { index: 3, docId: primaryDoc.id, chunkId: `chk-${Date.now()}-3`, page: Math.min(12, primaryDoc.pageCount) },
    ];
  }

  const assistantMsgId = `msg-a-${Date.now()}`;

  // Split response text into chunks of 2-6 words
  const words = responseText.split(' ');
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunkSize = Math.min(Math.floor(Math.random() * 5) + 2, words.length - i);
    const piece = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '');
    chunks.push(piece);
    i += chunkSize;
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      if (shouldError) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: {"message":"Failed to process message query. An intentional error was triggered."}\n\n`
          )
        );
        controller.close();
        return;
      }

      // Stream tokens every ~40ms
      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, 40));
        const payload = JSON.stringify({ text: chunk });
        controller.enqueue(encoder.encode(`event: token\ndata: ${payload}\n\n`));
      }

      // Small pause before done event
      await new Promise((resolve) => setTimeout(resolve, 60));

      const donePayload = JSON.stringify({
        messageId: assistantMsgId,
        citations,
      });
      controller.enqueue(encoder.encode(`event: done\ndata: ${donePayload}\n\n`));

      // Append assistant message to persistent in-memory store
      const completedAssistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: responseText,
        citations,
        createdAt: new Date().toISOString(),
      };
      appendChatMessage(chatId, completedAssistantMsg);

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
