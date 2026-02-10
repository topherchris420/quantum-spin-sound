import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
}

export const Controls = ({ isPlaying, onPlayPause, onReset }: ControlsProps) => {
  return (
    <div className="flex gap-3 items-center justify-center">
      <Button
        onClick={onPlayPause}
        size="lg"
        className="relative bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-sm font-semibold tracking-wide shadow-[var(--glow-shadow)] hover:shadow-[var(--glow-shadow-strong)] unified-transition"
      >
        {isPlaying ? (
          <>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Play
          </>
        )}
      </Button>
      
      <Button
        onClick={onReset}
        variant="outline"
        size="lg"
        className="rounded-full px-6 py-3 text-sm border-border/50 hover:bg-muted/50 hover:border-primary/30 unified-transition"
      >
        <RotateCcw className="mr-2 h-3.5 w-3.5" />
        Reset
      </Button>
    </div>
  );
};
