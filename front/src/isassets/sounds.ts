export default {
  items: {} as Record<string, {
    repeat?: boolean;
    audio: HTMLAudioElement
  }>,
  play(name: string, repeat?: boolean) {
    let it = this.items[name];
    if (it) {
      return it;
    }
    it = { repeat, audio: new Audio(`assets/audio/${name}.mp3`) };
    this.items[name] = it;
    it.audio.addEventListener('ended', () => {
      if (it.repeat) {
        it.audio.play();
      } else {
        delete this.items[name];
      }
    });
    it.audio.addEventListener('error', () => {
      delete this.items[name];
    })
    it.audio.play();
  },
  stop(name: string) {
    let it = this.items[name];
    if (it) {
      it.audio.pause();
      delete this.items[name];
    }
  }
};
