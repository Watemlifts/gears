//------------------------------------------------------
// executes a shell command.
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

//------------------------------------------------------
// runs a small cli.
//------------------------------------------------------
const cli = async (args, tasks) => {
  const task = (args.length === 3) ? args[2] : "none"
  const func = (tasks[task]) ? tasks[task] : () => {
    console.log("scripts:")
    Object.keys(tasks).forEach(task => console.log(` - ${task}`))
  }; await func()
}

//------------------------------------------------------
//  tasks:
//------------------------------------------------------
const clean = () => shell("shx rm -rf ./bin")

const tools_install = async () => {
  await shell("npm install shx -g")
  await shell("npm install typescript -g")
  await shell("npm install typescript-bundle -g")
}

const src_build = async () => {
  await shell("shx mkdir -p ./bin")
  await shell("shx cp -rf ./license.md ./bin/license.md")
  await shell("shx cp -rf ./package.json ./bin/package.json")
  await shell("shx cp -rf ./readme.md ./bin/readme.md")
  await shell("cd ./bin && npm install")
  await shell("tsc-bundle ./src/index.ts ./bin/index.js")
}

const src_watch = async () => {
  await shell("shx mkdir -p ./bin")
  await shell("shx cp -rf ./license.md ./bin/license.md")
  await shell("shx cp -rf ./package.json ./bin/package.json")
  await shell("shx cp -rf ./readme.md ./bin/readme.md")
  await shell("cd ./bin && npm install")
  await shell("tsc-bundle ./src/index.ts ./bin/index.js --watch")
}

const test_build = async () => {
  await shell("shx mkdir -p ./bin")
  await shell("shx cp -rf ./license.md ./bin/license.md")
  await shell("shx cp -rf ./package.json ./bin/package.json")
  await shell("shx cp -rf ./readme.md ./bin/readme.md")
  await shell("cd ./bin && npm install")
  await shell("tsc-bundle ./test/index.ts ./bin/index.js")
}

const test_watch = async () => {
  await shell("shx mkdir -p ./bin")
  await shell("shx cp -rf ./license.md ./bin/license.md")
  await shell("shx cp -rf ./package.json ./bin/package.json")
  await shell("shx cp -rf ./readme.md ./bin/readme.md")
  await shell("cd ./bin && npm install")
  await shell("tsc-bundle ./test/index.ts ./bin/index.js --watch")
}

//------------------------------------------------------
//  cli:
//------------------------------------------------------
cli(process.argv, {
  "clean"        : clean,
  "tools:install": tools_install,
  "src:build"    : src_build,
  "src:watch"    : src_watch,
  "test:build"   : test_build,
  "test:watch"   : test_watch,
}).catch(error => {
  console.log(error)
})
