"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface LivePreviewProps {
  filePath: string;
}

export function LivePreview({ filePath }: LivePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "http://localhost:3000";

  useEffect(() => {
    if (!filePath || !filePath.endsWith(".html")) {
      setPreviewUrl("");
      return;
    }

    setLoading(true);
    // Create a preview URL that serves the file from your Express backend
    const url = `${BACKEND_URL}/preview?path=${encodeURIComponent(filePath)}`;
    setPreviewUrl(url);
    setLoading(false);
  }, [filePath]);

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">Select an HTML file to preview</p>
        </div>
      </div>
    );
  }

  if (!filePath.endsWith(".html")) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">Preview not available</p>
          <p className="text-sm">Only HTML files can be previewed</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b bg-gray-50 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={openInNewTab}
          title="Open in new tab"
        >
          <ExternalLink className="mr-2 h-3 w-3" />
          Open in New Tab
        </Button>
      </div>
      <div className="flex-1">
        <iframe
          src={previewUrl}
          className="w-full h-full border-0"
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
