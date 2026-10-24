// Server Component
import { redirect } from "next/navigation";
import Link from "next/link";
import { hasValidSession } from "@/lib/session";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";
import { FiFileText } from "react-icons/fi";

export const metadata = {
  title: "Sign in · Chat with PDF",
  description: "Sign in to your Chat with PDF account",
};

export default async function LoginPage() {
  if (await hasValidSession()) {
    redirect("/documents");
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-zinc-50">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-900 font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <FiFileText className="w-4 h-4" />
            </div>
            <span>Chat with PDF</span>
          </Link>
          <h1 className="text-xl font-bold text-zinc-900 mt-4">Welcome back</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Sign in to chat with your documents and citations
          </p>
        </div>

        <Card className="p-6 shadow-xs">
          <LoginForm />
        </Card>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 rounded-xl bg-white border border-zinc-200 text-center text-xs text-zinc-500">
          <span>
            Demo credentials pre-filled: test with any email or password
          </span>
        </div>
      </div>
    </div>
  );
}
