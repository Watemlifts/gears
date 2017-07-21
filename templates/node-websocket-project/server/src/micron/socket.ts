/*--------------------------------------------------------------------------

micron - http + websocket server.

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
import * as ws   from "ws"

import {ISerializer} from "./serialize"

export type WebSocket = ws

export class Socket {

  private _state: { [key: string]: any } = {}

  constructor(private _socket: WebSocket, private _serializer: ISerializer) { }

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
   * sends data to the socket.
   * @param {any} data the data to send.
   * @returns {Promise<any>}
   */
  public send(data: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let message = null
      try {
        message = this._serializer.serialize(data)
      } catch(e) {
        reject(e)
        return
      }
      this._socket.send(message, error => {
        if (error) return reject(error)
        else resolve({})
      })
    })
  }
  
  /**
   * drops this socket.
   * @returns {Promise<any>}
   */
  public drop(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this._socket.close()
    })
  }
}