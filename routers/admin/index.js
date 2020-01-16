const Router = require('koa-router')

let router = new Router()

router.get('/login',async ctx => {
    ctx.body = 'admin'
})


module.exports = router.routes()