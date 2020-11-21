const _ = require('underscore')
const _l = require('lodash')
const _slugify = require('underscore.string/slugify')
const _s = require('underscore.string')

import {html,render} from 'lit-html'
import { ifDefined } from 'lit-html/directives/if-defined.js';

let menu = {} //< private state of menu; updated each time render is called.
let defaults 
let routes = []

//When a link is clicked lookup the matching route and render the menu it has registered: 
window.onhashchange = () => {
  if(window.location.hash.search('arcadeMenu') === -1 )  return 
  let path = _s.strRight(window.location.hash, 'arcadeMenu/')
  let matchingRoute = _.findWhere( routes, { path : path  })
  if(!matchingRoute) {
    //window.location.hash = '' //< doesn't work; need to actually modify the popstate or however that doesn't modify URL 
    return console.warn('no matching Arcade Menu for: ' + path)
  }
  if( matchingRoute.function)  return matchingRoute.function( menu )
  arcadeMenu( matchingRoute.menu )
}

//Rendering: 
const computeTemplate = menu => {

  let mergeCustomizer = (objValue, srcValue, key) => {
    //this let's us combine the 'classes' property which is a string: 
    if(key === 'classes') return `${objValue} ${srcValue}`
  }

  //Do a pass over the user supplied object to prepare into template-ready object: 
  menu = _.map( menu, stringOrObj => {
    let item
    if(_.isString(stringOrObj)) { 
      //convert single string param to fit our model if supplied as such:
      item = { name: stringOrObj }
    } else {
      item = stringOrObj
    }

    //An entry with defaults : true will be applied to all entries:
    if(item.default) defaults = item

    //if defaults supplied, merge over them: 
    if(defaults) item = _l.mergeWith( _.clone(defaults), item, mergeCustomizer )

    //if href is not provided, or not set as explicitly false, auto slug it: 
    if(_.isUndefined(item.href)) item.href = '#arcadeMenu/' + _slugify(item.name)
    //oterhwise if explicitly false, or item has disabled prop, we need to set it to undefined so it doesn't render in template (as per lit-html behavior)
    if(item.href === false || item.disabled ) item.href = undefined

    //an 'activated' property is an alternate version of the item, 
    //we use it instead of the parent obj if 'show' prop is active: 
    if(item.activated && item.activated.show) {
      //an additional prop on activated obj is 'merge' which indicates whether or not to merge with the original parent obj: 
      item = item.activated.merge ? item = _l.mergeWith( item, item.activated, mergeCustomizer ) : item.activated
    }

    if(item.selectable === false || item.disabled) item.classes = item.classes + ' disabled'
    //if no 'classes' prop, just add a blank one to save checking for this later: 
    if(!item.classes) item.classes = ''
    return item
  }) 
  return html`
    ${  menu.map( item => html`
      <a class="block cursor-default
                ${item.disabled ? 'text-opacity-25' : 'text-opacity-75 hover:text-opacity-100' }
                ${item.classes}
                ${item.selectable === false ? ' disabled' : ''}
                "
         style="${ item.style }"
         href="${ifDefined(item.href ? item.href : undefined )}"
      >
        ${item.name}
      </a>
    `)}
  `
}

const renderMenu = () => render( computeTemplate(menu) , document.getElementById('menu'))

const arcadeMenu = menuState => {
  menu = menuState
  renderMenu(menu) 
}

arcadeMenu.on = (path, newMenuStateOrFunction) => {
  let route = { path : path }
  if(_.isFunction(newMenuStateOrFunction)) {
    route.function = newMenuStateOrFunction
  } else {
    route.menu = newMenuStateOrFunction
  }
  routes.push(route)
}

module.exports = arcadeMenu