import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ExternalLink,
  Headphones,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  url: string;
  label?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Returns true if the URL is a direct audio file the browser can play via <audio>.
 */
function isDirectAudioUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    const directExtensions = [
      ".mp3",
      ".ogg",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".opus",
      ".webm",
      ".mp4",
    ];
    if (directExtensions.some((ext) => pathname.endsWith(ext))) return true;
    const ct = parsed.searchParams.get("content-type") ?? "";
    if (ct.startsWith("audio/")) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Converts various platform URLs into an embeddable iframe src.
 * Returns null if the URL cannot be embedded (should fall back to native player).
 */
function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Google Drive: https://drive.google.com/file/d/FILE_ID/view  OR  /open?id=FILE_ID
    if (hostname === "drive.google.com") {
      // file/d/ID/view → file/d/ID/preview
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      if (fileMatch) {
        return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
      }
      // open?id=ID → file/d/ID/preview
      const idParam = parsed.searchParams.get("id");
      if (idParam) {
        return `https://drive.google.com/file/d/${idParam}/preview`;
      }
    }

    // YouTube: https://www.youtube.com/watch?v=ID  OR  https://youtu.be/ID
    if (
      hostname === "www.youtube.com" ||
      hostname === "youtube.com" ||
      hostname === "youtu.be" ||
      hostname === "m.youtube.com"
    ) {
      let videoId: string | null = null;
      if (hostname === "youtu.be") {
        videoId = parsed.pathname.slice(1);
      } else {
        videoId = parsed.searchParams.get("v");
        if (!videoId) {
          const embedMatch = parsed.pathname.match(/\/embed\/([^/]+)/);
          if (embedMatch) videoId = embedMatch[1];
        }
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
      }
    }

    // SoundCloud: embed via oEmbed iframe
    if (hostname === "soundcloud.com" || hostname === "www.soundcloud.com") {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%230057B7&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
    }

    // Spotify: track/episode links
    if (hostname === "open.spotify.com") {
      const embedPath = parsed.pathname.replace(/^\/?/, "");
      return `https://open.spotify.com/embed/${embedPath}`;
    }

    // Dropbox: add ?raw=1 for direct streaming
    if (hostname === "www.dropbox.com" || hostname === "dropbox.com") {
      const rawUrl = url.replace(/[?&]dl=\d/, "").replace(/\?$/, "");
      const sep = rawUrl.includes("?") ? "&" : "?";
      return `${rawUrl}${sep}raw=1`;
    }

    // For any other URL — try embedding it directly in an iframe
    // This covers custom CDN links, OneDrive, Mega, etc.
    return url;
  } catch {
    return url;
  }
}

// ── Embedded iframe player (for platform URLs) ────────────────────────────────

function EmbeddedAudioPlayer({ url, label }: { url: string; label?: string }) {
  const embedUrl = getEmbedUrl(url);

  // Detect if it's a video embed (YouTube) vs audio-only to set height
  let frameHeight = 80;
  try {
    const parsed = new URL(url);
    const h = parsed.hostname.toLowerCase();
    if (
      h === "www.youtube.com" ||
      h === "youtube.com" ||
      h === "youtu.be" ||
      h === "m.youtube.com"
    ) {
      frameHeight = 315;
    } else if (h === "open.spotify.com") {
      frameHeight = 152;
    } else if (
      h === "w.soundcloud.com" ||
      h === "soundcloud.com" ||
      h === "www.soundcloud.com"
    ) {
      frameHeight = 166;
    } else {
      // Google Drive and other audio embeds
      frameHeight = 80;
    }
  } catch {
    frameHeight = 80;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {label && (
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-primary shrink-0" />
          <p className="font-semibold text-foreground text-sm">{label}</p>
        </div>
      )}

      <div className="w-full overflow-hidden rounded-lg bg-muted">
        <iframe
          src={embedUrl ?? url}
          width="100%"
          height={frameHeight}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          title={label ?? "Audio player"}
          className="block border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
        />
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors w-fit"
        data-ocid="audio.button"
      >
        <ExternalLink className="w-3 h-3" />
        Open in new tab
      </a>
    </div>
  );
}

// ── Native HTML5 player ───────────────────────────────────────────────────────

export default function AudioPlayer({ url, label }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const useNativePlayer = isDirectAudioUrl(url);

  // biome-ignore lint/correctness/useExhaustiveDependencies: setters are stable
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [url]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
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

  // Non-native URLs: embed via iframe so they play inline
  if (!useNativePlayer) {
    return <EmbeddedAudioPlayer url={url} label={label} />;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      {label && (
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-primary shrink-0" />
          <p className="font-semibold text-foreground text-sm">{label}</p>
        </div>
      )}

      {/* biome-ignore lint/a11y/useMediaCaption: audio lectures do not have caption tracks */}
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Play / Seek row */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={handlePlayPause}
          className="shrink-0 rounded-full w-10 h-10"
          data-ocid="audio.button"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <Slider
            min={0}
            max={duration || 1}
            step={0.1}
            value={[currentTime]}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Volume row */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleMuteToggle}
          className="shrink-0 h-8 w-8"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[isMuted ? 0 : volume]}
          onValueChange={handleVolumeChange}
          className="w-28"
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Open link
        </a>
      </div>
    </div>
  );
}
