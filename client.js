//### PONG - game client ### 

const $ = require('jquery')

let body = document.getElementsByTagName('body')[0]
body.setAttribute("style", "background-color: #282828; height: 100%;  display: grid;");

$('body').prepend(`
<div id="gameCanvas" 
     style="width: 360; height: 200; 
            border : solid 1px gray; margin: auto; 
            color: #fa0; font-size: 4em;">
  <p id="scoreOne" style="position:absolute; left: 10%;"></p>
  <p id="scoreTwo" style="position:absolute; right: 10%;"></p>
</div>`)

import levelScene from "./classes/levelScene.js";

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
  scene: levelScene
}

pong.phaser = new Phaser.Game(pong.phaserConfig)