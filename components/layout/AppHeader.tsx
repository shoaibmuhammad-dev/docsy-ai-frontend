// Client Component (app navigation header with user profile menu)
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/lib/types";
import { logoutAction } from "@/app/actions/auth";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import {
  FiFileText,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiLayers,
} from "react-icons/fi";

interface AppHeaderProps {
  user: User;
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const isDocuments = pathname.startsWith("/documents");

  const userMenuItems = [
    {
      label: "Sign out",
      icon: <FiLogOut className="w-3.5 h-3.5" />,
      onClick: async () => {
        await logoutAction();
      },
      isDestructive: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200">
      <div className="w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand and primary nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/documents"
            className="flex items-center gap-2.5 text-zinc-900 font-semibold text-sm hover:opacity-85 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <FiFileText className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold tracking-tight">Chat with PDF</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/documents"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isDocuments
                  ? "bg-zinc-100 text-zinc-900 font-semibold"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <FiLayers className="w-3.5 h-3.5" />
              <span>Documents</span>
            </Link>
          </nav>
        </div>

        {/* User profile menu */}
        <div className="flex items-center gap-3">
          <DropdownMenu
            align="right"
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 text-left"
                aria-label="User profile options"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                  {user?.name.charAt(0) || <FiUser className="w-3 h-3" />}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-zinc-800 leading-tight truncate max-w-[120px]">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 leading-none truncate max-w-[120px]">
                    {user?.email}
                  </p>
                </div>
                <FiChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            }
            items={userMenuItems}
          />
        </div>
      </div>
    </header>
  );
}
