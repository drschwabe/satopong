const $ = require('jquery')
const { html, render } = require('lit-html')
const { MoneysocketBeacon, ProviderStack } = require('moneysocket')

//### UI state and template/rendering ####
$('body').html( '<div id="content" class="center"></div>')

const state = {
  connecting : true, 
  connected : false
}

const template = () => html`
  
  ${ state.connecting && !state.error ? 
    html`<p class="orange">connecting...</p>` : ''
  }

  ${ !state.connecting && state.connected ? 
    html`
      <p class="green bold">Seller moneysocket active!</p>
      <p>${state.beaconStr}</p>
    `
    : ''
  }

  ${ state.error ? 
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

    //share beacon with buyer: 
    state.beaconStr = new MoneysocketBeacon().toString()
    
    renderPage() 
    
    //convert to a QR code ... TODO
  }
}

//connect to 'on-demand cloud lightning moneysocket-enabled node' :
$.get('/moneysocketserver/beacon', body => {
  if(!body || !body.beacon) {
    state.error = 'no beacon :/'
    return renderPage() 
  } 

  let serverBeacon = new MoneysocketBeacon.fromBech32Str(body.beacon)[0]

  providerStack.doConnect( serverBeacon )
})