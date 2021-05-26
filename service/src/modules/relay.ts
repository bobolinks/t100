import { RpcModule, } from '../types/types';
import { server } from '../rpc';

export function loadModule() {
  return { name: 'relay' };
}

export default <RpcModule>{
  input(command: string, ...args: any[]): any {
    return server.request(command, args);
  },
};
