const $ = require('jquery')
const _ = require('underscore')
const _l = require('lodash')
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
  .text-cyan { color: #b5eff1 }
</style>`)

document.body.setAttribute("style", "background-color: black;")

$('body').addClass('text-center pt-10 font-Press-Start-2').prepend('<div id="menu"></div>')

let startMenu = {
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

let connectMenu = {
  'COPY BEACON' : {
    classes : 'mt-20',
    activated : {
      show : true, 
      extend : true, 
      name : 'BEACON COPIED!',
      classes : 'text-cyan',
      selectable : false
    }
  },
  'PASTE BEACON' : {},
  '...connecting' : {},
  'back' : {
    classes: 'mt-10'
  }
}

let computeTemplate = menu => {

  let mergeCustomizer = (objValue, srcValue, key) => {
    if(key === 'classes') return `${objValue} ${srcValue}`
    return srcValue
  }

  //Convert the 'user friendly' supplied object into a mechanical template-ready object: 
  menu = _.map( menu, (val, key) => {
    let item = _.extend( { name : key }, val )
    if(!item.href) item.href = 'pong/menu/' + _slugify(item.name)
    if(item.activated && item.activated.show) {
      item = item.activated.extend ? item = _l.mergeWith( item, item.activated, mergeCustomizer ) : item.activated
    }
    if(!item.classes) item.classes = ''
    return item
  }) 
  return html`
    ${  repeat( menu, item => html`
      <a class="h1 block text-white
                ${item.disabled ? 'text-opacity-25' : 'text-opacity-75 hover:text-opacity-100' }
                ${item.classes}"
         style="margin: 2rem 0;"
        href="${item.href}"
      >
        ${item.name}
      </a>
    `)}
  `
}

render( computeTemplate(connectMenu) , document.getElementById('menu'))


