import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { runAgent } from './geminiAgent.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/generate', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    try {
        const result = await runAgent(prompt);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
