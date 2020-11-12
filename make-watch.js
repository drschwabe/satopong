const no = require('nodejs-html')

let html = `
<html>
<body>
  <script src="phaser.js"></script>
	<script src="client.bundle.js"></script>
</body>
</html>
`

no.makeIndex( null, html  ) 

no.watch()

no.server() 

no.static() 
