"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileTree } from "@/components/file-tree";
import { CodeViewer } from "@/components/code-viewer";
import { LivePreview } from "@/components/live-preview";
import {
  Loader2,
  Send,
  Eye,
  Code,
  Folder,
  RefreshCw,
  Download,
  ExternalLink,
  FolderDown,
} from "lucide-react";

interface FileStructure {
  [key: string]: string | FileStructure;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLog, setGenerationLog] = useState<string[]>([]);
  const [fileStructure, setFileStructure] = useState<FileStructure>({});
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // All API calls go directly to your Express backend at localhost:3000
  const BACKEND_URL = "http://localhost:3000";

  const generateWebsite = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerationLog([]);

    try {
      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.success) {
        setGenerationLog(data.result);
        await refreshFileStructure();
      } else {
        setGenerationLog([`Error: ${data.error}`]);
      }
    } catch (error) {
      setGenerationLog([
        `Network Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const refreshFileStructure = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/files`);
      if (response.ok) {
        const files = await response.json();
        setFileStructure(files);
      } else {
        console.error("Failed to fetch file structure");
      }
    } catch (error) {
      console.error("Failed to refresh file structure:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const downloadFolder = async (folderPath?: string) => {
    setIsDownloading(true);
    try {
      const pathToDownload = folderPath || selectedFolder || "created_files";
      const response = await fetch(
        `${BACKEND_URL}/download-folder?path=${encodeURIComponent(
          pathToDownload
        )}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Get folder name for download
        const folderName = pathToDownload.split("/").pop() || "website";
        a.download = `${folderName}.zip`;

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Failed to download folder");
      }
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const openPreviewInNewTab = () => {
    if (selectedFile && selectedFile.endsWith(".html")) {
      const previewUrl = `${BACKEND_URL}/preview?path=${encodeURIComponent(
        selectedFile
      )}`;
      window.open(previewUrl, "_blank");
    }
  };

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    const folderPath = filePath.split("/").slice(0, -1).join("/");
    setSelectedFolder(folderPath);
  };

  const handleFolderSelect = (folderPath: string) => {
    setSelectedFolder(folderPath);
    // Find the first HTML file in the selected folder for preview
    const findHtmlFile = (
      structure: FileStructure,
      currentPath = ""
    ): string | null => {
      for (const [key, value] of Object.entries(structure)) {
        const fullPath = currentPath ? `${currentPath}/${key}` : key;
        if (typeof value === "string" && key.endsWith(".html")) {
          return fullPath;
        } else if (typeof value === "object") {
          const result = findHtmlFile(value, fullPath);
          if (result) return result;
        }
      }
      return null;
    };

    const htmlFile = findHtmlFile(fileStructure, folderPath);
    if (htmlFile) {
      setSelectedFile(htmlFile);
    }
  };

  const hasFiles = Object.keys(fileStructure).length > 0;

  useEffect(() => {
    refreshFileStructure();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AI Website Generator
              </h1>
              <p className="text-gray-600">
                Generate complete websites using AI - just describe what you
                want!
              </p>
            </div>
            {hasFiles && (
              <div className="flex gap-2 flex-wrap">
                {selectedFolder && (
                  <Button
                    onClick={() => downloadFolder(selectedFolder)}
                    disabled={isDownloading}
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FolderDown className="mr-2 h-4 w-4" />
                        Download "{selectedFolder.split("/").pop()}"
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => downloadFolder("created_files")}
                  disabled={isDownloading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Project
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Prompt Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Generate Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Textarea
                placeholder="Describe the website you want to create... (e.g., 'Create a modern portfolio website with dark theme and contact form')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 min-h-[100px]"
                disabled={isGenerating}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={generateWebsite}
                  disabled={isGenerating || !prompt.trim()}
                  className="h-12"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={refreshFileStructure}
                  disabled={isRefreshing}
                  className="h-12 bg-transparent"
                >
                  {isRefreshing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generation Log */}
        {generationLog.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Generation Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {generationLog.map((log, index) => (
                    <div key={index} className="text-sm font-mono">
                      <Badge
                        variant={
                          log.includes("✅")
                            ? "default"
                            : log.includes("❌")
                            ? "destructive"
                            : "secondary"
                        }
                        className="mr-2 mb-1"
                      >
                        {log}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          {/* File Explorer */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Folder className="h-4 w-4" />
                File Explorer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] lg:h-[600px]">
                <FileTree
                  structure={fileStructure}
                  onFileSelect={handleFileSelect}
                  onFolderSelect={handleFolderSelect}
                  selectedFile={selectedFile}
                  selectedFolder={selectedFolder}
                />
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Code/Preview Area */}
          <div className="lg:col-span-3 flex flex-col">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {selectedFile || "No file selected"}
                </Badge>
                {selectedFolder && (
                  <Badge variant="secondary" className="text-xs">
                    Folder: {selectedFolder}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={viewMode === "code" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("code")}
                >
                  <Code className="mr-2 h-4 w-4" />
                  Code
                </Button>
                <Button
                  variant={viewMode === "preview" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("preview")}
                  disabled={!selectedFile || !selectedFile.endsWith(".html")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openPreviewInNewTab}
                  disabled={!selectedFile || !selectedFile.endsWith(".html")}
                  title="Open preview in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <Card className="flex-1">
              <CardContent className="p-0 h-full">
                {viewMode === "code" ? (
                  <CodeViewer filePath={selectedFile} />
                ) : (
                  <LivePreview filePath={selectedFile} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
