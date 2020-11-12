const no = require('nodejs-html')

no.makeIndex( null, no.html( null, null, 'client.bundle.js')  ) 

no.watch()