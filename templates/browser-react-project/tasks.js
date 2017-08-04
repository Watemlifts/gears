//------------------------------------------------------
// task helper scripts
//------------------------------------------------------
const shell = (command) => new Promise((resolve, reject) => {
  const { spawn } = require('child_process')
  const windows = /^win/.test(process.platform)
  console.log(`\x1b[32m${command}\x1b[0m` )
  const ls      = spawn(windows ? 'cmd' : 'sh', [windows ? '/c' : '-c', command] )
  ls.stdout.pipe(process.stdout)
  ls.stderr.pipe(process.stderr)
  ls.on('close', (code) => resolve(code))
})
const watch = (directory, func) => new Promise((resolve, reject) => {
  const fs   = require("fs")
  const path = require("path")
  fs.watch(directory, func)
  const paths = fs.readdirSync(directory).map(n => path.join(directory, n))
  const stats = paths.map(n => ({path: n, stat: fs.statSync(n)}))
  const dirs  = stats.filter(stat => stat.stat.isDirectory())
  return Promise.all([dirs.map(dir => watch(dir.path, func))])
})
const cli = async (args, tasks) => {
  const task = (args.length === 3) ? args[2] : "none"
  const func = (tasks[task]) ? tasks[task] : () => {
    console.log("tasks:")
    Object.keys(tasks).forEach(task => console.log(` - ${task}`))
  }; await func()
}

//------------------------------------------------------
//  constants:
//------------------------------------------------------

const TYPESCRIPT = "tsc-bundle ./script/index.tsx ./target/index.js --allowJs --lib es2015,dom --jsx react --importAs react=React,react-dom=ReactDOM,react-router=ReactRouter,react-router-dom=ReactRouterDOM --removeComments"
const LESS       = "lessc ./styles/index.less ./target/index.css"

//------------------------------------------------------
//  tasks:
//------------------------------------------------------
const clean = async () => {
  await shell("shx rm -rf ./node_modules"),
  await shell("shx rm -rf ./target/index.js")
  await shell("shx rm -rf ./target/index.css")
}

const install = async () => {
  await shell("npm install typescript -g")
  await shell("npm install typescript-bundle -g")
  await shell("npm install less -g")
  await shell("npm install shx -g")
  await shell("npm install fsweb -g")
}

const build = async () => {
  await shell("npm install")
  await shell("shx mkdir -p ./target")
  await shell(`${TYPESCRIPT}`)
  await shell(`${LESS}`)
}

const run = async () => {
  await shell("npm install")
  await shell("shx mkdir -p ./target")
  await shell(`${TYPESCRIPT}`)
  await shell(`${LESS}`)
  await Promise.all([
    shell(`${TYPESCRIPT} --watch`),
    watch("./styles", () => shell(`${LESS}`)),
    shell("fsweb ./target 5000")
  ])
}

//------------------------------------------------------
//  cli:
//------------------------------------------------------
cli(process.argv, {
  install,
  clean,
  build,
  run,
}).catch(console.log)
