import pkg from '../../package.json'

export default defineNitroPlugin(() => {
  console.log(`[cubestats] v${pkg.version} starting (node ${process.version})`)
})
