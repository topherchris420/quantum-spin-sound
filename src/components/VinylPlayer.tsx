import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VinylPlayerProps {
  isPlaying: boolean;
  onNeedleChange: (isOnRecord: boolean) => void;
  onScratch?: (scratchSpeed: number) => void;
  audioContext?: AudioContext | null;
}

export const VinylPlayer = ({ isPlaying, onNeedleChange, onScratch, audioContext }: VinylPlayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingRecord, setIsDraggingRecord] = useState(false);
  const [isHoveringArm, setIsHoveringArm] = useState(false);
  const [needleAngle, setNeedleAngle] = useState(-30);
  const [rotation, setRotation] = useState(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const lastMoveTimeRef = useRef(0);
  const needleOnRecord = needleAngle > -10;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw vinyl record
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, "#1a1a1a");
    gradient.addColorStop(0.3, "#0a0a0a");
    gradient.addColorStop(0.6, "#1a1a1a");
    gradient.addColorStop(1, "#0a0a0a");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw grooves
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 50; i++) {
      const grooveRadius = radius * 0.3 + (i * radius * 0.7) / 50;
      ctx.beginPath();
      ctx.arc(centerX, centerY, grooveRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw label
    const labelGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.3);
    labelGradient.addColorStop(0, "hsl(180, 100%, 50%)");
    labelGradient.addColorStop(0.5, "hsl(180, 80%, 30%)");
    labelGradient.addColorStop(1, "hsl(220, 20%, 15%)");

    ctx.fillStyle = labelGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Add glow effect if playing
    if (isPlaying) {
      ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(0, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw center hole
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }, [isPlaying, needleAngle]);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleArmPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    lastMoveTimeRef.current = performance.now();
    // Haptic feedback on drag start
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([15, 10, 15]);
    }
  };

  const handleArmPointerEnter = () => {
    setIsHoveringArm(true);
    // Light haptic nudge when hovering over grab area
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(8);
    }
  };

  const handleArmPointerLeave = () => {
    setIsHoveringArm(false);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    
    // Fallback: click/tap near the needle (top right area)
    if (x > rect.width * 0.6 && y < rect.height * 0.55) {
      setIsDragging(true);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      lastMoveTimeRef.current = performance.now();
    } 
    // Check if click is on the vinyl record
    else if (distance < rect.width * 0.4) {
      setIsDraggingRecord(true);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      lastMoveTimeRef.current = performance.now();
    }
  };

  // Signed, time-based scratch velocity (~px per frame), clamped for stability
  const computeScratchVelocity = (delta: number) => {
    const now = performance.now();
    const dt = Math.max(8, now - lastMoveTimeRef.current);
    lastMoveTimeRef.current = now;
    const velocity = (delta / dt) * 16;
    return Math.max(-15, Math.min(15, velocity));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const maxY = rect.height * 0.5;
      
      // Calculate angle based on vertical position
      const angle = Math.max(-30, Math.min(5, ((y / maxY) * 35) - 30));
      setNeedleAngle(angle);
      
      const isOnRecord = angle > -10;
      onNeedleChange(isOnRecord);

      // Scratching with the needle: wiggling the arm on the record scrubs the audio
      if (isOnRecord && isPlaying && onScratch) {
        const deltaY = e.clientY - lastMousePosRef.current.y;
        const velocity = computeScratchVelocity(deltaY);
        if (Math.abs(velocity) > 0.3) onScratch(velocity);
      }
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else if (isDraggingRecord && isPlaying) {
      // Velocity-based scratch from record drag (signed: forward/backward)
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const velocity = computeScratchVelocity(deltaX);
      
      // Update rotation for visual feedback
      setRotation(prev => prev + deltaX * 0.5);
      
      // Trigger scratch effect with signed velocity
      if (onScratch && Math.abs(velocity) > 0.3) {
        onScratch(velocity);
      }
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsDraggingRecord(false);
  };

  useEffect(() => {
    if (isDragging || isDraggingRecord) {
      document.addEventListener("pointerup", handlePointerUp);
      document.addEventListener("pointercancel", handlePointerUp);
      return () => {
        document.removeEventListener("pointerup", handlePointerUp);
        document.removeEventListener("pointercancel", handlePointerUp);
      };
    }
  }, [isDragging, isDraggingRecord]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto aspect-square touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className={cn(
          "w-full h-full transition-transform duration-1000 touch-none",
          isDraggingRecord && "cursor-grabbing",
          !isDraggingRecord && "cursor-grab",
          isPlaying && !isDraggingRecord && "animate-spin-vinyl"
        )}
        style={isDraggingRecord ? { transform: `rotate(${rotation}deg)` } : undefined}
      />
      
      {/* Tonearm and needle */}
      <div 
        className={cn(
          "absolute top-0 right-4 sm:right-6 md:right-8 w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-56 origin-top-right transition-all duration-200 cursor-grab active:cursor-grabbing touch-none select-none",
          isHoveringArm && !isDragging && "scale-105",
          isDragging && "scale-110"
        )}
        style={{ transform: `rotate(${needleAngle}deg) scale(${isDragging ? 1.08 : isHoveringArm ? 1.04 : 1})` }}
        onPointerDown={handleArmPointerDown}
      >
        {/* Generous invisible grab area around the arm with hover/drag glow */}
        <div 
          className={cn(
            "absolute -inset-4 sm:-inset-5 rounded-full transition-all duration-300",
            isHoveringArm && !isDragging && "bg-primary/10 ring-2 ring-primary/40 shadow-[0_0_20px_rgba(0,255,255,0.25)]",
            isDragging && "bg-primary/20 ring-4 ring-primary/70 shadow-[0_0_35px_rgba(0,255,255,0.5)]"
          )}
          onPointerEnter={handleArmPointerEnter}
          onPointerLeave={handleArmPointerLeave}
        />
        {/* Arm */}
        <div className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-1.5 sm:w-2 h-32 sm:h-40 md:h-48 bg-gradient-to-b from-muted to-muted-foreground rounded-full shadow-lg transition-all duration-200",
          isHoveringArm && !isDragging && "shadow-[0_0_15px_rgba(0,255,255,0.3)]",
          isDragging && "shadow-[0_0_25px_rgba(0,255,255,0.6)] brightness-110"
        )} />
        
        {/* Cartridge */}
        <div className={cn(
          "absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-5 sm:w-4 sm:h-6 bg-primary rounded shadow-md transition-all duration-200",
          isHoveringArm && !isDragging && "shadow-[0_0_12px_rgba(0,255,255,0.4)]",
          isDragging && "shadow-[0_0_20px_rgba(0,255,255,0.7)] scale-110"
        )} 
             style={{ 
               boxShadow: needleOnRecord ? "0 0 20px hsl(var(--primary))" : undefined 
             }} 
        />
        
        {/* Needle tip */}
        <div className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 sm:h-3 bg-accent transition-all shadow-sm",
          needleOnRecord && "animate-pulse-glow",
          isDragging && "h-3 sm:h-4 bg-white shadow-[0_0_10px_rgba(0,255,255,0.8)]"
        )} />
      </div>

      {/* Interaction hint */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
          <div className="text-center bg-background/90 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-primary/30 shadow-lg max-w-xs">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Drag the needle to the record</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/80 mt-1">Drag the record while playing to scratch</p>
          </div>
        </div>
      )}
      {isPlaying && (isDraggingRecord || (isDragging && needleOnRecord)) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/50">
            <p className="text-xs font-mono text-primary">SCRATCHING...</p>
          </div>
        </div>
      )}
    </div>
  );
};
