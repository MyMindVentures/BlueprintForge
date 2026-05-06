import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '10mb' }));

  app.all("/api/ai/*", async (req, res) => {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY || req.headers.authorization?.replace("Bearer ", "");
      if (!apiKey) {
        return res.status(401).json({ error: "OpenRouter API Key is missing." });
      }

      // Compute the destination path properly
      const destPath = req.originalUrl.replace("/api/ai", "");
      const url = `https://openrouter.ai/api/v1${destPath}`;
      
      const headers: Record<string, string> = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "https://ai.studio/build",
        "X-OpenRouter-Title": "BlueprintForge AI"
      };

      const openRouterRes = await fetch(url, {
        method: req.method,
        headers,
        body: req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body) : undefined
      });

      if (!openRouterRes.ok) {
        const text = await openRouterRes.text();
        return res.status(openRouterRes.status).send(text);
      }

      const data = await openRouterRes.json();
      res.json(data);
    } catch (e: any) {
      console.error("OpenRouter Proxy Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
