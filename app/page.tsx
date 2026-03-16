"use client";

import AudioPlayerController from "@/components/AudioPlayerController";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRef, useState } from "react";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [result, setResult] = useState<{
    spectrogram: string;
    midi: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;

    setIsTranscribing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("model", "default"); // Pass a model identifier required by your backend

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to transcribe audio");
      }

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="flex gap-4 mt-4">
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button
          onClick={handleUploadClick}
          className="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Upload Audio
        </Button>
        <Button className="px-4 py-2 font-semibold text-white bg-red-500 rounded hover:bg-red-600">
          Record Audio
        </Button>
      </div>

      {audioFile && (
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">Selected: {audioFile.name}</p>
          <Button onClick={handleTranscribe} disabled={isTranscribing}>
            {isTranscribing ? "Transcribing..." : "Transcribe"}
          </Button>
        </div>
      )}

      {error && <p className="font-medium text-red-500">{error}</p>}

      <div>
        <AudioPlayerController audioFile={audioFile} />
      </div>

      <div className="flex flex-col gap-8 mt-8">
        <div>
          <h1 className="mb-4 text-2xl font-bold">Mel Spectrogram</h1>
          {result?.spectrogram ? (
            <Image
              src={result.spectrogram}
              alt="Mel Spectrogram"
              className="w-full max-w-3xl border rounded shadow-sm dark:border-zinc-800"
              width={500}
              height={400}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-64 rounded max-w-3xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
              No spectrogram generated yet.
            </div>
          )}
        </div>

        <div>
          <h1 className="mb-4 text-2xl font-bold">Midi Visualizer</h1>
          {result?.midi ? (
            <a
              href={result.midi}
              download="transcription.mid"
              className="inline-block px-4 py-2 font-semibold text-white transition-colors bg-green-500 rounded hover:bg-green-600"
            >
              Download MIDI
            </a>
          ) : (
            <div className="flex items-center justify-center w-full h-64 rounded max-w-3xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
              No MIDI generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
