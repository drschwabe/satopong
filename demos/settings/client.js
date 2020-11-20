const $ = require('jquery')

import {html,render} from 'lit-html'

document.head.insertAdjacentHTML('beforeend', `
<style>
  ${require("../../node_modules/tailwindcss/dist/tailwind.min.css")}

  @font-face {
    font-family: 'press_start_2pregular';
    src: url('../../assets/pressstart2p.woff2') format('woff2'); 
  }
  .font-Press-Start-2 {
    font-family: 'press_start_2pregular', monospace;
  }
</style>`)

document.body.setAttribute("style", "background-color: black;")

$('body').addClass('text-center pt-10  font-Press-Start-2 text-white').prepend('<div id="menu"></div>')

let menu = [
  { name: 'SATOPONG',
    highlighted : true, 
    classes : 'text-5xl' 
  },
  { name: 'PLAY',
    disabled : true 
  },
  {
    name: "CONNECT-MONEYSOCKET"
  }
]

let menuTemplate = () => html`
  ${menu.map( item => html`
    <h1 class="py-5
               ${item.disabled ? 'opacity-20' : '' }
               ${item.classes ? item.classes : '' }">
      ${item.name}
    </h1>
  `)}
`

render( menuTemplate() , document.getElementById('menu'))

