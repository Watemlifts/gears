export async function clean() {
  await shell('shx rm -rf ./bin/index.js')
  await shell('shx rm -rf ./bin/public/index.js')
  await shell('shx rm -rf ./node_modules')
}

export async function start() {
  // pre-build project
  await shell('npm install')
  await shell('tsc-bundle ./src/client/tsconfig.json')
  await shell('tsc-bundle ./src/server/tsconfig.json')

  // start watchers
  await Promise.all([
    shell('tsc-bundle ./src/client/tsconfig.json --watch'),
    shell('tsc-bundle ./src/server/tsconfig.json --watch'),
    shell('fsrun ./bin/index.js [node ./bin/index.js]'),
    shell('fsweb ./bin/public/')
  ])
}
