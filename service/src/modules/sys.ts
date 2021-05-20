import { RpcModule, } from '../types/types';
import { env } from '../environment';

export function loadModule() {
  return { name: 'sys' };
}

export default <RpcModule>{
  env(): any {
    return env;
  },
};
