/*--------------------------------------------------------------------------

micron server - simple http / web socket abstraction.

The MIT License (MIT)

Copyright (c) 2016 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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
import * as ws from "ws"

export type WebSocket = ws

export type RequestHandler = (request: http.ServerRequest, response: http.ServerResponse, sockets: Socket[]) => void
export type ConnectHandler = (socket: Socket, sockets: Socket[]) => void
export type MessageHandler = (message: ws.Data, socket: Socket, sockets: Socket[]) => void
export type DisconnectHandler = (socket: Socket, sockets: Socket[]) => void

export class Socket {

  private _state: { [key: string]: any } = {}

  constructor(private _socket: WebSocket) { }

  /**
   * sets the state associated with this socket.
   * @param {string} key the key to set.
   * @param {T} value the value to set.
   * @returns {void}
   */
  public set<T>(key: string, value: T): void {
    this._state[key] = value
  }

  /**
   * gets this state associated with this socket.
   * @param {string} key the key.
   * @returns {T}
   */
  public get<T>(key: string): T {
    return this._state[key] as T
  }

  /**
   * sends a message to this socket.
   * @param {ws.Data} data the data to send.
   * @returns {Promise<any>}
   */
  public send(data: ws.Data): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this._socket.send(data, error => {
        if (error) return reject(error)
        else resolve({})
      })
    })
  }
}

export class Server {
  private _request: RequestHandler = function () { }
  private _connect: ConnectHandler = function () { }
  private _message: MessageHandler = function () { }
  private _disconnect: DisconnectHandler = function () { }
  private _http: http.Server = undefined
  private _wss: ws.Server = undefined
  private _sockets: Socket[] = []

  /**
   * subscribes to standard http requests.
   * @param {RequestHandler} func the listening function.
   * @returns {void}
   */
  public request(func: RequestHandler) { this._request = func }

  /**
   * subscribes to web socket connect events.
   * @param {ConnectHandler} func the listening function.
   * @returns {void}
   */
  public connect(func: ConnectHandler) { this._connect = func }

  /**
   * subscribes to web socket message events.
   * @param {MessageHandler} func the listening function.
   * @returns {void}
   */
  public message(func: MessageHandler) { this._message = func }

  /**
   * subscribes to web socket disconnect events.
   * @param {DisconnectHandler} func the listening function.
   * @returns {void}
   */
  public disconnect(func: DisconnectHandler) { this._disconnect = func }

  /**
   * starts this server listening on the given port.
   * @param {number} port the port to start listening.
   * @returns {Promise<number>}
   */
  public listen(port: number): Promise<number> {
    return new Promise<any>((resolve, reject) => {
      this._http = http.createServer((request, response) => {
        this._request(request, response, this._sockets)
      })
      this._wss = new ws.Server({ server: this._http })
      this._wss.on("connection", inbound => {
        const socket = new Socket(inbound)
        this._sockets.push(socket)
        this._connect(socket, this._sockets)
        inbound.on("message", message => {
          this._message(message, socket, this._sockets)
        })
        inbound.on("close", () => {
          const index = this._sockets.indexOf(socket)
          this._sockets.splice(index, 1)
          this._disconnect(socket, this._sockets)
        })
      })
      this._http.listen(port, error => {
        if (error) reject(error)
        else resolve(port)
      })
    })
  }
}