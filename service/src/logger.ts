import { Logger } from './types/types';

export const logger = <Logger> {
  debug(message: any, ...args: any[]) {
    console.log(message, ...args);
  },
  info(message: any, ...args: any[]) {
    console.info(message, ...args);
  },
  warn(message: any, ...args: any[]) {
    console.warn(message, ...args);
  },
  error(message: any, ...args: any[]) {
    console.error(message, ...args);
  },
};

export default logger;
