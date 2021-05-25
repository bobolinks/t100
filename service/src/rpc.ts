import ws from 'ws';
import { MessageConnection, WebSocketMessageReader, WebSocketMessageWriter, createMessageConnection, ConsoleLogger } from 'vscode-ws-jsonrpc';
import { RpcModule, RpcSession } from './types/types';

export const server: RpcSession = {
  connection: null as any as MessageConnection,
  notify(name: string, ...args): void {
    if (!this.connection) {
      return;
    }
    this.connection.sendNotification(name, ...args);
  },
  request(name: string, ...args): any {
    if (!this.connection) {
      return;
    }
    return this.connection.sendRequest(name, ...args);
  }
};

export const student: RpcSession = {
  connection: null as any as MessageConnection,
  notify(name: string, ...args): void {
    if (!this.connection) {
      return;
    }
    this.connection.sendNotification(name, ...args);
  },
  request(name: string, ...args): any {
    if (!this.connection) {
      return;
    }
    return this.connection.sendRequest(name, ...args);
  }
};

// create the web socket
const wss = new ws.Server({
  noServer: true,
  perMessageDeflate: false,
});

function handleIncoming(app, modules: Record<string, RpcModule>, url, session: RpcSession) {
  app.onUpgrade(url, (request, socket, head) => {
    if (session.connection) {
      return;
    }
    wss.handleUpgrade(request, socket, head, (webSocket) => {
      const socket = {
        send: (content) => webSocket.send(content, (error) => {
          if (error) {
            throw error;
          }
        }),
        onMessage: (cb) => webSocket.on('message', cb),
        onError: (cb) => webSocket.on('error', cb),
        onClose: (cb) => {
          webSocket.on('close', cb);
        },
        dispose: () => {
          webSocket.close();
        },
      };

      const reader = new WebSocketMessageReader(socket);
      const writer = new WebSocketMessageWriter(socket);

      const newConnection = createMessageConnection(reader, writer, new ConsoleLogger());
      webSocket.on('close', () => {
        session.connection = undefined;
      });
      newConnection.onRequest((method: string, ...params: any[]) => {
        const [, name, methodName] = /^([^.]+)\.(.+)$/.exec(method);
        const mo = modules[name];
        if (!mo) {
          throw `module ${name} not found`;
        }
        const me = mo[methodName];
        if (!me) {
          throw `method ${name}.${methodName} not found`;
        }
        return me.call(mo, ...params);
      });

      newConnection.listen();
      session.connection = newConnection;

      console.log(`connected to ${url}`);
    });
  });
}

export const rpc = {
  init(app, modules: Record<string, RpcModule>) {
    handleIncoming(app, modules, '/rpc/server', server);
    handleIncoming(app, modules, '/rpc/student', student);
  },
};

export default rpc;
