import { App } from 'vue';
import { Router, } from "vue-router";
import { Store } from 'vuex';
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
    rpcService.init('/rpc/message', ()=> {
      rpc.request('album.profile').then(e => {
        console.log(e);
      });
    });
  },
  onLaunched(app: App, store: Store<typeof state>, router: Router) {
  },
};
