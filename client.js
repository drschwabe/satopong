//### PONG - game client ### 

//## CSS ### 
document.head.insertAdjacentHTML('beforeend', `
<style>
  ${require("tailwindcss/dist/tailwind.min.css")}
  @font-face {
    font-family: 'press_start_2pregular';
    src: url('assets/pressstart2p.woff2') format('woff2'); 
  }
  .font-Press-Start-2 {
    font-family: 'press_start_2pregular', monospace;
  }
  canvas { border: solid 1px gray; }
</style>`)

document.body.setAttribute("style", "background-color: #282828; height: 100%;  display: grid;")
document.body.innerHTML = `
<div class="flex font-Press-Start-2" style=" color: #fa0; font-size: 4em;">
  <div id="playerScore" class="text-center" style="margin:auto; width:20%"></div>
  <div id="gameCanvas" 
      style="width: 60%; height: 1; 
             margin: auto;">
  </div>
  <div id="aiScore" class="text-center" style="margin:auto; width:20%"></div>
</div>
`
let gameCanvasEl = document.getElementById('gameCanvas')
let width = parseInt(getComputedStyle(gameCanvasEl)['width'])
let height = parseInt(width * 0.555)
gameCanvasEl.style.height = height

//#### Phaser config ### 

global.pong = {
  width : 36,
  height : 20,
  ballVelocity : 15
}
pong.phaserConfig = {
  type: Phaser.AUTO,
  transparent: true,
  resolution: 1,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "gameCanvas",
    width: pong.width,
    height: pong.height,
    zoom: Phaser.Scale.MAX_ZOOM 
  },
  scene: require("./mods/level.js")
}

pong.Phaser = new Phaser.Game(pong.phaserConfig)
