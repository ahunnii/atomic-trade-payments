"use client";

import { useState } from "react";

import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";

export const CopyableSessionId = ({ sessionId }: { sessionId: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm">
      <code className="flex-1 overflow-x-auto rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
        {sessionId}
      </code>
      <button
        onClick={copyToClipboard}
        className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
      >
        {copied ? (
          <>
            <CheckIcon className="h-4 w-4" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <ClipboardIcon className="h-4 w-4" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
};
