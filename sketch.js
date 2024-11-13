let tSize = 100;  // Text Size
let tposX = 350;  // X position of text
let tposY = 500;  // Y position of text
let pointCount = 0.9;  // Between 0 - 1 for point count
let speed = 100;  // Speed of the particles
let comebackSpeed = 100;  // Lower the number for less interaction
let dia = 200;  // Diameter of interaction
let randomPos = false;  // Starting points
let pointsDirection = "up";  // Direction: left, right, up, down, or general
let interactionDirection = -1;  // -1 or 1

let textPoints = [];
let isDissolved = false;

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(1000, 1000);
  textFont(font);

  let points = font.textToPoints("LORI", tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }
}

function draw() {
  background(0);

  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update();
    v.show();

    // Control behavior based on hover and click
    if (isDissolved) {
      v.behaviors();
    } else {
      v.returnToStart();
    }
  }
}

function mouseMoved() {
  // Dissolve text when hovering
  isDissolved = true;
}

function mousePressed() {
  // Reset particles to original text position on click
  isDissolved = false;
  for (let i = 0; i < textPoints.length; i++) {
    textPoints[i].resetPosition();
  }
}

// Interact class
function Interact(x, y, m, d, t, s, di, p) {
  this.home = createVector(x, y);
  this.pos = this.home.copy();
  this.target = createVector(x, y);
  this.vel = createVector();
  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxForce = 0.1;
  this.dia = d;
  this.come = s;
  this.dir = p;
}

Interact.prototype.hasArrived = function() {
  return p5.Vector.dist(this.pos, this.target) < 5;
};

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  steer.limit(this.maxForce);
  return steer;
};

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.show = function () {
  stroke(255);
  strokeWeight(4);
  point(this.pos.x, this.pos.y);
};

// New function to reset particles to their original positions
Interact.prototype.returnToStart = function () {
  this.target = this.home; // Set target to original position
};

Interact.prototype.resetPosition = function() {
  this.pos = this.home.copy(); // Reset position to original point
  this.vel.mult(0);  // Reset velocity to zero to stop movement
};
