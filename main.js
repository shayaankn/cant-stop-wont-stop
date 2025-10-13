const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- Car properties ---
const carImg = new Image();
carImg.src = "./assets/cars/1.png";

const car = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  angle: 0,
  speed: 0,
  maxSpeed: 6,
  acceleration: 0.05,
  friction: 0.02,
  turnSpeed: 0.04,
};

// --- Input state ---
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowDown: false,
};

// --- Key handlers ---
document.addEventListener("keydown", (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// --- Update function ---
function update() {
  // Auto acceleration
  car.speed += car.acceleration;
  if (car.speed > car.maxSpeed) car.speed = car.maxSpeed;

  // Braking
  if (keys.ArrowDown) {
    car.speed -= 0.2;
    if (car.speed < 0) car.speed = 0;
  }

  // Turning (stronger at higher speeds)
  if (keys.ArrowLeft)
    car.angle -= car.turnSpeed * (car.speed / car.maxSpeed + 0.3);
  if (keys.ArrowRight)
    car.angle += car.turnSpeed * (car.speed / car.maxSpeed + 0.3);

  // Friction — makes it feel like sliding on gravel
  car.speed *= 1 - car.friction;

  // Move
  car.x += Math.cos(car.angle) * car.speed;
  car.y += Math.sin(car.angle) * car.speed;

  // Boundaries
  if (car.x < 0) car.x = 0;
  if (car.y < 0) car.y = 0;
  if (car.x > canvas.width) car.x = canvas.width;
  if (car.y > canvas.height) car.y = canvas.height;
}

// --- Draw function ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);
  ctx.drawImage(carImg, -carImg.width / 2, -carImg.height / 2);
  ctx.restore();
}

// --- Game loop ---
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// --- Start ---
carImg.onload = () => {
  loop();
};
