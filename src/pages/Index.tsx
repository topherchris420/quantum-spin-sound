import { useState, useEffect, useRef, useCallback } from "react";
import { VinylPlayer } from "@/components/VinylPlayer";
import { CodeEditor } from "@/components/CodeEditor";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { EnhancedVisualizer } from "@/components/EnhancedVisualizer";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { Controls } from "@/components/Controls";
import { EasterEggParticles } from "@/components/EasterEggParticles";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { evaluate } from "@strudel/transpiler";
import { Code2, Maximize2, Minimize2, Music, Radio, Waves } from "lucide-react";
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

type AudioCapableWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

type StrudelRuntime = {
  oscillators?: OscillatorNode[];
  gains?: GainNode[];
  arpInterval?: ReturnType<typeof setInterval>;
  mainGain?: GainNode;
};

const ignoreAudioNodeError = (error: unknown) => {
  void error;
};

const Index = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
const [easterEggCount, setEasterEggCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [easterEggActive, setEasterEggActive] = useState(false);
const [easterEggAnalyser, setEasterEggAnalyser] = useState<AnalyserNode | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const strudelRef = useRef<StrudelRuntime | null>(null);
  const scratchFilterRef = useRef<BiquadFilterNode | null>(null);
  const crackleRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode; surfaceGain: GainNode; surfaceSource: AudioBufferSourceNode } | null>(null);
  const easterEggAudioRef = useRef<HTMLAudioElement | null>(null);
  const easterEggSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    const initAudio = () => {
      try {
        const AudioContextConstructor = window.AudioContext || (window as AudioCapableWindow).webkitAudioContext;
        if (!AudioContextConstructor) {
          throw new Error("Web Audio is not supported in this browser.");
        }
        const ctx = new AudioContextConstructor();
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

    // Reduced motion preference
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);

    return () => {
      strudelRef.current = null;
      mql.removeEventListener('change', handler);
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
      // Route through the scratch filter so scratching can sweep brightness
      const scratchFilter = scratchFilterRef.current;
      if (scratchFilter) {
        try { scratchFilter.disconnect(); } catch (error) { ignoreAudioNodeError(error); }
        mainGain.connect(scratchFilter);
        if (analyser) {
          scratchFilter.connect(analyser);
        } else {
          scratchFilter.connect(audioContext.destination);
        }
      } else if (analyser) {
        mainGain.connect(analyser);
      } else {
        mainGain.connect(audioContext.destination);
      }

      // ===== Vinyl crackle + surface noise =====
      // Continuous low-level hiss/crackle that sits under the music and swells
      // when the user scratches, then fades back when the needle is lifted.
      try {
        const sampleRate = audioContext.sampleRate;
        // 2s loop of dense crackle (sparse impulses + pink-ish noise)
        const crackleBuffer = audioContext.createBuffer(1, sampleRate * 2, sampleRate);
        const cData = crackleBuffer.getChannelData(0);
        for (let i = 0; i < cData.length; i++) {
          // sparse pops
          const pop = Math.random() < 0.0008 ? (Math.random() * 2 - 1) * 0.9 : 0;
          // fine grain hiss
          const hiss = (Math.random() * 2 - 1) * 0.08;
          cData[i] = pop + hiss;
        }
        const crackleSource = audioContext.createBufferSource();
        crackleSource.buffer = crackleBuffer;
        crackleSource.loop = true;
        const crackleHP = audioContext.createBiquadFilter();
        crackleHP.type = "highpass";
        crackleHP.frequency.value = 1200;
        const crackleGain = audioContext.createGain();
        crackleGain.gain.setValueAtTime(0.05, now);
        crackleSource.connect(crackleHP);
        crackleHP.connect(crackleGain);
        crackleGain.connect(analyser ?? audioContext.destination);

        // Warmer "surface noise" bed — broadband rumble + brush
        const surfaceBuffer = audioContext.createBuffer(1, sampleRate * 2, sampleRate);
        const sData = surfaceBuffer.getChannelData(0);
        let lastSample = 0;
        for (let i = 0; i < sData.length; i++) {
          // low-passed brown-ish noise
          const white = Math.random() * 2 - 1;
          lastSample = (lastSample + 0.02 * white) / 1.02;
          sData[i] = lastSample * 3;
        }
        const surfaceSource = audioContext.createBufferSource();
        surfaceSource.buffer = surfaceBuffer;
        surfaceSource.loop = true;
        const surfaceBP = audioContext.createBiquadFilter();
        surfaceBP.type = "bandpass";
        surfaceBP.frequency.value = 500;
        surfaceBP.Q.value = 0.7;
        const surfaceGain = audioContext.createGain();
        surfaceGain.gain.setValueAtTime(0.04, now);
        surfaceSource.connect(surfaceBP);
        surfaceBP.connect(surfaceGain);
        surfaceGain.connect(analyser ?? audioContext.destination);

        crackleSource.start(now + 0.05);
        surfaceSource.start(now + 0.05);
        crackleRef.current = { source: crackleSource, gain: crackleGain, surfaceSource, surfaceGain };
      } catch (e) {
        console.warn("Crackle generator failed:", e);
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
          try { osc.stop(); } catch (error) { ignoreAudioNodeError(error); }
        });
        if (strudelRef.current.arpInterval) clearInterval(strudelRef.current.arpInterval);
        strudelRef.current = null;
      }
      stopCrackle();
      setIsPlaying(false);
    }
  };

  // Fade out and tear down the crackle/surface-noise bed when the needle lifts
  const stopCrackle = () => {
    const crackle = crackleRef.current;
    if (!crackle || !audioContext) return;
    const now = audioContext.currentTime;
    try {
      crackle.gain.gain.cancelScheduledValues(now);
      crackle.gain.gain.setTargetAtTime(0, now, 0.25);
      crackle.surfaceGain.gain.cancelScheduledValues(now);
      crackle.surfaceGain.gain.setTargetAtTime(0, now, 0.3);
      const src = crackle.source;
      const surf = crackle.surfaceSource;
      setTimeout(() => {
        try { src.stop(); } catch (error) { ignoreAudioNodeError(error); }
        try { surf.stop(); } catch (error) { ignoreAudioNodeError(error); }
      }, 1200);
    } catch (error) {
      ignoreAudioNodeError(error);
    }
    crackleRef.current = null;
  };

  const handleScratch = useCallback((velocity: number) => {
    if (!audioContext || !strudelRef.current) return;
    const { oscillators, mainGain } = strudelRef.current;
    const now = audioContext.currentTime;
    const speed = Math.abs(velocity);

    // Pitch: signed velocity bends pitch like dragging real vinyl (forward = up, back = down)
    const detune = Math.max(-1200, Math.min(1200, velocity * 90));
    oscillators?.forEach((osc: OscillatorNode) => {
      try {
        osc.detune.cancelScheduledValues(now);
        osc.detune.setTargetAtTime(detune, now, 0.015);
        // Spring back to normal pitch shortly after the last movement
        osc.detune.setTargetAtTime(0, now + 0.08, 0.12);
      } catch (error) {
        ignoreAudioNodeError(error);
      }
    });

    // Volume: fast flicks burst louder, slow drags duck the output
    if (mainGain) {
      const targetGain = Math.max(0.04, Math.min(0.32, 0.06 + speed * 0.03));
      mainGain.gain.cancelScheduledValues(now);
      mainGain.gain.setTargetAtTime(targetGain, now, 0.012);
      mainGain.gain.setTargetAtTime(0.15, now + 0.1, 0.15);
    }

    // Filter sweep: brightness follows scratch speed for that wicki-wicki texture
    const filter = scratchFilterRef.current;
    if (filter) {
      const freq = Math.max(300, Math.min(8000, 600 + speed * 700));
      filter.frequency.cancelScheduledValues(now);
      filter.frequency.setTargetAtTime(freq, now, 0.012);
      filter.frequency.setTargetAtTime(2000, now + 0.1, 0.2);
    }

    // Crackle + surface noise swell during scratching, fall back to bed level
    const crackle = crackleRef.current;
    if (crackle) {
      const crackleTarget = Math.min(0.45, 0.08 + speed * 0.07);
      const surfaceTarget = Math.min(0.3, 0.06 + speed * 0.045);
      crackle.gain.gain.cancelScheduledValues(now);
      crackle.gain.gain.setTargetAtTime(crackleTarget, now, 0.02);
      crackle.gain.gain.setTargetAtTime(0.05, now + 0.15, 0.25);
      crackle.surfaceGain.gain.cancelScheduledValues(now);
      crackle.surfaceGain.gain.setTargetAtTime(surfaceTarget, now, 0.02);
      crackle.surfaceGain.gain.setTargetAtTime(0.04, now + 0.15, 0.3);
    }
  }, [audioContext]);

  const handleNeedleChange = useCallback(async (isOnRecord: boolean) => {
    if (isOnRecord && !isPlaying) {
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
    } else if (!isOnRecord && isPlaying) {
      if (strudelRef.current) {
        strudelRef.current.oscillators?.forEach((osc: OscillatorNode) => {
          try { osc.stop(); } catch (error) { ignoreAudioNodeError(error); }
        });
        if (strudelRef.current.arpInterval) clearInterval(strudelRef.current.arpInterval);
        strudelRef.current = null;
      }
      stopCrackle();
      setIsPlaying(false);
    }
  }, [isPlaying, audioContext, evaluateCode]);

  const handleReset = () => {
    setCode(DEFAULT_CODE);
    toast.success("Code reset to default");
  };

  const handleEasterEgg = async () => {
    setEasterEggCount(prev => prev + 1);
    if (easterEggCount + 1 === 3) {
      if (strudelRef.current) {
        strudelRef.current.oscillators?.forEach((osc: OscillatorNode) => {
          try { osc.stop(); } catch (error) { ignoreAudioNodeError(error); }
        });
        if (strudelRef.current.arpInterval) clearInterval(strudelRef.current.arpInterval);
        strudelRef.current = null;
      }
      setIsPlaying(false);
      if (!easterEggAudioRef.current) {
        easterEggAudioRef.current = new Audio('/easter-egg.mp3');
        easterEggAudioRef.current.volume = 0.7;
      }
      // Route easter egg audio through an analyser for beat-sync (only once per element)
      if (audioContext) {
        if (audioContext.state === 'suspended') await audioContext.resume();
        if (!easterEggSourceRef.current) {
          const source = audioContext.createMediaElementSource(easterEggAudioRef.current);
          easterEggSourceRef.current = source;
          const eeAnalyser = audioContext.createAnalyser();
          eeAnalyser.fftSize = 256;
          source.connect(eeAnalyser);
          eeAnalyser.connect(audioContext.destination);
          setEasterEggAnalyser(eeAnalyser);
        }
      }
      easterEggAudioRef.current.play();
      setEasterEggActive(true);
      easterEggAudioRef.current.onended = () => {
        setEasterEggActive(false);
        setEasterEggAnalyser(null);
      };
      toast.success("🎵 Cymatic Connection — Easter Egg Unlocked!", { duration: 5000 });
      setEasterEggCount(0);
    } else {
      toast(`Click ${3 - (easterEggCount + 1)} more times...`, { duration: 1000 });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden noise-overlay">
      {/* Shader background — fullscreen mode */}
      <div className={`fixed inset-0 transition-all duration-700 ease-in-out ${isFullscreen ? 'z-50 opacity-100' : 'pointer-events-none z-0 opacity-60'}`}>
        {!prefersReducedMotion && <ShaderAnimation analyser={analyser} />}
        {isFullscreen && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 pointer-events-none">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setIsFullscreen(false)}
              className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full glass-panel-strong text-sm font-semibold tracking-wide text-foreground/80 hover:text-foreground transition-colors shadow-lg"
            >
              <Minimize2 className="w-4 h-4" />
              Exit Fullscreen
            </motion.button>
          </div>
        )}
      </div>

      {/* Easter egg visual effect overlay */}
      {easterEggActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed inset-0 z-40 pointer-events-none"
        >
          {/* Pulsing radial glow */}
          <div className="absolute inset-0 animate-[pulse_1.5s_ease-in-out_infinite]"
            style={{
              background: 'radial-gradient(circle at 50% 50%, hsla(var(--primary), 0.25), hsla(var(--accent), 0.15), transparent 70%)',
            }}
          />
          {/* Spinning ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-[80vmin] h-[80vmin] rounded-full border-2 border-primary/30 animate-[spin_8s_linear_infinite]"
              style={{
                boxShadow: '0 0 60px 20px hsla(var(--primary), 0.2), inset 0 0 60px 20px hsla(var(--accent), 0.1)',
              }}
            />
          </div>
          {/* Secondary ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-[50vmin] h-[50vmin] rounded-full border border-accent/20 animate-[spin_12s_linear_infinite_reverse]"
              style={{
                boxShadow: '0 0 40px 10px hsla(var(--accent), 0.15)',
              }}
            />
          </div>
          {/* Corner flares */}
          <div className="absolute top-0 left-0 w-1/3 h-1/3 opacity-40 animate-[pulse_2s_ease-in-out_infinite]"
            style={{ background: 'radial-gradient(circle at 0% 0%, hsl(var(--primary)), transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 opacity-40 animate-[pulse_2s_ease-in-out_infinite_0.5s]"
            style={{ background: 'radial-gradient(circle at 100% 100%, hsl(var(--accent)), transparent 70%)' }} />
        </motion.div>
      )}

      {/* Easter egg particles */}
      {easterEggActive && !prefersReducedMotion && <EasterEggParticles analyser={easterEggAnalyser} />}

      <div className="relative z-10 showcase-shell">
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="showcase-nav"
        >
          <div className="brand-lockup">
            <img src="/logo.jpg" alt="Vers3Dynamics mark" className="brand-image" />
            <div>
              <p className="nav-kicker">Quantum Spin Sound</p>
              <h1>Vers3Dynamics Studio</h1>
            </div>
          </div>
          <div className="nav-actions">
            <span>Live code</span>
            <span>Vinyl scratch</span>
            <span>Wave field</span>
              <button
                onClick={() => setIsFullscreen(true)}
                className="icon-button"
                title="Fullscreen shader"
                aria-label="Open fullscreen shader"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <ThemeToggle />
          </div>
        </motion.header>

        <main className="showcase-main">

          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="showcase-hero"
          >
            <div className="hero-copy">
              <p className="eyebrow">A playable quantum record</p>
              <h2>Spin the field. Hear the math bend.</h2>
              <p className="hero-subcopy">
                A live-coded sound lab where vinyl movement, synthesized tones, and
                quantum-inspired visual fields react as one instrument.
              </p>
              <div className="hero-metrics" aria-label="Studio capabilities">
                <div>
                  <strong>09</strong>
                  <span>pattern layers</span>
                </div>
                <div>
                  <strong>120</strong>
                  <span>bpm field</span>
                </div>
                <div>
                  <strong>3D</strong>
                  <span>shader stage</span>
                </div>
              </div>
            </div>
            <div className="hero-stage">
              <div onClick={handleEasterEgg} className="vinyl-wrap cursor-pointer">
                <VinylPlayer
                  isPlaying={isPlaying}
                  onScratch={handleScratch}
                  onNeedleChange={handleNeedleChange}
                />
              </div>
              <div className="control-dock">
                <Controls
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onReset={handleReset}
                />
                <p>Drag the needle onto the record. Drag the record while playing to scratch.</p>
              </div>
            </div>
          </motion.section>

          <section className="signal-runway" aria-label="Signal flow">
            <div className="signal-track">
              <span>spin state</span>
              <span>surface noise</span>
              <span>pitch bend</span>
              <span>resonance</span>
              <span>field vision</span>
              <span>live code</span>
              <span>spin state</span>
              <span>surface noise</span>
              <span>pitch bend</span>
              <span>resonance</span>
              <span>field vision</span>
              <span>live code</span>
            </div>
          </section>

          <section className="lab-deck" aria-label="Studio features">
            {[
              [
                "01",
                "Scratch physics",
                "Signed drag velocity bends pitch, gain, filter brightness, crackle, and surface noise.",
              ],
              [
                "02",
                "Generative score",
                "The Strudel-inspired canvas keeps the composition visible, editable, and central.",
              ],
              [
                "03",
                "Field vision",
                "Audio analysis drives waveform, spectrum, and shader movement for a full-body readout.",
              ],
            ].map(([number, title, body]) => (
              <article key={number} className="lab-card">
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </section>

          {/* Performance workspace */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="performance-grid"
          >
            <div className="visual-stack">
              <div className="section-label">
                <Waves className="w-4 h-4" />
                <span>Signal monitor</span>
              </div>
              <div className="visual-panel">
                <AudioVisualizer
                  isPlaying={isPlaying}
                  audioContext={audioContext}
                  analyser={analyser}
                />
              </div>

              <div className="visual-panel visual-panel-tall">
                <EnhancedVisualizer
                  isPlaying={isPlaying}
                  audioContext={audioContext}
                  analyser={analyser}
                />
              </div>
            </div>

            <div className="code-stage">
              <div className="code-stage-header">
                <div>
                  <div className="section-label">
                    <Code2 className="w-4 h-4" />
                    <span>Sonic code canvas</span>
                  </div>
                  <h3>Compose the resonance engine.</h3>
                </div>
                <div className="status-pills">
                  <span>
                    <Radio className="w-3.5 h-3.5" />
                    {isPlaying ? "Live" : "Idle"}
                  </span>
                  <span>
                    <Music className="w-3.5 h-3.5" />
                    Web Audio
                  </span>
                </div>
              </div>
              <div className="code-editor-frame">
                <CodeEditor value={code} onChange={setCode} />
              </div>
            </div>
          </motion.section>

          {/* Footer */}
          <footer className="showcase-footer">
            <span>Gesamtkunstwerk studio</span>
            <span>Quantum sound, vinyl touch, live code.</span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
