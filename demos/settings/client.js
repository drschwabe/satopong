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

  @font-face {
    font-family: 'NineteenNinetyThree';
    src: url('../../assets/NineteenNinetyThree-L1Ay.ttf') format('truetype'); 
  }
  .font-NineteenNinetyThree{
    font-family: 'NineteenNinetyThree', monospace; 
  }
  .text-cyan { color: #b5eff1 }
</style>`)

document.body.setAttribute("style", "background-color: black;")

$('body').addClass('text-center pt-10 font-Press-Start-2').prepend('<div id="menu"></div>')

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
    classes: 'text-3xl my-8'
  },
  {
    name: 'CONNECT MONEYSOCKET', 
    classes: 'my-5'
  },
  {
    name: 'INSERT SATOSHIS',
    disabled: true,
    classes: 'my-5'
  },
  {
    name: 'EJECT SATOSHIS',
    disabled: true,
    classes: 'my-5'
  }
]

let connectMenu = [
  {
    default : true, 
    classes : 'text-white my-5'
  },
  { 
    name: 'COPY BEACON',
    classes : 'mt-32',
    activated : {
      show : false, 
      extend : true, 
      name : 'BEACON COPIED!',
      classes : 'text-cyan',
      selectable : false
    }
  },
  {
    name : 'PASTE BEACON'
  },
  {
    name: '',
    disabled : true,
    activated : {
      name : 'connecting...'
    }
  },
  {
    name: 'back',
    classes: 'mt-20'
  }
]

let arcadeMenu = require('../../mods/arcadeMenu')

arcadeMenu( startMenu)
arcadeMenu.on('connect-moneysocket', connectMenu)
arcadeMenu.on('back', startMenu)

setTimeout(() => {
  //arcadeMenu( connectMenu )
}, 2000);