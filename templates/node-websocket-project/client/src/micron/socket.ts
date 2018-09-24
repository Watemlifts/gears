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

import {ISerializer}       from "./serialize"
import {DefaultSerializer} from "./serialize"

export type WebSocketConnectFunction    = ()           => void
export type WebSocketMessageFunction    = (data : any) => void
export type WebSocketErrorFunction      = (error: any) => void
export type WebSocketDisconnectFunction = ()           => void
export type QueuedMessage = {
  data   : any
  resolve: Function
  reject : Function
}

export interface SocketOptions {
  endpoint    : string
  serializer? : ISerializer
}
export class Socket {
  private _connect    : WebSocketConnectFunction    = function() {}
  private _message    : WebSocketMessageFunction    = function() {}
  private _error      : WebSocketErrorFunction      = function() {}
  private _disconnect : WebSocketDisconnectFunction = function() {}
  private _connected  : boolean                     = false
  private _queue      : QueuedMessage[]             = []
  private _socket     : WebSocket                   = undefined
  private _serializer : ISerializer                 = undefined

  /**
   * creates a new web socket connection
   * @param {SocketOptions} options the web socket options.
   * @returns {Socket} 
   */
  constructor(options: SocketOptions) {
    options.serializer     = options.serializer || new DefaultSerializer()
    this._serializer       = options.serializer
    this._socket           = new WebSocket(options.endpoint)
    this._socket.onopen    = ()      => this.handle_connect   ()
    this._socket.onmessage = (data)  => this.handle_message   (data)
    this._socket.onerror   = (error) => this.handle_error     (error)
    this._socket.onclose   = ()      => this.handle_disconnect()
  }
  
  /**
   * subscribes to the socket connect event.
   * @param {WebSocketConnectFunction} func the listener function.
   * @returns {void}
   */
  public connect    (func: WebSocketConnectFunction):    void { this._connect    = func }
  
  /**
   * subscribes to the socket message event.
   * @param {WebSocketMessageFunction} func the listener function.
   * @returns {void}
   */
  public message    (func: WebSocketMessageFunction):    void { this._message    = func }
  
  /**
   * subscribes to the socket error event.
   * @param {WebSocketErrorFunction} func the listener function.
   * @returns {void}
   */
  public error    (func: WebSocketErrorFunction):    void { this._error    = func }
  
  /**
   * subscribes to the socket disconnect event.
   * @param {WebSocketDisconnectFunction} func the listener function.
   * @returns {void}
   */
  public disconnect (func: WebSocketDisconnectFunction): void { this._disconnect = func }

  /**
   * sends a message to the server.
   * @param {any} data the data to send.
   * @returns {Promise<any>}
   */
  public send       (data: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if(this._connected){
        try {
          this.send_internal(data)
          resolve({})
        } catch(e) {
          reject(e)
        }
      } else {
        this._queue.push({
          data   : data,
          resolve: resolve,
          reject : reject
        })
      }
    })
  }

  /**
   * internally sends the message.
   * @param {any} data the data to send.
   * @returns {void}
   */
  private send_internal(data: any): void {
    const message = this._serializer.serialize(data)
    this._socket.send(message)
  }

  /**
   * handles the connect event.
   * @returns {void}
   */
  private handle_connect(): void {
    this._connect()
    this._connected = true
    while(this._queue.length > 0) {
      const item = this._queue.shift()
      try {
        this.send_internal(item.data)
        item.resolve({})
      } catch(e) {
        item.reject(e)
      }
    }
  }

  /**
   * handles incoming messages
   * @param {any} data the data being received.
   * @returns {void}
   */
  private handle_message(data: any): void {
    try {
      const message = this._serializer.deserialize(data.data)
      this._message(message)
    } catch(e) {
      this.handle_error(e)
    }
  }

  /**
   * handles error events on this socket.
   * @param {any} error the error.
   * @returns {void}
   */
  private handle_error(error: any): void {
    this._error(error)
  }

  /**
   * handles the socket disconnect event.
   * @returns {void}
   */
  private handle_disconnect(): void { 
    this._disconnect()
  }
}

