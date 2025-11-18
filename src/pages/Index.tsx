import { useState, useEffect, useRef, useCallback } from "react";
import { VinylPlayer } from "@/components/VinylPlayer";
import { CodeEditor } from "@/components/CodeEditor";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { EnhancedVisualizer } from "@/components/EnhancedVisualizer";
import { QuantumField } from "@/components/QuantumField";
import { Controls } from "@/components/Controls";
import { ThemeToggle } from "@/components/ThemeToggle";
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
    // Initialize audio context immediately
    const initAudio = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        
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
        console.log("Audio context created successfully, state:", ctx.state);
      } catch (error) {
        console.error("Audio initialization failed:", error);
        toast.error("Failed to initialize audio: " + (error as Error).message);
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
    if (!audioContext) {
      toast.error("Audio not initialized yet. Please refresh the page.");
      return;
    }
    
    try {
      const now = audioContext.currentTime;
      const oscillators: OscillatorNode[] = [];
      const gains: GainNode[] = [];
      
      // Main mixer
      const mainGain = audioContext.createGain();
      mainGain.gain.setValueAtTime(0.15, now);
      
      // Bass line - sawtooth
      const bass = audioContext.createOscillator();
      const bassGain = audioContext.createGain();
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(65.41, now); // C2
      bassGain.gain.setValueAtTime(0.3, now);
      bass.connect(bassGain);
      bassGain.connect(mainGain);
      
      // Modulate bass frequency
      const lfo1 = audioContext.createOscillator();
      const lfo1Gain = audioContext.createGain();
      lfo1.frequency.setValueAtTime(0.25, now);
      lfo1Gain.gain.setValueAtTime(10, now);
      lfo1.connect(lfo1Gain);
      lfo1Gain.connect(bass.frequency);
      
      // Melody - triangle wave
      const melody = audioContext.createOscillator();
      const melodyGain = audioContext.createGain();
      melody.type = 'triangle';
      melodyGain.gain.setValueAtTime(0.2, now);
      melody.connect(melodyGain);
      melodyGain.connect(mainGain);
      
      // Arpeggio pattern
      const notes = [261.63, 293.66, 329.63, 392.00, 523.25]; // C4, D4, E4, G4, C5
      let noteIndex = 0;
      const arpInterval = setInterval(() => {
        if (melody.frequency) {
          melody.frequency.setValueAtTime(notes[noteIndex], audioContext.currentTime);
          noteIndex = (noteIndex + 1) % notes.length;
        }
      }, 250);
      
      // Pad - sine waves
      const pad1 = audioContext.createOscillator();
      const pad2 = audioContext.createOscillator();
      const padGain = audioContext.createGain();
      pad1.type = 'sine';
      pad2.type = 'sine';
      pad1.frequency.setValueAtTime(523.25, now); // C5
      pad2.frequency.setValueAtTime(659.25, now); // E5
      padGain.gain.setValueAtTime(0.1, now);
      
      // Add reverb-like delay
      const delay = audioContext.createDelay();
      delay.delayTime.setValueAtTime(0.3, now);
      const delayFeedback = audioContext.createGain();
      delayFeedback.gain.setValueAtTime(0.4, now);
      
      pad1.connect(padGain);
      pad2.connect(padGain);
      padGain.connect(delay);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay);
      delay.connect(mainGain);
      padGain.connect(mainGain);
      
      // High frequency shimmer - FM synthesis
      const carrier = audioContext.createOscillator();
      const modulator = audioContext.createOscillator();
      const modGain = audioContext.createGain();
      const carrierGain = audioContext.createGain();
      
      carrier.type = 'sine';
      modulator.type = 'sine';
      carrier.frequency.setValueAtTime(1046.5, now); // C6
      modulator.frequency.setValueAtTime(5, now);
      modGain.gain.setValueAtTime(200, now);
      carrierGain.gain.setValueAtTime(0.08, now);
      
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(carrierGain);
      carrierGain.connect(mainGain);
      
      // Connect to analyser
      if (analyser) {
        mainGain.connect(analyser);
      } else {
        mainGain.connect(audioContext.destination);
      }
      
      // Start all oscillators
      const startTime = now + 0.1;
      bass.start(startTime);
      lfo1.start(startTime);
      melody.start(startTime);
      pad1.start(startTime);
      pad2.start(startTime);
      carrier.start(startTime);
      modulator.start(startTime);
      
      oscillators.push(bass, lfo1, melody, pad1, pad2, carrier, modulator);
      gains.push(bassGain, melodyGain, padGain, carrierGain, mainGain);
      
      strudelRef.current = { 
        oscillators, 
        gains, 
        arpInterval,
        mainGain 
      };
      
      toast.success("Quantum resonance field activated!");
    } catch (error) {
      console.error("Audio error:", error);
      toast.error("Audio playback failed: " + (error as Error).message);
    }
  }, [code, audioInitialized, analyser, audioContext]);

  const handlePlayPause = async () => {
    if (!isPlaying) {
      // Ensure audio context exists and is running
      if (!audioContext) {
        toast.error("Audio system not ready. Please refresh the page.");
        return;
      }
      
      // Resume audio context if suspended (required by browser autoplay policy)
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
          console.log("Audio context resumed, state:", audioContext.state);
        } catch (error) {
          console.error("Failed to resume audio context:", error);
          toast.error("Failed to start audio");
          return;
        }
      }
      
      await evaluateCode();
      setIsPlaying(true);
    } else {
      if (strudelRef.current) {
        // Stop all oscillators
        strudelRef.current.oscillators?.forEach((osc: OscillatorNode) => {
          try {
            osc.stop();
          } catch (e) {
            // Oscillator might already be stopped
          }
        });
        
        // Clear arpeggio interval
        if (strudelRef.current.arpInterval) {
          clearInterval(strudelRef.current.arpInterval);
        }
        
        strudelRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  const handleScratch = useCallback((scratchSpeed: number) => {
    if (!audioContext || !strudelRef.current?.mainGain) return;
    
    const now = audioContext.currentTime;
    const scratchIntensity = Math.abs(scratchSpeed) * 0.05;
    
    // Modulate volume for scratch effect
    const currentGain = strudelRef.current.mainGain.gain.value;
    const targetGain = Math.max(0.05, Math.min(0.3, currentGain + scratchIntensity));
    
    strudelRef.current.mainGain.gain.cancelScheduledValues(now);
    strudelRef.current.mainGain.gain.setValueAtTime(targetGain, now);
    strudelRef.current.mainGain.gain.linearRampToValueAtTime(0.15, now + 0.1);
  }, [audioContext]);

  const handleNeedleChange = useCallback((isOnRecord: boolean) => {
    if (isOnRecord && !isPlaying) {
      handlePlayPause();
    } else if (!isOnRecord && isPlaying) {
      if (strudelRef.current) {
        strudelRef.current.oscillators?.forEach((osc: OscillatorNode) => {
          try {
            osc.stop();
          } catch (e) {
            // Already stopped
          }
        });
        if (strudelRef.current.arpInterval) {
          clearInterval(strudelRef.current.arpInterval);
        }
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
        strudelRef.current.oscillators?.forEach((osc: OscillatorNode) => {
          try {
            osc.stop();
          } catch (e) {
            // Already stopped
          }
        });
        if (strudelRef.current.arpInterval) {
          clearInterval(strudelRef.current.arpInterval);
        }
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Atmospheric background layer */}
      <div className="fixed inset-0 pointer-events-none opacity-60">
        <QuantumField isPlaying={isPlaying} analyser={analyser} />
      </div>

      {/* Main artistic container */}
      <div className="relative z-10">
        {/* Header - Unified artistic title */}
        <header className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <Music className="w-5 h-5 sm:w-6 sm:h-6 text-quantum-glow artistic-glow" />
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-quantum-glow via-quantum-purple to-quantum-pink bg-clip-text text-transparent">
                Vers3Dynamics Studio
              </span>
            </h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main artistic workspace */}
        <main className="px-2 sm:px-4 md:px-6 pb-4 space-y-3 sm:space-y-4 md:space-y-5 max-w-7xl mx-auto">
          
          {/* Central focal point - Vinyl player with immersive frame */}
          <section 
            className="relative rounded-3xl overflow-hidden atmospheric-blur border border-border/50 shadow-[var(--shadow-artistic)]"
            style={{ background: 'linear-gradient(135deg, hsl(var(--card) / 0.8), hsl(var(--card) / 0.6))' }}
          >
            <div className="absolute inset-0 opacity-30 pointer-events-none" 
                 style={{ background: 'var(--gradient-quantum)' }} />
            
            <div className="relative p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
              <div onClick={handleEasterEgg}>
                <VinylPlayer
                  isPlaying={isPlaying}
                  onScratch={handleScratch}
                  onNeedleChange={handleNeedleChange}
                />
              </div>
            </div>
          </section>

          {/* Unified control & visualization symphony */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            
            {/* Left panel - Controls & Audio visualization */}
            <div className="space-y-3 sm:space-y-4">
              {/* Controls with artistic framing */}
              <div 
                className="rounded-2xl atmospheric-blur border border-border/50 p-3 sm:p-4 shadow-[var(--shadow-artistic)] unified-transition hover:shadow-[var(--glow-shadow)]"
                style={{ background: 'linear-gradient(135deg, hsl(var(--card) / 0.7), hsl(var(--card) / 0.5))' }}
              >
                <Controls
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onReset={handleReset}
                />
              </div>

              {/* Audio visualizer - immersive frequency display */}
              <div 
                className="rounded-2xl overflow-hidden border border-quantum-glow/30 artistic-glow"
                style={{ background: 'linear-gradient(180deg, hsl(var(--card) / 0.5), hsl(var(--card) / 0.3))' }}
              >
                <AudioVisualizer
                  isPlaying={isPlaying}
                  audioContext={audioContext}
                  analyser={analyser}
                />
              </div>

              {/* Enhanced visualizer - artistic expression */}
              <div 
                className="rounded-2xl overflow-hidden border border-quantum-purple/30"
                style={{ background: 'linear-gradient(135deg, hsl(var(--card) / 0.4), hsl(var(--card) / 0.2))' }}
              >
                <EnhancedVisualizer
                  isPlaying={isPlaying}
                  audioContext={audioContext}
                  analyser={analyser}
                />
              </div>
            </div>

            {/* Right panel - Code editor as creative instrument */}
            <div 
              className="rounded-2xl atmospheric-blur border border-border/50 overflow-hidden shadow-[var(--shadow-artistic)] unified-transition hover:shadow-[var(--glow-shadow-purple)]"
              style={{ background: 'linear-gradient(135deg, hsl(var(--card) / 0.8), hsl(var(--card) / 0.6))' }}
            >
              <div className="p-3 sm:p-4 border-b border-border/50">
                <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-quantum-purple to-quantum-pink bg-clip-text text-transparent">
                  Sonic Code Canvas
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Compose your quantum symphony
                </p>
              </div>
              
              <div className="p-2 sm:p-3">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                />
              </div>
            </div>
          </section>

          {/* Footer - Artistic signature */}
          <footer className="text-center py-4 sm:py-6">
            <p className="text-xs sm:text-sm text-muted-foreground/70 tracking-wide">
              <span className="bg-gradient-to-r from-quantum-glow via-quantum-purple to-quantum-pink bg-clip-text text-transparent font-medium">
                Gesamtkunstwerk
              </span>
              {" "}- A unified artistic experience
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
