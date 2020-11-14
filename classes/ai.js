// ### ai ###
let scene
let ai = {}

ai.init = (levelScene, x, y) => {
  scene = levelScene
  // Add sprite
  ai.paddle = scene.playerGroup.create(x, y, "pong").setScale(0.025).setOrigin(1).setImmovable()
  ai.paddle.setCollideWorldBounds(true)
  ai.paddle.type = 'Right'
  return ai
}

ai.update = ball => {
  // Super basic AI
  // when the ball is not in the middle waiting for the player to press space
  // the paddle will follow the ball once it's near the halfway point.
  // when the ball is in the middle and waiting (after a point gain) then move the paddle back to the middle of the y axis
  if (!ball.getData('inMiddle')) {
    if(ball.x > Phaser.Math.Between( (pong.height/2) -2, pong.height/2) ) {
      if(ball.y > ai.paddle.y) {
        ai.paddle.setVelocityY(7)
      } else if(ball.y < ai.paddle.y) {
        ai.paddle.setVelocityY(-7)
      }
    }
  } else {
    ai.paddle.y = pong.height/2
  }
}

module.exports = ai