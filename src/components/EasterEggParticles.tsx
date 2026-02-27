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

export const EasterEggParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

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

    const spawn = () => {
      const type = Math.random() < 0.6 ? "orb" : Math.random() < 0.7 ? "spark" : "ring";
      const maxLife = 120 + Math.random() * 180;
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(0.5 + Math.random() * 2),
        size: type === "ring" ? 8 + Math.random() * 20 : type === "spark" ? 1.5 + Math.random() * 2 : 3 + Math.random() * 6,
        opacity: 0,
        hue: Math.random() < 0.5 ? 168 + Math.random() * 20 : 330 + Math.random() * 30, // primary or accent hues
        life: 0,
        maxLife,
        type,
      });
    };

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      timeRef.current++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn particles
      if (timeRef.current % 2 === 0) {
        for (let i = 0; i < 3; i++) spawn();
      }

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx + Math.sin(timeRef.current * 0.02 + p.x * 0.01) * 0.3;
        p.y += p.vy;
        p.vy *= 0.998;
        p.vx *= 0.999;

        // Fade in then out
        const progress = p.life / p.maxLife;
        p.opacity = progress < 0.15 ? progress / 0.15 : 1 - ((progress - 0.15) / 0.85);
        p.opacity = Math.max(0, Math.min(1, p.opacity));

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.opacity;

        if (p.type === "orb") {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `hsla(${p.hue}, 80%, 65%, 0.9)`);
          grad.addColorStop(0.5, `hsla(${p.hue}, 70%, 55%, 0.4)`);
          grad.addColorStop(1, `hsla(${p.hue}, 60%, 50%, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "spark") {
          ctx.strokeStyle = `hsla(${p.hue}, 90%, 75%, 0.8)`;
          ctx.lineWidth = p.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
          ctx.stroke();
        } else {
          ctx.strokeStyle = `hsla(${p.hue}, 70%, 60%, 0.5)`;
          ctx.lineWidth = 1;
          const ringSize = p.size * (0.5 + progress * 1.5);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40 pointer-events-none"
    />
  );
};
