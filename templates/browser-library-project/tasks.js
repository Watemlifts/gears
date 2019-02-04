const TYPESCRIPT_SRC = 'tsc-bundle ./src/tsconfig.json'

export async function clean() {
  await shell('shx rm -rf ./dist/index.js')
  await shell('shx rm -rf ./node_modules')
}

export async function build() {
  await shell('npm install')
  await shell(`${TYPESCRIPT_SRC}`)
}

export async function start() {
  await shell('npm install')
  await shell(`${TYPESCRIPT_SRC}`)
  await Promise.all([
    shell(`${TYPESCRIPT_SRC} --watch > /dev/null`),
    shell('fsweb ./dist 5000')
  ])
}
