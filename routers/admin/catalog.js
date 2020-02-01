const Router = require('koa-router')
const path = require('path')
const common=require('../../libs/common');
const router = new Router


const fields = [
    {title:'标题',name:'title',type:'text'},

]

const table = 'catalog_table'
const page_type = 'catalog'
const page_types = {
    'banner':'banner管理',
    'article':'文章管理',
    'catalog':'类目管理'
}

//添加
router.get('/',async ctx => {
    let {HTTP_ROOT} =ctx.config
    let datas = await ctx.db.query(`SELECT * FROM ${table}`)
    await ctx.render('admin/table',{
        datas,
        fields,
        HTTP_ROOT,
        page_type,
        page_types
    })
});


router.post('/',async ctx => { //上传图片
    let {HTTP_ROOT} = ctx.config

    //let {title,src,href,serial} = ctx.request.fields
    let keys = []
    let vals = []
    fields.forEach(field => {
        const {name,type} = field
        keys.push(name)

        if (type == 'file'){
            vals.push(path.basename(ctx.request.fields[name][0].path))
        } else {
            vals.push(ctx.request.fields[name])
        }

    })


    await ctx.db.query(`INSERT INTO ${table} (${keys.join(',')}) VALUES(${keys.map(key => '?').join(',')})`, vals);

    ctx.redirect(`${HTTP_ROOT}/admin/${page_type}`)

})

//删除
router.get('/delete/:id', async ctx => {
    let {id} = ctx.params
    let {UPLOAD_DIR,HTTP_ROOT} = ctx.config

    let data = await ctx.db.query(`SELECT * FROM ${table} WHERE ID = ?`,[id]);


    ctx.assert(data.length,400,'no data')

    /*    if (data.length = 0){
            ctx.body = '对不起，没有数据'
        }*/

    let row = data[0]
    fields.forEach(async({name,type}) => {
        if (type == 'file'){
            await common.unlink(path.resolve(UPLOAD_DIR,row.src)) //删除本地文件
        }
    })


    await ctx.db.query(`DELETE FROM ${table} WHERE ID = ?`,[id]); //删除数据库中的文件

    ctx.redirect(`${HTTP_ROOT}/admin/${page_type}`)
})

//修改
router.get('/get/:id',async ctx => {
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


router.post('/modify/:id/', async ctx => {
    let {UPLOAD_DIR,HTTP_ROOT} = ctx.config

    const post = ctx.request.fields
    const {id} = ctx.params

    //获取原来的
    let rows = await ctx.db.query(`SELECT * FROM ${table} WHERE ID = ?`,[id])
    ctx.assert(rows.length,400,'no this data')

    //let old_src = rows[0].src

    let keys = ['title']
    let vals = []

    keys.forEach(key => {
        vals.push(post[key])
    })
/*
    //单独处理文件
    let src_changed = false;
    if (post.src && post.src.length && post.src[0].size) {
        src_changed = true;
    }

    if (src_changed){
        keys.push('src');
        vals.push(path.basename(post.src[0].path))
    }

*/
    await ctx.db.query(`UPDATE ${table} SET ${
        keys.map(key=> (`${key} = ?`)).join(',')
        } WHERE ID = ?`,[...vals,id])
/*
    if (src_changed){
        await common.unlink(path.resolve(UPLOAD_DIR,old_src))

    }
    */

    ctx.redirect(`${HTTP_ROOT}/admin/${page_type}`)
})






module.exports = router.routes()