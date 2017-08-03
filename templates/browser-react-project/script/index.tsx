/*--------------------------------------------------------------------------

project-name

The MIT License (MIT)

Copyright (c) 2017 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

//------------------------------------------------------------------------------------
// reference react dependencies as part of the compilation.
//------------------------------------------------------------------------------------
/// <reference path="../node_modules/react/dist/react.min.js" />
/// <reference path="../node_modules/react-dom/dist/react-dom.min.js" />
/// <reference path="../node_modules/react-router/umd/react-router.min.js" />
/// <reference path="../node_modules/react-router-dom/umd/react-router-dom.min.js" />
//------------------------------------------------------------------------------------

import * as React                          from "react";
import * as ReactDOM                       from "react-dom"
import { HashRouter, Route, Switch, Link } from "react-router-dom"

export class HomePage extends React.Component {
  render() {
    return <p>home page</p>
  }
}

export class AboutPage extends React.Component {
  render() {
    return <p>about page</p>
  }
}

export class ContactPage extends React.Component {
  render() {
    return <p>contact page</p>
  }
}

export class Header extends React.Component {
  render() {
    return (
      <div className="header">
        <h1>gears</h1>
        <div className="nav">
          <ul>
            <li><Link to="/">home</Link></li>
            <li><Link to="/about">about</Link></li>
            <li><Link to="/contact">contact</Link></li>
          </ul>
        </div>
      </div>
    )
  }
}

export class Content extends React.Component {
  render() {
    return (<div className="content">
      <Switch>
        <Route exact path='/' component={HomePage} />
        <Route path='/about' component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
      </Switch>
      </div>)
  }
}

export class App extends React.Component {
  render() {
    return <div className="app">
      <Header />
      <Content />
    </div>
  }
}

ReactDOM.render((<HashRouter>
  <App />  
</HashRouter>), document.querySelector("body"))