const Queue = require('bull')

const printQueue = new Queue('printQueue', {})

module.exports = printQueue