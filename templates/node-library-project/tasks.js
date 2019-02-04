const TYPESCRIPT_SOURCE = 'tsc-bundle ./src/tsconfig.json'
const TYPESCRIPT_TEST   = 'tsc-bundle ./spec/tsconfig.json'

export async function clean() {
  await shell('shx rm -rf ./bin')
  await shell('shx rm -rf ./index.js')
  await shell('shx rm -rf ./spec.js')
  await shell('shx rm -rf ./package-lock.json')
  await shell('shx rm -rf ./node_modules')
}

export async function start() {
  await shell('npm install')
  await shell(`${TYPESCRIPT_SOURCE}`)
  await Promise.all([
    shell(`${TYPESCRIPT_SOURCE} --watch > /dev/null`),
    shell('fsrun ./index.js [node index.js]')
  ])
}

export async function spec() {
  await shell('npm install')
  await shell(`${TYPESCRIPT_TEST}`)
  await shell('mocha ./spec.js')
}

export async function build() {
  await shell('npm install')
  await shell(`${TYPESCRIPT_SOURCE}`)
  await shell(`shx rm   -rf ./bin`)
  await shell(`shx mkdir -p ./bin`)
  await shell(`shx cp ./index.js     ./bin/index.js`)
  await shell(`shx cp ./package.json ./bin/package.json`)
  await shell(`shx cp ./readme.md    ./bin/readme.md`)
  await shell(`shx cp ./license.md   ./bin/license.md`)
}
