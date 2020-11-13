import Player from "./player.js"
import AI from "./ai.js"

const _ = require('underscore')

// ### level Scene ###
let scene 

let roundOver = winner => {
  let scoreName = winner + 'Score'
  setTimeout(() => {
    scene[scoreName] += 1 
    document.querySelector('#' + scoreName).innerHTML = scene[scoreName]
    scene.resetBall() 
  }, 500) 
}

let roundOverThrottled = _.throttle(roundOver, 1000, {trailing: false})


export default class levelScene extends Phaser.Scene {

  constructor() {
    super({ key: 'levelScene' })
  }

  preload() {
    scene = this
    scene.load.image("ball", "assets/ball.svg")
    scene.load.image("pong", "assets/pong.png")

    scene.load.audio('left', ['assets/left.wav'])
    scene.load.audio('right', ['assets/right.wav'])
    scene.load.audio('wall', ['assets/wall.wav'])
    scene.load.audio('goal', ['assets/goal.wav'])
  }

  create() {
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
    scene.leftAudio = scene.sound.add('left')
    scene.rightAudio = scene.sound.add('right')
    scene.wallAudio = scene.sound.add('wall')
    scene.goalAudio = this.sound.add('goal')

    // create inputs
    scene.cursors = scene.input.keyboard.createCursorKeys()
    
    // create player group for player and ai
    scene.playerGroup = scene.physics.add.group()
    // Add ball Group
    scene.ballGroup = scene.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    })

    // create player
    scene.player = new Player(scene, 1, pong.height/2)
    scene.playerScore = 0
    document.querySelector('#playerScore').innerHTML = scene.playerScore

    //create ai
    scene.ai = new AI(scene, pong.width, pong.height/2)
    scene.aiScore = 0
    document.querySelector('#aiScore').innerHTML = scene.aiScore

    // create the ball
    scene.ball = scene.ballGroup.create(pong.width/2, pong.height/2, 'ball').setOrigin(0.5, 0.5)
    scene.ball.setScale(1)
    scene.ball.setMaxVelocity(pong.ballVelocity)
    scene.ball.setMass(1)
    scene.ball.setCircle(1) //< change? 
    scene.ball.body.onWorldBounds = true
    scene.ball.type = 'ball'
    scene.ball.setData('inMiddle', true)

    // Space key to start the game and to continue when a player scores
    scene.input.keyboard.on('keydown_SPACE', event => {
      if (scene.ball.getData('inMiddle')) {
        scene.ball.setActive(true)
        // 'randomly' choose which way the ball goes
        if(Math.random() > 0.49) {
          scene.ball.setVelocity(-20, Phaser.Math.Between(-1, -4))
        } else {
          scene.ball.setVelocity(20, Phaser.Math.Between(1, 4))
        } 
        scene.ball.setData('inMiddle', false)
      }
    })

    // if ball hits world bounds, play wall sound
    scene.physics.world.on('worldbounds', body => {
      if(body.gameObject.type === 'ball') scene.wallAudio.play()
    })

    scene.physics.add.collider(scene.ball, scene.playerGroup, scene.hitPaddle, null, scene)
  }

  update(time, delta) {
    scene.player.update()
    scene.ai.update(scene.ball)

    //if ball goes out on left side (player)
    if(scene.ball.x < 1) return roundOverThrottled('ai')
    //ball goes out on right side (ai)
    if(scene.ball.x > pong.width -1) return roundOverThrottled('player')
  }

  hitPaddle(ball, paddle) {
    let diff = 0

    if(paddle.type === 'Left') {
      scene.rightAudio.play()
    } else if(paddle.type === 'Right') {
      scene.leftAudio.play()
    }

    // above
    if (ball.y < paddle.y) {
      // ball is on the left-hand side of the paddle
      diff = ball.y - paddle.y
      ball.setVelocityY(12 * diff)
    } else if (ball.y > paddle.y) { 
      // ball is on the right-hand side of the paddle
      diff = paddle.y + ball.y
      ball.setVelocityY(12 * diff)
    } else { // middle
      // ball is perfectly in the middle
      ball.setVelocityY(2 + Math.random() * 10)
    }
  }

  resetBall() {
    scene.goalAudio.play() // goal!
    setTimeout(() => scene.cam.shake(100, 0.01) ) 

    //set ball back to starting position
    scene.ball.setActive(false)
    scene.ball.setVelocity(0)
    scene.ball.setPosition(pong.width/2, pong.height/2)
    scene.ball.setData('inMiddle', true)
    scene.player.paddle.y = pong.height/2
  }

}