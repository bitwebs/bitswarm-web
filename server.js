
const BitswarmProxyWSServer = require('@web4/bitswarm-proxy-ws/server')
const { SignalServer } = require('@web4/discovery-swarm-webrtc/server')
const websocket = require('websocket-stream')

const url = require('url')

class BitswarmServer extends BitswarmProxyWSServer {
  listenOnServer (server) {
    this.server = server

    const proxyWss = this.websocketServer = websocket.createServer({ noServer: true }, (socket) => {
      this.handleStream(socket)
    })

    const signalServer = new SignalServer({ noServer: true })
    const signalWss = signalServer.ws

    server.on('upgrade', function upgrade(request, socket, head) {
      const pathname = url.parse(request.url).pathname;

      if (pathname === '/signal') {
        signalWss.handleUpgrade(request, socket, head, (ws) => signalWss.emit('connection', ws, request));
        return
      }

      // proxy
      proxyWss.handleUpgrade(request, socket, head, (ws) => proxyWss.emit('connection', ws, request));
    });
  }
}

module.exports = BitswarmServer
