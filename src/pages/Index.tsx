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
import { Music, Disc3, Waves } from "lucide-react";
import { motion } from "framer-motion";

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
    const initAudio = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        setAudioContext(ctx);
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 2048;
        analyserNode.connect(ctx.destination);
        setAnalyser(analyserNode);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 2000;
        scratchFilterRef.current = filter;
        setAudioInitialized(true);
      } catch (error) {
        console.error("Audio initialization failed:", error);
        toast.error("Failed to initialize audio: " + (error as Error).message);
      }
    };
    initAudio();
    return () => { strudelRef.current = null; };
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
      const mainGain = audioContext.createGain();
      mainGain.gain.setValueAtTime(0.15, now);
      const bass = audioContext.createOscillator();
      const bassGain = audioContext.createGain();
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(65.41, now);
      bassGain.gain.setValueAtTime(0.3, now);
      bass.connect(bassGain);
      bassGain.connect(mainGain);
      const lfo1 = audioContext.createOscillator();
      const lfo1Gain = audioContext.createGain();
      lfo1.frequency.setValueAtTime(0.25, now);
      lfo1Gain.gain.setValueAtTime(10, now);
      lfo1.connect(lfo1Gain);
      lfo1Gain.connect(bass.frequency);
      const melody = audioContext.createOscillator();
      const melodyGain = audioContext.createGain();
      melody.type = 'triangle';
      melodyGain.gain.setValueAtTime(0.2, now);
      melody.connect(melodyGain);
      melodyGain.connect(mainGain);
      const notes = [261.63, 293.66, 329.63, 392.00, 523.25];
      let noteIndex = 0;
      const arpInterval = setInterval(() => {
        if (melody.frequency) {
          melody.frequency.setValueAtTime(notes[noteIndex], audioContext.currentTime);
          noteIndex = (noteIndex + 1) % notes.length;
        }
      }, 250);
      const pad1 = audioContext.createOscillator();
      const pad2 = audioContext.createOscillator();
      const padGain = audioContext.createGain();
      pad1.type = 'sine';
      pad2.type = 'sine';
      pad1.frequency.setValueAtTime(523.25, now);
      pad2.frequency.setValueAtTime(659.25, now);
      padGain.gain.setValueAtTime(0.1, now);
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
      const carrier = audioContext.createOscillator();
      const modulator = audioContext.createOscillator();
      const modGain = audioContext.createGain();
      const carrierGain = audioContext.createGain();
      carrier.type = 'sine';
      modulator.type = 'sine';
      carrier.frequency.setValueAtTime(1046.5, now);
      modulator.frequency.setValueAtTime(5, now);
      modGain.gain.setValueAtTime(200, now);
      carrierGain.gain.setValueAtTime(0.08, now);
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(carrierGain);
      carrierGain.connect(mainGain);
      if (analyser) {
        mainGain.connect(analyser);
      } else {
        mainGain.connect(audioContext.destination);
      }
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
      strudelRef.current = { oscillators, gains, arpInterval, mainGain };
      toast.success("Quantum resonance field activated!");
    } catch (error) {
      console.error("Audio error:", error);
      toast.error("Audio playback failed: " + (error as Error).message);
    }
  }, [code, audioInitialized, analyser, audioContext]);

  const handlePlayPause = async () => {
    if (!isPlaying) {
      if (!audioContext) {
        toast.error("Audio system not ready. Please refresh the page.");
        return;
      }
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
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
        strudelRef.current.oscillators?.forEach((osc: OscillatorNode) => {
          try { osc.stop(); } catch (e) {}
        });
        if (strudelRef.current.arpInterval) clearInterval(strudelRef.current.arpInterval);
        strudelRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  const handleScratch = useCallback((scratchSpeed: number) => {
    if (!audioContext || !strudelRef.current?.mainGain) return;
    const now = audioContext.currentTime;
    const scratchIntensity = Math.abs(scratchSpeed) * 0.05;
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
          try { osc.stop(); } catch (e) {}
        });
        if (strudelRef.current.arpInterval) clearInterval(strudelRef.current.arpInterval);
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
      if (strudelRef.current) {
        strudelRef.current.oscillators?.forEach((osc: OscillatorNode) => {
          try { osc.stop(); } catch (e) {}
        });
        if (strudelRef.current.arpInterval) clearInterval(strudelRef.current.arpInterval);
        strudelRef.current = null;
      }
      setIsPlaying(false);
      if (!easterEggAudioRef.current) {
        easterEggAudioRef.current = new Audio('/easter-egg.mp3');
        easterEggAudioRef.current.volume = 0.7;
      }
      easterEggAudioRef.current.play();
      toast.success("🎵 Easter egg unlocked! Wrong Number Song - Slowed & Reverb", { duration: 5000 });
      setEasterEggCount(0);
    } else {
      toast(`Click ${3 - (easterEggCount + 1)} more times...`, { duration: 1000 });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden noise-overlay">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none opacity-50">
        <QuantumField isPlaying={isPlaying} analyser={analyser} />
      </div>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full opacity-[0.04] animate-breathe"
          style={{ background: 'radial-gradient(circle, hsl(var(--quantum-glow)), transparent 70%)' }} />
        <div className="absolute -bottom-1/4 -right-1/4 w-[50vw] h-[50vw] rounded-full opacity-[0.03] animate-breathe"
          style={{ background: 'radial-gradient(circle, hsl(var(--quantum-purple)), transparent 70%)', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="px-4 sm:px-6 lg:px-8 pt-6 pb-2"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Disc3 className={`w-7 h-7 sm:w-8 sm:h-8 text-quantum-glow ${isPlaying ? 'animate-spin-vinyl' : ''}`} />
                <div className="absolute inset-0 blur-md opacity-40">
                  <Disc3 className="w-7 h-7 sm:w-8 sm:h-8 text-quantum-glow" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tighter text-gradient-brand">
                  Vers3Dynamics
                </h1>
                <p className="text-[10px] sm:text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground/60 -mt-0.5">
                  Studio
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </motion.header>

        {/* Main workspace */}
        <main className="px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto">

          {/* Hero: Vinyl Player */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 mb-6 sm:mb-8"
          >
            <div className="relative rounded-[2rem] overflow-hidden glass-panel-strong shadow-[var(--shadow-elevated)] border-gradient">
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: 'var(--gradient-hero)' }} />
              
              <div className="relative p-6 sm:p-8 md:p-10 flex flex-col items-center">
                <div onClick={handleEasterEgg} className="cursor-pointer">
                  <VinylPlayer
                    isPlaying={isPlaying}
                    onScratch={handleScratch}
                    onNeedleChange={handleNeedleChange}
                  />
                </div>

                {/* Integrated controls below vinyl */}
                <div className="w-full max-w-md mt-6">
                  <Controls
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onReset={handleReset}
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Visualizers + Code Editor */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5"
          >
            {/* Left: Visualizers */}
            <div className="lg:col-span-5 space-y-4">
              {/* Frequency bars */}
              <div className="rounded-2xl overflow-hidden glass-panel shadow-[var(--shadow-artistic)] unified-transition hover:shadow-[var(--glow-shadow)]">
                <div className="px-4 py-2.5 border-b border-border/30 flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5 text-quantum-glow" />
                  <span className="text-xs font-mono font-semibold tracking-widest text-gradient-brand">
                    FREQUENCY
                  </span>
                </div>
                <AudioVisualizer
                  isPlaying={isPlaying}
                  audioContext={audioContext}
                  analyser={analyser}
                />
              </div>

              {/* Waveform + Spectrogram */}
              <div className="rounded-2xl overflow-hidden glass-panel shadow-[var(--shadow-artistic)] unified-transition hover:shadow-[var(--glow-shadow-purple)]">
                <EnhancedVisualizer
                  isPlaying={isPlaying}
                  audioContext={audioContext}
                  analyser={analyser}
                />
              </div>
            </div>

            {/* Right: Code editor */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden glass-panel-strong shadow-[var(--shadow-elevated)] unified-transition hover:shadow-[var(--glow-shadow-purple)] h-full flex flex-col">
                <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gradient-brand">
                      Sonic Code Canvas
                    </h2>
                    <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5 tracking-wide">
                      Compose your quantum symphony
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-quantum-pink/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-quantum-gold/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-quantum-glow/60" />
                  </div>
                </div>
                <div className="p-2 sm:p-3 flex-1 min-h-[300px] lg:min-h-0">
                  <CodeEditor value={code} onChange={setCode} />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Footer */}
          <footer className="text-center py-8 mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-gradient-brand">
                Gesamtkunstwerk
              </span>
              <span className="text-xs text-muted-foreground/50">—</span>
              <span className="text-xs text-muted-foreground/50 tracking-wide">
                A unified artistic experience
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
