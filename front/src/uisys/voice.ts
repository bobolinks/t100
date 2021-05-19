import * as SpeechCommands from './speech-commands/index';

export type FnOnVoice = (event: SpeechCommands.SpeechCommandRecognizerResult) => void;

export default {
  recognizer: null as any as SpeechCommands.SpeechCommandRecognizer,
  callback: null as any as FnOnVoice,

  async init(cb: FnOnVoice) {
    this.callback = cb;
    this.recognizer = SpeechCommands.create('BROWSER_FFT', '18w');
    await this.recognizer.ensureModelLoaded();
  },

  async start() {
    this.recognizer.listen(result => {
      this.callback(result);
      return null as any as Promise<void>;
    }, {
      includeSpectrogram: true,
      probabilityThreshold: 0.75
    });
  },

  async stop() {
    this.recognizer.stopListening();
  }
};
