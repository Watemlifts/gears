const BUILD_SOURCE = 'tsc-bundle ./src/tsconfig.json'

export async function clean() {
  await shell('shx rm -rf ./dist/index.js')
  await shell('shx rm -rf ./node_modules')
}

export async function build() {
  await shell(`${BUILD_SOURCE}`)
}

export async function start() {
  await Promise.all([
    shell(`${BUILD_SOURCE} --watch > /dev/null`),
    shell('fsweb ./dist 5000')
  ])
}
