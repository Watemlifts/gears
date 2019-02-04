const BUILD_SOURCE = 'tsc-bundle ./src/tsconfig.json'
const BUILD_SPEC   = 'tsc-bundle ./spec/tsconfig.json'

export async function clean() {
  await shell('shx rm -rf ./bin')
  await shell('shx rm -rf ./index.js')
  await shell('shx rm -rf ./spec.js')
  await shell('shx rm -rf ./node_modules')
}

export async function start() {
  await shell(`${BUILD_SOURCE}`)
  await Promise.all([
    shell(`${BUILD_SOURCE} --watch > /dev/null`),
    shell('fsrun ./index.js [node index.js]')
  ])
}

export async function spec() {
  await shell(`${BUILD_SPEC}`)
  await shell('mocha ./spec.js')
}

export async function build() {
  await shell(`${BUILD_SOURCE}`)
  await shell(`shx rm   -rf ./bin`)
  await shell(`shx mkdir -p ./bin`)
  await shell(`shx cp ./index.js     ./bin`)
  await shell(`shx cp ./package.json ./bin`)
  await shell(`shx cp ./readme.md    ./bin`)
  await shell(`shx cp ./license      ./bin`)
}
