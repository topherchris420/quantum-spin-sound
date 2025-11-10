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
      if (audioContext?.state === 'suspended') {
        await audioContext.resume();
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
    <div className="min-h-screen bg-background text-foreground p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse-glow leading-tight">
              Quantum Resonance Field
            </h1>
            <button
              onClick={handleEasterEgg}
              className="p-2 hover:scale-110 transition-transform touch-manipulation"
              aria-label="Easter egg"
            >
              <Music className="w-5 h-5 md:w-6 md:h-6 text-primary/60 hover:text-primary transition-colors" />
            </button>
          </div>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg px-4">
            Live code music with Strudel & vinyl interaction
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left side - Vinyl player and controls */}
          <div className="space-y-4 md:space-y-6">
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

            <div className="hidden md:block">
              <AudioVisualizer
                isPlaying={isPlaying}
                audioContext={audioContext}
                analyser={analyser}
              />
            </div>
          </div>

          {/* Right side - Code editor */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Live Code Editor
              </h2>
              <span className="text-xs md:text-sm text-muted-foreground">
                Edit & click Play to hear
              </span>
            </div>
            
            <div className="h-[400px] sm:h-[500px] md:h-[550px] lg:h-[600px]">
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
        <div className="text-center text-xs md:text-sm text-muted-foreground space-y-1 md:space-y-2 pt-6 md:pt-8 border-t border-border/50">
          <p className="px-4">Drag the tonearm needle onto the vinyl record to start playback</p>
          <p className="text-[10px] md:text-xs opacity-70">Built with Strudel, React & Web Audio API</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
