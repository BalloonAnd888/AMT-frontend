import { Play, Pause, Rewind, Square } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface AudioControllerProps {
  audioFile: File | null;
}

export default function AudioController({ audioFile }: AudioControllerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] =
    useState<boolean>(false);

  useEffect(() => {
    if (audioFile && audioRef.current) {
      const objectUrl = URL.createObjectURL(audioFile);
      audioRef.current.src = objectUrl;

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [audioFile]);

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
    }
  };

  const handlePlayPause = () => {
    if (!audioFile) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress(
        (audioRef.current.currentTime / audioRef.current.duration) * 100 || 0,
      );
    }
  };

  const handleSeek = (clientX: number) => {
    if (progressBarRef.current && audioRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percentage * duration;

      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(percentage * 100);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!audioFile) return;
    setIsDragging(true);
    if (isPlaying) {
      setWasPlayingBeforeDrag(true);
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setWasPlayingBeforeDrag(false);
    }
    handleSeek(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleSeek(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (wasPlayingBeforeDrag && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setCurrentTime(0);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
          <div className="w-full">
            <div
              className="cursor-pointer py-2"
              ref={progressBarRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <Progress value={progress} className="pointer-events-none" />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRewind}
              disabled={!audioFile}
            >
              <Rewind className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              disabled={!audioFile}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStop}
              disabled={!audioFile}
            >
              <Square className="w-6 h-6" />
            </Button>
          </div>
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
