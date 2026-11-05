import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Dev server must run on port 3000
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini AI SDK according to guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', hasApiKey: !!apiKey });
});

// API: Generate complete planner outline & content structure
app.post('/api/gemini/generate-planner', async (req: Request, res: Response) => {
  try {
    const {
      category,
      title,
      subtitle,
      targetAudience,
      pageCount,
      trimSize,
      interiorStyle,
      year,
      notes,
    } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured. Please verify your GEMINI_API_KEY secret.',
      });
    }

    const systemPrompt = `You are a world-class book interior designer and Amazon KDP publishing expert.
Your job is to generate a professional, practical, and highly marketable PAPERBACK planner structure for Amazon KDP.
The output must be returned strictly in valid JSON format.

Planner specifications:
- Category: ${category || 'Weekly Planner'}
- Title: ${title || 'My Planner'}
- Subtitle: ${subtitle || ''}
- Target Audience: ${targetAudience || 'General productivity seekers'}
- Page Count: ${pageCount || 100} pages
- Trim Size: ${trimSize || '6x9'}
- Interior Style: ${interiorStyle || 'Minimalist'}
- Year/Range: ${year || '2026'}
- Additional Notes: ${notes || 'None'}

Return a JSON object with this exact shape:
{
  "title": string,
  "subtitle": string,
  "recommendedSubtitle": string,
  "targetAudienceSummary": string,
  "kdpKeywords": string[], // 7 high-search-volume Amazon KDP keywords
  "kdpCategories": string[], // 3 recommended Amazon browse categories
  "bookDescription": string, // Professional Amazon book sales description with bullet points
  "pageDistribution": [
    {
      "sectionName": string,
      "pageCount": number,
      "description": string,
      "layoutType": "title" | "calendar" | "weekly" | "daily" | "tracker" | "table" | "checklist" | "notes" | "custom",
      "sampleHeadings": string[],
      "promptDetails": string
    }
  ],
  "uniqueSellingPoints": string[]
}`;

    // Retry logic with fallback for temporary spikes
    let parsed: any = null;
    let lastError: any = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((res) => setTimeout(res, 1000 * attempt));
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Generate a complete, high-quality, professional KDP planner plan for category "${category}", page count ${pageCount}, titled "${title}". Focus on Amazon KDP paperback print practicality, clean layout, no fluff, and high customer review satisfaction.`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '{}';
        parsed = JSON.parse(text);
        if (parsed && parsed.kdpKeywords) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt + 1} failed:`, err?.message || err);
      }
    }

    if (!parsed) {
      // Fallback blueprint generated dynamically based on category
      parsed = {
        title: title || `${category} 2026`,
        subtitle: subtitle || 'A Guided Framework for Intentional Living & Productivity',
        recommendedSubtitle: `A 52-Week Guided System for ${category} Mastery & Daily Focus`,
        targetAudienceSummary: targetAudience || 'Busy professionals and goal achievers',
        kdpKeywords: [
          `${category.toLowerCase()} 2026`,
          'productivity journal paperback',
          'habit tracker for adults',
          'goal setting workbook',
          'daily and weekly agenda',
          'amazon kdp low content',
          'time management notebook',
        ],
        kdpCategories: [
          'Books > Business & Money > Time Management',
          'Books > Self-Help > Personal Transformation',
          'Books > Crafts & Hobbies > Guided Journals',
        ],
        bookDescription: `<h3>Transform Your Daily Routine with the ${title || category}</h3>\n<p>Engineered for high performance, clarity, and consistency. Built specifically for physical paperback printing with crisp interior margins and zero wasted pages.</p>`,
        pageDistribution: [
          { sectionName: 'Front Matter', pageCount: 4, layoutType: 'title' },
          { sectionName: 'Core Planner Spreads', pageCount: Math.max(20, (pageCount || 100) - 10), layoutType: 'weekly' },
          { sectionName: 'Notes & End Reflection', pageCount: 6, layoutType: 'notes' },
        ],
        uniqueSellingPoints: [
          'Print-on-demand optimized margins with alternating gutter spacing',
          'High contrast vector layout prevents bleed-through',
          'Clean structured habit tracking grids',
        ],
      };
    }

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating planner via Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate planner structure with AI.',
    });
  }
});

// API: Generate or refine a specific page content
app.post('/api/gemini/generate-page', async (req: Request, res: Response) => {
  try {
    const { category, pageType, currentTitle, theme } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured.',
      });
    }

    const systemPrompt = `You are an expert low-content & medium-content book layout designer for Amazon KDP paperbacks.
Generate the content and layout elements for a single page in a "${category}" paperback planner.
The layout must be clean, printer-friendly (black/white or grayscale), within safe margins, and practical to write in.

Return a JSON object:
{
  "pageTitle": string,
  "pageSubtitle": string,
  "sections": [
    {
      "type": "heading" | "lines" | "checklist" | "table" | "habit_tracker" | "calendar_grid" | "box" | "prompt_box",
      "title": string,
      "heightPercent": number, // Approximate percentage height of the page (sum should be <= 90)
      "items": string[], // Labels, table headers, or checklist items
      "rowCount": number, // For lines or tables
      "columns": string[] // For tables
    }
  ],
  "footerQuote": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Design a ${pageType || 'custom'} page for a ${category} planner with theme "${theme || 'Modern'}". Current title is "${currentTitle || ''}".`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating page via Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate page content.',
    });
  }
});

// Setup Vite middleware in development or serve static in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KDP Planner Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
