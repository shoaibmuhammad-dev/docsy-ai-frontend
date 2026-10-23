// Server Component
import { notFound } from "next/navigation";
import { getChat, listChats, listDocuments } from "@/lib/api";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  try {
    const { chat } = await getChat(chatId);
    return {
      title: `${chat.title} · Chat with PDF`,
      description: `Interactive AI chat with citations for ${chat.title}`,
    };
  } catch {
    return {
      title: "Chat · Chat with PDF",
    };
  }
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  let chatData;
  try {
    chatData = await getChat(chatId);
  } catch {
    notFound();
  }

  const [allChats, docListResponse] = await Promise.all([
    listChats(),
    listDocuments(1, 50),
  ]);

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-3.5rem)] overflow-hidden">
      <ChatWorkspace
        chat={chatData.chat}
        initialMessages={chatData.messages}
        documents={chatData.documents}
        allChats={allChats}
        allDocuments={docListResponse.documents}
      />
    </div>
  );
}
