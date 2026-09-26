const screens = {
  login: document.getElementById('screen-login'),
  settings: document.getElementById('screen-settings'),
  instructions: document.getElementById('screen-instructions'),
  game: document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
  records: document.getElementById('screen-records')
};

let currentScreen = 'login';
let selectedMode = 1;
let gameInstance = null;

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens[name].classList.remove('hidden');
  screens[name].classList.add('active');
  currentScreen = name;

  if (name !== 'login') {
    document.getElementById('main-header').classList.remove('hidden');
  } else {
    document.getElementById('main-header').classList.add('hidden');
  }

  if (name === 'login') {
    document.getElementById('input-callsign').focus();
  }
}

function updateHeader() {
  document.getElementById('hud-callsign').innerText = 'OP: ' + (Storage.getCallsign() || 'UNKNOWN');
  document.getElementById('btn-aspect').innerText = '[ASPECT: ' + Storage.getAspect() + ']';
  document.getElementById('btn-audio').innerText = '[AUDIO: ' + (Storage.getAudioMuted() ? 'OFF' : 'ON') + ']';
  document.getElementById('btn-crt').innerText = '[CRT: ' + (Storage.getCRT() ? 'ON' : 'OFF') + ']';
  
  const crt = document.getElementById('crt-overlay');
  if (Storage.getCRT()) crt.classList.remove('hidden');
  else crt.classList.add('hidden');

  const app = document.getElementById('app-container');
  app.className = '';
  if (Storage.getAspect() === 'AUTO') app.classList.add('aspect-auto');
  else if (Storage.getAspect() === '16:9') app.classList.add('aspect-16-9');
  else if (Storage.getAspect() === '4:3') app.classList.add('aspect-4-3');

  if (gameInstance) {
    const canvas = document.getElementById('game-canvas');
    const container = document.getElementById('canvas-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    gameInstance.resize(canvas.width, canvas.height);
  }
}

// Init
audio.muted = Storage.getAudioMuted();
if (Storage.getCallsign()) {
  document.getElementById('input-callsign').value = Storage.getCallsign();
}
updateHeader();

// Header Buttons
document.getElementById('btn-callsign').addEventListener('click', () => { audio.click(); showScreen('login'); });
document.getElementById('btn-aspect').addEventListener('click', () => {
  audio.click();
  const current = Storage.getAspect();
  const next = current === 'AUTO' ? '16:9' : (current === '16:9' ? '4:3' : 'AUTO');
  Storage.setAspect(next);
  updateHeader();
});
document.getElementById('btn-audio').addEventListener('click', () => {
  audio.click();
  const muted = !Storage.getAudioMuted();
  Storage.setAudioMuted(muted);
  audio.muted = muted;
  updateHeader();
});
document.getElementById('btn-crt').addEventListener('click', () => {
  audio.click();
  Storage.setCRT(!Storage.getCRT());
  updateHeader();
});

// Settings
document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedMode = parseInt(card.dataset.mode);
    audio.click();
    document.getElementById('mode-preview').innerText = WORD_LISTS[selectedMode].slice(0, 5).join(', ');
  });
});
document.querySelector('.mode-card[data-mode="1"]').classList.add('selected');

// Keyboard Routing
window.addEventListener('keydown', (e) => {
  if (currentScreen === 'login') {
    if (e.key === 'Enter') {
      const input = document.getElementById('input-callsign');
      const name = input.value.trim().toUpperCase() || 'ANON';
      Storage.setCallsign(name);
      audio.click();
      updateHeader();
      showScreen('settings');
    } else {
      document.getElementById('input-callsign').focus();
    }
  } else if (currentScreen === 'settings' && (e.key === 'Enter' || e.key === ' ')) {
    audio.click();
    showScreen('instructions');
  } else if (currentScreen === 'instructions' && (e.key === 'Enter' || e.key === ' ')) {
    audio.click();
    startGame();
  } else if (currentScreen === 'result') {
    if (e.key === 'Enter' || e.key === ' ') {
      audio.click();
      startGame();
    } else if (e.key.toLowerCase() === 'r') {
      audio.click();
      showRecords();
    } else if (e.key === 'Escape') {
      audio.click();
      showScreen('settings');
    }
  } else if (currentScreen === 'records' && e.key === 'Escape') {
    audio.click();
    showScreen('result');
  }
});

function startGame() {
  showScreen('game');
  const canvas = document.getElementById('game-canvas');
  const container = document.getElementById('canvas-container');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  
  if (gameInstance) gameInstance.stop();
  gameInstance = new Game(canvas, selectedMode, showResult);
  gameInstance.start();
}

function showResult(stats) {
  showScreen('result');
  
  document.getElementById('res-mode').innerText = stats.mode;
  document.getElementById('res-score').innerText = stats.score;
  document.getElementById('res-wpm').innerText = stats.wpm;
  document.getElementById('res-acc').innerText = stats.acc;
  document.getElementById('res-words').innerText = stats.words;
  document.getElementById('res-combo').innerText = stats.combo;

  stats.date = new Date().toISOString().split('T')[0];
  
  const pb = Storage.getPB(stats.mode);
  const banner = document.getElementById('new-record-banner');
  const compare = document.getElementById('pb-compare');
  
  if (!pb || stats.score > pb.score) {
    banner.classList.remove('hidden');
    compare.innerText = '';
    audio.fanfare();
  } else {
    banner.classList.add('hidden');
    compare.innerText = `PB: ${pb.score} (Need +${pb.score - stats.score + 1} to beat)`;
  }
  
  Storage.saveRecord(stats);
}

function showRecords() {
  showScreen('records');
  const records = Storage.getRecords();
  
  let overviewHTML = '';
  for(let i=1; i<=4; i++) {
    const pb = Storage.getPB(i);
    overviewHTML += `<div><h3>MODE ${i}</h3><p>PB: ${pb ? pb.score : 0}</p><p>WPM: ${pb ? pb.wpm : 0}</p></div>`;
  }
  document.getElementById('records-overview').innerHTML = overviewHTML;

  let tbody = '';
  records.reverse().forEach(r => {
    tbody += `<tr><td>${r.date}</td><td>MODE ${r.mode}</td><td>${r.score}</td><td>${r.wpm}</td><td>${r.acc}%</td></tr>`;
  });
  document.querySelector('#records-table tbody').innerHTML = tbody;
}

document.getElementById('btn-purge').addEventListener('click', () => {
  if(confirm("Purge all logs?")) {
    Storage.purge();
    showRecords();
  }
});
