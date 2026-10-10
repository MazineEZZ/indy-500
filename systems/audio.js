class AudioSystem {
  constructor() {
    this.sounds = [];

    this.adjustVolume();
  }
  add(src) {
    const soundDir = "assets/sounds/";
    const audio = new Audio(soundDir + src);

    this.sounds.push(audio);

    return audio;
  }
  adjustVolume(volume = 0.5) {
    this.sounds.forEach((sounds) => (sounds.volume = volume));
  }
  pauseSounds() {
    this.sounds.forEach((sound) => sound.pause());
  }
}

export { AudioSystem };
