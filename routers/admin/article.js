const Router = require('koa-router')
const path = require('path')
const common=require('../../libs/common');
const router = new Router


const table = 'article_table'
const fields=[
    {title: '标题', name: 'title', type: 'text'},
    {title: '类目', name: 'catalog_ID', type: 'select'/*, ?*/},
    {title: '时间', name: 'created_time', type: 'date'},
    {title: '作者', name: 'author', type: 'text'},
    {title: '浏览', name: 'view', type: 'number'},
    {title: '评论', name: 'comment', type: 'number'},
    {title: '摘要', name: 'summary', type: 'text'},
    {title: '列表图', name: 'list_img_src', type: 'file'},
    {title: 'banner图', name: 'banner_img_src', type: 'file'},
    {title: '内容', name: 'content', type: 'textarea'},
];
const page_type = 'article'
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

    let old_src = rows[0].src

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