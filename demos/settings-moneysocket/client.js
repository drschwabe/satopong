//### Moneysocket + (arcade) Settings demo ###
const { MoneysocketBeacon, ConsumerStack, WebsocketLocation } = require('moneysocket')

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

//establish moneysocket stacks to connect to terminus (our lightning node) and consumer (their wallet app): 
const consumerStackTerminus = new ConsumerStack
const consumerStackBuyer =  new ConsumerStack

consumerStackTerminus.onstackevent = (layer_name, nexus, status)  => {
  console.log(status)
  if(status === 'NEXUS_WAITING') {
    if(state.connected) return 
    state.connecting = false //< upon re-render this tells template to show the beacon instead of loading spinner
    state.connected = true
    delete state.error

    //now create a new beacon to share with the buyer... 
    state.sellerBeaconForBuyer = generateNewBeacon() 
    
    let beaconStr = state.sellerBeaconForBuyer.toString()
    state.beaconStr = beaconStr
    state.beaconImg = qrCode( state.sellerBeaconForBuyer.toBech32Str())
  
    connectMenu[2].invisible = false 
    connectMenu[3].activated.show = true  

    arcadeMenu(connectMenu) 
    
    console.log('beacon for buyer generated & rendered')

    setTimeout( () => {
      //now connect to the same beacon we just created, but with the consumer stack....
      consumerStackBuyer.doConnect(  state.sellerBeaconForBuyer  )
      
    }, 2000)

  }
  if(status === 'NEXUS_DESTROYED' || status === 'NEXUS_REVOKED') {
    if(state.connecting) return 
    //^ prevent running this more than once 
    state.connected = false
    state.beaconReceived = false
    delete state.beaconImg
    state.error = 'connection to seller lost'
    state.previouslyConnected = true 
    connectMenu[2].invisible = true 
    connectMenu[2].activated.show = false 
    connectMenu[3].activated.show = false  

    //make sure both stacks disconnect so we they will restart cleanly: 
    consumerStackTerminus.doDisconnect() 
    consumerStackBuyer.doDisconnect() 
    
    //show this err brierfly before starting the loop again:
    arcadeMenu(disconnectedMenu)
    setTimeout(() => {
      arcadeMenu(connectMenu) 
      loopForBeacon()
    }, 2000)
  }
}

//### Buyer connection functionality ### 
consumerStackBuyer.onstackevent = (layer_name, nexus, status)  => {
  console.log(status)
  if(status === 'NEXUS_CREATED') {
    if( _.isBoolean(nexus.handshake_finished) && !nexus.handshake_finished) {
      //if the nexus obj has a property '.handshake_finished' regardless of it is false, it means the buyer has at least a connection (but no downstream connection; ie- they have not yet connected their wallet)
      state.buyerConnectedButNoSats = true 
      console.log('buyerConnectedButNoSats')
      startMenu[4].activated.show = true
      arcadeMenu(connectMenuConnected)
    }
  } else if(status === 'NEXUS_REVOKED' && layer_name !== 'OUTGOING_WEBSOCKET') {
    //^ checking layer name prevents the following status logic from running twice (since the same status gets broadcast but from OUTGOING_WEBSOCKET and OUTGOING_RENDEZVOUS)
    if(state.connecting) return  //< prevent running more than once
    console.log('connection to buyer lost')
    state.error = 'connection to buyer lost'
    delete state.buyerConnectedButNoSats
    delete state.buyerAvailableSats
    connectMenu[2].activated.show = false 
    startMenu[4].activated.show = false 
    if(state.buyerConnected) {
      state.buyerConnected = false
      state.error = 'connection to buyer lost (was connected OK)'
    }
    arcadeMenu(disconnectedMenu)

    //make sure both stacks disconnect so we they will restart cleanly: 
    consumerStackTerminus.doDisconnect() 
    consumerStackBuyer.doDisconnect() 

    setTimeout(() => {
      window.location.hash = '' //< so the 'route' gets triggered again when 'copy beacon' is clicked; TODO - consider listening for link clicks instead of hash changes to remedy this dillemma ^ 
      arcadeMenu.fire('connect-moneysocket')
    }, 2000)
  }
}

consumerStackBuyer.onproviderinfo = info => {
  console.log(info)
  //we connected!  
  delete state.buyerConnectedButNoSats 
  state.buyerAvailableSats = undercoin.msat2sat( info.wad.msats )
  state.credits = 0
  if(!state.buyerConnected) { 
    //state.buyerConnected is falsy until this function is called initially...
    state.buyerConnected = true
    arcadeMenu(connectMenuConnectedSatoshis)

    //update the main menu state for when we go back to it: 
    //startMenu[3].activated.show = true
    startMenu[4].activated.show = true
    startMenu[5].activated.show = true
    return
  } //^^ so we return by rendering the appropriate screen... 
  //otherwise we re-render the existing screen (if said screen is one of these below):  
  if(window.location.hash === '#arcadeMenu/back') return arcadeMenu()
  if(window.location.hash === '#arcadeMenu/copy-beacon') return arcadeMenu()
  if(window.location.hash === '#arcadeMenu/connect-moneysocket') return arcadeMenu()  
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
  $.get('/moneysocketserver/beacon', body => {
    console.log('get beacon')

    if(!body || !body.beacon) {
      state.error = 'no beacon :/'
      state.connecting = false 
      if(cb) return cb() 
      return  
    } 

    if(state.beaconReceived) {
      if(cb) return cb 
      return
    } 

    state.beaconReceived = true 

    state.serverBeacon = new MoneysocketBeacon.fromBech32Str(body.beacon)[0]

    consumerStackTerminus.doConnect( state.serverBeacon )

    if(cb) return cb() 
  })
}

//### initate the moneysocket stage ### 
loopForBeacon = () => {
  if(state.looping) return  
  state.looping = true 
  asyncJs.until(
    cb => cb(null, state.beaconReceived), 
    cb => 
      getBeacon( () => 
        setTimeout(() => 
          cb(null, state.beaconReceived)
        , 3000)
      ),
    () => state.looping = false 
  )
}

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


let moneyGreen = '#6df458dc'


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
    classes: 'text-3xl my-8',
    activated : {
      classes: 'text-yellow-400',
      merge : true,
      disabled : false,
      hover : 'hv-yellow'
    }
  },
  {
    name: 'CONNECT MONEYSOCKET', 
    classes: 'my-5',
    activated : {
      name : 'MONEYSOCKET CONNECTED',
      style : `color: ${moneyGreen}`, 
      merge : true,
      hover : 'hv-blue-i'
    }
  },
  {
    name: 'INSERT SATOSHI',
    disabled: () => state.buyerAvailableSats,
    classes: 'my-5',
    activated : { 
      merge : true,
      hover : 'hv-yellow',
      href : '#arcadeMenu/insert-satoshi'
    }
  },
  {
    name: 'EJECT SATOSHIS',
    disabled: () => state.credits,
    classes: 'my-5',
  },
  {
    name: 'SATOSHIS: 0',
    disabled : true, 
    classes : 'mt-12',
    hide : () => state.buyerAvailableSats
  },
  {
    name : {
      function: () => html`SATOSHIS: <span style="color:${moneyGreen}">${ state.buyerAvailableSats }</span>`
    },
    classes : 'float-left mt-12 pl-10',
    invisible : () => !state.buyerAvailableSats,
    selectable : false
  }, 
  {
    name : {
      function: () => html`CREDITS: <span class="text-yellow-400">${ state.credits }</span>`
    },
    classes : 'float-right mt-12 pr-10',
    invisible : () => !state.buyerAvailableSats,
    selectable : false
  }
]

let connectMenu = [
  {
    default : true, 
    classes : 'text-white my-5'
  },
  {
    name: { 
      function : () => html`<div id="beacon" class="mx-auto bg-white" style="width:120px; height:120px;">
       ${state.connecting || !state.beaconImg ? html`<img src="/assets/hourglass.gif" />` 
        : state.beaconImg }
      </div>`
    }
  }, 
  { 
    name: 'COPY BEACON',
    classes : 'mt-10 text-blue-200',
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
    name: {
      function: () => html`connecting seller...
      ${state.previouslyConnected ? html`<br><br><span style="color:#f1c0bd;">(lost previous connection)</span>` : ''}`
    },
    classes: 'text-yellow-400',
    selectable : false, 
    activated : {
      merge : true, 
      style : 'color: #fffbc5ff;',
      name : html`awaiting buyer...<br>
      <br><span class="muted">(connect a wallet by pasting beacon)</span>`
    }
  },
  {
    name: 'back',
    classes: 'mt-20'
  }
]

let connectMenuConnected = [
  { 
    name: html`awaiting buyer...<br>
    <br><span class="muted">(connect downstream <br>satoshi source)</span>`,
    classes: 'mt-10',
    style : 'color: #fffbc5ff;',
    selectable : false
  },
  {
    name: 'MONEYSOCKET CONNECTED',
    classes: 'my-10',
    style : `color: ${moneyGreen}`, 
    selectable : false
  },
  {
    name: 'DISCONNECT',
    classes : 'mt-1 text-silver'
  },
  {
    name: 'back',
    classes: 'mt-20'
  }
]

let connectMenuConnectedSatoshis = _.clone(connectMenuConnected) 

connectMenuConnectedSatoshis[0] = {
  name : 'AVAILABLE SATOSHIS', 
  classes : 'my-10',
  selectable : false
}

connectMenuConnectedSatoshis.splice(1, 0, {
  name : {
    function: () => html`${ state.buyerAvailableSats }`
  },
  selectable : false,
  classes : 'text-white text-4xl'
})

let disconnectedMenu = [
  { 
    name: {
      function: () => html`${state.error}<br>
      <br><span class="muted">re-attempting...</span>`,
    },
    classes: 'mt-10',
    style : 'color: red;',
    selectable : false
  }
]

let arcadeMenu = require('../../mods/arcadeMenu')

arcadeMenu( startMenu )

arcadeMenu.on('insert-satoshi', () => {
  console.log('insert satoshi')
})

arcadeMenu.on('connect-moneysocket', connectMenu)
arcadeMenu.on('connect-moneysocket', () => {
  if(!state.connected) {
    console.log('loop for beacon (if not already looping)!')
    return loopForBeacon() 
  } else if(state.buyerConnectedButNoSats) {
    return arcadeMenu(connectMenuConnected)
    
  } else if(state.buyerAvailableSats ) {
    return arcadeMenu(connectMenuConnectedSatoshis)
  }
  //else nothing to do
})

arcadeMenu.on('back', startMenu)
arcadeMenu.on('back', () => {
  connectMenu[2].activated.show = false 
})

arcadeMenu.on('copy-beacon', () => {
  console.log('copy the beacon!!!')
  connectMenu[2].activated.show = true 
  arcadeMenu(connectMenu)
  copy(state.beaconStr )
  console.log(state.beaconStr )
})

arcadeMenu.on('disconnect', () => {
  console.log('disconnect from buyer')
  startMenu[4].activated.show = false //< disable the 'MONEYSOCKET CONNECTED' in main menu.
  
  state.beaconReceived = false
  delete state.beaconImg 
  connectMenu[2].activated.show = false 
  //disconnect terminus as well since otherwise for some reason we cannot reconnect to buyer: 
  consumerStackTerminus.doDisconnect() 
  consumerStackBuyer.doDisconnect() 
})

//reset hash URL on load: 
document.location.hash = ''