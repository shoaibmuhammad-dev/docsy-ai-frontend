// Server Component
import { redirect } from "next/navigation";
import { hasValidSession } from "@/lib/session";
import { getCurrentUser } from "@/lib/api";
import { AppHeader } from "@/components/layout/AppHeader";
import { ToastProvider } from "@/components/ui/Toast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No cookie at all: go to login
  if (!(await hasValidSession())) {
    redirect("/login");
  }

  // Asks the API who this is. A rejected token redirects to /session/expired,
  // which clears the stale cookie and then goes to /login.
  const user = await getCurrentUser();

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900">
        <AppHeader user={user} />
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </ToastProvider>
  );
}
