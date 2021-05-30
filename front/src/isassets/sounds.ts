export default {
  items: {} as Record<string, HTMLAudioElement>,
  play(name: string) {
    let it = this.items[name];
    if (it) {
      return it;
    }
    it = new Audio(`assets/audio/${name}.mp3`);
    this.items[name] = it;
    it.addEventListener('ended', () => {
      delete this.items[name];
    });
    it.addEventListener('error', () => {
      delete this.items[name];
    })
    it.play();
  },
  stop(name: string) {
    let it = this.items[name];
    if (it) {
      it.pause();
      delete this.items[name];
    }
  }
};
