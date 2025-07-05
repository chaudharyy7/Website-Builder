// server.js
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import fs from "fs"
import path from "path"
import archiver from "archiver"
import { runAgent } from "./geminiAgent.js"

const app = express()
const PORT = 3000

app.use(cors())
app.use(bodyParser.json())

// Existing generate endpoint
app.post("/generate", async (req, res) => {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ error: "Prompt is required" })

    try {
        const result = await runAgent(prompt)
        res.json({ success: true, result })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Existing endpoint to get file structure
app.get("/files", (req, res) => {
    try {
        const createdFilesPath = path.resolve("created_files")

        if (!fs.existsSync(createdFilesPath)) {
            return res.json({})
        }

        const structure = buildFileStructure(createdFilesPath)
        res.json({ created_files: structure })
    } catch (error) {
        res.status(500).json({ error: "Failed to read file structure" })
    }
})

// Existing endpoint to get file content
app.get("/file-content", (req, res) => {
    const filePath = req.query.path

    if (!filePath) {
        return res.status(400).json({ error: "File path is required" })
    }

    try {
        const fullPath = path.resolve(filePath)
        const createdFilesPath = path.resolve("created_files")

        // Security check
        if (!fullPath.startsWith(createdFilesPath)) {
            return res.status(403).json({ error: "Access denied" })
        }

        const content = fs.readFileSync(fullPath, "utf8")
        res.send(content)
    } catch (error) {
        res.status(404).json({ error: "File not found" })
    }
})

// Existing endpoint to download single file
app.get("/download-file", (req, res) => {
    const filePath = req.query.path

    if (!filePath) {
        return res.status(400).json({ error: "File path is required" })
    }

    try {
        const fullPath = path.resolve(filePath)
        const createdFilesPath = path.resolve("created_files")

        // Security check
        if (!fullPath.startsWith(createdFilesPath)) {
            return res.status(403).json({ error: "Access denied" })
        }

        const fileName = path.basename(fullPath)
        const stats = fs.statSync(fullPath)

        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`)
        res.setHeader("Content-Length", stats.size)

        // Set appropriate content type
        const ext = path.extname(fullPath).toLowerCase()
        const contentTypes = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
            ".json": "application/json",
            ".txt": "text/plain",
            ".md": "text/markdown",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
        }

        const contentType = contentTypes[ext] || "application/octet-stream"
        res.setHeader("Content-Type", contentType)

        const fileStream = fs.createReadStream(fullPath)
        fileStream.pipe(res)
    } catch (error) {
        res.status(404).json({ error: "File not found" })
    }
})

// NEW: Download specific folder as ZIP endpoint
app.get("/download-folder", (req, res) => {
    try {
        const folderPath = req.query.path || "created_files"
        const fullFolderPath = path.resolve(folderPath)
        const createdFilesPath = path.resolve("created_files")

        // Security check
        if (!fullFolderPath.startsWith(createdFilesPath) && fullFolderPath !== createdFilesPath) {
            return res.status(403).json({ error: "Access denied" })
        }

        if (!fs.existsSync(fullFolderPath)) {
            return res.status(404).json({ error: "Folder not found" })
        }

        const stats = fs.statSync(fullFolderPath)
        if (!stats.isDirectory()) {
            return res.status(400).json({ error: "Path is not a directory" })
        }

        const archive = archiver("zip", {
            zlib: { level: 9 }, // Maximum compression
        })

        // Get folder name for the zip file
        const folderName = path.basename(fullFolderPath) || "website"
        const zipFileName = `${folderName}.zip`

        res.setHeader("Content-Type", "application/zip")
        res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`)

        archive.pipe(res)

        // Add all files from the specified folder
        archive.directory(fullFolderPath, false)

        archive.finalize()

        archive.on("error", (err) => {
            console.error("Archive error:", err)
            res.status(500).json({ error: "Failed to create archive" })
        })
    } catch (error) {
        res.status(500).json({ error: "Failed to create download archive" })
    }
})

// Existing endpoint for HTML preview
app.get("/preview", (req, res) => {
    const filePath = req.query.path

    if (!filePath) {
        return res.status(400).json({ error: "File path is required" })
    }

    try {
        const fullPath = path.resolve(filePath)
        const createdFilesPath = path.resolve("created_files")

        // Security check
        if (!fullPath.startsWith(createdFilesPath)) {
            return res.status(403).json({ error: "Access denied" })
        }

        let content = fs.readFileSync(fullPath, "utf8")

        // Process HTML to fix relative paths
        const dir = path.dirname(filePath)
        content = content.replace(/(src|href)=["'](?!http|\/\/|#)([^"']+)["']/g, (match, attr, url) => {
            const resolvedPath = path.join(dir, url).replace(/\\/g, "/")
            return `${attr}="/static?path=${encodeURIComponent(resolvedPath)}"`
        })

        res.setHeader("Content-Type", "text/html")
        res.send(content)
    } catch (error) {
        res.status(404).json({ error: "File not found" })
    }
})

// Existing endpoint for static assets
app.get("/static", (req, res) => {
    const filePath = req.query.path

    if (!filePath) {
        return res.status(400).json({ error: "File path is required" })
    }

    try {
        const fullPath = path.resolve(filePath)
        const createdFilesPath = path.resolve("created_files")

        // Security check
        if (!fullPath.startsWith(createdFilesPath)) {
            return res.status(403).json({ error: "Access denied" })
        }

        // Get file extension to set proper content type
        const ext = path.extname(fullPath).toLowerCase()
        const contentTypes = {
            ".css": "text/css",
            ".js": "application/javascript",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
        }

        const contentType = contentTypes[ext] || "application/octet-stream"
        res.setHeader("Content-Type", contentType)

        const content = fs.readFileSync(fullPath)
        res.send(content)
    } catch (error) {
        res.status(404).json({ error: "File not found" })
    }
})

// Helper function to build file structure
function buildFileStructure(dirPath) {
    const structure = {}

    try {
        const items = fs.readdirSync(dirPath)

        for (const item of items) {
            const itemPath = path.join(dirPath, item)
            const stats = fs.statSync(itemPath)

            if (stats.isDirectory()) {
                structure[item] = buildFileStructure(itemPath)
            } else {
                structure[item] = "file"
            }
        }
    } catch (error) {
        return {}
    }

    return structure
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})
