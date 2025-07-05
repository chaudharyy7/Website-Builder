import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const asyncExecute = promisify(exec);
const platform = os.platform();

const ai = new GoogleGenAI({
    apiKey: 'API-KEY' // Replace with your Gemini API key
});

const History = [];

async function executeCommand({ command, file, content }) {
    try {
        if (file && content) {
            const filePath = path.resolve('created_files', file);
            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            fs.writeFileSync(filePath, content, 'utf8');
            return `✅ File written to ${filePath}`;
        }

        if (command) {
            const { stdout, stderr } = await asyncExecute(command);
            if (stderr) return `⚠️ Error: ${stderr}`;
            return `✅ Command output:\n${stdout}`;
        }

        return '❌ No valid operation provided.';
    } catch (err) {
        return `❌ Execution failed: ${err.message}`;
    }
}

const executeCommandDeclaration = {
    name: 'executeCommand',
    description: 'Run terminal commands or write content to files.',
    parameters: {
        anyOf: [
            {
                type: 'object',
                properties: {
                    command: { type: 'string', description: 'Terminal command' }
                },
                required: ['command']
            },
            {
                type: 'object',
                properties: {
                    file: { type: 'string', description: 'Target file path' },
                    content: { type: 'string', description: 'File content' }
                },
                required: ['file', 'content']
            }
        ]
    }
};

const availableTools = { executeCommand };

export async function runAgent(userPrompt) {
    const resultLog = [];
    History.push({ role: 'user', parts: [{ text: userPrompt }] });

    while (true) {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: History,
            config: {
                systemInstruction: `You are an AI assistant that can build websites based on user input.
You can use terminal commands to create folders and files, or write content directly into files.
Use either:
  - { "command": "mkdir MyFolder" }
  - { "file": "MyFolder/index.html", "content": "<!DOCTYPE html>..." }
User is using: ${platform}`,
                tools: [{ functionDeclarations: [executeCommandDeclaration] }]
            }
        });

        const call = response.functionCalls?.[0];
        if (call) {
            const { name, args } = call;
            const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;

            const func = availableTools[name];
            const result = await func(parsedArgs);

            resultLog.push(result);

            History.push({ role: 'model', parts: [{ functionCall: call }] });
            History.push({ role: 'user', parts: [{ functionResponse: { name, response: { result } } }] });
        } else {
            resultLog.push(response.text);
            History.push({ role: 'model', parts: [{ text: response.text }] });
            break;
        }
    }

    return resultLog;
}
