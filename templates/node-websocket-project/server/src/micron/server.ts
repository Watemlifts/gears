/*--------------------------------------------------------------------------

micron - http + websocket server.

The MIT License (MIT)

Copyright (c) 2018 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import * as http from "http"
import * as ws   from "ws"

import { Socket            } from "./socket"
import { ISerializer       } from "./serialize"
import { DefaultSerializer } from "./serialize"

export type WebSocket                   = ws
export type HttpRequestFunction         = (request: http.ServerRequest, response: http.ServerResponse, sockets: Socket[]) => void
export type WebSocketConnectFunction    = (socket: Socket, sockets: Socket[]) => void
export type WebSocketMessageHandler     = (message: any, socket: Socket, sockets: Socket[]) => void
export type WebSocketDisconnectHandler  = (socket: Socket, sockets: Socket[]) => void

export type ServerOptions = {
  serializer: ISerializer
}

export class Server {
  private _request   : HttpRequestFunction        = function () { }
  private _connect   : WebSocketConnectFunction   = function () { }
  private _message   : WebSocketMessageHandler    = function () { }
  private _disconnect: WebSocketDisconnectHandler = function () { }
  private _http      : http.Server                = undefined
  private _wss       : ws.Server                  = undefined
  private _serializer: ISerializer                = undefined
  private _sockets   : Socket[]                   = []

  /**
   * creates a new micron server.
   * @param _serializer the serializer to use (defaults to json)
   */
  constructor(options: ServerOptions = { serializer: new DefaultSerializer() }) {
    this._serializer = options.serializer
  }

  /**
   * returns the sockets connected to this server.
   * @return {Socket[]}
   */
  public sockets(): Socket [] { return this._sockets }

  /**
   * subscribes to standard http requests.
   * @param {HttpRequestFunction} func the listening function.
   * @returns {void}
   */
  public request(func: HttpRequestFunction) { this._request = func }

  /**
   * subscribes to web socket connect events.
   * @param {WebSocketConnectFunction} func the listening function.
   * @returns {void}
   */
  public connect(func: WebSocketConnectFunction) { this._connect = func }

  /**
   * subscribes to web socket message events.
   * @param {WebSocketMessageHandler} func the listening function.
   * @returns {void}
   */
  public message(func: WebSocketMessageHandler) { this._message = func }

  /**
   * subscribes to web socket disconnect events.
   * @param {WebSocketDisconnectHandler} func the listening function.
   * @returns {void}
   */
  public disconnect(func: WebSocketDisconnectHandler) { this._disconnect = func }

  /**
   * starts this server listening on the given port.
   * @param {number} port the port to start listening.
   * @returns {Promise<number>}
   */
  public listen(port: number): Promise<number> {
    return new Promise<any>((resolve, reject) => {
      this._http = http.createServer( this.handle_request.bind(this) )
      this._wss  = new ws.Server    ({ server: this._http })
      this._wss.on("connection", this.handle_connect.bind(this))
      this._http.listen(port, error => {
        if (error) reject(error)
        else resolve(port)
      })
    })
  }

  private handle_request(request: http.ServerRequest, response: http.ServerResponse): void {
    this._request(request, response, this._sockets)
  }

  private handle_connect (websocket: WebSocket, request: http.IncomingMessage): void {
    const socket = new Socket(websocket, this._serializer)
    this._connect(socket, this._sockets)
    websocket.on("message", data => this.handle_message(data, socket))
    websocket.on("close",   _    => this.handle_close(socket))
    websocket.on("error",   _    => {})
    this._sockets.push(socket)
  }
  
  private handle_message(data: ws.Data, socket: Socket): void {
    try {
      const message = this._serializer.deserialize(data)
      this._message(message, socket, this._sockets)
    } catch(e) {
      /* ignore */
    }
  }

  private handle_close(socket: Socket): void {
      const index = this._sockets.indexOf(socket)
      this._sockets.splice(index, 1)
      this._disconnect(socket, this._sockets)
  }
}