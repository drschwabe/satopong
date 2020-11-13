const $ = require('jquery')

$('head').append(`
<style>
  #scoreOne {
    position: absolute;
    left: 10%;
  }

  #scoreTwo {
    position: absolute;
    right: 10%;
  }

  body {
    margin: 0;
    background-color: #282828;
    font-size: 4em;
    color: #fa0;
    text-shadow: 0 0 4px #fa0;
    height: 100%;
    display: grid;
  }
</style>
`)

$('body').prepend(`
<div id="gameCanvas" style="width: 360; height: 200; border : solid 1px gray; margin: auto;">
  <p id="scoreOne"></p>
  <p id="scoreTwo"></p>
</div>
`)


import levelScene from "./levelScene.js";

const config = {
  type: Phaser.AUTO,
  transparent: true,
  resolution: 1,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      //debug: true,
      gravity: { x: 0, y: 0 }
    }
  },
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "gameCanvas", // See [HTML] and [CSS]
    width: 18,
    height: 10,
    zoom: Phaser.Scale.MAX_ZOOM // -1
  },
  scene: levelScene
}

const game = new Phaser.Game(config)