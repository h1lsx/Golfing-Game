const socket = io();
let players = [0, 0, 0, 0];
let ball = new Ball(350, 350, 0, 0, 35, 1, ':', true);
socket.on('player', a => {
  ball.player = a;
})
if(localStorage.getItem('username') == null) {
  const username = prompt('Username?');
  localStorage.setItem('username', username);
}
ball.username = localStorage.getItem('username');
socket.on('ballRecieve', a => {
  const data = JSON.parse(a);
  players[data.player - 1] = new Ball(data.x, data.y, data.xV, data.yV, data.radius, data.player, data.username, false);
})
socket.on('ballDelete', a => {
  players[a - 1] = 0;
})
let releaseState = 2;
let walls = [{"x1":636,"y1":254,"x2":1223,"y2":276},{"x1":616,"y1":867,"x2":1289,"y2":980},{"x1":120,"y1":387,"x2":175,"y2":607},{"x1":1465,"y1":450,"x2":1641,"y2":686}];
function setup() {
  createCanvas(windowWidth, windowHeight + 10);
  noStroke();
  textAlign(CENTER);
  textSize(25);
}
function draw() {
  if(mouseIsPressed) {
    releaseState = 0;
  } else if(releaseState == 1) {
    releaseState = 2;
  } else if(releaseState == 0) {
    releaseState = 1;
  }
  if(releaseState == 1 && ball.xV == 0 && ball.yV == 0) {
    ball.onRelease();
  }
  ball.tick();
  clear();
  background(0, 165, 0);
  fill(255, 255, 255);
  walls.forEach(a => {
    rect(a.x1, a.y1, a.x2 - a.x1, a.y2 - a.y1);
  })
  ball.render();
  players.forEach(a => {
    if(a != 0) {
      a.tick();
      a.render();
      if(dist(ball.x, ball.y, a.x, a.y) < ball.radius) {
        console.log("coll")
        ball.xV = -ball.xV;
        ball.yV = -ball.yV;
      }
    }
  })
}