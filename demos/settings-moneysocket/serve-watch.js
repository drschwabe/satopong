const no = require('nodejs-html')
const config = require('config')
const { spawn } = require('child_process')
const _s = require('underscore.string')
const path = require('path')

//Start an expess server: 
let expressApp = no.index(no.html( no.css, null, 'client.bundle.js' ), 8224) 
no.static() 
no.static('/assets', path.resolve('../../assets') )

//#### Seller lightning node + moneysocket plugin #### 
//must be running bitcoind, c-lightning + moneysocket plugin(s) 

//then use moneysocket terminus-cli to create an account with funds, 
//and then create a beacon ie: ./terminus-cli listen account-0

//and then on the following route the terminus-cli will be called to get that beacon... 

expressApp.get('/moneysocketserver/beacon', async (req, res) => {
  console.log("get beacon from server's terminus...")
  //use the terminus CLI to get a beacon...
  
  const getInfo = spawn(
     './terminus-cli', ['getinfo'] , { cwd : config.get('moneysocket_python_dir')  })

  //collect output: 
  let output = []
  getInfo.stdout.on('data', data => output.push(data))

  //handle err: 
  getInfo.stderr.on('data', data => console.warn(`${data}`))
  
  //wait a second for output to collect 
  await new Promise(r => setTimeout(r, 1000))

  //parse for the beacon: 
  let beacon = _s(output.toString()).strRightBack('incoming beacon: ').replace('\n',"").value()

  //did we get one? 
  if(!beacon.length || beacon.search('moneysocket') < 0) {
    //if no oputput data and send null to client: 
    console.warn(output.toString)
    return res.send(null)
  }

  //if yes, send to client: 
  console.log( 'beacon received!' ) 
  res.send({ beacon : beacon })
})


//if 'watch' provided as terminal argument, watch: 
//ie: node serve-watch.js watch
if(process.argv[2] === 'watch') {
  console.log('compiling...')
  no.watch() 
}


