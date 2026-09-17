var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set. Please configure it in the Secrets panel.");
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "20mb" }));
  app.use(import_express.default.urlencoded({ limit: "20mb", extended: true }));
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
  app.use(import_express.default.static(import_path.default.join(process.cwd(), "public")));
  app.post("/api/generate", async (req, res) => {
    try {
      const {
        prompt,
        aspectRatio = "9:16",
        imageSize = "1K",
        quality = "standard",
        referenceImage
      } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "A valid wallpaper description (vibe) is required." });
      }
      const ai = getGeminiClient();
      const modelName = quality === "studio" ? "gemini-3-pro-image-preview" : "gemini-3.1-flash-image-preview";
      console.log(`Generating 4 variations using model: ${modelName}, Aspect Ratio: ${aspectRatio}, Size: ${imageSize}, Remixing: ${!!referenceImage}`);
      const variationPromises = Array.from({ length: 4 }).map(async (_, idx) => {
        const variationModifiers = [
          "mystical atmosphere, dramatic depth, highly detailed, masterfully shot",
          "vivid colors, rich textures, dreamy ambiance, crisp resolution",
          "minimalist composition, cinematic lighting, elegant focus, ethereal style",
          "hyper-detailed background, cinematic contrast, premium aesthetic, spectacular angle"
        ];
        const modifiedPrompt = `${prompt}, ${variationModifiers[idx]}, masterpiece, desktop phone wallpaper aesthetic`;
        const seed = Math.floor(Math.random() * 9999999) + 1;
        const parts = [];
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
          referenceImageUsed: referenceImage ? referenceImage.substring(0, 100) + "..." : void 0
        };
      });
      const wallpapers = await Promise.all(variationPromises);
      return res.json({ wallpapers });
    } catch (error) {
      console.error("Generation error:", error);
      return res.status(500).json({
        error: error?.message || "An unexpected error occurred during image generation."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
