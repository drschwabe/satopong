const $ = require('jquery')

$('head').append(`
<style>

  #gameCanvas {
    margin: auto;
  }

  #scoreOne {
    position: absolute;
    left: 10%;
}

#scoreTwo {
    position: absolute;
    right: 10%;
}

* {
  margin: 0;
  padding: 0;
}	

body {
  margin: 0;
  background-color: #282828;
  font-size: 2em;
  color: #fa0;
  text-shadow: 0 0 4px #fa0;
  height: 100%;
  display: grid;
}

#title {
  font-size: 2vw;
  margin-top: 3%;
  margin-bottom: 3%;
  text-align: center;
}

a {
  font-size: 1vw;
  color: #fa0;
  text-decoration: none;
}

a:hover {
  color: #7f5500;
  text-shadow: 0 0 4px #7f5500;
}

p {
  display: block;
  font-family: gameFont;
  font-size: 1vw;
  margin: auto;

}

</style>
`)

$('body').prepend(`
<div id="gameCanvas">
  <p id="scoreOne"></p>
  <p id="scoreTwo"></p>
</div>
`)


import levelScene from "./levelScene.js";

const config = {
    type: Phaser.AUTO,
    parent: 'gameCanvas',
    transparent: true,
    resolution: 2,
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
      parent: "parent", // See [HTML] and [CSS]
      width: 18,
      height: 10,
      zoom: Phaser.Scale.MAX_ZOOM // -1
    },
    scene: levelScene
};

const game = new Phaser.Game(config);