const Player = require("./player.js")
const AI = require("./ai.js")

const _ = require('underscore')

// ### level Scene ###
let scene
let level = {}
let ball
let ai 
let player
let leftAudio
let rightAudio
let wallAudio
let goalAudio
let originalBallVelocity = pong.ballVelocity

const hitPaddle = (ball, paddle) => {
  let diff = 0
  let velocity 

  if(paddle.type === 'Left') rightAudio.play()
  if(paddle.type === 'Right') leftAudio.play()

  // above
  if (ball.y < paddle.y) {
    // ball is on the left-hand side of the paddle
    diff = ball.y - paddle.y
    velocity = (pong.ballVelocity * 0.8) * (diff * (pong.height * 0.7) ) 
    ball.setVelocityY( velocity  )
  } else if (ball.y > paddle.y) { 
    // ball is on the right-hand side of the paddle
    diff = paddle.y + ball.y
    velocity = (pong.ballVelocity * 0.8) * (diff * (pong.height * 0.7) ) 
    ball.setVelocityY(velocity)
  } else { // middle (never catches though; TODO)
    velocity = (pong.ballVelocity * 0.2) + Math.random() * (pong.ballVelocity)
    ball.setVelocityY(velocity)
  }
}

const resetBall =() => {
  goalAudio.play() // goal!
  setTimeout(() => scene.cam.shake(100, 0.01) ) 

  //set ball back to starting position
  ball.setActive(false)
  ball.setVelocity(0)
  ball.setMaxVelocity( originalBallVelocity )
  ball.setPosition(pong.width/2, pong.height/2)
  ball.setData('inMiddle', true)
  player.paddle.y = pong.height/2
}

const roundOver = winner => {
  let scoreId = '#' + (winner === ai ? 'aiScore' : 'playerScore')
  setTimeout(() => {
    winner.score += 1 
    document.querySelector(scoreId).innerHTML = winner.score
    resetBall() 
  }, 500) 
}

//^ Throttle this function since we are calling it on update (every frame); it only needs run once - the 500ms delay allows the ball to go outside of screen for a while before we reset & begin next round
const roundOverThrottled = _.throttle(roundOver, 501, {trailing: false})

const onWorldBounds = () => {
  //each time ball hits world bounds, increase the max velocity slightly: 
  let currentVelocity = ball.body.velocity
  let xVel = currentVelocity.x > 0 ? currentVelocity.x + 1 : currentVelocity.x - 1
  let yVel = currentVelocity.y > 0 ? currentVelocity.y + 1 : currentVelocity.y - 1

  pong.ballVelocity = pong.ballVelocity + 0.1
  ball.setMaxVelocity(  pong.ballVelocity  )
  ball.setVelocity( xVel, yVel )
  console.log(currentVelocity)
}

level.preload = () => {
  scene = pong.Phaser.scene.scenes[0]
  scene.load.image("ball", "assets/ball.svg")
  scene.load.image("pong", "assets/pong.png")

  scene.load.audio('left', ['assets/left.wav'])
  scene.load.audio('right', ['assets/right.wav'])
  scene.load.audio('wall', ['assets/wall.wav'])
  scene.load.audio('goal', ['assets/goal.wav'])
}

level.create = () => {
  // set world bounds
  scene.physics.world.setBounds(0, 0, pong.width, pong.height, false, false, true, true)

  // camera
  scene.cam = scene.cameras.main
  setTimeout( () => scene.cam.flash(), 200 ) //< 'flash' effect to start game

  // add line down the middle
  let graphics = scene.add.graphics({ lineStyle: { width: 0.5, color: 0xffffff } })
  let line = new Phaser.Geom.Line(pong.width/2, 0, pong.width/2, pong.height)
  graphics.strokeLineShape(line)

  // add sounds for ball when hitting walls or paddles
  leftAudio = scene.sound.add('left')
  rightAudio = scene.sound.add('right')
  wallAudio = scene.sound.add('wall')
  goalAudio = scene.sound.add('goal')

  // create inputs
  pong.cursors = scene.input.keyboard.createCursorKeys()
  
  // create player group for player and ai
  pong.playerGroup = scene.physics.add.group()
  // Add ball Group
  pong.ballGroup = scene.physics.add.group({
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  })

  // create player
  player = Player.init(1, pong.height/2)
  document.querySelector('#playerScore').innerHTML = player.score

  //create ai
  ai = AI.init(pong.width, pong.height/2)
  document.querySelector('#aiScore').innerHTML = ai.score

  // create the ball
  ball = pong.ballGroup.create(pong.width/2, pong.height/2, 'ball').setOrigin(0.5, 0.5)
  ball.setScale(1)
  ball.setMaxVelocity(pong.ballVelocity)
  ball.setMass(1)
  ball.setCircle(1) //< change? 
  ball.body.onWorldBounds = true
  ball.type = 'ball'
  ball.setData('inMiddle', true)

  // Space key to start the game and to continue when a player scores
  scene.input.keyboard.on('keydown_SPACE', event => {
    if (ball.getData('inMiddle')) {
      ball.setActive(true)
      // 'randomly' choose which way the ball goes
      if(Math.random() > 0.49) {
        ball.setVelocity(-pong.ballVelocity, Phaser.Math.Between(-1, -4))
      } else {
        ball.setVelocity(pong.ballVelocity, Phaser.Math.Between(1, 4))
      } 
      ball.setData('inMiddle', false)
    }
  })

  // if ball hits world bounds, play wall sound
  scene.physics.world.on('worldbounds', body => {
    if(body.gameObject.type === 'ball') wallAudio.play()
  })

  scene.physics.add.collider(ball, pong.playerGroup, hitPaddle, null, scene)

  scene.physics.world.on('worldbounds', onWorldBounds)
}

level.update = (time, delta) => {
  player.update()
  ai.update(ball)

  //if ball goes out on left side (player)
  if(ball.x < 0) return roundOverThrottled(ai)
  //ball goes out on right side (ai)
  if(ball.x > pong.width) return roundOverThrottled(player)
}


module.exports = level