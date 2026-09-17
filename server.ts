import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Verify and lazy-load Gemini API key
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set. Please configure it in the Secrets panel.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to handle base64 reference images
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // Global CORS and PWA headers for external checkers (PWABuilder, Lighthouse)
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.path.endsWith("manifest.webmanifest") || req.path.endsWith("manifest.json")) {
      res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    } else if (req.path.endsWith("sw.js")) {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      res.setHeader("Service-Worker-Allowed", "/");
    }
    next();
  });

  // Serve static assets from public folder first (for sw.js, manifest.webmanifest, icons)
  app.use(express.static(path.join(process.cwd(), "public")));

  // API Route: Generate Wallpapers
  app.post("/api/generate", async (req, res) => {
    try {
      const {
        prompt,
        aspectRatio = "9:16",
        imageSize = "1K",
        quality = "standard",
        referenceImage,
      } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "A valid wallpaper description (vibe) is required." });
      }

      const ai = getGeminiClient();

      // Determine model based on requested quality and prompt specifications
      // Standard Quality maps to 'gemini-3.1-flash-image-preview'
      // Studio Quality maps to 'gemini-3-pro-image-preview'
      const modelName = quality === "studio" 
        ? "gemini-3-pro-image-preview" 
        : "gemini-3.1-flash-image-preview";

      console.log(`Generating 4 variations using model: ${modelName}, Aspect Ratio: ${aspectRatio}, Size: ${imageSize}, Remixing: ${!!referenceImage}`);

      // Generate 4 distinct variations concurrently
      const variationPromises = Array.from({ length: 4 }).map(async (_, idx) => {
        // Build slightly different prompt descriptions for each variation to ensure aesthetic diversity
        const variationModifiers = [
          "mystical atmosphere, dramatic depth, highly detailed, masterfully shot",
          "vivid colors, rich textures, dreamy ambiance, crisp resolution",
          "minimalist composition, cinematic lighting, elegant focus, ethereal style",
          "hyper-detailed background, cinematic contrast, premium aesthetic, spectacular angle"
        ];
        
        const modifiedPrompt = `${prompt}, ${variationModifiers[idx]}, masterpiece, desktop phone wallpaper aesthetic`;
        const seed = Math.floor(Math.random() * 9999999) + 1;

        const parts: any[] = [];
        
        // Include reference image if remix mode is active
        if (referenceImage) {
          const matches = referenceImage.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            parts.push({
              inlineData: {
                mimeType: matches[1],
                data: matches[2]
              }
            });
          }
        }
        
        parts.push({ text: modifiedPrompt });

        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            seed,
            imageConfig: {
              aspectRatio,
              imageSize
            }
          }
        });

        // Find the image base64 data in the response parts
        let base64Data = "";
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              base64Data = part.inlineData.data;
              break;
            }
          }
        }

        if (!base64Data) {
          throw new Error(`Model did not return image data for variation ${idx + 1}`);
        }

        return {
          id: `wall_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
          url: `data:image/png;base64,${base64Data}`,
          prompt,
          vibe: prompt,
          aspectRatio,
          size: imageSize,
          model: modelName,
          timestamp: Date.now(),
          referenceImageUsed: referenceImage ? referenceImage.substring(0, 100) + "..." : undefined
        };
      });

      const wallpapers = await Promise.all(variationPromises);
      return res.json({ wallpapers });

    } catch (error: any) {
      console.error("Generation error:", error);
      return res.status(500).json({ 
        error: error?.message || "An unexpected error occurred during image generation." 
      });
    }
  });

  // Vite Middleware integration for SPA routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
