import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBZKaIkDD5E-2rxluU7xVUb3IQCalVz-Yw";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json(
        { message: "Input is required for AI processing" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are an AI assistant that helps create promotional offers for a restaurant menu.
The user will provide a natural language description of an offer. Your task is to extract the following information and format it as a JSON object.
If a piece of information is not explicitly mentioned, use a reasonable default or leave it null/undefined.

JSON Schema for the output:
{
  "name": string, // e.g., "Friday Happy Hour"
  "description": string (optional),
  "offerType": "DISCOUNT" | "BUY_ONE_GET_ONE" | "FIXED_PRICE",
  "discountValue": number (percentage or amount),
  "targetType": "ALL" | "CATEGORY" | "SUBCATEGORY" | "MENU_ITEM",
  "targetIds": string[] (optional, array of IDs if specific targets),
  "startDate": string (YYYY-MM-DD format, optional),
  "endDate": string (YYYY-MM-DD format, optional),
  "isForever": boolean,
  "daysOfWeek": number[] (0=Sunday, 6=Saturday, optional),
  "startTime": string (HH:mm format, optional),
  "endTime": string (HH:mm format, optional),
  "tableNumbers": string[] (optional, array of table numbers),
  "isActive": boolean
}

Examples:
- "20% discount on all food items every Friday from 5 PM to 9 PM for tables T-01, T-02, T-03, valid from January 1st to January 31st"
  => {
      "name": "Friday Happy Hour",
      "description": "20% discount on all food items",
      "offerType": "DISCOUNT",
      "discountValue": 20,
      "targetType": "ALL",
      "targetIds": [],
      "startDate": "2025-01-01",
      "endDate": "2025-01-31",
      "isForever": false,
      "daysOfWeek": [5],
      "startTime": "17:00",
      "endTime": "21:00",
      "tableNumbers": ["T-01", "T-02", "T-03"],
      "isActive": true
    }

- "Buy one get one free on all drinks every weekend"
  => {
      "name": "Weekend BOGO Drinks",
      "description": "Buy one get one free on all drinks",
      "offerType": "BUY_ONE_GET_ONE",
      "discountValue": null,
      "targetType": "ALL",
      "targetIds": [],
      "startDate": null,
      "endDate": null,
      "isForever": true,
      "daysOfWeek": [0, 6],
      "startTime": null,
      "endTime": null,
      "tableNumbers": [],
      "isActive": true
    }

User input: "${input}"

Provide ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text().trim();

    // Extract JSON
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/```\n?/g, "");
    }

    const parsedOffer = JSON.parse(rawText);

    return NextResponse.json(parsedOffer);
  } catch (error: any) {
    console.error("Error processing offer with AI:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process offer with AI" },
      { status: 500 }
    );
  }
}
