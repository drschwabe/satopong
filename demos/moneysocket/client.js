const $ = require('jquery')
const { html, render } = require('lit-html')

const { MoneysocketBeacon, ProviderStack, ConsumerStack, WebsocketLocation } = require('moneysocket')

//constants from moneysocket reference spec: 
const DEFAULT_HOST = "relay.socket.money"
const DEFAULT_PORT = 443
const DEFAULT_USE_TLS = true

const asyncJs = require('async') 
const Kjua = require('kjua')
const _ = require('underscore')
const undercoin = require('undercoin')

//### UI state and template/rendering ####
$('body').html( '<div id="content" class="center"></div>')

const state = {
  connecting : true, 
  connected : false,
  beaconReceived : false,
  buyerConnected : false
}

const template = () => html`
  
  ${ state.connecting ? 
    html`<p class="orange">connecting...</p>` : ''
  }

  ${ !state.connecting && state.connected && !state.buyerConnected ? 
    html`
      <p class="green bold">Seller moneysocket active!</p>
      <h3>beacon:</h3>
      <div id="beacon"></div>
      <p class="break-word">${state.beaconStr}</p>
    ` : ''
  }

  ${ !state.connecting && state.error ? 
    html`<p class="red">${state.error}</p>` : ''
  }

  ${ state.buyerConnected ? 
    html`<p class="green bold">Buyer connected!</p>
    <p>Available satoshis: ${state.buyerAvailableSats} </p>`
   : ''
  }

  ${ state.buyerConnectedButNoSats ? 
    html`<p class="orange">AWAITING BUYER'S DOWNSTREAM CONNECTION</p>`
   : ''
  }
`

const renderPage = () => render( template(), document.getElementById('content') ) 

renderPage()

//### Seller app functionality ### 
//establish moneysocket...
const providerStack = new ProviderStack
const consumerStack = new ConsumerStack

providerStack.onstackevent = (layer_name, nexus, status)  => {
  console.log(status)
  if(status === 'NEXUS_WAITING') {
    state.connecting = false
    state.connected = true
    delete state.error

    //now create a new beacon to share with the buyer... 
    let sellerBeaconForBuyer = generateNewBeacon() 
    
    let beaconStr = sellerBeaconForBuyer.toString()
    state.beaconStr = beaconStr

    renderPage() 

    //convert to a QR code ... TODO
    let sellerBeaconForBuyerQr = qrCode( sellerBeaconForBuyer.toBech32Str())
  
    document.getElementById('beacon').appendChild(sellerBeaconForBuyerQr)

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

  renderPage() 

}

consumerStack.onstackevent = (layer_name, nexus, status)  => {
  console.log(status)
  if(status === 'NEXUS_CREATED') {
    if( _.isBoolean(nexus.handshake_finished) && !nexus.handshake_finished) {
      //if the nexus obj has a property '.handshake_finished' regardless of it is false, it means the buyer has at least a connection (but no downstream connection; ie- they have not yet connected their wallet)
      state.buyerConnectedButNoSats = true 
    }
  } else if(status === 'NEXUS_REVOKED' && state.buyerConnectedButNoSats) {
    delete state.buyerConnectedButNoSats
    state.error = 'connection to buyer lost'
  } else if(status === 'NEXUS_REVOKED' && state.buyerConnected) {
    state.buyerConnected = false
    delete state.buyerAvailableSats
    state.error = 'connection to buyer lost (was connected OK)'
  } 
  renderPage()
}

consumerStack.onproviderinfo = info => {
  console.log(info)
  //we connected!  
  delete state.buyerConnectedButNoSats 
  state.buyerConnected = true 
  state.buyerAvailableSats = undercoin.msat2sat( info.wad.msats )
  renderPage() 
}

// consumerStack.onping = msecs => {
//   console.log(msecs)
// }

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
  renderPage() 
  $.get('/moneysocketserver/beacon', body => {
    console.log('get beacon')

    if(!body || !body.beacon) {
      state.error = 'no beacon :/'
      state.connecting = false 
      renderPage()
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

loopForBeacon()