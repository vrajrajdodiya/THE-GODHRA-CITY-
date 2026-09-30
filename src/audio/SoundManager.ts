/**
 * Procedural Web Audio Sound Manager for Godhra City Life.
 * Completely self-contained, no external mp3 files required.
 */
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private isEngineRunning: boolean = false;
  private isRainPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopEngineSound();
      this.stopRainAmbience();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playFootstep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 40, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch {
      // Audio fallback safety
    }
  }

  public playBicycleBell() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.1].forEach((delay, idx) => {
        const t = now + delay;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 1900 : 2200, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.12);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.15);
      });
    } catch {
      // safe
    }
  }

  public playVehicleHorn(isScooter = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const freqs = isScooter ? [480, 520] : [380, 440];

      freqs.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.setValueAtTime(0.12, t + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.33);
      });
    } catch {
      // safe
    }
  }

  public startEngineSound(vehicleType: string) {
    if (this.isMuted) return;
    if (this.isEngineRunning) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      const baseFreq = vehicleType === 'car' ? 65 : vehicleType === 'motorcycle' ? 85 : 110;
      this.engineOsc.type = vehicleType === 'car' ? 'sawtooth' : 'triangle';
      this.engineOsc.frequency.setValueAtTime(baseFreq, t);

      this.engineGain.gain.setValueAtTime(0.06, t);

      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start(t);
      this.isEngineRunning = true;
    } catch {
      // safe
    }
  }

  public updateEnginePitch(speedRatio: number, vehicleType: string) {
    if (!this.isEngineRunning || !this.engineOsc || !this.ctx) return;
    try {
      const baseFreq = vehicleType === 'car' ? 65 : vehicleType === 'motorcycle' ? 85 : 110;
      const targetFreq = baseFreq + speedRatio * 140;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
    } catch {
      // safe
    }
  }

  public stopEngineSound() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
        this.engineOsc = null;
      }
      if (this.engineGain) {
        this.engineGain.disconnect();
        this.engineGain = null;
      }
    } catch {
      // safe
    }
    this.isEngineRunning = false;
  }

  public playCashEarned() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // High bell + coin register
      [1200, 1600, 2400].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const start = t + i * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.16);
      });
    } catch {
      // safe
    }
  }

  public playMissionComplete() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // Gujarati celebratory victory fanfare notes (C4, E4, G4, C5 arpeggio)
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const start = t + idx * 0.11;
        const dur = idx === notes.length - 1 ? 0.6 : 0.2;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + dur + 0.05);
      });
    } catch {
      // safe
    }
  }

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {
      // safe
    }
  }

  public playDoorEnter() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(480, t + 0.12);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch {
      // safe
    }
  }

  public startRainAmbience() {
    if (this.isMuted || this.isRainPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Generate pink/white noise buffer for rain
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.15;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.ctx.destination);

      noise.start();
      this.rainNode = noise;
      this.isRainPlaying = true;
    } catch {
      // safe
    }
  }

  public stopRainAmbience() {
    if (!this.isRainPlaying) return;
    try {
      if (this.rainNode) {
        (this.rainNode as AudioScheduledSourceNode).stop();
        this.rainNode.disconnect();
        this.rainNode = null;
      }
      if (this.rainGain) {
        this.rainGain.disconnect();
        this.rainGain = null;
      }
    } catch {
      // safe
    }
    this.isRainPlaying = false;
  }

  // ================= DISTRICT AMBIENT SYSTEM =================
  private currentDistrict: string = 'home';
  private districtGain: GainNode | null = null;
  private districtNodes: AudioNode[] = [];
  private districtInterval: number | null = null;

  public setDistrictAmbience(district: string) {
    if (this.currentDistrict === district && this.districtGain) return;
    this.currentDistrict = district;

    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopDistrictAmbience();

    try {
      const t = this.ctx.currentTime;
      this.districtGain = this.ctx.createGain();
      this.districtGain.gain.setValueAtTime(0.001, t);
      this.districtGain.gain.exponentialRampToValueAtTime(0.08, t + 1.2);
      this.districtGain.connect(this.ctx.destination);

      switch (district) {
        case 'market':
          this.buildMarketAmbience();
          break;
        case 'college':
          this.buildCollegeAmbience();
          break;
        case 'food':
          this.buildFoodStreetAmbience();
          break;
        case 'garage':
          this.buildGarageAmbience();
          break;
        case 'park':
          this.buildParkAmbience();
          break;
        case 'center':
          this.buildCenterAmbience();
          break;
        case 'highway':
          this.buildHighwayAmbience();
          break;
        default:
          this.buildHomeAmbience();
          break;
      }
    } catch {
      // safe
    }
  }

  public stopDistrictAmbience() {
    if (this.districtInterval !== null) {
      window.clearInterval(this.districtInterval);
      this.districtInterval = null;
    }
    if (this.districtGain && this.ctx) {
      try {
        this.districtGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
      } catch {
        // safe
      }
    }
    this.districtNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // safe
      }
    });
    this.districtNodes = [];
  }

  /**
   * Main Market: Bustling crowd murmur, vendor shouts, brass scales clink
   */
  private buildMarketAmbience() {
    if (!this.ctx || !this.districtGain) return;

    // Filtered pink noise for bustling crowd murmur
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.18;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(650, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.8, this.ctx.currentTime);

    noise.connect(bandpass);
    bandpass.connect(this.districtGain);
    noise.start();
    this.districtNodes.push(noise, bandpass);

    // Periodic market chime / vendor bell / clink
    this.districtInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || Math.random() > 0.65) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400 + Math.random() * 800, now);
        g.gain.setValueAtTime(0.04, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch {
        // safe
      }
    }, 2800);
  }

  /**
   * College Campus: Youth chatter formants, book rustle, campus bell chime
   */
  private buildCollegeAmbience() {
    if (!this.ctx || !this.districtGain) return;

    // Light airy crowd atmosphere
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    g.gain.setValueAtTime(0.015, this.ctx.currentTime);

    osc.connect(g);
    g.connect(this.districtGain);
    osc.start();
    this.districtNodes.push(osc, g);

    // Campus bell & cheerful chatter bursts
    this.districtInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || Math.random() > 0.6) return;
      try {
        const now = this.ctx.currentTime;
        // Two-tone bell or vocal formant blip
        [587.33, 880].forEach((freq, idx) => {
          const bOsc = this.ctx!.createOscillator();
          const bGain = this.ctx!.createGain();
          bOsc.type = 'sine';
          bOsc.frequency.setValueAtTime(freq, now + idx * 0.15);
          bGain.gain.setValueAtTime(0.03, now + idx * 0.15);
          bGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.4);
          bOsc.connect(bGain);
          bGain.connect(this.ctx!.destination);
          bOsc.start(now + idx * 0.15);
          bOsc.stop(now + idx * 0.15 + 0.45);
        });
      } catch {
        // safe
      }
    }, 4500);
  }

  /**
   * Food Street (Khavdra Gali): Sizzling kadai oil & bubbling tea samovar
   */
  private buildFoodStreetAmbience() {
    if (!this.ctx || !this.districtGain) return;

    // Sizzling oil high-pass noise
    const bufferSize = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(2400, this.ctx.currentTime);

    noise.connect(highpass);
    highpass.connect(this.districtGain);
    noise.start();
    this.districtNodes.push(noise, highpass);

    // Occasional glass cup clinking
    this.districtInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || Math.random() > 0.5) return;
      try {
        const now = this.ctx.currentTime;
        const clink = this.ctx.createOscillator();
        const cg = this.ctx.createGain();
        clink.type = 'sine';
        clink.frequency.setValueAtTime(2400, now);
        cg.gain.setValueAtTime(0.03, now);
        cg.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        clink.connect(cg);
        cg.connect(this.ctx.destination);
        clink.start(now);
        clink.stop(now + 0.12);
      } catch {
        // safe
      }
    }, 3200);
  }

  /**
   * JD Auto Garage: Pneumatic air hiss & metallic wrench drops
   */
  private buildGarageAmbience() {
    if (!this.ctx || !this.districtGain) return;

    // Low mechanical motor hum
    const hum = this.ctx.createOscillator();
    const hg = this.ctx.createGain();
    hum.type = 'sawtooth';
    hum.frequency.setValueAtTime(55, this.ctx.currentTime);
    hg.gain.setValueAtTime(0.02, this.ctx.currentTime);

    hum.connect(hg);
    hg.connect(this.districtGain);
    hum.start();
    this.districtNodes.push(hum, hg);

    // Occasional pneumatic wrench hiss or tool clatter
    this.districtInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || Math.random() > 0.5) return;
      try {
        const now = this.ctx.currentTime;
        const metal = this.ctx.createOscillator();
        const mg = this.ctx.createGain();
        metal.type = 'triangle';
        metal.frequency.setValueAtTime(950 + Math.random() * 400, now);
        metal.frequency.exponentialRampToValueAtTime(300, now + 0.08);
        mg.gain.setValueAtTime(0.04, now);
        mg.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        metal.connect(mg);
        mg.connect(this.ctx.destination);
        metal.start(now);
        metal.stop(now + 0.16);
      } catch {
        // safe
      }
    }, 3600);
  }

  /**
   * Shanti Baug (Park): Gentle breeze, fountain water, songbirds
   */
  private buildParkAmbience() {
    if (!this.ctx || !this.districtGain) return;

    // Soft water trickle / fountain filter
    const bufferSize = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.04;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.districtGain);
    noise.start();
    this.districtNodes.push(noise, filter);

    // Songbird chirps
    this.districtInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || Math.random() > 0.4) return;
      try {
        const now = this.ctx.currentTime;
        const bird = this.ctx.createOscillator();
        const bg = this.ctx.createGain();
        bird.type = 'sine';
        bird.frequency.setValueAtTime(2800, now);
        bird.frequency.exponentialRampToValueAtTime(3600, now + 0.06);
        bird.frequency.exponentialRampToValueAtTime(2600, now + 0.14);
        bg.gain.setValueAtTime(0.025, now);
        bg.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        bird.connect(bg);
        bg.connect(this.ctx.destination);
        bird.start(now);
        bird.stop(now + 0.17);
      } catch {
        // safe
      }
    }, 2400);
  }

  /**
   * City Center: Clock Tower chime & traffic murmur
   */
  private buildCenterAmbience() {
    if (!this.ctx || !this.districtGain) return;

    // Distant traffic drone
    const drone = this.ctx.createOscillator();
    const dg = this.ctx.createGain();
    drone.type = 'triangle';
    drone.frequency.setValueAtTime(90, this.ctx.currentTime);
    dg.gain.setValueAtTime(0.02, this.ctx.currentTime);

    drone.connect(dg);
    dg.connect(this.districtGain);
    drone.start();
    this.districtNodes.push(drone, dg);

    // Resonant Clock Tower toll chime
    this.districtInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || Math.random() > 0.5) return;
      try {
        const now = this.ctx.currentTime;
        const bell = this.ctx.createOscillator();
        const bg = this.ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(329.63, now); // E4 bell
        bg.gain.setValueAtTime(0.06, now);
        bg.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        bell.connect(bg);
        bg.connect(this.ctx.destination);
        bell.start(now);
        bell.stop(now + 1.3);
      } catch {
        // safe
      }
    }, 6000);
  }

  /**
   * Highway: Fast tire whoosh
   */
  private buildHighwayAmbience() {
    if (!this.ctx || !this.districtGain) return;
    const wind = this.ctx.createOscillator();
    const wg = this.ctx.createGain();
    wind.type = 'triangle';
    wind.frequency.setValueAtTime(75, this.ctx.currentTime);
    wg.gain.setValueAtTime(0.03, this.ctx.currentTime);
    wind.connect(wg);
    wg.connect(this.districtGain);
    wind.start();
    this.districtNodes.push(wind, wg);
  }

  /**
   * Friends' Home: Peaceful acoustic residential tone
   */
  private buildHomeAmbience() {
    if (!this.ctx || !this.districtGain) return;
    const tone = this.ctx.createOscillator();
    const tg = this.ctx.createGain();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(110, this.ctx.currentTime);
    tg.gain.setValueAtTime(0.01, this.ctx.currentTime);
    tone.connect(tg);
    tg.connect(this.districtGain);
    tone.start();
    this.districtNodes.push(tone, tg);
  }

  /**
   * Speech Synthesis / Formant Vocal Chatter
   */
  public speakPedestrianChatter(text: string) {
    if (this.isMuted) return;

    // Check Web Speech API
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Don't queue too many
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0 + (Math.random() - 0.5) * 0.2;
        utterance.volume = 0.65;

        // Try finding Indian English or local voice
        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find((v) => v.lang.includes('IN') || v.name.toLowerCase().includes('india'));
        if (indianVoice) {
          utterance.voice = indianVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        // safe
      }
    }
  }
}

export const soundManager = new SoundManager();
