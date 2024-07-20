"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn, sleep } from "@/lib/utils";

const CopyButton: React.FC<{
  content: string;
}> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    setCopied(true);
    navigator.clipboard.writeText(content);
    await sleep(1000);
    setCopied(false);
  };

  return (
    <div
      className={cn(
        "group flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-custom-hover",
        {
          "pointer-events-none cursor-default": copied,
          "cursor-pointer": !copied,
        },
      )}
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-primary" />
      )}
    </div>
  );
};

export default CopyButton;
