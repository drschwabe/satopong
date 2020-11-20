const $ = require('jquery')
const _ = require('underscore')
const _slugify = require('underscore.string/slugify')

import {html,render} from 'lit-html'
import {repeat} from 'lit-html/directives/repeat.js';

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

$('body').addClass('text-center pt-10 font-Press-Start-2').prepend('<div id="menu"></div>')

let menu = {
  'SATOPONG': {
    highlighted : true, 
    classes : 'text-5xl'
  },
  'PLAY' : {
    disabled : true,
    classes: 'text-3xl'
  },
  'CONNECT MONEYSOCKET' : {},
  'INSERT SATOSHIS' : { disabled: true },
  'EJECT SATOSHIS' : { disabled: true }
}


let computeTemplate = menu => {
  //Convert the 'user friendly' supplied object into a mechanical template-ready object: 
  menu = _.map( menu, (val, key) => {
    let item = _.extend( { name : key }, val )
    if(!item.href) item.href = 'pong/menu/' + _slugify(item.name)
    return item
  }) 
  return html`
    ${  repeat( menu, item => html`
      <a class="h1 py-2 block text-white
                ${item.disabled ? 'text-opacity-25' : 'text-opacity-75 hover:text-opacity-100' }
                ${item.classes ? item.classes : '' }"
        href="${item.href}"
      >
        ${item.name}
      </a>
    `)}
  `
}

render( computeTemplate(menu) , document.getElementById('menu'))

