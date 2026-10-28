// Server Component
import { redirect } from "next/navigation";
import Link from "next/link";
import { hasValidSession } from "@/lib/session";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Card } from "@/components/ui/Card";
import { FiFileText } from "react-icons/fi";

export const metadata = {
  title: "Forgot Password · Chat with PDF",
  description: "Request a password reset link for your Chat with PDF account",
};

export default async function ForgotPasswordPage() {
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
          <h1 className="text-xl font-bold text-zinc-900 mt-4">
            Reset your password
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Enter your account email to receive password reset instructions
          </p>
        </div>

        <Card className="p-6 shadow-xs">
          <ForgotPasswordForm />
        </Card>
      </div>
    </div>
  );
}
