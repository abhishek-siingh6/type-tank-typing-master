class Game {
  constructor(canvas, mode, onEnd) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mode = mode;
    this.onEnd = onEnd;
    this.running = false;
    
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.words = [];
    this.particles = [];
    this.bullets = [];
    
    this.lockedWord = null;
    this.score = 0;
    this.combo = 1;
    this.hull = 100;
    this.keystrokes = 0;
    this.correctKeystrokes = 0;
    this.startTime = Date.now();
    this.wordsDestroyed = 0;
    
    this.spawnTimer = 0;
    this.spawnRate = 2000;
    this.fallSpeed = this.height / 10000; 

    this.tankPos = { x: this.width / 2, y: this.height - 30 };
    this.turretAngle = -Math.PI / 2;

    this.redCooldowns = {};

    this.lastTime = performance.now();
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  start() {
    this.running = true;
    window.addEventListener('keydown', this.handleKeyDown);
    this.loop(performance.now());
  }

  stop() {
    this.running = false;
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.tankPos = { x: this.width / 2, y: this.height - 30 };
  }

  spawnWord() {
    const text = getRandomWord(this.mode);
    const firstChar = text[0].toLowerCase();
    
    if (this.redCooldowns[firstChar] > Date.now()) return;

    const isRed = Math.random() < 0.1;
    if (isRed) {
      audio.bonusSpawn();
    }

    this.ctx.font = "20px 'Share Tech Mono'";
    const textWidth = this.ctx.measureText(text).width;
    
    this.words.push({
      text: text,
      typed: "",
      x: Math.random() * (this.width - textWidth - 40) + 20,
      y: -20,
      isRed: isRed,
      speedMult: isRed ? 1.5 : 1
    });
  }

  handleKeyDown(e) {
    if (!this.running) return;
    if (e.key === 'Escape') {
      this.hull = 0;
      return;
    }
    
    if (e.key.length > 1) return; // Ignore modifiers
    
    const char = e.key;
    this.keystrokes++;

    if (!this.lockedWord) {
      // Find lowest word starting with char
      let target = null;
      let maxIY = -Infinity;
      
      for (let w of this.words) {
        if (w.text[0] === char) {
          if (w.y > maxIY) {
            maxIY = w.y;
            target = w;
          }
        }
      }
      if (target) {
        this.lockedWord = target;
      }
    }

    if (this.lockedWord) {
      const expectedChar = this.lockedWord.text[this.lockedWord.typed.length];
      if (char === expectedChar) {
        this.lockedWord.typed += char;
        this.correctKeystrokes++;
        audio.shoot();
        
        // Fire bullet
        const targetX = this.lockedWord.x + (this.lockedWord.typed.length * 12); // Approx char width
        const targetY = this.lockedWord.y;
        this.turretAngle = Math.atan2(targetY - this.tankPos.y, targetX - this.tankPos.x);
        
        this.bullets.push({
          x: this.tankPos.x, y: this.tankPos.y,
          tx: targetX, ty: targetY,
          progress: 0
        });

        // Add small spark at muzzle
        this.createParticles(this.tankPos.x + Math.cos(this.turretAngle)*30, this.tankPos.y + Math.sin(this.turretAngle)*30, 3, '#fff');

        if (this.lockedWord.typed === this.lockedWord.text) {
          // Destroyed
          audio.explosion();
          this.createParticles(this.lockedWord.x + 20, this.lockedWord.y, 15, this.lockedWord.isRed ? '#f33' : '#3f3');
          
          let pts = this.lockedWord.text.length * 10;
          if (this.lockedWord.isRed) pts *= 3.5;
          this.score += Math.floor(pts * this.combo);
          this.combo++;
          this.wordsDestroyed++;
          
          if (this.lockedWord.isRed) {
            this.redCooldowns[this.lockedWord.text[0].toLowerCase()] = Date.now() + 3000;
          }

          this.words = this.words.filter(w => w !== this.lockedWord);
          this.lockedWord = null;
          this.updateHUD();
        }
      } else {
        this.combo = 1;
      }
    } else {
      this.combo = 1;
    }
    this.updateHUD();
  }

  createParticles(x, y, count, color) {
    for(let i=0; i<count; i++) {
      this.particles.push({
        x: x, y: y,
        vx: (Math.random()-0.5)*5,
        vy: (Math.random()-0.5)*5,
        life: 1,
        color: color
      });
    }
  }

  updateHUD() {
    document.getElementById('hud-score').innerText = String(this.score).padStart(6, '0');
    document.getElementById('hud-combo').innerText = this.combo;
    const elapsedMins = (Date.now() - this.startTime) / 60000;
    const wpm = elapsedMins > 0 ? Math.round((this.correctKeystrokes / 5) / elapsedMins) : 0;
    document.getElementById('hud-wpm').innerText = wpm;
    const acc = this.keystrokes > 0 ? Math.round((this.correctKeystrokes / this.keystrokes) * 100) : 100;
    document.getElementById('hud-acc').innerText = acc;
    
    const fill = document.getElementById('hud-hull-fill');
    fill.style.width = this.hull + '%';
    if(this.hull > 50) fill.style.backgroundColor = 'var(--color-green)';
    else if(this.hull > 25) fill.style.backgroundColor = 'var(--color-amber)';
    else fill.style.backgroundColor = 'var(--color-red)';
  }

  loop(timestamp) {
    if (!this.running) return;
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Difficulty scaling
    const elapsed = Date.now() - this.startTime;
    this.spawnRate = Math.max(500, 2000 - elapsed / 60);
    const currentFallSpeed = this.fallSpeed * (1 + elapsed / 60000);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnWord();
      this.spawnTimer = this.spawnRate;
    }

    // Draw words
    this.ctx.font = "20px 'Share Tech Mono'";
    for (let i = this.words.length - 1; i >= 0; i--) {
      let w = this.words[i];
      w.y += currentFallSpeed * w.speedMult * dt;

      if (w.y > this.height - 50) {
        // Impact
        audio.damage();
        this.createParticles(w.x, w.y, 20, '#f80');
        this.hull -= w.isRed ? 30 : 20;
        if (this.hull < 0) this.hull = 0;
        this.combo = 1;
        if (w === this.lockedWord) this.lockedWord = null;
        this.words.splice(i, 1);
        this.updateHUD();
        continue;
      }

      this.ctx.fillStyle = w.isRed ? '#f33' : '#3f3';
      
      // Draw typed part dim
      if (w.typed.length > 0) {
        this.ctx.globalAlpha = 0.4;
        this.ctx.fillText(w.typed, w.x, w.y);
        this.ctx.globalAlpha = 1.0;
        const offset = this.ctx.measureText(w.typed).width;
        this.ctx.fillText(w.text.substring(w.typed.length), w.x + offset, w.y);
      } else {
        this.ctx.fillText(w.text, w.x, w.y);
      }
    }

    // Bullets
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      let b = this.bullets[i];
      b.progress += 0.1 * dt;
      if (b.progress >= 1) {
        this.createParticles(b.tx, b.ty, 5, '#ffa');
        this.bullets.splice(i, 1);
        continue;
      }
      const bx = b.x + (b.tx - b.x) * b.progress;
      const by = b.y + (b.ty - b.y) * b.progress;
      this.ctx.beginPath();
      this.ctx.moveTo(bx, by);
      this.ctx.lineTo(bx + (b.tx - b.x) * 0.05, by + (b.ty - b.y) * 0.05);
      this.ctx.stroke();
    }

    // Tank
    this.ctx.fillStyle = '#1a801a';
    this.ctx.beginPath();
    this.ctx.arc(this.tankPos.x, this.tankPos.y, 30, Math.PI, 0);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#3f3';
    this.ctx.lineWidth = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(this.tankPos.x, this.tankPos.y);
    this.ctx.lineTo(this.tankPos.x + Math.cos(this.turretAngle)*40, this.tankPos.y + Math.sin(this.turretAngle)*40);
    this.ctx.stroke();

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.fillRect(p.x, p.y, 3, 3);
      this.ctx.globalAlpha = 1.0;
    }

    if (this.hull <= 0) {
      this.stop();
      this.onEnd({
        score: this.score,
        wpm: parseInt(document.getElementById('hud-wpm').innerText),
        acc: parseInt(document.getElementById('hud-acc').innerText),
        words: this.wordsDestroyed,
        combo: parseInt(document.getElementById('hud-combo').innerText),
        mode: this.mode
      });
      return;
    }

    requestAnimationFrame(this.loop.bind(this));
  }
}
