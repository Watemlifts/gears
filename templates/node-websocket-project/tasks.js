//----------------------------------------------------------
// task automation script
//----------------------------------------------------------

const shell = (command) => new Promise((resolve, reject) => {
  const { spawn } = require('child_process')
  const windows = /^win/.test(process.platform)
  console.log(`\x1b[32m${command}\x1b[0m` )
  const ls      = spawn(windows ? 'cmd' : 'sh', [windows ? '/c' : '-c', command] )
  ls.stdout.pipe(process.stdout)
  ls.stderr.pipe(process.stderr)
  ls.on('close', (code) => resolve(code))
})
const cli = async (args, tasks) => {
  const task = (args.length === 3) ? args[2] : "none"
  const func = (tasks[task]) ? tasks[task] : () => {
    console.log("tasks:")
    Object.keys(tasks).forEach(task => console.log(` - ${task}`))
  }; await func()
}

//------------------------------------------------------
//  tasks:
//------------------------------------------------------
const install = async () => {
  await shell("npm install shx -g")
  await shell("npm install typescript -g")
  await shell("npm install typescript-bundle -g")
  await shell("npm install fsrun -g")
  await shell("npm install fsweb -g")
}

const clean = async() => {
  // client
  await shell("shx rm -rf ./client/target/index.js")
  await shell("shx rm -rf ./client/node_modules")
  // server
  await shell("shx rm -rf ./server/target/")
  await shell("shx rm -rf ./server/node_modules")
}

const build = async () => {
  // client
  await shell("cd ./client && npm install")
  await shell("cd ./client && tsc-bundle ./src/index.ts ./target/index.js --lib es2015,dom")
  // server
  await shell("cd ./server && npm install")
  await shell("cd ./server && tsc-bundle ./src/index.ts ./target/index.js --lib es2015,dom")
}

const run = async () => {
  await build()
  await Promise.all([
    // client
    shell("cd ./client && tsc-bundle ./src/index.ts ./target/index.js --lib es2015,dom --watch"),
    shell("cd ./client && fsweb ./target 5000 > /dev/null"),
    // server
    shell("cd ./server && tsc-bundle ./src/index.ts ./target/index.js --lib es2015,dom --watch"),
    shell("cd ./server && fsrun ./target/index.js [node ./target/index.js]"),
    shell("fsrun server/target/index.js [shx touch client/target/index.js]")
  ])
}
//------------------------------------------------------
//  cli:
//------------------------------------------------------
cli(process.argv, {
  install,
  clean,
  build,
  run
}).catch(console.log)
