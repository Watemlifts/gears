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

// installs global cli tooling used to build and automate 
// this project. feel free to install these locally. 
const install_tools = async () => {
  await shell("npm install shx -g")
  await shell("npm install typescript -g")
  await shell("npm install typescript-bundle -g")
  await shell("npm install nodemon -g")
}

// cleans out project directories.
const clean = async() => {
  await shell("shx rm -rf ./node_modules")
  await shell("shx rm -rf ./program.js")
  await shell("shx rm -rf ./public/scripts/bootstrap")
  await shell("shx rm -rf ./public/scripts/program/program.js")
}

// bootstraps the project for initial use.
const build = async () => {
  await shell("npm install")

  // install website.
  await shell("npm install bootstrap")
  await shell("mkdir ./public/scripts/bootstrap")
  await shell("shx cp -rf ./node_modules/bootstrap/dist/css   ./public/scripts/bootstrap/css")
  await shell("shx cp -rf ./node_modules/bootstrap/dist/fonts ./public/scripts/bootstrap/fonts")
  await shell("shx cp -rf ./node_modules/bootstrap/dist/js    ./public/scripts/bootstrap/js")
  await shell("npm uninstall bootstrap")

  await shell("tsc-bundle ./program.ts ./program.js")
  await shell("tsc-bundle ./public/scripts/program/program.ts ./public/scripts/program/program.js --lib es2015,dom")
}

const watch = async () => {
  await build()
  await Promise.all([
    shell("tsc-bundle ./program.ts ./program.js --watch"),
    shell("tsc-bundle ./public/scripts/program/program.ts ./public/scripts/program/program.js --lib es2015,dom --watch"),
    shell("nodemon ./program.js")
  ])
}

//------------------------------------------------------
//  cli:
//------------------------------------------------------
cli(process.argv, {
  install_tools,
  clean,
  build,
  watch
}).catch(console.log)
