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

// installs global tools used to build this project.
const install_tools = async () => {
  await shell("npm install shx -g")
  await shell("npm install typescript -g")
  await shell("npm install typescript-bundle -g")
  await shell("npm install fsrun -g")
  await shell("npm install fsweb -g")
}

// cleans out project directories.
const clean = async() => {
  await shell("cd ./server && npm run clean")
  await shell("cd ./client && npm run clean")
}

// builds this project
const build = async () => {
  await shell("cd ./server && npm install")
  await shell("cd ./client && npm install")
  await shell("cd ./server && npm run build")
  await shell("cd ./client && npm run build")
}
// starts the compilers for this project and watches
const watch = async () => {
  await build()
  await Promise.all([
    shell("cd ./server && npm run watch"),
    shell("cd ./server && npm run start"),
    shell("cd ./client && npm run watch"),
    shell("cd ./client && npm run start")
  ])
}
cli(process.argv, {
  install_tools,
  clean,
  build,
  watch
}).catch(console.log)
