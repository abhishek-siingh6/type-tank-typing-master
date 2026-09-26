const Storage = {
  getCallsign() { return localStorage.getItem('typetank_callsign'); },
  setCallsign(name) { localStorage.setItem('typetank_callsign', name); },
  
  getAspect() { return localStorage.getItem('typetank_aspect') || 'AUTO'; },
  setAspect(mode) { localStorage.setItem('typetank_aspect', mode); },

  getAudioMuted() { return localStorage.getItem('typetank_mute') === 'true'; },
  setAudioMuted(muted) { localStorage.setItem('typetank_mute', muted); },

  getCRT() { return localStorage.getItem('typetank_crt') !== 'false'; },
  setCRT(on) { localStorage.setItem('typetank_crt', on); },

  saveRecord(record) {
    const records = this.getRecords();
    records.push(record);
    localStorage.setItem('typetank_records', JSON.stringify(records));
  },
  
  getRecords() {
    return JSON.parse(localStorage.getItem('typetank_records') || '[]');
  },

  getPB(mode) {
    const records = this.getRecords().filter(r => r.mode == mode);
    if (!records.length) return null;
    return records.reduce((max, r) => r.score > max.score ? r : max);
  },

  purge() {
    localStorage.removeItem('typetank_records');
  }
};
