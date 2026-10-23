// Server Component
import { redirect } from "next/navigation";
import { hasValidSession } from "@/lib/session";
import { getCurrentUser } from "@/lib/api";
import { AppHeader } from "@/components/layout/AppHeader";
import { ToastProvider } from "@/components/ui/Toast";
import { DevToolbar } from "@/components/dev/DevToolbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isValid = await hasValidSession();
  if (!isValid) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900">
        <AppHeader user={user} />
        <main className="flex-1 flex flex-col">{children}</main>
        <DevToolbar />
      </div>
    </ToastProvider>
  );
}
