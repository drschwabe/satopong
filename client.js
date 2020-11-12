const $ = require('jquery')

$('head').append(`
<style>
  canvas {
    border: 0.5px solid;
    border-color: rgba(255, 255, 255, 0.87);
    border-radius: 1px;
  }

  #gameCanvas {
    margin: auto;
  }

  #scoreOne {
    position: absolute;
    left: 47%;
}

#scoreTwo {
    position: absolute;
    right: 47%;
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
    width: 18,
    height: 10,
    transparent: true,
    resolution: 2,
    physics: {
        default: "arcade",
        arcade: {
            //debug: true,
            gravity: { x: 0, y: 0 }
        }
    },
    scene: levelScene
};

const game = new Phaser.Game(config);
