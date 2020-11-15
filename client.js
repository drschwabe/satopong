//### PONG - game client ### 

//## CSS ### 
document.head.insertAdjacentHTML('beforeend', `
<style>
  @font-face {
    font-family: 'press_start_2pregular';
    src: url('assets/pressstart2p.woff2') format('woff2'); 
    font-weight: normal;
    font-style: normal;
  }
  .font-Press-Start-2 {
    font-family: 'press_start_2pregular', monospace
  }
</style>

<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">

`)

document.body.setAttribute("style", "background-color: #282828; height: 100%;  display: grid;")
document.body.innerHTML = `
<div class="flex font-Press-Start-2" style=" color: #fa0; font-size: 4em;">
  <div id="playerScore" style="margin:auto;"></div>
  <div id="gameCanvas" 
      style="width: 360; height: 200; 
             border: solid 1px gray; margin: auto;">
  </div>
  <div id="aiScore" style="margin:auto;"></div>
</div>
`

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
