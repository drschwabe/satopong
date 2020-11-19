const no = require('nodejs-html')

let html = `
<html>
<body>
  <script src="phaser.js"></script>
  <script src="client.bundle.js"></script>
</body>
</html>`

no.server() 
no.index(html) 
no.watch(null, '/public/client.bundle.js')
no.static('/', __dirname + '/public')