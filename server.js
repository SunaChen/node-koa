const Koa = require('koa')
const Router = require('koa-router')
const static=require('./routers/static');
const body = require('koa-better-body')
const path = require('path')
const session = require('koa-session')
const fs = require('fs')
const ejs = require('koa-ejs')


const config = require('./config')



let server = new Koa()
let router = new Router()
server.listen(config.PORT)
console.log(`server runing at ${config.PORT}`)

//渲染
ejs(server, {
    root: path.resolve(__dirname, 'template'),
    layout: false,
    viewExt: 'ejs',
    cache: false,
    debug: false
});



//中间件
server.use(body({
    uploadDir:config.UPLOAD_DIR
}))

//数据库
server.context.db = require('./libs/database')
server.context.config = require('./config')

server.keys = fs.readFileSync('./.key').toString().split('\n')

server.use(session({
    maxAge:456*1000,
    renew:true
},server))


//错误统一处理
/*
router.use(async (ctx,next )=> {
    try{
        await next()
    }catch (e) {
        ctx.state = 500
        ctx.body = '出错了！！'
        // ctx.throw(500,'出错了ε＝ε＝ε＝(#>д<)ﾉ')
    }
})*/


router.use('/admin',require('./routers/admin'))
router.use('/api',require('./routers/api'))
router.use('/',require('./routers/www'))

//缓存设置
static(router,{
    html:1
})

server.use(router.routes())