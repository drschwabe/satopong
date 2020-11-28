const $ = require('jquery')
const { html, render } = require('lit-html')

const { MoneysocketBeacon, ProviderStack, WebsocketLocation } = require('moneysocket')

//constants from moneysocket reference spec: 
const DEFAULT_HOST = "relay.socket.money"
const DEFAULT_PORT = 443
const DEFAULT_USE_TLS = true

const asyncJs = require('async') 
const Kjua = require('kjua')

//### UI state and template/rendering ####
$('body').html( '<div id="content" class="center"></div>')

const state = {
  connecting : true, 
  connected : false,
  beaconReceived : false
}

const template = () => html`
  
  ${ state.connecting ? 
    html`<p class="orange">connecting...</p>` : ''
  }

  ${ !state.connecting && state.connected ? 
    html`
      <p class="green bold">Seller moneysocket active!</p>
      <h3>beacon:</h3>
      <div id="beacon"></div>
    `
    : ''
  }

  ${ !state.connecting && state.error ? 
    html`<p class="red">${state.error}</p>` : ''
  }
`

const renderPage = () => render( template(), document.getElementById('content') ) 

renderPage()

//### Seller app functionality ### 
//establish moneysocket...
const providerStack = new ProviderStack

providerStack.onstackevent = (layer_name, nexus, status)  => {
  if(status === 'NEXUS_WAITING') {
    state.connecting = false
    state.connected = true
    delete state.error

    //now create a new beacon to share with the buyer... 
    let sellerBeaconForBuyer = generateNewBeacon() 
    
    let beaconStr = sellerBeaconForBuyer.toString()
    renderPage() 

    console.log( beaconStr )

    //convert to a QR code ... TODO
    let sellerBeaconForBuyerQr = qrCode( sellerBeaconForBuyer.toBech32Str())
  
    document.getElementById('beacon').appendChild(sellerBeaconForBuyerQr)

  }
  if(status === 'NEXUS_DESTROYED' || status === 'NEXUS_REVOKED') {
    state.connected = false
    state.beaconReceived = false
    state.error = 'connection lost'
    //show this err brierfly before starting the loop again:
    setTimeout( () => loopForBeacon, 2000)
  }

  renderPage() 

}


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