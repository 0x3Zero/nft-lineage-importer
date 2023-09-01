import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { NextFunction, Request, Response } from 'express';

let wss: WebSocketServer;
let wsClients: Set<WebSocket> = new Set();

function init() {
  wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', ws => {
    wsClients.add(ws);

    ws.on('close', () => {
      wsClients.delete(ws);
    });

    ws.send('WebSocket connection established!');
  });
}

function broadcast(_: Request, res: Response, next: NextFunction) {
  const { wsData: data } = res.locals;
  let clients = Array.from(wsClients);

  clients.forEach(c => {
    let stringified = JSON.stringify(data);
    if (c.readyState === WebSocket.OPEN) c.send(stringified);
  });

  next();
}

function upgrade(server: Server) {
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
      wss.emit('connection', socket, request);
    });
  });
}
export { init, upgrade, broadcast, wsClients };
