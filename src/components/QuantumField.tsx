import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface QuantumFieldProps {
  isPlaying: boolean;
  analyser: AnalyserNode | null;
}

export const QuantumField = ({ isPlaying, analyser }: QuantumFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  class Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    hue: number;
    alpha: number;

    constructor(canvas: HTMLCanvasElement) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.hue = 180;
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update(canvas: HTMLCanvasElement, audioIntensity: number) {
      this.x += this.speedX * (1 + audioIntensity);
      this.y += this.speedY * (1 + audioIntensity);

      // Wrap around edges
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      // Pulse with audio
      this.hue = 180 + audioIntensity * 40;
      this.alpha = 0.2 + audioIntensity * 0.5;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize particles
    const particleCount = 100;
    particlesRef.current = Array.from(
      { length: particleCount },
      () => new Particle(canvas)
    );

    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Get audio intensity
      let audioIntensity = 0;
      if (isPlaying && analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        audioIntensity = average / 255;
      }

      // Clear with fade effect
      ctx.fillStyle = "rgba(17, 24, 39, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw toroidal wave patterns
      if (isPlaying && audioIntensity > 0.1) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < 3; i++) {
          const radius = 50 + i * 60 + Math.sin(time + i) * 20 * audioIntensity;
          ctx.strokeStyle = `hsla(${180 + i * 20}, 100%, 50%, ${0.3 * audioIntensity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        particle.update(canvas, audioIntensity);
        particle.draw(ctx);
      });

      // Draw connections between nearby particles
      if (isPlaying) {
        particlesRef.current.forEach((p1, i) => {
          particlesRef.current.slice(i + 1).forEach((p2) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.strokeStyle = `hsla(180, 100%, 60%, ${
                (1 - distance / 100) * 0.2 * audioIntensity
              })`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          });
        });
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analyser]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        className="w-full h-full opacity-60"
      />
    </motion.div>
  );
};
