import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
}

export const AudioVisualizer = ({ isPlaying, audioContext, analyser }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isPlaying || !audioContext || !analyser || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "hsl(220, 25%, 8%)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, "hsl(180, 100%, 50%)");
        gradient.addColorStop(0.5, "hsl(180, 80%, 40%)");
        gradient.addColorStop(1, "hsl(200, 80%, 35%)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = "hsl(180, 100%, 50%)";
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        ctx.shadowBlur = 0;

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioContext, analyser]);

  return (
    <div className="w-full h-32 border border-primary/30 rounded-lg overflow-hidden bg-card">
      <canvas
        ref={canvasRef}
        width={800}
        height={128}
        className="w-full h-full"
      />
    </div>
  );
};
