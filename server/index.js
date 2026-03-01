/**
 * Fontrapunkt Server
 * Optional server for static font instance generation
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { generateInstance } from "./routes/generate-instance.js";

const Filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(Filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: "Too many requests, please try again later.",
});

app.use("/api/", limiter);

// File upload configuration
const upload = multer({
  dest: "temp/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (_req, file, cb) => {
    // Validate font file magic numbers
    const validMimeTypes = [
      "font/ttf",
      "font/otf",
      "application/font-woff",
      "application/font-woff2",
    ];
    if (validMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid font file type"), false);
    }
  },
});

// Routes
app.post("/api/generate-instance", upload.single("font"), generateInstance);

/**
 * Proofing API (no-auth, server-side fetch to avoid browser CORS issues)
 */
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function extractCleanParagraph(text) {
  // Early exit: process text in chunks and return first valid paragraph
  // This avoids processing the entire 50KB if we find a good paragraph early
  const chunks = text.split(/\n\s*\n/g);

  // Process paragraphs one at a time and return immediately when we find a good one
  for (let i = 0; i < Math.min(50, chunks.length); i++) {
    const normalized = normalizeWhitespace(chunks[i]);
    if (
      normalized.length >= 100 &&
      normalized.length <= 500 &&
      !normalized.includes("***") &&
      !normalized.toLowerCase().includes("gutenberg")
    ) {
      return normalized;
    }
  }

  return null;
}

app.get("/api/proofing/quote", async (_req, res) => {
  try {
    // Quoterism API: /api/quotes/random returns {id,text,author:{...}}
    // https://www.quoterism.com/developer
    const r = await fetch("https://www.quoterism.com/api/quotes/random", {
      headers: { Accept: "application/json" },
    });
    if (!r.ok) {
      return res.status(502).json({ error: "quoterism_failed", status: r.status });
    }
    const data = await r.json();
    const text = typeof data?.text === "string" ? data.text : null;
    if (!text) {
      return res.status(502).json({ error: "quoterism_invalid_response" });
    }
    const author = typeof data?.author?.name === "string" ? data.author.name : null;
    return res.json({ text, author });
  } catch (err) {
    console.error("Proofing quote error:", err);
    return res.status(502).json({ error: "quote_exception" });
  }
});

app.get("/api/proofing/title", async (_req, res) => {
  try {
    // OpenLibrary Search API (no-auth)
    // https://openlibrary.org/developers/api
    const seeds = [
      "love",
      "time",
      "night",
      "dream",
      "world",
      "river",
      "shadow",
      "light",
      "moon",
      "forest",
    ];
    const q = pickRandom(seeds);
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=50&fields=title`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) {
      return res.status(502).json({ error: "openlibrary_failed", status: r.status });
    }
    const data = await r.json();
    const docs = Array.isArray(data?.docs) ? data.docs : [];
    const titles = docs
      .map((d) => (typeof d?.title === "string" ? d.title.trim() : null))
      .filter(Boolean);
    if (titles.length === 0) {
      return res.status(502).json({ error: "openlibrary_no_titles" });
    }
    return res.json({ title: pickRandom(titles) });
  } catch (err) {
    console.error("Proofing title error:", err);
    return res.status(502).json({ error: "title_exception" });
  }
});

app.get("/api/proofing/gutenberg", async (_req, res) => {
  try {
    // Gutendex provides Gutenberg metadata with format URLs. We fetch text on the server
    // to avoid browser CORS. https://gutendex.com/
    const page = Math.floor(Math.random() * 50) + 1;
    const metaUrl = `https://gutendex.com/books?languages=en&mime_type=text%2Fplain&page=${page}`;

    // Add timeout for metadata fetch (5 seconds)
    const metaController = new AbortController();
    const metaTimeout = setTimeout(() => metaController.abort(), 5000);

    const metaRes = await fetch(metaUrl, {
      headers: { Accept: "application/json" },
      signal: metaController.signal,
    });
    clearTimeout(metaTimeout);

    if (!metaRes.ok) {
      return res.status(502).json({ error: "gutendex_failed", status: metaRes.status });
    }
    const meta = await metaRes.json();
    const results = Array.isArray(meta?.results) ? meta.results : [];
    if (results.length === 0) {
      return res.status(502).json({ error: "gutendex_empty" });
    }

    // Optimize: Try books in parallel, return immediately on first success
    // This significantly speeds up the process when some books are slow
    const attempts = Math.min(6, results.length);
    const booksToTry = [];
    const usedIndices = new Set();

    // Pick random books without duplicates
    while (booksToTry.length < attempts && usedIndices.size < results.length) {
      const randomIndex = Math.floor(Math.random() * results.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        booksToTry.push(results[randomIndex]);
      }
    }

    // Try all books in parallel with timeouts
    // Use Promise.race pattern to return as soon as first succeeds
    const fetchPromises = booksToTry.map(async (book) => {
      const formats = book?.formats ?? {};
      const formatKeys = Object.keys(formats);
      const plainKey =
        formatKeys.find((k) => k.startsWith("text/plain")) ??
        formatKeys.find((k) => k === "text/plain") ??
        null;

      const textUrl = plainKey ? formats[plainKey] : null;
      if (typeof textUrl !== "string") return null;

      try {
        // Reduced timeout: 6 seconds (was 8) - faster failure for slow servers
        const textController = new AbortController();
        const textTimeout = setTimeout(() => textController.abort(), 6000);

        const textRes = await fetch(textUrl, {
          signal: textController.signal,
          // Reduced chunk size: 50KB instead of 100KB - we only need one paragraph
          headers: { Range: "bytes=0-51200" },
        });
        clearTimeout(textTimeout);

        if (!textRes.ok) return null;

        // Read only first chunk
        const raw = await textRes.text();
        const para = extractCleanParagraph(raw);

        if (para) {
          return {
            text: para,
            title: typeof book?.title === "string" ? book.title : undefined,
          };
        }
      } catch (error) {
        // Silently fail - try next book
        if (error.name !== "AbortError") {
          console.warn(`[Gutenberg] Failed to fetch book ${book?.title}:`, error.message);
        }
        return null;
      }

      return null;
    });

    // Race: return immediately when first promise resolves successfully
    // Use Promise.any() to get first fulfilled promise (Node 15+)
    // If not available or all fail, fall back to checking all results
    try {
      // Wrap promises to filter out null results for Promise.any
      const anyPromises = fetchPromises.map(async (promise) => {
        const result = await promise;
        if (!result) {
          throw new Error("No result");
        }
        return result;
      });

      const winner = await Promise.any(anyPromises);
      return res.json(winner);
    } catch {
      // Promise.any rejected (all promises failed or returned null)
      // Fall back to checking all results
      const allResults = await Promise.allSettled(fetchPromises);
      for (const result of allResults) {
        if (result.status === "fulfilled" && result.value) {
          return res.json(result.value);
        }
      }
    }

    return res.status(502).json({ error: "gutenberg_no_paragraph" });
  } catch (err) {
    console.error("Proofing gutenberg error:", err);
    return res.status(502).json({ error: "gutenberg_exception" });
  }
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Error handling
app.use((err, _req, res, _next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Fontrapunkt server running on port ${PORT}`);
});
