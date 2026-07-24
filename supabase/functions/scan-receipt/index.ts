import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI } from "npm:@google/genai";

const ai = new GoogleGenAI({
  apiKey: Deno.env.get("GEMINI_API_KEY")!,
});

Deno.serve(async (req) => {
  try {
    const { image, mimeType } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No image provided",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prompt = `
You are an AI receipt parser.

Analyze the receipt image and return ONLY valid JSON.

Rules:
- Do not wrap the response in markdown.
- Do not explain anything.
- If a value is missing, use null.
- Category should be one of:
  Groceries
  Food & Drinks
  Shopping
  Entertainment
  Transport
  Healthcare
  Bills
  Travel
  Education
  Other

Return exactly this schema:

{
  "merchant": "",
  "amount": 0,
  "date": "",
  "category": "",
  "items": [
    {
      "name": "",
      "price": 0
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: mimeType ?? "image/jpeg",
                data: image,
              },
            },
          ],
        },
      ],
    });

    const text = response.text ?? "";

    // Remove markdown fences if Gemini accidentally returns them
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          rawResponse: text,
          error: "Gemini did not return valid JSON.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        receipt: parsed,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});