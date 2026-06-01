import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const __filename = typeof import.meta !== "undefined" && import.meta.url ? fileURLToPath(import.meta.url) : "";
const __dirname = __filename ? path.dirname(__filename) : "";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase client from env
  const supabaseUrl = process.env.SUPABASE_URL || 'https://ftilzhekqutqmdjiewbg.supabase.co';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_lQdzEhuU_LlME7vXSWNskA_-Ga7D-fw';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Gemini Setup
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // 1. Health API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", supabaseUrl });
  });

  // secure mentor chat routing
  app.post("/api/mentor/ask", async (req: Request, res: Response) => {
    try {
      const { prompt, history, studentContext, timetable, customSystemInstruction } = req.body;
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not defined in server environment settings." });
      }
      const client = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const systemInstruction = customSystemInstruction || `You are the ITA Personal AI Mentor, the supreme cognitive layer of IT INTERNATIONAL ACADEMY.
      
      ACADEMY SCHEDULE & TIMETABLE:
      ${timetable || ''}
      
      STUDENT REAL-TIME ACADEMIC PROFILE:
      ${studentContext || ''}
      
      STRICT OPERATIONAL DIRECTIVES:
      1. ACCURACY FIRST: You are a technical expert. If a student asks a technical question about CCNA, Networking, Cyber Security, or Code, provide industry-standard, accurate information. Never hallucinate technical commands or concepts.
      2. CURRICULUM ALIGNMENT: Reference the student's current progress and modules to provide contextual advice. If they are in a specific module (e.g. Cisco Networking), focus your examples on that domain.
      3. NO GUESSING: If you are unsure about a student's specific grade or data point not provided in the context, politely explain that you lack that specific record but can help with the general concept.
      4. TONALITY: Maintain a visionary, sophisticated, and encouraging tone. Use professional Markdown (tables, bold text, code blocks) for layout.
      5. LEARN-BY-DOING: Adhere to the ITA 90% Practical Ethos. When explaining, prioritize hands-on steps and "Build first" mentalities.
      6. IDENTITY: You are an AI, but you represent the prestige and rigor of ITA.
      
      EXPERTISE DOMAIN: Cisco Networking (CCNA/CCNP), Cyber Security, Software Engineering, Linux Administration, and Digital Transformation.`;

      const contents = (history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      if (prompt && prompt.trim().length > 0) {
        contents.push({ role: 'user', parts: [{ text: prompt }] });
      }

      console.log("[Mentor API] Processing request with model gemini-3.5-flash");
      const modelResponse = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ text: modelResponse.text || "I am processing your request. Please hold." });
    } catch (err: any) {
      console.error("[Mentor API Error]:", err);
      return res.status(500).json({ error: err.message || "Ask Mentor handler encountered a neural sync fault." });
    }
  });

  // secure grading routing
  app.post("/api/submission/grade", async (req: Request, res: Response) => {
    try {
      const { sub } = req.body;
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not defined in server environment settings." });
      }
      const client = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const textPrompt = `You are a professional assessor at IT International Academy. Please grade this ${sub.type} submission with extreme scrutiny:
      Title: ${sub.title}
      Module: ${sub.moduleId}
      Student: ${sub.studentName}
      
      CRITERIA:
      1. Technical Accuracy
      2. Completeness
      3. Logic & Structure`;

      const parts: any[] = [{ text: textPrompt }];
      if (sub.fileUrl && sub.fileUrl.startsWith('data:')) {
        const [header, base64Data] = sub.fileUrl.split(',');
        const mimeType = header.split(':')[1].split(';')[0];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType
          }
        });
      }

      console.log("[Grading API] Processing submission grading...");
      const modelResponse = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              grade: { type: Type.NUMBER },
              feedback: { type: Type.STRING }
            },
            required: ["grade", "feedback"]
          },
          temperature: 0.1
        }
      });

      const designResult = JSON.parse(modelResponse.text || "{}");
      return res.json(designResult);
    } catch (err: any) {
      console.error("[Grading API Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to parse standard grading metrics." });
    }
  });

  // secure exam grading routing
  app.post("/api/exam/grade", async (req: Request, res: Response) => {
    try {
      const { examContext } = req.body;
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not defined in server environment settings." });
      }
      const client = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      console.log("[Exam Grading API] Processing exam context grading...");
      const modelResponse = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: `Grade this mock exam: ${JSON.stringify(examContext)}` }] }],
        config: {
          systemInstruction: "You are an expert examiner. For Multiple Choice: index match. For Short Answer/Essay: quality grade.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING }
            },
            required: ["score", "feedback"]
          },
          temperature: 0.1
        }
      });

      const designResult = JSON.parse(modelResponse.text || "{}");
      return res.json(designResult);
    } catch (err: any) {
      console.error("[Exam Grading API Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to score exam." });
    }
  });

  // 2. Generate Syllabus & Insert to Supabase API
  app.post("/api/courses/generate", async (req: Request, res: Response) => {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    if (!ai) {
      return res.status(500).json({ error: "Gemini API client is not initialized. Please verify your GEMINI_API_KEY." });
    }

    try {
      console.log(`Generating syllabus for topic: ${topic}`);
      const prompt = `Generate a comprehensive 3-module syllabus for a college-level course about: "${topic}" under the banner "IT INTERNATIONAL ACADEMY".
Each module must have exactly 1 lesson. For each lesson, generate exactly 5 highly interactive and visually structured study slides.
Each slide must have:
- title: A focused, clear concept name.
- bullets: Exactly 3 high-impact educational bullet points explaining the core keys of the slide topic.
- imagePrompt: A detailed, beautiful AI image generation instruction describing diagrams, network schemas, dashboards, code workspaces, or high-end visual vectors relevant to this slide.
Also include a narrator lecture script (100-150 words) for the AI video avatar to narrate.
Provide the response in structured JSON with Name, Description, Duration, and the 3 Modules.`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the course" },
              description: { type: Type.STRING, description: "A detailed description" },
              duration: { type: Type.STRING, description: "Typical duration of the course (e.g. 3 weeks, 1 month)" },
              modules: {
                type: Type.ARRAY,
                description: "List of modules in the syllabus (must be exactly 3)",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Title of the module" },
                    order: { type: Type.INTEGER, description: "Order sequence (1-3)" },
                    lessons: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING, description: "Title of the lesson" },
                          slides: {
                            type: Type.ARRAY,
                            description: "Exactly 5 interactive slides for this lesson",
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                title: { type: Type.STRING, description: "Title of the slide" },
                                bullets: {
                                  type: Type.ARRAY,
                                  items: { type: Type.STRING },
                                  description: "Exactly 3 concise bullet points explaining key concepts"
                                },
                                imagePrompt: { type: Type.STRING, description: "Detailed description prompt for visual painting" }
                              },
                              required: ["title", "bullets", "imagePrompt"]
                            }
                          },
                          script: { type: Type.STRING, description: "Syllabus lecture script (100-200 words) for AI video avatar to narrate" },
                          order: { type: Type.INTEGER, description: "Lesson order" }
                        },
                        required: ["title", "slides", "script", "order"]
                      }
                    }
                  },
                  required: ["title", "order", "lessons"]
                }
              }
            },
            required: ["name", "description", "duration", "modules"]
          }
        }
      });

      const text = geminiResponse.text;
      if (!text) {
        throw new Error("No response text received from Gemini");
      }

      const courseData = JSON.parse(text);

      // Generate UNIQUE clean v4 UUID for database compatibility
      const courseId = crypto.randomUUID();

      console.log(`Inserting course: ${courseId} - ${courseData.name}`);

      // Insert Course
      const { error: courseError } = await supabase.from('courses').insert({
        id: courseId,
        name: courseData.name,
        duration: courseData.duration
      });

      if (courseError) {
        console.error("Supabase Course Insert Error:", courseError);
        throw courseError;
      }

      // Insert Modules & Lessons into Supabase
      if (courseData.modules && Array.isArray(courseData.modules)) {
        for (let mIdx = 0; mIdx < courseData.modules.length; mIdx++) {
          const mod = courseData.modules[mIdx];
          const moduleId = crypto.randomUUID();
          
          try {
            const { error: modError } = await supabase.from('modules').insert({
              id: moduleId,
              course_id: courseId,
              title: mod.title,
              order: mod.order || (mIdx + 1)
            });

            if (modError) {
              console.warn("Supabase Module Insert Warning (non-blocking):", modError);
            }
          } catch (e) {
            console.warn("Exception inserting module (non-blocking):", e);
          }

          if (mod.lessons && Array.isArray(mod.lessons)) {
            for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
              const les = mod.lessons[lIdx];
              const lessonId = crypto.randomUUID();
              
              try {
                // Store the 5 interactive slides as serialised JSON in content
                const contentValue = les.slides ? JSON.stringify(les.slides) : "[]";
                const { error: lesError } = await supabase.from('lessons').insert({
                  id: lessonId,
                  module_id: moduleId,
                  title: les.title,
                  content: contentValue,
                  order: les.order || (lIdx + 1),
                  external_links: JSON.stringify([{ title: `${les.title} Lecture Script`, url: '#_script', scriptText: les.script }])
                });

                if (lesError) {
                  console.warn("Supabase Lesson Insert Warning (non-blocking):", lesError);
                }
              } catch (e) {
                console.warn("Exception inserting lesson (non-blocking):", e);
              }
            }
          }
        }
      }

      // Return the JSON response including courseId and generated data
      return res.json({
        success: true,
        courseId,
        course: {
          id: courseId,
          ...courseData
        }
      });
    } catch (err: any) {
      console.error("Generating course syllabus error:", err);
      res.status(500).json({ error: err.message || "Failed to generate course" });
    }
  });

  // 3. Trigger Lecture Video Generation using HeyGen
  app.post("/api/generate-lecture-video", async (req: Request, res: Response) => {
    const { courseId, script } = req.body;
    if (!courseId || !script) {
      return res.status(400).json({ error: "Missing courseId or lecture script." });
    }

    const apiKey = process.env.HEYGEN_API_KEY;
    
    // Dynamic Webhook host and protocol resolution:
    const host = req.get('host');
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const webhookUrl = `${protocol}://${host}/api/webhook/heygen?courseId=${courseId}`;

    console.log(`Triggering HeyGen v3 for course ${courseId} via webhook: ${webhookUrl}`);

    if (!apiKey) {
      console.warn("HEYGEN_API_KEY is not configured in .env. Firing simulated mock webhook completion...");
      // Simulate rendering
      setTimeout(async () => {
        try {
          console.log(`[SIMULATION] Sending completed callback webhook triggered for courseId: ${courseId}`);
          const simulatedVideoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // standard open source movie URL
          const updateResponse = await fetch(`${protocol}://${host}/api/webhook/heygen?courseId=${courseId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: "simulated_heygen_id",
              event: "video_completed",
              data: {
                video_id: "simulated_heygen_id",
                status: "completed",
                video_url: simulatedVideoUrl
              }
            })
          });
          console.log(`[SIMULATION] Webhook status: ${updateResponse.status}`);
        } catch (e) {
          console.error("[SIMULATION] Failed to invoke webhook caller:", e);
        }
      }, 5000);

      // We can update the courses table that video is "generating" in DB
      await supabase.from("courses").update({ duration: "generating" }).eq("id", courseId);

      return res.json({
        success: true,
        simulated: true,
        message: "Video request accepted. Simulated HeyGen rendering task started in the background (completes in 5 seconds)."
      });
    }

    try {
      // Real API call to HeyGen v3 Create Video Endpoint ONLY
      const heygenRes = await fetch("https://api.heygen.com/v3/video/generate", {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "x-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          video_setting: {
            aspect_ratio: "16:9",
            resolution: "high"
          },
          video_inputs: [
            {
              character: {
                type: "avatar",
                avatar_id: "Daisy-insuit-20220818",
                avatar_style: "normal"
              },
              voice: {
                type: "text",
                input_text: script,
                voice_id: "1bd001e7e50f421d891986aad5c8bbd2"
              }
            }
          ],
          callback_url: webhookUrl
        })
      });

       if (!heygenRes.ok) {
        const errorText = await heygenRes.text();
        console.error("HeyGen API returned error:", errorText);
        return res.status(heygenRes.status).json({ error: `HeyGen API error: ${errorText}` });
      }

      const heygenData = await heygenRes.json();
      console.log("HeyGen API Response:", heygenData);

      // Handle application-level error objects inside successful 200 HTTP responses
      if (heygenData.error && heygenData.error !== null) {
        const errorMsg = heygenData.error.message || JSON.stringify(heygenData.error);
        console.error("HeyGen API returned application error:", errorMsg);
        return res.status(400).json({ error: `HeyGen API error: ${errorMsg}` });
      }

      // Extract video_id from the nested .data structure returned by HeyGen v2/v3
      const videoId = heygenData.data?.video_id || heygenData.video_id || (heygenData.data && heygenData.data.id);

      if (!videoId) {
        console.warn("Could not find videoId in HeyGen response data. Falling back or reporting empty.");
      }

      // Update the courses table to indicate that the video is now "generating"
      try {
        const { error: updateError } = await supabase
          .from("courses")
          .update({ duration: "generating" })
          .eq("id", courseId);

        if (updateError) {
          console.error("Supabase Course Update Error (non-blocking status update):", updateError);
        }
      } catch (dbEx) {
        console.error("Exception writing course status update to Supabase (non-blocking):", dbEx);
      }

      return res.json({
        success: true,
        videoId: videoId || "unknown_video_id",
        status: heygenData.data?.status || "processing",
        message: "HeyGen video generation initiated successfully."
      });
    } catch (err: any) {
      console.error("HeyGen integration error:", err);
      res.status(500).json({ error: err.message || "Failed to trigger HeyGen rendering." });
    }
  });

  // Proxy endpoint to check HeyGen v3 status securely
  app.get("/api/heygen/status/:video_id", async (req: Request, res: Response) => {
    const video_id = req.params.video_id;
    if (!video_id || typeof video_id !== "string") {
      return res.status(400).json({ error: "Missing or invalid video_id parameter" });
    }
    const apiKey = process.env.HEYGEN_API_KEY;

    // Support simulated video checks when no API key is set
    if (!apiKey || video_id === "simulated_heygen_id" || video_id === "unknown_video_id" || video_id.startsWith("simulated_")) {
      console.log(`[SIMULATION] Returning mock successful v3 status for video job ${video_id}`);
      return res.json({
        data: {
          status: "completed",
          video_url: "https://www.w3schools.com/html/mov_bbb.mp4"
        }
      });
    }

    try {
      console.log(`[Proxy] Checking HeyGen v3 status for video ${video_id}...`);
      const heygenRes = await fetch(`https://api.heygen.com/v3/videos/${video_id}`, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "accept": "application/json"
        }
      });

      if (!heygenRes.ok) {
        console.error(`HeyGen v3 API status call failed for ${video_id} with code ${heygenRes.status}`);
        return res.status(heygenRes.status).json({ error: `HeyGen API status check failed: ${heygenRes.statusText}` });
      }

      const responseData = await heygenRes.json();
      console.log(`[Proxy] HeyGen v3 status response for ${video_id}:`, JSON.stringify(responseData));
      return res.json(responseData);
    } catch (err: any) {
      console.error("Exception in HeyGen v3 status proxy:", err);
      return res.status(500).json({ error: err.message || "Internal server error checked via status proxy." });
    }
  });

  // 4. HeyGen Webhook endpoint
  app.post("/api/webhook/heygen", async (req: Request, res: Response) => {
    console.log("HeyGen webhook triggered with query:", req.query, "body:", req.body);
    const { courseId } = req.query;
    
    if (!courseId) {
      console.error("Webhook triggered but missing courseId query parameter.");
      return res.status(400).json({ error: "Missing courseId" });
    }

    try {
      // Support nested payload object (useful for multiple webhook variations)
      const payloadNode = req.body.payload || req.body || {};
      const dataNode = payloadNode.data || req.body.data || {};
      
      const status = (
        dataNode.status || 
        payloadNode.status || 
        req.body.status || 
        req.body.event || 
        payloadNode.event || 
        req.body.event_type || 
        payloadNode.event_type || 
        ""
      ).toLowerCase();
      
      const isCompleted = 
        status === "complete" || 
        status === "completed" || 
        status === "video_completed" || 
        status === "video.completed" || 
        status === "success";

      if (isCompleted) {
        const videoUrl = 
          dataNode.video_url || 
          payloadNode.video_url || 
          req.body.video_url || 
          dataNode.download_url || 
          payloadNode.download_url || 
          req.body.download ||
          payloadNode.download;
        
        if (!videoUrl) {
          console.error("HeyGen reported video completion but did not supply a valid download/video_url in payload:", req.body);
          return res.status(400).json({ error: "Missing video download/render URL in payload" });
        }

        console.log(`Webhook reports video completed. Updating course ${courseId} videoUrl to: ${videoUrl}`);

        const { error: dbError } = await supabase
          .from("courses")
          .update({ duration: videoUrl })
          .eq("id", courseId);

        if (dbError) {
          console.error(`Database update error for course ${courseId}:`, dbError);
          return res.status(500).json({ error: dbError.message });
        }

        console.log(`Successfully updated video_url for course ${courseId}`);
      } else {
        console.log(`Webhook reports active video status: ${status} for course: ${courseId}`);
      }

      return res.json({ success: true });
    } catch (err: any) {
      console.error("Webhook processing error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Vite Server registration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
