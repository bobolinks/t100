import { MessageConnection } from "vscode-ws-jsonrpc";

export interface Environment {
  /** in debug mode */
  debug: boolean,
  /** vide version */
  version: string,
  /** platform name */
  platform: 'windows' | 'darwin' | 'linux' | string,
  /** network info */
  net: {
    address: string;
  },
  /** relative paths */
  paths: {
    /** where the server app is located after 'npm install -g mind-test' */
    bin: string,
    /** here we use this folder to store album */
    doc: string,
  },
  /** args passed from cmd line */
  args: Record<string, number | boolean | string>,
  /** running mode */
  cmd: string,
};

export interface Profile {
  printer: {
    address: string;
    user: string;
  };
  camera: {
    device: string;
  },
}

export interface RpcModule {
  [key: string]: any,
}

/** rpc session */
export interface RpcSession {
  /** connection */
  connection: MessageConnection;
  /** send notification to browser */
  notify(name: string, ...args: any[]): void;
  /** send request to browser */
  request(name: string, ...args): any;
}

export interface Logger {
  debug(...rest: any[]): void,
  info(...rest: any[]): void,
  warn(...rest: any[]): void,
  error(...rest: any[]): void,
  fatal(...rest: any[]): void,
  /** get current log file path */
  currentFile(): string,
}
