export default {
  paly(name: string) {
    (new Audio(`assets/audio/${name}.mp3`)).play();
  }
};
