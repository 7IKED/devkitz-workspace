import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3042;

app.use(cors());
app.use(bodyParser.json());

import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

// Real function for web search via DuckDuckGo HTML
async function performSearch(query) {
    try {
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        const results = [];
        $('.result').each((i, el) => {
            if (i >= 5) return; // limit to 5
            const title = $(el).find('.result__title a').text().trim();
            const url = $(el).find('.result__url').attr('href')?.trim();
            const snippet = $(el).find('.result__snippet').text().trim();
            if (title && url) {
                // DuckDuckGo prefixes URLs with /url?q=
                let cleanUrl = url;
                if (url.startsWith('//duckduckgo.com/l/?')) {
                    const match = url.match(/uddg=([^&]+)/);
                    if (match) cleanUrl = decodeURIComponent(match[1]);
                }
                results.push({ title, url: cleanUrl, snippet });
            }
        });
        return results.length > 0 ? results : [{ title: "DuckDuckGo Blocked", url: "#", snippet: "Consider Playwright or proxy." }];
    } catch (e) {
        return [{ title: "Error", url: "#", snippet: e.message }];
    }
}

// Dummy function for scraping
async function performScrape(url) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
        const html = await res.text();
        const $ = cheerio.load(html);
        return $('body').text().replace(/\s+/g, ' ').substring(0, 2000); // 2000 chars limit
    } catch(e) {
        return `Mock scraped content from ${url} due to error: ${e.message}`;
    }
}

// Routes
app.get('/health', (req, res) => {
    res.json({ status: "ok", service: "DkZ OpenResearch Server", port: PORT });
});

app.post('/research/search', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "Missing query" });
        console.log(`[OpenResearch] Searching for: ${query}`);
        const results = await performSearch(query);
        res.json({ results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/research/scrape', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "Missing url" });
        console.log(`[OpenResearch] Scraping: ${url}`);
        const content = await performScrape(url);
        res.json({ content });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/research/summary', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: "Missing content" });
        console.log(`[OpenResearch] Summarizing content...`);
        // We will just return a mock summary for now. In real life we'd call Ollama.
        res.json({ summary: `Summary: ${content.substring(0, 100)}...` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/research/deep', async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) return res.status(400).json({ error: "Missing topic" });
        console.log(`[OpenResearch] Deep research on: ${topic}`);
        // Orchestrate search -> scrape -> summary
        const results = await performSearch(topic);
        const topResult = results[0];
        const content = await performScrape(topResult.link);
        res.json({
            topic,
            report: `Deep Research Report for ${topic}\nSource: ${topResult.link}\nSummary: ${content}`
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log("==================================================");
    console.log(` 🔬 DkZ OpenResearch Server running on port ${PORT}`);
    console.log("==================================================");
});
