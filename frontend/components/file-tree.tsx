"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileStructure {
  [key: string]: string | FileStructure
}

interface FileTreeProps {
  structure: FileStructure
  onFileSelect: (filePath: string) => void
  onFolderSelect: (folderPath: string) => void
  selectedFile: string
  selectedFolder: string
  basePath?: string
}

export function FileTree({
  structure,
  onFileSelect,
  onFolderSelect,
  selectedFile,
  selectedFolder,
  basePath = "",
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["created_files"]))

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const renderItem = (key: string, value: string | FileStructure, currentPath: string) => {
    const fullPath = currentPath ? `${currentPath}/${key}` : key
    const isFile = typeof value === "string"
    const isExpanded = expandedFolders.has(fullPath)
    const isSelected = isFile ? selectedFile === fullPath : selectedFolder === fullPath

    if (isFile) {
      return (
        <div key={fullPath} className="ml-4">
          <Button
            variant={isSelected ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start h-8 px-2"
            onClick={() => onFileSelect(fullPath)}
          >
            <File className="mr-2 h-3 w-3 flex-shrink-0" />
            <span className="truncate text-xs">{key}</span>
          </Button>
        </div>
      )
    }

    return (
      <div key={fullPath}>
        <Button
          variant={isSelected ? "secondary" : "ghost"}
          size="sm"
          className="w-full justify-start h-8 px-2"
          onClick={() => {
            toggleFolder(fullPath)
            onFolderSelect(fullPath)
          }}
        >
          {isExpanded ? (
            <ChevronDown className="mr-1 h-3 w-3 flex-shrink-0" />
          ) : (
            <ChevronRight className="mr-1 h-3 w-3 flex-shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="mr-2 h-3 w-3 flex-shrink-0" />
          ) : (
            <Folder className="mr-2 h-3 w-3 flex-shrink-0" />
          )}
          <span className="truncate text-xs">{key}</span>
        </Button>
        {isExpanded && (
          <div className="ml-2">
            {Object.entries(value as FileStructure).map(([subKey, subValue]) => renderItem(subKey, subValue, fullPath))}
          </div>
        )}
      </div>
    )
  }

  return <div className="p-2">{Object.entries(structure).map(([key, value]) => renderItem(key, value, basePath))}</div>
}
