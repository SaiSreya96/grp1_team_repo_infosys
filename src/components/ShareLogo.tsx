import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

interface Props {
  location?: string;
}

export default function ShareLogo({ location }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: "AirAware — Air Quality",
      text: location
        ? `AirAware — current location: ${location}`
        : "AirAware — check your local air quality",
      url: window.location.href,
    };

    try {
      if ((navigator as any).share) {
        await (navigator as any).share(shareData);
        return;
      }

      // Fallback: copy link
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Share failed", err);
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch (e) {
        // ignore
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      title="Share dashboard"
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center"
    >
      {copied ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      )}
    </button>
  );
}
