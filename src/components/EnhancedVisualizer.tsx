import { useEffect, useRef } from "react";
import Meyda from "meyda";

interface EnhancedVisualizerProps {
  isPlaying: boolean;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
}

export const EnhancedVisualizer = ({ isPlaying, audioContext, analyser }: EnhancedVisualizerProps) => {
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const meydaRef = useRef<any>(null);

  useEffect(() => {
    if (!isPlaying || !audioContext || !analyser) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (meydaRef.current) {
        meydaRef.current.stop();
        meydaRef.current = null;
      }
      return;
    }

    const waveformCanvas = waveformCanvasRef.current;
    const spectrogramCanvas = spectrogramCanvasRef.current;
    if (!waveformCanvas || !spectrogramCanvas) return;

    const waveformCtx = waveformCanvas.getContext("2d");
    const spectrogramCtx = spectrogramCanvas.getContext("2d");
    if (!waveformCtx || !spectrogramCtx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDataArray = new Uint8Array(bufferLength);

    // Initialize Meyda for advanced audio analysis
    if (typeof Meyda !== "undefined") {
      meydaRef.current = Meyda.createMeydaAnalyzer({
        audioContext: audioContext,
        source: analyser,
        bufferSize: 512,
        featureExtractors: ["spectralCentroid", "rms", "energy"],
        callback: () => {}, // Features available via .get()
      });
      meydaRef.current.start();
    }

    let spectrogramHistory: number[][] = [];
    const maxHistoryLength = 100;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      // Get frequency and time domain data
      analyser.getByteFrequencyData(dataArray);
      analyser.getByteTimeDomainData(timeDataArray);

      // Draw Waveform
      waveformCtx.fillStyle = "hsl(220, 25%, 8%)";
      waveformCtx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);

      waveformCtx.lineWidth = 2;
      waveformCtx.strokeStyle = "hsl(180, 100%, 50%)";
      waveformCtx.shadowBlur = 10;
      waveformCtx.shadowColor = "hsl(180, 100%, 50%)";
      waveformCtx.beginPath();

      const sliceWidth = waveformCanvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeDataArray[i] / 128.0;
        const y = (v * waveformCanvas.height) / 2;

        if (i === 0) {
          waveformCtx.moveTo(x, y);
        } else {
          waveformCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      waveformCtx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
      waveformCtx.stroke();
      waveformCtx.shadowBlur = 0;

      // Draw Spectrogram
      spectrogramHistory.push(Array.from(dataArray));
      if (spectrogramHistory.length > maxHistoryLength) {
        spectrogramHistory.shift();
      }

      spectrogramCtx.fillStyle = "hsl(220, 25%, 8%)";
      spectrogramCtx.fillRect(0, 0, spectrogramCanvas.width, spectrogramCanvas.height);

      const barWidth = spectrogramCanvas.width / maxHistoryLength;
      const barHeight = spectrogramCanvas.height / bufferLength;

      for (let i = 0; i < spectrogramHistory.length; i++) {
        const snapshot = spectrogramHistory[i];
        for (let j = 0; j < snapshot.length; j++) {
          const value = snapshot[j];
          const intensity = value / 255;
          
          // Quantum-themed gradient
          const hue = 180 + (intensity * 40);
          const lightness = 20 + (intensity * 60);
          spectrogramCtx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;
          
          spectrogramCtx.fillRect(
            i * barWidth,
            spectrogramCanvas.height - (j * barHeight),
            barWidth,
            barHeight
          );
        }
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (meydaRef.current) {
        meydaRef.current.stop();
        meydaRef.current = null;
      }
    };
  }, [isPlaying, audioContext, analyser]);

  return (
    <div className="space-y-4">
      <div className="border border-primary/30 rounded-lg overflow-hidden bg-card">
        <div className="p-2 bg-muted/20 border-b border-primary/20">
          <span className="text-xs font-mono text-primary">WAVEFORM</span>
        </div>
        <canvas
          ref={waveformCanvasRef}
          width={800}
          height={120}
          className="w-full"
        />
      </div>
      
      <div className="border border-primary/30 rounded-lg overflow-hidden bg-card">
        <div className="p-2 bg-muted/20 border-b border-primary/20">
          <span className="text-xs font-mono text-primary">SPECTROGRAM</span>
        </div>
        <canvas
          ref={spectrogramCanvasRef}
          width={800}
          height={200}
          className="w-full"
        />
      </div>
    </div>
  );
};
