const $ = require('jquery')


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

let startMenu = [
  {
    name: 'SATOPONG',
    highlighted : true, 
    classes : 'text-5xl'
  },
  {
    name: 'PLAY', 
    disabled : true,
    classes: 'text-3xl'
  },
  'CONNECT MONEYSOCKET', 
  {
    name: 'INSERT SATOSHIS',
    disabled: true,
  },
  {
    name: 'EJECT SATOSHIS',
    disabled: true
  }
]

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

let arcadeMenu = require('../../mods/arcadeMenu')

arcadeMenu( startMenu )
arcadeMenu.on('connect-moneysocket', connectMenu)

setTimeout(() => {
  //arcadeMenu( connectMenu )
}, 2000);