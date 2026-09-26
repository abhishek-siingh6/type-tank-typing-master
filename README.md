# TYPE//TANK

**TYPE//TANK** is a retro, zero-dependency, DOS-style arcade typing defense game built completely with Vanilla HTML, CSS, and JavaScript. 

Defend your command center from falling threat vectors by locking onto their coordinates and initiating a kinetic keystroke bombardment. 

## Features
- **Zero Dependencies**: Pure HTML5, Canvas 2D, and CSS (No React, Vue, or npm required).
- **Retro Aesthetic**: Authentic CRT monitor effects, scanlines, phosphor glow, and deep dark-green military terminal aesthetics.
- **Dynamic Viewport**: Supports classic 4:3 arcade monitor, 16:9 widescreen, or fluid auto-resizing.
- **Web Audio Synthesis**: Procedurally synthesized SFX using the Web Audio API—zero audio files required!
- **Persistent Flight Logs**: Tracks your personal bests, WPM, and accuracy locally in your browser.
- **4 Threat Modes**: Progress from simple lowercase letters (Mode 1) all the way to special characters and equations (Mode 4).

## How to Play
1. **Login**: Enter your operator callsign.
2. **Setup**: Select your display aspect ratio and difficulty mode from the arsenal config.
3. **Engage**: 
   - Words fall from the top of the screen.
   - Type the characters exactly as they appear to fire your turret.
   - The turret automatically locks onto the lowest matching word.
   - Destroy red bonus targets for 3.5x points!
   - If a word breaches your perimeter, your hull takes damage. Hit 0%, and the sortie ends.

## Installation / Setup
No build step is necessary. 
1. Clone this repository:
   ```bash
   git clone https://github.com/abhishek-siingh6/type-tank-typing-master.git
   ```
2. Open `index.html` in your favorite modern browser, or serve it locally (e.g., using `npx serve .` or Python's `http.server`).

## Controls
- **Keyboard**: Type words exactly as they appear.
- **Enter/Spacebar**: Advance screens or confirm.
- **Escape**: Abort mission.
- **R**: View records after a match.

## License
MIT License. Feel free to fork, modify, and distribute.
