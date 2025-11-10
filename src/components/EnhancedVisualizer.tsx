import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
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
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';

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

      // Draw Waveform with gradient and dynamic effects
      const bgGradient = waveformCtx.createLinearGradient(0, 0, 0, waveformCanvas.height);
      if (isDark) {
        bgGradient.addColorStop(0, "hsl(220, 30%, 6%)");
        bgGradient.addColorStop(1, "hsl(220, 25%, 10%)");
      } else {
        bgGradient.addColorStop(0, "hsl(0, 0%, 98%)");
        bgGradient.addColorStop(1, "hsl(0, 0%, 95%)");
      }
      waveformCtx.fillStyle = bgGradient;
      waveformCtx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);

      // Create vibrant gradient for waveform
      const gradient = waveformCtx.createLinearGradient(0, 0, waveformCanvas.width, 0);
      gradient.addColorStop(0, "hsl(180, 100%, 55%)");
      gradient.addColorStop(0.5, "hsl(280, 85%, 65%)");
      gradient.addColorStop(1, "hsl(320, 100%, 60%)");

      waveformCtx.lineWidth = 3;
      waveformCtx.strokeStyle = gradient;
      waveformCtx.shadowBlur = 15;
      waveformCtx.shadowColor = "hsl(180, 100%, 55%)";
      waveformCtx.beginPath();

      const sliceWidth = waveformCanvas.width / bufferLength;
      let x = 0;

      // Add amplitude variation for more dynamic appearance
      for (let i = 0; i < bufferLength; i++) {
        const v = timeDataArray[i] / 128.0;
        const amplitude = (v - 1) * 0.5;
        const y = waveformCanvas.height / 2 + amplitude * waveformCanvas.height;

        if (i === 0) {
          waveformCtx.moveTo(x, y);
        } else {
          waveformCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      waveformCtx.stroke();
      
      // Add glow line underneath
      waveformCtx.shadowBlur = 25;
      waveformCtx.shadowColor = "hsl(280, 85%, 65%)";
      waveformCtx.lineWidth = 1.5;
      waveformCtx.stroke();
      waveformCtx.shadowBlur = 0;

      // Draw Spectrogram with enhanced colors
      spectrogramHistory.push(Array.from(dataArray));
      if (spectrogramHistory.length > maxHistoryLength) {
        spectrogramHistory.shift();
      }

      // Dynamic background gradient
      const specBgGradient = spectrogramCtx.createLinearGradient(0, 0, 0, spectrogramCanvas.height);
      if (isDark) {
        specBgGradient.addColorStop(0, "hsl(220, 30%, 6%)");
        specBgGradient.addColorStop(1, "hsl(220, 25%, 10%)");
      } else {
        specBgGradient.addColorStop(0, "hsl(0, 0%, 98%)");
        specBgGradient.addColorStop(1, "hsl(0, 0%, 95%)");
      }
      spectrogramCtx.fillStyle = specBgGradient;
      spectrogramCtx.fillRect(0, 0, spectrogramCanvas.width, spectrogramCanvas.height);

      const barWidth = spectrogramCanvas.width / maxHistoryLength;
      const barHeight = spectrogramCanvas.height / bufferLength;

      for (let i = 0; i < spectrogramHistory.length; i++) {
        const snapshot = spectrogramHistory[i];
        const fadeOpacity = i / spectrogramHistory.length; // Fade older entries
        
        for (let j = 0; j < snapshot.length; j++) {
          const value = snapshot[j];
          const intensity = value / 255;
          
          if (intensity < 0.1) continue; // Skip very low values for performance
          
          // Multi-color quantum gradient based on frequency and intensity
          let hue, saturation, lightness;
          if (intensity < 0.3) {
            // Low intensity - cyan to blue
            hue = 180 + (intensity * 100);
            saturation = 100;
            lightness = 30 + (intensity * 40);
          } else if (intensity < 0.6) {
            // Medium intensity - purple
            hue = 280;
            saturation = 85;
            lightness = 35 + (intensity * 50);
          } else {
            // High intensity - pink/magenta
            hue = 320;
            saturation = 100;
            lightness = 50 + (intensity * 30);
          }
          
          const alpha = intensity * fadeOpacity;
          spectrogramCtx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
          
          // Add glow effect for high intensity
          if (intensity > 0.7) {
            spectrogramCtx.shadowBlur = 10;
            spectrogramCtx.shadowColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          }
          
          spectrogramCtx.fillRect(
            i * barWidth,
            spectrogramCanvas.height - (j * barHeight),
            barWidth + 1, // Slight overlap to avoid gaps
            barHeight + 1
          );
          
          spectrogramCtx.shadowBlur = 0;
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
  }, [isPlaying, audioContext, analyser, isDark]);

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="border border-primary/40 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm shadow-lg">
        <div className="px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-primary/30">
          <span className="text-xs md:text-sm font-mono font-semibold tracking-wider bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            WAVEFORM
          </span>
        </div>
        <canvas
          ref={waveformCanvasRef}
          width={800}
          height={120}
          className="w-full h-auto"
          style={{ minHeight: '80px', maxHeight: '120px' }}
        />
      </div>
      
      <div className="border border-secondary/40 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm shadow-lg">
        <div className="px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-secondary/10 via-accent/10 to-primary/10 border-b border-secondary/30">
          <span className="text-xs md:text-sm font-mono font-semibold tracking-wider bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
            SPECTROGRAM
          </span>
        </div>
        <canvas
          ref={spectrogramCanvasRef}
          width={800}
          height={200}
          className="w-full h-auto"
          style={{ minHeight: '120px', maxHeight: '200px' }}
        />
      </div>
    </div>
  );
};
