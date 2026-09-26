class AudioEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.muted = false;
  }

  playTone(freq, type, duration, vol) {
    if (this.muted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  shoot() {
    this.playTone(800, 'square', 0.1, 0.1);
  }

  explosion() {
    if (this.muted) return;
    const dur = 0.5;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + dur);
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  }

  damage() {
    this.playTone(150, 'sawtooth', 0.4, 0.3);
  }

  bonusSpawn() {
    this.playTone(1200, 'sine', 0.2, 0.1);
    setTimeout(() => this.playTone(1600, 'sine', 0.3, 0.1), 100);
  }

  fanfare() {
    this.playTone(400, 'square', 0.2, 0.1);
    setTimeout(() => this.playTone(500, 'square', 0.2, 0.1), 200);
    setTimeout(() => this.playTone(600, 'square', 0.4, 0.1), 400);
  }

  click() {
    this.playTone(1000, 'sine', 0.05, 0.05);
  }
}

const audio = new AudioEngine();
