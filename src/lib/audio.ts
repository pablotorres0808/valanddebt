/**
 * Synthetic Audio Manager - Procedural Game Sounds
 * No external dependencies or assets required.
 */

class AudioMgr {
    private ctx: AudioContext | null = null;
    private engineOsc: OscillatorNode | null = null;
    private secondaryOsc: OscillatorNode | null = null;
    private engineGain: GainNode | null = null;
    private muted: boolean = false;

    private initCtx() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopEngine();
        }
        return this.muted;
    }

    public isMuted() {
        return this.muted;
    }

    // --- ENGINE HUM (Procedural) ---
    public startEngine() {
        if (this.muted) return;
        this.initCtx();
        if (this.engineOsc) return;

        this.engineOsc = this.ctx!.createOscillator();
        this.secondaryOsc = this.ctx!.createOscillator();
        this.engineGain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        // Digital/Data Hum for Portfolio
        this.engineOsc.type = 'triangle';
        this.engineOsc.frequency.setValueAtTime(80, this.ctx!.currentTime);

        this.secondaryOsc.type = 'square';
        this.secondaryOsc.frequency.setValueAtTime(82.4, this.ctx!.currentTime); // Digital phase

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, this.ctx!.currentTime);

        this.engineGain.gain.setValueAtTime(0.02, this.ctx!.currentTime);

        this.engineOsc.connect(filter);
        this.secondaryOsc.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.ctx!.destination);

        this.engineOsc.start();
        this.secondaryOsc.start();
    }

    public stopEngine() {
        if (this.engineOsc) {
            this.engineOsc.stop();
            this.engineOsc.disconnect();
            this.engineOsc = null;
        }
        if (this.secondaryOsc) {
            this.secondaryOsc.stop();
            this.secondaryOsc.disconnect();
            this.secondaryOsc = null;
        }
    }

    // --- SOUND EFFECTS (Procedural) ---
    public playCoin() {
        if (this.muted) return;
        this.initCtx();
        const t = this.ctx!.currentTime;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.2);
    }

    public playExplosion() {
        if (this.muted) return;
        this.initCtx();
        const t = this.ctx!.currentTime;
        const dur = 0.5;

        // Create noise buffer
        const bufferSize = this.ctx!.sampleRate * dur;
        const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx!.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.exponentialRampToValueAtTime(40, t + dur);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        noise.start(t);
    }

    public playCrash() {
        if (this.muted) return;
        this.initCtx();
        const t = this.ctx!.currentTime;
        const dur = 1.0;

        // Sharp, brittle noise for glass break
        const bufferSize = this.ctx!.sampleRate * dur;
        const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // More high-frequency content for glass-like sound
            data[i] = (Math.random() * 2 - 1) * (i % 2 === 0 ? 1 : 0.8);
        }

        const noise = this.ctx!.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + dur);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        noise.start(t);
    }
}

const manager = new AudioMgr();

export const playSound = (name: 'coin' | 'explosion' | 'crash' | 'engine') => {
    if (name === 'coin') manager.playCoin();
    if (name === 'explosion') manager.playExplosion();
    if (name === 'crash') manager.playCrash();
    if (name === 'engine') manager.startEngine();
};

export const stopSound = (name: 'engine') => {
    if (name === 'engine') manager.stopEngine();
};

export const toggleMute = () => {
    return manager.toggleMute();
};

export const isMuted = () => {
    return manager.isMuted();
};
