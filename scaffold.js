/*--------------------------------------------------------------------------

scaffold - simple project scaffolding for node.

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

const fs            = require("fs")
const path          = require("path")
const BUFFER_LENGTH = 16384

/**
 * returns a list of installed template names.
 * @returns {string[]}
 */
const templates = () => fs.readdirSync(path.join(__dirname, "template")).filter(name => fs.statSync(path.join(__dirname, "template", name)).isDirectory())

/**
 * returns true if the current working directory is empty.
 * @returns {boolean}
 */
const isempty   = () => fs.readdirSync(process.cwd()).length === 0

/**
 * displays the cli help message.
 * @returns {void}
 */
const help      = () => {
  console.log(``)
  console.log(`usage: `)
  console.log(``)
  console.log(`  scaffold [template]`)
  console.log(``)
  console.log(`installed:`)
  console.log(``)
  console.log(`${templates().map(template => `- ${template}`).join("\n\n")}`)
  console.log('')
}

/**
 * builds a copy manifest from the given from and to directories.
 * @param {string} from the from directory. 
 * @param {string} to the to directory.
 * @returns {{type, from, to} []} the manifest.
 */
const manifest = (from, to) => fs.readdirSync(from).reduce((acc, name) => {
  const stat = fs.statSync(path.join(from, name))
  if(stat.isDirectory()) {
    acc.push({
      type: "directory",
      from: path.join(from, name),
      to  : path.join(to, name)
    })
    acc.push.apply(acc, manifest(
      path.join(from, name),
      path.join(to, name)
    ))
    return acc
  } else {
    acc.push({
      type: "file",
      from: path.join(from, name),
      to  : path.join(to, name)
    })
    return acc
  }
}, [])

/**
 * executes the copy operations from the given manifest.
 * @param {{type, from, to} []} manifest the manifest.
 * @returns {void} 
 */
const copy = (manifest) => {
  manifest.forEach(operation => {
    switch(operation.type) {
      case "directory":
        console.log(`copy: ${operation.to}`)
        fs.mkdirSync(operation.to)
        break;
      case "file":
        console.log(`copy: ${operation.to}`)
        const buffer = new Buffer(BUFFER_LENGTH)
        const fread  = fs.openSync(operation.from, 'r')
        const fwrite = fs.openSync(operation.to,   'w')
        let read = 1
        let pos  = 0
        while (read > 0) {
          read = fs.readSync(fread, buffer, 0, BUFFER_LENGTH, pos)
          fs.writeSync(fwrite, buffer, 0, read)
          pos += read
        }
        fs.closeSync(fread)
        fs.closeSync(fwrite)
        break;
    }
  })
}

//---------------------------------------------------
// runtime
//---------------------------------------------------
const template = process.argv.slice(2).shift()
const index    = templates().indexOf(template)
if(index === -1) return help()

if(!isempty()) {
  console.log("the current is not empty.")
  return
} else {
  const from = path.join(__dirname, "template", template)
  const to   = process.cwd()
  copy( manifest(from, to) )
  console.log("done")
}