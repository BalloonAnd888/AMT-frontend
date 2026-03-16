import { NextResponse } from "next/server";
import { Client } from "@gradio/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    const model = formData.get("model") as string;

    if (!file || !model) {
      return NextResponse.json(
        { error: "Missing file or model selection." },
        { status: 400 },
      );
    }

    const GRADIO_URL =
      process.env.GRADIO_BACKEND_URL || "http://127.0.0.1:7860/";

    console.log(`Connecting to Gradio at: ${GRADIO_URL}`);
    const app = await Client.connect(GRADIO_URL);

    const result = await app.predict(0, [file, model]);

    const responseData = result.data as { url: string }[];
    const spectrogramData = responseData[0];

    const [imageResponse] = await Promise.all([fetch(spectrogramData.url)]);

    if (!imageResponse.ok) {
      throw new Error("Failed to fetch generated files from the backend.");
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    return NextResponse.json({
      spectrogram: `data:image/png;base64,${imageBase64}`,
    });
  } catch (error) {
    console.error("Transcription API Error:", error);
    return NextResponse.json(
      { error: "Failed to process audio and generate transcription." },
      { status: 500 },
    );
  }
}
