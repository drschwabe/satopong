// ### ai ###
let ai = {
  score : 0
}

const moveToBall = ball => {
  if(ball.x > Phaser.Math.Between( (pong.height/2) -2, pong.height/2) ) {
    if(ball.y > ai.paddle.y ) {
      ai.paddle.setVelocityY(Phaser.Math.Between( pong.ballVelocity * 0.65, pong.ballVelocity + 3))
    } else {
      ai.paddle.setVelocityY(-Phaser.Math.Between( pong.ballVelocity * 0.65, pong.ballVelocity + 3)) 
    }
  }
}

ai.init = (x, y) => {
  // Add sprite
  ai.paddle = pong.playerGroup.create(x, y, "pong").setScale(0.025).setOrigin(0.7).setImmovable()
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
    moveToBall(ball)
  } else {
    ai.paddle.y = pong.height/2
  }
}

module.exports = ai