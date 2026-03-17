"use client";

import AudioPlayerController from "@/components/AudioPlayerController";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ModelOption = {
  value: string;
  label: string;
};

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("default");
  const [result, setResult] = useState<{
    spectrogram: string;
    midi: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/models");
        if (response.ok) {
          const data = await response.json();
          const modelsList: Array<{ value: string; label: string } | string> =
            Array.isArray(data) ? data : data.models || [];

          const normalizedModels = modelsList.map((m) =>
            typeof m === "string"
              ? { value: m, label: m }
              : { value: m.value, label: m.label },
          );

          setModels(normalizedModels);
          if (normalizedModels.length > 0) {
            setSelectedModel(normalizedModels[0].value);
          }
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
      }
    };

    fetchModels();
  }, []);

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
      formData.append("model", selectedModel);

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

  const selectedModelLabel =
    models.find((m) => m.value === selectedModel)?.label ?? selectedModel;

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700">
            Model: {selectedModelLabel} <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuRadioGroup
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            {models.map((model) => {
              return (
                <DropdownMenuRadioItem key={model.value} value={model.value}>
                  {model.label}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

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
            <div>
              <midi-player
                src={result.midi}
                sound-font
                visualizer="#midi-visualizer"
              ></midi-player>
              <midi-visualizer
                src={result.midi}
                id="midi-visualizer"
                type="piano-roll"
              ></midi-visualizer>
            </div>
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
