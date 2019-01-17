//------------------------------------------------------
// task helper scripts:
//------------------------------------------------------
const shell = command =>
  new Promise((resolve, reject) => {
    const { spawn } = require('child_process')
    const windows = /^win/.test(process.platform)
    console.log(`\x1b[32m${command}\x1b[0m`)
    const ls = spawn(windows ? 'cmd' : 'sh', [windows ? '/c' : '-c', command])
    ls.stdout.pipe(process.stdout)
    ls.stderr.pipe(process.stderr)
    ls.on('close', code => resolve(code))
  })

const cli = async (args, tasks) => {
  const task = args.length === 3 ? args[2] : 'none'
  const func = tasks[task]
    ? tasks[task]
    : () => {
        console.log('tasks:')
        Object.keys(tasks).forEach(task => console.log(` - ${task}`))
      }
  await func()
}

//------------------------------------------------------
// tasks:
//------------------------------------------------------

async function clean() {
  await shell('shx rm -rf ./bin/index.js')
  await shell('shx rm -rf ./bin/public/index.js')
  await shell('shx rm -rf ./node_modules')
}

async function start() {
  // pre-build project
  await shell('npm install')
  await shell('tsc-bundle --project ./src/client/tsconfig.json')
  await shell('tsc-bundle --project ./src/server/tsconfig.json')

  // start watchers
  await Promise.all([
    shell('tsc-bundle --project ./src/client/tsconfig.json --watch'),
    shell('tsc-bundle --project ./src/server/tsconfig.json --watch'),
    shell('fsrun ./bin/index.js [node ./bin/index.js]'),
    shell('fsweb ./bin/public/')
  ])
}

//------------------------------------------------------
//  cli:
//------------------------------------------------------

cli(process.argv, {
  clean,
  start
}).catch(console.log)
