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
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barCount = 48;
    const gap = 3;
    const barWidth = (canvas.width - (barCount - 1) * gap) / barCount;
    const step = Math.floor(bufferLength / barCount);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const barHeight = (value / 255) * canvas.height * 0.9;
        const x = i * (barWidth + gap);
        const y = canvas.height - barHeight;

        const hue = 168 + (i / barCount) * 162;
        const lightness = 50 + (value / 255) * 15;

        ctx.fillStyle = `hsla(${hue}, 85%, ${lightness}%, 0.85)`;

        const radius = Math.min(barWidth / 2, 4);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, canvas.height);
        ctx.lineTo(x, canvas.height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, audioContext, analyser]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={140}
        className="w-full h-32 sm:h-36"
      />
    </div>
  );
};
