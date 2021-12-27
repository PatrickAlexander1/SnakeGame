import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';

const randomXY = (snake, gameContainerWidth, gameContainerHeight) => {
  
  let goodSpot = true
  const randX = _.clamp(_.random(gameContainerWidth / 25) * 25, 25, gameContainerHeight - 25)
  const randY = _.clamp(_.random(gameContainerHeight / 25) * 25, 25, gameContainerHeight - 25)
  snake.segmentLocations.forEach((segment) =>{
    if (_.isEqual([randX, randY], segment)){
       goodSpot = false
    }})

  return goodSpot? [randX, randY]: randomXY(snake, gameContainerWidth, gameContainerHeight)

}

class GameContainer {

  constructor(width, height){
    this.width = width
    this.height = height
    this.wallCollision = false
    this.pause = false
  }

  update(snake, apple, score, setScore){
    // If the game is not Paused then update
    if (!this.pause){
      snake.update(apple, score, setScore)
      // check of snake collided with wall
      this.wallCollision = (snake.segmentLocations[0][0] >= this.width || snake.segmentLocations[0][0] < 0 || snake.segmentLocations[0][1] >= this.height || snake.segmentLocations[0][1] < 0)?  true: false
  }
    }

  stop(){
    this.pause = true
  }

  start(){
    this.pause = false
  }

}

class Snake {

  constructor()
  {
    this.segmentLocations = [[50,50], [25,50], [0,50]]
    this.head = this.segmentLocations[0]
    this.direction = "right"
    this.crashed = false
  }

  ateApple(apple){
    const didEatApple = (this.head[0] === apple.x && this.head[1] === apple.y)
    if(didEatApple){
      const [x, y] = randomXY(snake, 400, 400)
      apple.x = x
      apple.y = y
    }
    return didEatApple

  }

  checkIfCrashed(){
    this.segmentLocations.slice(1,).forEach((segment) =>{
    if (_.isEqual(this.head, segment)){
       this.crashed = true
    }})
}

  update(apple, score, setScore){

    if (!this.crashed){
      let currentHead
      if (this.direction === "right"){
        currentHead = [this.head[0] + 25, this.head[1]]
      }
      else if (this.direction === "left"){
        currentHead = [this.head[0] - 25, this.head[1]]
      }
      else if (this.direction === "up"){
        currentHead = [this.head[0], this.head[1] - 25]
      }
      else if (this.direction === "down"){
        currentHead = [this.head[0], this.head[1] + 25]
      }
      this.head = currentHead
      this.segmentLocations = [currentHead].concat(this.segmentLocations)


      if (!this.ateApple(apple)){
        this.segmentLocations.pop()
      }
      else{
        setScore(score + 1)
      }
      this.checkIfCrashed()
  }
}
  changeDirection(direction){
    this.direction = direction
  }
}

class Apple {
  constructor(location)
  {
    this.x = location.x
    this.y = location.y
  }
}

const gameContainer = new GameContainer(400, 400)
const snake = new Snake()
const apple = new Apple({x:100, y:100})


const Game = ({gameContainer, snake, apple}) => {

  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const updateGameState = (gameContainer, snake, apple, ctx, score, setScore) => {

    // Update gameContainer
    gameContainer.update(snake, apple, score, setScore)
    if (!gameContainer.wallCollision && !snake.crashed && !gameContainer.pause){
        // Draw Game Container
        ctx.clearRect(0,0, gameContainer.width, gameContainer.height)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, gameContainer.x, gameContainer.y)
        // Draw Snake
        ctx.fillStyle = 'green';
        for (let index = 0; index < snake.segmentLocations.length; index++) {
          const segment = snake.segmentLocations[index]
          ctx.fillRect(segment[0], segment[1], 25, 25);
          ctx.strokeRect(segment[0], segment[1], 25, 25)
        }
        // Draw Apple
        ctx.fillStyle = 'red';
        ctx.fillRect(apple.x, apple.y, 25, 25)
        ctx.strokeRect(apple.x, apple.y, 25, 25)
        // Draw Score
        ctx.fillStyle = 'white';
        ctx.font = "30px Arial";
        ctx.fillText(`Score: ${score}`, 10, 30);
  }

}

  const controller = (event) => {

    switch (event.code) {
      case "ArrowRight":
        snake.changeDirection("right")
        break
      case "ArrowLeft":
        snake.changeDirection("left")
        break
      case "ArrowUp":
        snake.changeDirection("up")
        break
      case "ArrowDown":
        snake.changeDirection("down")
        break
      default:
        break;
    }
    switch (event.keyCode ) {
      case 32:
        gameContainer.stop()
        break
      case 13:
        gameContainer.start()
        break
      default:
        break;
    }
  }

  useEffect(() => {

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d");

      let gameState = setInterval(() => {updateGameState(gameContainer, snake, apple, ctx, score, setScore);}, 150)
      window.addEventListener('keydown', controller);

      return () => {
      clearInterval(gameState)
      window.removeEventListener('keydown', controller);
      }
  })
  return(
    <div style={{display:"flex",
           justifyContent:"center",
           alignItems:"center",
           flexDirection:"column",
           minHeight:"100vh"}}>
        <canvas
          style={{
          background: "#262626",
          display: "block",
          }}
          id="myCanvas"
          width="400"
          height="400"
          ref={canvasRef}></canvas>
          

          <table style={{borderCollapse:"collapse", position:"absolute", top:20, left:20}}>
            <tr>
            <th>Command</th>
            <th>Key</th>
            </tr>
            <tr>
              <td>Stop</td>
              <td>Space Bar</td>
            </tr>
            <tr>
              <td>Continue</td>
              <td>Enter</td>
            </tr>
            <tr>
              <td>Left</td>
              <td>Left Arrow</td>
            </tr>
            <tr>
              <td>Right</td>
              <td>Right Arrow</td>
            </tr>
            <tr>
              <td>Up</td>
              <td>Up Arrow</td>
            </tr>
            <tr>
              <td>Down</td>
              <td>Down Arrow</td>
            </tr>
          </table>

          <div
           onClick={() => window.location.reload()}
          style={{display:"flex",
                  justifyContent:"center",
                 }}>
           <div
           style={{
             fontSize:"1.5rem",
             padding:15,
             border:"solid",
             borderWidth: 1,
             cursor: "grab",
             fontWeight:"normal",
             margin:40,
           }}
           > New Game 
           </div>
          </div>
    </div>
  )
  }
function App() {

  return(
    <>
    <Game gameContainer={gameContainer} snake={snake} apple={apple}/>
    </>
  )


}

export default App;
