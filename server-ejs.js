const Koa = require('koa')
const Router = require('koa-router');
const path = require('path')
const ejs = require('koa-ejs')
let server = new Koa

server.listen(8080)

ejs(server,{
    root:path.resolve(__dirname,'template'), //渲染的根路径
    layout:false,
    viewExt:'ejs', //扩展名
    cache:false,//服务器是否缓存
    debug:true
})

server.use(async ctx => {
    await ctx.render('2',{  //渲染的文件，渲染的数据
        arr:[1,2,3,4,5]
    })
})


