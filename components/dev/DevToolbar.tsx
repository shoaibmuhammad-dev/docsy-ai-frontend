// Client Component (dev toolbar for mocking network latency, session expiry, and error states)
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleDevFlagAction,
  expireSessionAction,
  resetMockDataAction,
} from "@/app/actions/dev";
import { useToast } from "@/components/ui/Toast";
import {
  FiTool,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiAlertTriangle,
  FiClock,
  FiFolder,
  FiLogOut,
  FiZap,
} from "react-icons/fi";

export function DevToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [slowNetwork, setSlowNetwork] = useState(false);
  const [forceEmpty, setForceEmpty] = useState(false);
  const [forceStreamError, setForceStreamError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const { toast } = useToast();

  const handleToggleSlow = () => {
    const nextVal = !slowNetwork;
    setSlowNetwork(nextVal);
    startTransition(async () => {
      await toggleDevFlagAction("slowNetwork", nextVal);
      toast({
        type: "info",
        title: nextVal
          ? "Slow Network (2.5s) Enabled"
          : "Normal Network Restored",
      });
      router.refresh();
    });
  };

  const handleFailNext = () => {
    startTransition(async () => {
      await toggleDevFlagAction("failNextRequest", true);
      toast({
        type: "error",
        title: "Next API request will throw an error",
        description: "Perform any document or chat action to trigger failure.",
      });
    });
  };

  const handleForceEmpty = () => {
    const nextVal = !forceEmpty;
    setForceEmpty(nextVal);
    startTransition(async () => {
      await toggleDevFlagAction("forceEmptyState", nextVal);
      toast({
        type: "info",
        title: nextVal ? "Empty State Activated" : "Normal Data View Restored",
      });
      router.refresh();
    });
  };

  const handleForceStreamError = () => {
    const nextVal = !forceStreamError;
    setForceStreamError(nextVal);
    startTransition(async () => {
      await toggleDevFlagAction("forceStreamError", nextVal);
      toast({
        type: "error",
        title: nextVal
          ? "Stream Error Mode Active"
          : "Normal Streaming Restored",
      });
    });
  };

  const handleExpireSession = () => {
    startTransition(async () => {
      await expireSessionAction();
      toast({
        type: "error",
        title: "Session expired",
        description: "Redirecting to login page...",
      });
      setTimeout(() => {
        router.push("/login");
      }, 700);
    });
  };

  const handleResetData = () => {
    startTransition(async () => {
      await resetMockDataAction();
      setSlowNetwork(false);
      setForceEmpty(false);
      setForceStreamError(false);
      toast({
        type: "success",
        title: "Mock database reset",
        description: "Restored 4 initial documents and 2 sample chats.",
      });
      router.refresh();
    });
  };

  return (
    <aside
      aria-label="Developer testing toolbar"
      className="fixed bottom-4 left-4 z-50 select-none font-sans"
    >
      <div className="bg-zinc-900 text-white rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden text-xs max-w-xs transition-all">
        {/* Header / Toggle button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400">
              <FiTool className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold tracking-wide uppercase text-[10px] text-zinc-400">
              DEV ONLY
            </span>
            <span className="text-zinc-200 font-medium">Controls</span>
          </div>
          {isOpen ? (
            <FiChevronDown className="w-4 h-4 text-zinc-400" />
          ) : (
            <FiChevronUp className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {isOpen && (
          <div className="p-3 border-t border-zinc-800 space-y-2 bg-zinc-950/90 backdrop-blur-xs">
            <p className="text-[11px] text-zinc-400 pb-1 border-b border-zinc-800/80">
              Test error resilience, simulated latency & empty states:
            </p>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {/* Toggle slow network */}
              <button
                type="button"
                onClick={handleToggleSlow}
                disabled={isPending}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer disabled:opacity-50 ${
                  slowNetwork
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                }`}
              >
                <FiClock className="w-3 h-3 shrink-0" />
                <span className="truncate">Slow Net (2.5s)</span>
              </button>

              {/* Fail next request */}
              <button
                type="button"
                onClick={handleFailNext}
                disabled={isPending}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-left transition-colors cursor-pointer disabled:opacity-50"
              >
                <FiAlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                <span className="truncate">Fail Next Req</span>
              </button>

              {/* Toggle empty state */}
              <button
                type="button"
                onClick={handleForceEmpty}
                disabled={isPending}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer disabled:opacity-50 ${
                  forceEmpty
                    ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                    : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                }`}
              >
                <FiFolder className="w-3 h-3 shrink-0" />
                <span className="truncate">Empty State</span>
              </button>

              {/* Force stream error */}
              <button
                type="button"
                onClick={handleForceStreamError}
                disabled={isPending}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer disabled:opacity-50 ${
                  forceStreamError
                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                    : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                }`}
              >
                <FiZap className="w-3 h-3 shrink-0" />
                <span className="truncate">Stream Error</span>
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleExpireSession}
                disabled={isPending}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <FiLogOut className="w-3 h-3" />
                <span>Expire session</span>
              </button>

              <button
                type="button"
                onClick={handleResetData}
                disabled={isPending}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <FiRefreshCw className="w-3 h-3" />
                <span>Reset all</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
