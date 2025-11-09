import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
}

export const Controls = ({ isPlaying, onPlayPause, onReset }: ControlsProps) => {
  return (
    <div className="flex gap-4 items-center justify-center">
      <Button
        onClick={onPlayPause}
        size="lg"
        className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all"
      >
        {isPlaying ? (
          <>
            <Pause className="mr-2 h-5 w-5" />
            Pause
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            Play
          </>
        )}
      </Button>
      
      <Button
        onClick={onReset}
        variant="outline"
        size="lg"
        className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset Code
      </Button>
    </div>
  );
};
