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
    console.log("scripts:")
    Object.keys(tasks).forEach(task => console.log(` - ${task}`))
  }; await func()
}

//----------------------------------------------------------
// tasks
//----------------------------------------------------------
const install = async () => {
  await shell("npm install shx -g")
  await shell("npm install typescript -g")
  await shell("npm install typescript-bundle -g")
  await shell("npm install fsrun -g")
}
const clean = async() => {
  await shell("shx rm -rf ./node_modules")
  await shell("shx rm -rf ./index.js")
  await shell("shx rm -rf ./public/scripts/bootstrap")
  await shell("shx rm -rf ./public/scripts/app/index.js")
}
const build = async () => {
  await shell("npm install")

  // load install bootstrap
  await shell("npm install bootstrap")
  await shell("mkdir ./public/scripts/bootstrap")
  await shell("shx cp -rf ./node_modules/bootstrap/dist/css   ./public/scripts/bootstrap/css")
  await shell("shx cp -rf ./node_modules/bootstrap/dist/fonts ./public/scripts/bootstrap/fonts")
  await shell("shx cp -rf ./node_modules/bootstrap/dist/js    ./public/scripts/bootstrap/js")
  await shell("npm uninstall bootstrap")

  await shell("tsc-bundle ./index.ts ./index.js --removeComments")
  await shell("tsc-bundle ./public/scripts/app/index.ts ./public/scripts/app/index.js --removeComments --lib es2015,dom")
}

const run = async () => {
  await build()
  await Promise.all([
    shell("tsc-bundle ./index.ts ./index.js --removeComments --lib es2015,dom --watch"),
    shell("tsc-bundle ./public/scripts/app/index.ts ./public/scripts/app/index.js --removeComments --lib es2015,dom --watch"),
    shell("fsrun ./ [node index.js]")
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
