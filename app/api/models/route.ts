import { NextResponse } from "next/server";
import { Client } from "@gradio/client";

export async function GET() {
  try {
    const GRADIO_URL =
      process.env.GRADIO_BACKEND_URL || "http://127.0.0.1:7860/";
    const app = await Client.connect(GRADIO_URL);

    const result = await app.predict(1, []);

    const models = (result.data as string[][])[0];

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch available models." },
      { status: 500 },
    );
  }
}
