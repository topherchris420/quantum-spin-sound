import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  life: number;
  maxLife: number;
  type: "orb" | "spark" | "ring";
}

interface EasterEggParticlesProps {
  analyser?: AnalyserNode | null;
}

export const EasterEggParticles = ({ analyser }: EasterEggParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioRef = useRef({ bass: 0, mid: 0, treble: 0, energy: 0 });

  useEffect(() => {
    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
  }, [analyser]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (burst: boolean) => {
      const type = Math.random() < 0.6 ? "orb" : Math.random() < 0.7 ? "spark" : "ring";
      const audio = audioRef.current;
      const maxLife = 100 + Math.random() * 160 + audio.energy * 80;
      const speed = 0.5 + Math.random() * 2 + audio.bass * 3;
      particlesRef.current.push({
        x: burst
          ? canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4
          : Math.random() * canvas.width,
        y: burst
          ? canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.3
          : canvas.height + 10 + Math.random() * 40,
        vx: burst
          ? (Math.random() - 0.5) * (4 + audio.energy * 6)
          : (Math.random() - 0.5) * 1.5,
        vy: burst
          ? (Math.random() - 0.5) * (4 + audio.energy * 6)
          : -speed,
        size:
          type === "ring"
            ? 8 + Math.random() * 20 + audio.mid * 15
            : type === "spark"
            ? 1.5 + Math.random() * 2 + audio.treble * 3
            : 3 + Math.random() * 6 + audio.bass * 8,
        opacity: 0,
        hue:
          Math.random() < 0.5
            ? 168 + Math.random() * 20
            : 330 + Math.random() * 30,
        life: 0,
        maxLife,
        type,
      });
    };

    let prevEnergy = 0;

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      timeRef.current++;

      // Extract audio data
      if (analyser && dataArrayRef.current) {
        analyser.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>);
        const data = dataArrayRef.current;
        const len = data.length;

        const bassEnd = Math.floor(len * 0.15);
        let bassSum = 0;
        for (let i = 0; i < bassEnd; i++) bassSum += data[i];
        const bassAvg = bassSum / bassEnd / 255;

        const midEnd = Math.floor(len * 0.5);
        let midSum = 0;
        for (let i = bassEnd; i < midEnd; i++) midSum += data[i];
        const midAvg = midSum / (midEnd - bassEnd) / 255;

        let trebleSum = 0;
        for (let i = midEnd; i < len; i++) trebleSum += data[i];
        const trebleAvg = trebleSum / (len - midEnd) / 255;

        const energy = (bassAvg + midAvg + trebleAvg) / 3;

        // Smooth
        const a = audioRef.current;
        a.bass += (bassAvg - a.bass) * 0.25;
        a.mid += (midAvg - a.mid) * 0.25;
        a.treble += (trebleAvg - a.treble) * 0.25;
        a.energy += (energy - a.energy) * 0.2;

        // Beat detection — sudden energy spike
        if (a.energy - prevEnergy > 0.08) {
          const burstCount = Math.floor(5 + a.energy * 20);
          for (let i = 0; i < burstCount; i++) spawn(true);
        }
        prevEnergy = a.energy;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const audio = audioRef.current;

      // Spawn rate scales with energy
      const spawnRate = Math.max(1, Math.floor(3 - audio.energy * 2));
      if (timeRef.current % spawnRate === 0) {
        const count = 1 + Math.floor(audio.energy * 4);
        for (let i = 0; i < count; i++) spawn(false);
      }

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Movement influenced by audio
        const wobble = Math.sin(timeRef.current * 0.02 + p.x * 0.01) * (0.3 + audio.mid * 1.5);
        p.x += p.vx + wobble;
        p.y += p.vy;
        p.vy *= 0.998;
        p.vx *= 0.997;

        const progress = p.life / p.maxLife;
        p.opacity = progress < 0.15 ? progress / 0.15 : 1 - (progress - 0.15) / 0.85;
        p.opacity = Math.max(0, Math.min(1, p.opacity));

        // Brightness boost on beats
        const brightBoost = 1 + audio.energy * 0.6;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.opacity * brightBoost;

        if (p.type === "orb") {
          const dynamicSize = p.size * (1 + audio.bass * 0.5);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dynamicSize);
          grad.addColorStop(0, `hsla(${p.hue}, 80%, ${60 + audio.energy * 20}%, 0.9)`);
          grad.addColorStop(0.5, `hsla(${p.hue}, 70%, 55%, 0.4)`);
          grad.addColorStop(1, `hsla(${p.hue}, 60%, 50%, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, dynamicSize * 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "spark") {
          const trailLen = 4 + audio.treble * 8;
          ctx.strokeStyle = `hsla(${p.hue}, 90%, ${70 + audio.treble * 20}%, 0.8)`;
          ctx.lineWidth = p.size * (0.5 + audio.treble * 0.5);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * trailLen, p.y - p.vy * trailLen);
          ctx.stroke();
        } else {
          ctx.strokeStyle = `hsla(${p.hue}, 70%, 60%, ${0.5 + audio.mid * 0.3})`;
          ctx.lineWidth = 1 + audio.mid * 2;
          const ringSize = p.size * (0.5 + progress * 1.5) * (1 + audio.mid * 0.4);
          ctx.beginPath();
          ctx.arc(p.x, p.y, ringSize, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      particlesRef.current = [];
    };
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40 pointer-events-none"
    />
  );
};
