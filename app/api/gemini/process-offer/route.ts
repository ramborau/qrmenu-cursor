import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyBZKaIkDD5E-2rxluU7xVUb3IQCalVz-Yw"
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json(
        { message: "Input is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Parse the following offer description and extract structured information. Return ONLY valid JSON in this exact format:
{
  "name": "string - short name for the offer",
  "description": "string - full description",
  "offerType": "DISCOUNT, BUY_ONE_GET_ONE, or FIXED_PRICE",
  "discountValue": number - percentage or fixed amount,
  "targetType": "ALL, CATEGORY, SUBCATEGORY, or MENU_ITEM",
  "targetIds": [] - array of IDs if targetType is not ALL,
  "startDate": "YYYY-MM-DD or null",
  "endDate": "YYYY-MM-DD or null",
  "isForever": boolean,
  "daysOfWeek": [0-6] - array of numbers (0=Sunday, 6=Saturday), empty array means all days,
  "startTime": "HH:mm or null",
  "endTime": "HH:mm or null"
}

User description: "${input}"

If information is missing, use reasonable defaults:
- offerType: "DISCOUNT"
- discountValue: 10
- targetType: "ALL"
- targetIds: []
- startDate: null (today)
- endDate: null
- isForever: false
- daysOfWeek: [] (all days)
- startTime: null
- endTime: null

Return ONLY the JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    try {
      const parsed = JSON.parse(jsonText);

      // Validate and return
      return NextResponse.json({
        name: parsed.name || "Special Offer",
        description: parsed.description || "",
        offerType: ["DISCOUNT", "BUY_ONE_GET_ONE", "FIXED_PRICE"].includes(parsed.offerType)
          ? parsed.offerType
          : "DISCOUNT",
        discountValue: typeof parsed.discountValue === "number" ? parsed.discountValue : 10,
        targetType: parsed.targetType || "ALL",
        targetIds: Array.isArray(parsed.targetIds) ? parsed.targetIds : [],
        startDate: parsed.startDate || null,
        endDate: parsed.endDate || null,
        isForever: parsed.isForever === true,
        daysOfWeek: Array.isArray(parsed.daysOfWeek)
          ? parsed.daysOfWeek.filter((d: number) => d >= 0 && d <= 6)
          : [],
        startTime: parsed.startTime || null,
        endTime: parsed.endTime || null,
      });
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        { message: "Failed to parse AI response", raw: text },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("AI processing error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process with AI" },
      { status: 500 }
    );
  }
}
