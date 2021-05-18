import ws from 'ws';
import { MessageConnection, WebSocketMessageReader, WebSocketMessageWriter, createMessageConnection, ConsoleLogger } from 'vscode-ws-jsonrpc';
import { RpcModule, RpcSession } from './types/types';

let connection: MessageConnection = undefined;
export const session : RpcSession = {
  notify(name: string, ...args): void {
    if (!connection) {
      return;
    }
    connection.sendNotification(name, ...args);
  },
};

export const rpc = {
  // create the web socket
  wss: new ws.Server({
    noServer: true,
    perMessageDeflate: false,
  }),

  init(app, modules: Record<string, RpcModule>) {
    app.onUpgrade('/rpc/message',  (request, socket, head) => {
      if (connection) {
        return;
      }
      this.wss.handleUpgrade(request, socket, head, (webSocket) => {
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
          connection = undefined;
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
        connection = newConnection;
      });
    });
  },
};

export default rpc;
