import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  url?: string;
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset error state and playback when URL changes
  useEffect(() => {
    setHasError(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => setIsPlaying(false);
    const onError = () => setHasError(true);
    const onCanPlay = () => setHasError(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('canplay', onCanPlay);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, [url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setHasError(true);
        setIsPlaying(false);
      });
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolume = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const v = value[0];
    audio.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Music className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Audio Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Audio lecture hasn't been uploaded for this chapter yet.
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Unable to Load Audio
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The browser could not play this audio link directly. Try opening it externally.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary dark:bg-blue-600 text-white text-sm font-medium hover:bg-primary/90 dark:hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Audio Link
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Pass URL directly to audio element — no pre-validation */}
      <audio ref={audioRef} src={url} preload="metadata" />
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        {/* Icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-primary dark:bg-blue-600 flex items-center justify-center shadow-lg">
            <Music className="w-10 h-10 text-white" />
          </div>
        </div>
        <p className="text-center font-heading font-semibold text-lg text-gray-900 dark:text-white mb-6">
          Audio Lecture
        </p>

        {/* Progress */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Play/Pause */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            onClick={togglePlay}
            size="lg"
            className="w-14 h-14 rounded-full p-0 bg-primary dark:bg-blue-600 hover:bg-primary/90 dark:hover:bg-blue-700 text-white"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="rounded-xl shrink-0 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolume}
            className="flex-1"
          />
        </div>

        {/* External link fallback */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-blue-400 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open in browser
          </a>
        </div>
      </div>
    </div>
  );
}
