const args = require("minimist")(process.argv.slice(2)) //node script/dev.js reactivity -f global
const { build } = require("esbuild");
const { resolve } = require('path')
//minimist 用来解析命令行参数的

const target = args._[0] || 'reactivity';
const format = args.f || 'global'

//开发环境只打包某一个
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))

//iife 立即执行函数 (function() {})()
// cjs node中的模块 module.exports
// esm 浏览器中的esModule模块
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

//打包
build({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    sourcemap: true,   //所有的包全部打包到一起
    format: outputFormat,  //输出格式
    globalName: pkg.buildOptions?.name,  //打包全局名字
    platform: format === 'cjs' ? 'node' : 'browser',  //平台
    watch: {
        onRebuild(error) {
            if(!error) console.log('1111')
        }
    }
}).then(() => {
    console.log('watch---');
})