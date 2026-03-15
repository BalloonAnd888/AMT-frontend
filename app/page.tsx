"use client";

import AudioPlayerController from "@/components/AudioPlayerController";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950">
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

      <h1>Mel Spectrogram</h1>
      <h1>Midi Visualizer</h1>

      <div>
        <AudioPlayerController audioFile={audioFile} />
      </div>

      {audioFile && (
        <p className="mt-2 text-sm text-gray-600">Selected: {audioFile.name}</p>
      )}
    </div>
  );
}
