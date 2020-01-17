const crypto = require('crypto')

let obj = crypto.createHash('md5')
obj.update('12345')
console.log(obj.digest('hex'))