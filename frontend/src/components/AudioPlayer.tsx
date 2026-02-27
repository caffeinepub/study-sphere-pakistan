import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, ExternalLink, AlertCircle } from "lucide-react";

interface AudioPlayerProps {
  url: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset state when URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
  }, [url]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setHasError(true));
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    const vol = value[0];
    setVolume(vol);
    if (audio) {
      audio.volume = vol;
      audio.muted = vol === 0;
    }
    setIsMuted(vol === 0);
  };

  const handleMuteToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !isMuted;
    audio.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleEnded = () => setIsPlaying(false);
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleError = () => setHasError(true);

  // For blob URLs, don't show external link (they're not shareable)
  const isBlobUrl = url.startsWith("blob:");
  const isExternalUrl = !isBlobUrl && (url.startsWith("http://") || url.startsWith("https://"));

  if (hasError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-destructive opacity-70" />
        <div>
          <p className="font-medium text-foreground">Unable to load audio</p>
          <p className="text-sm text-muted-foreground mt-1">
            The audio file could not be played in your browser.
          </p>
        </div>
        {isExternalUrl && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Open Audio Link
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        preload="metadata"
      />

      {/* Play/Pause + Time */}
      <div className="flex items-center gap-4">
        <Button
          variant="default"
          size="icon"
          onClick={handlePlayPause}
          className="h-12 w-12 rounded-full shrink-0"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>

        <div className="flex-1 space-y-1">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 1}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleMuteToggle} className="h-8 w-8 shrink-0">
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-28"
        />
        {isExternalUrl && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open in browser
          </a>
        )}
      </div>
    </div>
  );
}
