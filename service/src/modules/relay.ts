import { RpcModule, } from '../types/types';
import { student, server } from '../rpc';

export function loadModule() {
  return { name: 'relay' };
}

export default <RpcModule>{
  input(command: string, ...args: any[]): any {
    return server.request(command, args);
  },
  notify(command: string, ...args: any[]): any {
    return student.request(command, args);
  },
};
