"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";

interface CodeViewerProps {
  filePath: string;
}

export function CodeViewer({ filePath }: CodeViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const BACKEND_URL = "http://localhost:3000";

  useEffect(() => {
    if (!filePath) {
      setContent("");
      return;
    }

    const fetchFileContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}/file-content?path=${encodeURIComponent(filePath)}`
        );
        if (response.ok) {
          const text = await response.text();
          setContent(text);
        } else {
          setContent("Error loading file content");
        }
      } catch (error) {
        setContent("Error loading file content");
      } finally {
        setLoading(false);
      }
    };

    fetchFileContent();
  }, [filePath]);

  const downloadFile = async () => {
    if (!filePath) return;

    setIsDownloading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/download-file?path=${encodeURIComponent(filePath)}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filePath.split("/").pop() || "file";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Failed to download file");
      }
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const getLanguage = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "html":
        return "html";
      case "css":
        return "css";
      case "js":
        return "javascript";
      case "json":
        return "json";
      case "md":
        return "markdown";
      default:
        return "text";
    }
  };

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">
            Select a file from the explorer to view its content
          </p>
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
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{getLanguage(filePath)}</Badge>
            <span className="text-sm text-gray-600 truncate">{filePath}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!content}
            >
              {isCopied ? (
                <>
                  <Check className="mr-2 h-3 w-3 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadFile}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Download className="mr-2 h-3 w-3 animate-pulse" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-3 w-3" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
          <code>{content}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}
