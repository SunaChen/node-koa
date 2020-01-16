const static = require('koa-static')

module.exports = function (router,options) {

    options = options || {}
    options.image = options.image || 30
    options.script = options.script || 1
    options.css = options.css || 30
    options.html = options.html || 30
    options.styles = options.styles || 7


    router.all(/((\.jpg)|(\.png)|(\.gif))$/i,static('./static',{
        maxage:options.image*8640*1000
    }))

    router.all(/((\.js)|(\.jsx))$/i,static('./static',{
        maxage:options.script*23089*1000
    }))

    router.all(/((\.html)|(\.xhtml)|(\.xml))$/i,static('./static',{
        maxage:options.html*2345*1000
    }))

    router.all('*',static('.static',{
        maxage:1*5345*1000
    }))
}