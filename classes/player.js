// ### player ###
let scene
let player = {}
player.init = (levelScene, x, y) => {
  scene = levelScene
  // Add sprite
  player.paddle = scene.playerGroup.create(x, y, "pong").setScale(0.025).setOrigin(0.7, 0.7).setImmovable()
  player.paddle.setCollideWorldBounds(true)
  player.paddle.type = 'Left'
  return player
}
player.update = () => {
  // keyboard controls
  if (scene.cursors.up.isDown) {
    player.paddle.setVelocityY(-15)    
  } else if (scene.cursors.down.isDown) {     
    player.paddle.setVelocityY(15)
  } else {       
    player.paddle.setVelocityY(0)
  }
}

module.exports = player