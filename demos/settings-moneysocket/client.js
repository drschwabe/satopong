//### Moneysocket raw demo ###
const { MoneysocketBeacon, ProviderStack, ConsumerStack, WebsocketLocation } = require('moneysocket')

//constants from moneysocket reference spec: 
const DEFAULT_HOST = "relay.socket.money"
const DEFAULT_PORT = 443
const DEFAULT_USE_TLS = true

//### other deps ### 
const $ = require('jquery')
const { html, render } = require('lit-html')
const asyncJs = require('async') 
const Kjua = require('kjua')
const _ = require('underscore')
const undercoin = require('undercoin')
const copy = require('clipboard-copy')

//### state  ####
global.state = {
  connecting : true, 
  connected : false,
  beaconReceived : false,
  buyerConnected : false
}

//### handle events ###

//establish moneysocket stacks for provider (us) and seller (user): 
const providerStack = new ProviderStack
const consumerStack = new ConsumerStack

providerStack.onstackevent = (layer_name, nexus, status)  => {
  console.log(status)
  if(status === 'NEXUS_WAITING') {
    if(state.connected) return 
    state.connecting = false
    state.connected = true
    delete state.error

    //now create a new beacon to share with the buyer... 
    let sellerBeaconForBuyer = generateNewBeacon() 
    
    let beaconStr = sellerBeaconForBuyer.toString()
    state.beaconStr = beaconStr

    let sellerBeaconForBuyerQr = qrCode( sellerBeaconForBuyer.toBech32Str())
  
    $('#beacon').html(sellerBeaconForBuyerQr)

    connectMenu[1].invisible = false 
    connectMenu[2].activated.show = true  

    arcadeMenu(connectMenu) 
    
    console.log('beacon for buyer generated & rendered')

    setTimeout( () => {
      //now connect to the same beacon we just created, but with the consumer stack....
      consumerStack.doConnect(  sellerBeaconForBuyer  )
      
    }, 2000)

  }
  if(status === 'NEXUS_DESTROYED' || status === 'NEXUS_REVOKED') {
    state.connected = false
    state.beaconReceived = false
    state.error = 'connection to seller lost'
    //show this err brierfly before starting the loop again:
    setTimeout( () => loopForBeacon, 2000)
  }
  
  console.log('renderPage ' + status)
  //renderPage() 

}

//### Buyer connection functionality ### 
consumerStack.onstackevent = (layer_name, nexus, status)  => {
  console.log(status)
  if(status === 'NEXUS_CREATED') {
    if( _.isBoolean(nexus.handshake_finished) && !nexus.handshake_finished) {
      //if the nexus obj has a property '.handshake_finished' regardless of it is false, it means the buyer has at least a connection (but no downstream connection; ie- they have not yet connected their wallet)
      state.buyerConnectedButNoSats = true 
      console.log('buyerConnectedButNoSats')
    }
  } else if(status === 'NEXUS_REVOKED' && state.buyerConnectedButNoSats) {
    delete state.buyerConnectedButNoSats
    state.error = 'connection to buyer lost'
    console.log('connection to buyer lost')
  } else if(status === 'NEXUS_REVOKED' && state.buyerConnected) {
    state.buyerConnected = false
    delete state.buyerAvailableSats
    state.error = 'connection to buyer lost (was connected OK)'
    console.log('connection to buyer lost (was connected OK)')
  }
  console.log('renderPage... NEXUS_CREATED')
  //renderPage()
}

consumerStack.onproviderinfo = info => {
  console.log(info)
  //we connected!  
  delete state.buyerConnectedButNoSats 
  state.buyerConnected = true 
  state.buyerAvailableSats = undercoin.msat2sat( info.wad.msats )
  //renderPage() 
}

// consumerStack.onping = msecs => {
//   console.log(msecs)
// }

//### functions ###

const generateNewBeacon = () => {
  let location = new WebsocketLocation(DEFAULT_HOST, DEFAULT_PORT,DEFAULT_USE_TLS)
  let beacon = new MoneysocketBeacon()
  beacon.addLocation(location)
  return beacon
}

const qrCode = bech32str => {
  let b32 = bech32str.toUpperCase()
  return Kjua({
    ecLevel: "M",
    render:  "canvas",
    size:    120,
    text:    b32,
    quiet:   0,
  })
}

//connect to 'on-demand cloud lightning moneysocket-enabled node' :
const getBeacon = cb => {
  state.connecting = true
  //renderPage() 
  $.get('/moneysocketserver/beacon', body => {
    console.log('get beacon')

    if(!body || !body.beacon) {
      state.error = 'no beacon :/'
      state.connecting = false 
      //renderPage()
      if(cb) return cb() 
      return  
    } 

    if(state.beaconReceived) {
      if(cb) return cb 
      return
    } 

    state.beaconReceived = true 

    let serverBeacon = new MoneysocketBeacon.fromBech32Str(body.beacon)[0]

    providerStack.doConnect( serverBeacon )

    if(cb) return cb() 
  })
}

//### initate the moneysocket stage ### 
loopForBeacon = () => 
  asyncJs.until(
    cb => cb(null, state.beaconReceived), 
    cb => 
      getBeacon( () => 
        setTimeout(() => 
          cb(null, state.beaconReceived)
        , 3000)
      )
  ) 
//(by calling this function; that will happen after user navigates into settings mneu)



//### Settings Menu ###


document.head.insertAdjacentHTML('beforeend', `
<style>
  ${require("../../node_modules/tailwindcss/dist/tailwind.min.css")}
  

  @font-face {
    font-family: 'press_start_2pregular';
    src: url('/assets/pressstart2p.woff2') format('woff2'); 
  }
  .font-Press-Start-2 {
    font-family: 'press_start_2pregular', monospace;
  }

  @font-face {
    font-family: 'NineteenNinetyThree';
    src: url('/assets/NineteenNinetyThree-L1Ay.ttf') format('truetype'); 
  }
  .font-NineteenNinetyThree{
    font-family: 'NineteenNinetyThree', monospace; 
  }
  .text-cyan { color: #b5eff1 }
</style>`)

document.body.setAttribute("style", "background-color: black;")

$('body').addClass('text-center pt-10 font-Press-Start-2').prepend('<div id="menu"></div>')

let startMenu = [
  {
    default : true, 
    classes : 'text-white'
  },
  {
    name: 'SATOPONG',
    highlighted : true, 
    disabled : true, 
    classes : 'text-5xl',
    style : 'color:white;'
  },
  {
    name: 'サトポング',
    classes: 'font-NineteenNinetyThree text-3xl -mt-2',
    disabled: true,
    style : 'color:white;'
  },
  {
    name: 'PLAY', 
    disabled : true,
    classes: 'text-3xl my-8'
  },
  {
    name: 'CONNECT MONEYSOCKET', 
    classes: 'my-5'
  },
  {
    name: 'INSERT SATOSHIS',
    disabled: true,
    classes: 'my-5'
  },
  {
    name: 'EJECT SATOSHIS',
    disabled: true,
    classes: 'my-5'
  }
]

let connectMenu = [
  {
    default : true, 
    classes : 'text-white my-5'
  },
  { 
    name: 'COPY BEACON',
    classes : 'mt-10',
    invisible: true, 
    activated : {
      show : false, 
      merge : true, 
      name : 'BEACON COPIED!',
      classes : 'text-cyan',
      selectable : false
    }
  },
  {
    name: 'connecting seller...',
    classes: 'text-yellow-400',
    selectable : false, 
    activated : {
      merge : true, 
      name : 'awaiting buyer...',
      classes: 'text-indigo-400',

    }
  },
  {
    name: 'back',
    classes: 'mt-20'
  }
]

let arcadeMenu = require('../../mods/arcadeMenu')

arcadeMenu( startMenu )

arcadeMenu.on('connect-moneysocket', connectMenu)
arcadeMenu.on('connect-moneysocket', () => {
  console.log('loop for beacon!')
  //### make a spot for beacon ####
  $('body').prepend(`
    <div id="beacon" class="mx-auto bg-white" style="width:120px; height:120px;">
      <img src="/assets/hourglass.gif" />
    </div>
  `)
  loopForBeacon() 
})

arcadeMenu.on('back', startMenu)
arcadeMenu.on('back', () => {
  $('#beacon').remove() 
})

arcadeMenu.on('copy-beacon', () => {
  console.log('copy the beacon!!!')
  connectMenu[1].activated.show = true 
  arcadeMenu(connectMenu)
  copy(state.beaconStr )
  console.log(state.beaconStr )
})

//reset hash URL on load: 
document.location.hash = ''