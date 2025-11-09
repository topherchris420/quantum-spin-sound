import { useState, useEffect, useRef, useCallback } from "react";
import { VinylPlayer } from "@/components/VinylPlayer";
import { CodeEditor } from "@/components/CodeEditor";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { EnhancedVisualizer } from "@/components/EnhancedVisualizer";
import { QuantumField } from "@/components/QuantumField";
import { Controls } from "@/components/Controls";
import { toast } from "sonner";
import { evaluate } from "@strudel/transpiler";
import { Music } from "lucide-react";

const DEFAULT_CODE = `stack(
  // Section 1: Vers3Dynamics — Living Resonant Field (ascending arpeggio for energy transfer)
  n("c4 d4 e4 f4 g4 a4 b4 c5").sound("sawtooth").release(0.5).room(0.3).slow(2),
  
  // Section 2: Bidirectional Toroidal Resonance Engine (repeating motifs for resonance)
  n("c3 <e3 g3> e3 <g3 c4>").sound("triangle").adsr(0.1, 0.2, 0.5, 0.3).fast(4).reverb(0.4),
  
  // Section 3: Vers3Dynamics Game Demo (erratic notes for game dynamics)
  n("<c4 e4 g4> [bb3 a3] <f4 d4> [g4~]").sound("fm").struct("t*8").gain(rand.range(0.5,1)).pan(rand).fast(2),
  
  // Section 4: FIELD PROPULSION SIMULATOR (sweeping glissando)
  n(seq(48,50,52,53,55,57,59,60,62,64,65,67,69,71,72)).sound("sine").release(0.1).fast(10).delay(0.2),
  
  // Section 5: Quantum code with Qiskit (harmonies for entanglement)
  chord("[c4.e4.g4] [d4.f4.a4] [e4.g4.b4] [f4.a4.c5]").sound("piano").room(0.5).slow(4),
  
  // Section 6: Adinkra Symbol computing (rhythmic patterns)
  s("bd*4 sd hh*2 sd").bank("tidal").n("0 1 2 1").fast(8).reverb(0.6),
  
  // Section 7: Cold Fusion Calorimetry Audit Tool (crescendo building tension)
  n("c3").sound("square").gain(seq(0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0)).slow(2).clip(0.5),
  
  // Section 8: More quantum (overlapping chords)
  chord("<[c4.e4.g4] [d4.f4.a4] [e4.g4.b4]>").sound("sawtooth").adsr(0.2,0.3,0.7,1).slow(3).reverb(0.7),
  
  // Section 9: Entanglement distribution for location (spatial delays)
  n("c4 [e4 g4] bb4 [d4 f4]").sound("fm").delay(rand.range(0,0.5)).pan(sine.slow(2)).fast(4)
).bpm(120)`;

const Index = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [easterEggCount, setEasterEggCount] = useState(0);
  const strudelRef = useRef<any>(null);
  const scratchFilterRef = useRef<BiquadFilterNode | null>(null);
  const easterEggAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio context
    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        
        // Resume context on user interaction
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        
        setAudioContext(ctx);
        
        // Create analyser
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 2048;
        analyserNode.connect(ctx.destination);
        setAnalyser(analyserNode);
        
        // Create scratch filter
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 2000;
        scratchFilterRef.current = filter;
        
        setAudioInitialized(true);
        toast.success("Quantum resonance field initialized!");
      } catch (error) {
        console.error("Audio initialization failed:", error);
        toast.error("Failed to initialize audio");
      }
    };

    initAudio();

    return () => {
      if (strudelRef.current) {
        strudelRef.current = null;
      }
    };
  }, []);

  const evaluateCode = useCallback(async () => {
    if (!audioInitialized || !audioContext) {
      toast.error("Audio not initialized yet");
      return;
    }

    try {
      // Simple audio synthesis based on code evaluation
      // This is a simplified version - Strudel integration would need more setup
      
      // Create oscillators for demonstration
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      oscillator.connect(gainNode);
      if (analyser) {
        gainNode.connect(analyser);
      } else {
        gainNode.connect(audioContext.destination);
      }
      
      oscillator.start();
      
      strudelRef.current = { oscillator, gainNode };
      toast.success("Audio started! (Simplified demo - full Strudel integration requires additional setup)");
    } catch (error) {
      console.error("Audio error:", error);
      toast.error("Audio playback failed: " + (error as Error).message);
    }
  }, [code, audioInitialized, analyser, audioContext]);

  const handlePlayPause = async () => {
    if (!isPlaying) {
      if (audioContext?.state === 'suspended') {
        await audioContext.resume();
      }
      await evaluateCode();
      setIsPlaying(true);
    } else {
      if (strudelRef.current) {
        strudelRef.current.oscillator?.stop();
        strudelRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  const handleScratch = useCallback((scratchSpeed: number) => {
    if (!audioContext || !scratchFilterRef.current || !strudelRef.current) return;
    
    const filter = scratchFilterRef.current;
    const now = audioContext.currentTime;
    
    // Apply pitch shift and filtering for scratch effect
    const pitchShift = 1 + (scratchSpeed * 0.1);
    const filterFreq = Math.max(200, Math.min(5000, 2000 - Math.abs(scratchSpeed) * 100));
    
    if (strudelRef.current.oscillator) {
      const baseFreq = 440;
      strudelRef.current.oscillator.frequency.setValueAtTime(
        baseFreq * pitchShift,
        now
      );
      filter.frequency.setValueAtTime(filterFreq, now);
    }
  }, [audioContext]);

  const handleNeedleChange = useCallback((isOnRecord: boolean) => {
    if (isOnRecord && !isPlaying) {
      handlePlayPause();
    } else if (!isOnRecord && isPlaying) {
      if (strudelRef.current) {
        strudelRef.current.oscillator?.stop();
        strudelRef.current = null;
      }
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const handleReset = () => {
    setCode(DEFAULT_CODE);
    toast.success("Code reset to default");
  };

  const handleEasterEgg = () => {
    setEasterEggCount(prev => prev + 1);
    
    if (easterEggCount + 1 === 3) {
      // Stop current audio
      if (strudelRef.current) {
        strudelRef.current.oscillator?.stop();
        strudelRef.current = null;
      }
      setIsPlaying(false);
      
      // Play easter egg audio
      if (!easterEggAudioRef.current) {
        easterEggAudioRef.current = new Audio('/easter-egg.mp3');
        easterEggAudioRef.current.volume = 0.7;
      }
      
      easterEggAudioRef.current.play();
      toast.success("🎵 Easter egg unlocked! Wrong Number Song - Slowed & Reverb", {
        duration: 5000,
      });
      setEasterEggCount(0);
    } else {
      toast(`Click ${3 - (easterEggCount + 1)} more times...`, { duration: 1000 });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-glow">
              Quantum Resonance Field
            </h1>
            <button
              onClick={handleEasterEgg}
              className="p-2 hover:scale-110 transition-transform"
              aria-label="Easter egg"
            >
              <Music className="w-6 h-6 text-primary/50 hover:text-primary" />
            </button>
          </div>
          <p className="text-muted-foreground text-lg">
            Live code music with Strudel & vinyl interaction
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side - Vinyl player and controls */}
          <div className="space-y-6">
            <div className="relative">
              <QuantumField isPlaying={isPlaying} analyser={analyser} />
              <VinylPlayer 
                isPlaying={isPlaying} 
                onNeedleChange={handleNeedleChange}
                onScratch={handleScratch}
                audioContext={audioContext}
              />
            </div>
            
            <Controls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
            />

            <AudioVisualizer
              isPlaying={isPlaying}
              audioContext={audioContext}
              analyser={analyser}
            />
          </div>

          {/* Right side - Code editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-primary">
                Live Code Editor
              </h2>
              <span className="text-sm text-muted-foreground">
                Edit the code and click Play to hear changes
              </span>
            </div>
            
            <div className="h-[600px]">
              <CodeEditor value={code} onChange={setCode} />
            </div>

            <EnhancedVisualizer
              isPlaying={isPlaying}
              audioContext={audioContext}
              analyser={analyser}
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-sm text-muted-foreground space-y-2 pt-8 border-t border-border">
          <p>Drag the tonearm needle onto the vinyl record to start playback</p>
          <p className="text-xs">Built with Strudel, React & Web Audio API</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
