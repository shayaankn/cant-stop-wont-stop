const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Car properties
const carImg = new Image();
carImg.src = "./assets/cars/1.png";
const startPosition = { x: 400, y: 300 };

const car = {
  x: startPosition.x,
  y: startPosition.y,
  angle: 0,
  speed: 0,
  maxSpeed: 14,
  acceleration: 0.2,
  friction: 0.02,
  turnSpeed: 0.05,
  steer: 0,
  steerDecay: 0.05, // how quickly steering returns to center
};

// Map properties
const mapImg = new Image();
mapImg.src = "./assets/maps/2.jpg";

const map = {
  width: 1600,
  height: 1200,
};

// Offscreen canvas for collision detection
const mapCanvas = document.createElement("canvas");
mapCanvas.width = map.width;
mapCanvas.height = map.height;
const mapCtx = mapCanvas.getContext("2d");

// Input state
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowDown: false,
};

// Key handlers
document.addEventListener("keydown", (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Restart function
function restartGame() {
  car.x = startPosition.x;
  car.y = startPosition.y;
  car.angle = 0;
  car.speed = 0;

  // Trigger flicker
  car.flicker = true;
  setTimeout(() => (car.flicker = false), 1000); // lasts 1s
}

// Collision detection
function checkCollision() {
  // ensure integer pixel coords
  const px = Math.floor(car.x);
  const py = Math.floor(car.y);

  // bounds check (safe guard)
  if (px < 0 || py < 0 || px >= map.width || py >= map.height) {
    // outside map — consider this a collision
    restartGame();
    return;
  }

  // get pixel color under car
  const pixel = mapCtx.getImageData(px, py, 1, 1).data;
  const [r, g, b, a] = pixel;

  // For debugging, uncomment to log values once:
  // console.log("pixel at", px, py, r, g, b, a);

  // simple grass detection (adjust thresholds for your map)
  const isGrass = g > 190 && r < 185 && b < 70;

  if (isGrass) {
    restartGame();
  }
}

// Update function
function update() {
  // Auto acceleration
  car.speed += car.acceleration;
  if (car.speed > car.maxSpeed) car.speed = car.maxSpeed;

  // Braking
  // if (keys.ArrowDown) {
  //   car.speed -= 0.2;
  //   if (car.speed < 0) car.speed = 0;
  // }

  // Steering
  if (keys.ArrowLeft) {
    car.steer -= 0.1;
    if (car.steer < -1) car.steer = -1;
  } else if (keys.ArrowRight) {
    car.steer += 0.1;
    if (car.steer > 1) car.steer = 1;
  } else {
    // Gradually return steering to 0
    if (car.steer > 0) car.steer = Math.max(0, car.steer - car.steerDecay);
    if (car.steer < 0) car.steer = Math.min(0, car.steer + car.steerDecay);
  }

  // Apply turning ONLY if the car is moving
  if (car.speed > 0.2) {
    car.angle += car.steer * car.turnSpeed * (car.speed / car.maxSpeed + 0.2);
  }

  // Friction — makes it feel like sliding on gravel
  car.speed *= 1 - car.friction;

  // Move
  car.x += Math.cos(car.angle) * car.speed;
  car.y += Math.sin(car.angle) * car.speed;

  // Clamp car within map boundaries
  car.x = Math.max(0, Math.min(map.width, car.x));
  car.y = Math.max(0, Math.min(map.height, car.y));

  // Check collision (after moving)
  checkCollision();
}

// Draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Camera logic
  const cameraX = car.x - canvas.width / 2;
  const cameraY = car.y - canvas.height / 2;

  ctx.save();
  // Shift everything opposite to camera position
  ctx.translate(-cameraX, -cameraY);

  // Draw map
  ctx.drawImage(mapImg, 0, 0, map.width, map.height);

  // Draw car
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  // Handle flicker (if active)
  if (car.flicker) {
    const flickerTime = Date.now() % 200; // flicker speed
    const opacity = flickerTime < 100 ? 0.3 : 1; // alternate visibility
    ctx.globalAlpha = opacity;
  }

  ctx.drawImage(carImg, -carImg.width / 2, -carImg.height / 2);
  ctx.restore();

  ctx.restore(); // restore after camera
}

// Game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Start (when both images are loaded)
let imagesLoaded = 0;
function onImageLoad() {
  imagesLoaded++;
  // if (imagesLoaded === 2) loop();
  if (imagesLoaded === 2) {
    // Draw the map into the offscreen canvas once here
    mapCtx.drawImage(mapImg, 0, 0, map.width, map.height);

    // start game loop
    loop();
  }
}

carImg.onload = onImageLoad;
mapImg.onload = onImageLoad;
