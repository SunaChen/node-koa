const Router = require('koa-router')
let router = new Router()

router.get('news',async ctx => {
    ctx.body = 'news'
})


module.exports = router.routes()