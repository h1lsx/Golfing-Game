const dist = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
function rectCircleColl(circle, rect) {
    var distX = Math.abs(circle.x - rect.x - rect.w / 2);
    var distY = Math.abs(circle.y - rect.y - rect.h / 2);

    if (distX > (rect.w / 2 + circle.r)) { return false; }
    if (distY > (rect.h / 2 + circle.r)) { return false; }

    if (distX <= (rect.w / 2)) { return true; } 
    if (distY <= (rect.h / 2)) { return true; }

    var dx = distX - rect.w / 2;
    var dy = distY - rect.h / 2;
    return (dx * dx + dy * dy <= (circle.r * circle.r));
}
const maxMouse = (a, x, y) => {
  const mouseBallDistance = dist(mouseX, mouseY, x, y);
  if(mouseBallDistance > 200) {
    return [(mouseX - x) / mouseBallDistance * 200 + x, (mouseY - y) / mouseBallDistance * 200 + y][a];
  } else {
    return [mouseX, mouseY][a];
  }
}
class Ball {
  constructor(x, y, xV, yV, r, player, username, me) {
    this.x = x;
    this.y = y;
    this.radius = r;
    this.xV = xV;
    this.yV = yV;
    this.player = player;
    this.username = username;
    this.me = me;
  }
  render() {
    if(mouseIsPressed & this.xV == 0 & this.yV == 0 & this.me) {
      const angle = Math.atan2(mouseY - this.y, mouseX - this.x);
      fill(195, 195, 195, 165);
      triangle(
        maxMouse(0, this.x, this.y), maxMouse(1, this.x, this.y),
        this.x + Math.cos(angle + Math.PI / 2) * this.radius / 2,
        this.y + Math.sin(angle + Math.PI / 2) * this.radius / 2,
        this.x + Math.cos(angle - Math.PI / 2) * this.radius / 2,
        this.y + Math.sin(angle - Math.PI / 2) * this.radius / 2);
    }
    fill(0, 0, 0);
    circle(this.x, this.y, this.radius);
    fill(255, 255, 255);
    circle(this.x, this.y, this.radius * 0.8);
    if(this.player == 1) {
      fill(255, 75, 75, 225);
    } else if(this.player == 2) {
      fill(75, 75, 255, 225);
    } else if(this.player == 3) {
      fill(75, 255, 75, 225);
    } else {
      fill(255, 255, 75, 225);
    }
    text(this.username, this.x, this.y - this.radius + 10);
  }
  onRelease() {
    this.xV = maxMouse(0, this.x, this.y) - this.x;
    this.yV = maxMouse(1, this.x, this.y) - this.y;
    socket.emit('ballData', JSON.stringify({x: this.x, y: this.y, radius: this.radius, xV: this.xV, yV: this.yV, username: this.username, player: this.player}));
  }
  collision() {
    return walls.filter(a => rectCircleColl({x: this.x, y: this.y, r: this.radius / 2}, {x: a.x1, y: a.y1, w: a.x2 - a.x1, h: a.y2 - a.y1}));
  }
  cornerColl() {
    return walls.filter(a => 
      dist(this.x, this.y, a.x1, a.y1) > this.radius || 
      dist(this.x, this.y, a.x2, a.y1) > this.radius ||
      dist(this.x, this.y, a.x1, a.y2) > this.radius ||
      dist(this.x, this.y, a.x2, a.y2) > this.radius
    )
  }
  tick() {
    if(Math.abs(this.xV) < 0.05) {
      this.xV = 0;
      this.x = Math.round(this.x);
    }
    if(Math.abs(this.yV) < 0.05) {
      this.yV = 0;
      this.y = Math.round(this.y);
    }
    let cornerColl = 0;
    this.x += this.xV / -12;
    if(this.collision().length > 0) {
      for(let i = 0; i < 10 & this.collision().length > 0; i++) {
        this.x += this.xV / 120;
      }
      this.xV *= -0.8;
      cornerColl = [this.xV, this.cornerColl().length > 0];
    }
    this.y += this.yV / -12;
    if(this.collision().length > 0) {
      for(let i = 0; i < 10 & this.collision().length > 0; i++) {
        this.y += this.yV / 120;
      }
      this.yV *= -0.8;
      if(this.cornerColl().length > 0 && cornerColl[1]) {
        this.xV = -this.yV;
        this.yV = -cornerColl[0];
      }
    }
    this.xV *= 0.97;
    this.yV *= 0.97;
  }
}