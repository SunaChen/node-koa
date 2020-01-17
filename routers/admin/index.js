const Router = require('koa-router')
const fs = require('await-fs')
const path = require('path')
const common=require('../../libs/common');



let router = new Router()
router.get('/login',async (ctx,next) => {
  await ctx.render('admin/login',{
      HTTP_ROOT:ctx.config.HTTP_ROOT,
      errmsg:ctx.query.errmsg

  })

})

router.post('/login',async ctx => {
    let {HTTP_ROOT} =ctx.config
    let {username,password} = ctx.request.fields;

    let admins=JSON.parse((await fs.readFile(
        path.resolve(__dirname, '../../admin.json')
    )).toString());

    function findAdmin(username) {
        let a = null
        admins.forEach(admin => {
            if (admin.username == username){
                a = admin;
            }
        })
        return a
    }

    let admin = findAdmin(username)

    if (!admin) {
      //用户不存在
        ctx.redirect(`${HTTP_ROOT}/admin/login?errmsg=${encodeURIComponent('用户不存在')}`);
    }else if (admin.password != common.md5(+password+ctx.config.ADMIN_AFTERFIX)){
        ctx.redirect(`${HTTP_ROOT}/admin/login?errmsg=${encodeURIComponent('密码不对')}`);
    }else {
        ctx.session['admin'] = username  //设置session admin字段
        ctx.redirect(`${HTTP_ROOT}/admin`);
    }

})


//权限控制
router.all("*",async (ctx,next) => {
    let {HTTP_ROOT} =ctx.config
    if (!ctx.session['admin']){
        ctx.redirect(`${HTTP_ROOT}/admin/login`);
    }else {
        next()
    }
})

router.get('/banner',async ctx => {
    ctx.body = 'banner'
})

module.exports = router.routes()