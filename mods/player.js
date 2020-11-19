// ### player ###
let player = {
  score: 0
}
player.init = (x, y) => {
  // Add sprite
  player.paddle = pong.playerGroup.create(x, y, "pong").setScale(0.025).setOrigin(0.7).setImmovable()
  player.paddle.setCollideWorldBounds(true)
  player.paddle.type = 'Left'
  return player
}
player.update = () => {
  // keyboard controls
  if (pong.cursors.up.isDown) {
    player.paddle.setVelocityY(-15)    
  } else if (pong.cursors.down.isDown) {     
    player.paddle.setVelocityY(15)
  } else {       
    player.paddle.setVelocityY(0)
  }
}

module.exports = player