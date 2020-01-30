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
        ctx.redirect(`${HTTP_ROOT}/admin/`);
    }

})
//权限控制
router.all("*",async (ctx,next) => {
    let {HTTP_ROOT} =ctx.config
    if (ctx.session['admin']){
        await next()
    }else {

        ctx.redirect(`${HTTP_ROOT}/admin/login`);
    }
})

router.get('/',async ctx => {
    let {HTTP_ROOT} =ctx.config
    ctx.redirect(`${HTTP_ROOT}/admin/banner`)
})

const fields = [
    {title:'标题',name:'title',type:'text'},
    {title:'图片',name:'src',type:'file'},
    {title:'链接',name:'href',type:'text'},
    {title:'序号',name:'serial',type:'number'}
    ]

const table = 'banner_table'

//添加
router.get('/banner',async ctx => {
    let {HTTP_ROOT} =ctx.config
    let datas = await ctx.db.query(`SELECT * FROM ${table}`)
    await ctx.render('admin/table',{
        datas,
        fields,
        HTTP_ROOT,
        type:'view',
        //action:`${HTTP_ROOT}/admin/banner`,
    })
});


router.post('/banner',async ctx => { //上传图片
    let {HTTP_ROOT} = ctx.config

    let {title,src,href,serial} = ctx.request.fields

    src = path.basename(src[0].path)

    await ctx.db.query(`INSERT INTO ${table} (title,src,href,serial) VALUES(?,?,?,?)`,[
        title,src,href,serial
    ])

    ctx.redirect(`${HTTP_ROOT}/admin/banner`)

})

//删除
router.get('/banner/delete/:id', async ctx => {
    let {id} = ctx.params
    let {UPLOAD_DIR,HTTP_ROOT} = ctx.config

    let data = await ctx.db.query(`SELECT * FROM ${table} WHERE ID = ?`,[id]);


    ctx.assert(data.length,400,'no data')

/*    if (data.length = 0){
        ctx.body = '对不起，没有数据'
    }*/

    let row = data[0]
    await common.unlink(path.resolve(UPLOAD_DIR,row.src)) //删除本地文件
    await ctx.db.query(`DELETE FROM ${table} WHERE ID = ?`,[id]); //删除数据库中的文件

    ctx.redirect(`${HTTP_ROOT}/admin/banner`)
})


//修改
/*
router.get('/banner/modify/:id', async ctx => {
    let {id} = ctx.params
    const {HTTP_ROOT} = ctx.config;

    let data = await ctx.db.query(`SELECT * FROM ${table} WHERE ID = ?`,[id])
    ctx.assert(data.length,400,'no data')

    let row = data[0]

    await ctx.render('admin/table',{
        HTTP_ROOT,
        datas:[],
        type:'modify',
        old_data:row,
        fields,
        action:`${HTTP_ROOT}/banner/modify/${id}`
    })
})
*/

router.get('/banner/get/:id',async ctx => {
   const {id} = ctx.params

    let rows = await ctx.db.query(`SELECT * FROM ${table} WHERE ID = ?`,[id])
    if (rows.length == 0){
       ctx.body = {
           err:1,
           msg:'no this data'
       }
    }else {
       ctx.body = {
           err:0,
           msg:'success',
           data:rows[0]
       }
    }

})


router.post('/banner/modify/:id/', async ctx => {
    ctx.body = 'body'
})

module.exports = router.routes()