import { RpcModule, } from '../types/types';
import { server } from '../rpc';

export function loadModule() {
  return { name: 'relay' };
}

export default <RpcModule>{
  input(command: string): any {
    return server.request('input', command);
  },
};
