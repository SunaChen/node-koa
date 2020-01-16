const Koa = require('koa')
const Router = require('koa-router')
const body = require('koa-better-body')
const path = require('path')
const session = require('koa-session')
const fs = require('fs')
const static = require('./routers/static')


let server = new Koa()
let router = new Router()
server.listen(8080)




//中间件
server.use(body({
    uploadDir:path.resolve(__dirname,'./static/upload')
}))


//数据库
server.context.db = require('./libs/database')

server.keys = fs.readFileSync('./.key').toString().split('\n')

server.use(session({
    maxAge:456*1000,
    renew:true
},server))

router.use('/admin',require('./routers/admin'))
router.use('/',require('./routers/www'))
router.use('/api',require('./routers/api'))

//缓存设置
static(router,{
    html:1
})
server.use(router.routes())