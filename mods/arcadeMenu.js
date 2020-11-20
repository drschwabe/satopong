const _ = require('underscore')
const _l = require('lodash')
const _slugify = require('underscore.string/slugify')

import {html,render} from 'lit-html'
import {repeat} from 'lit-html/directives/repeat.js';

const computeTemplate = menu => {

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


module.exports = menu => render( computeTemplate(menu) , document.getElementById('menu'))