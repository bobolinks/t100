import { App } from 'vue';
import { Router, } from "vue-router";
import { Store } from 'vuex';
import QRCode from 'qrcode';
import state from './store';
import rpcService, { rpc } from './rpc';

export default {
  beforeLaunch(app: App, store: Store<typeof state>, router: Router) {
    app.mixin({
      computed: {
        $app: () => this,
        $rpc: () => rpc,
      },
    });
    rpcService.init(`/rpc/${state.mode}`, () => {
      rpc.request('sys.env').then(e => {
        Object.assign(store.state.env, e);
        QRCode.toDataURL(e.net.address).then(e => {
          store.state.qrcode = e;
        });
      });
    });
  },
  onLaunched(app: App, store: Store<typeof state>, router: Router) {
  },
};
