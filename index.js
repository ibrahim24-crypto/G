// game.js (responsable du jeu uniquement)
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let score = 0;
let highscore = 0;
let circles = [];
let comboCount = 0;
let lastClickTime = Date.now();
const comboTimeout = 500;
let currentComboColor = 'red';
let maxComboRange = 0;
let rainbowMode = false;
let hue = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function getCircleColor(combo) {
  if (rainbowMode) {
    hue = (hue + 1) % 360;
    return `hsl(${hue}, 100%, 50%)`;
  }
  const colors = ['red', 'green', 'cyan', 'orange', 'yellow', 'purple', 'pink', 'brown', 'gray'];
  const currentRange = Math.floor(combo / 10);
  if (combo >= 0 && currentRange > maxComboRange) {
    maxComboRange = currentRange;
    currentComboColor = colors[Math.min(currentRange, colors.length - 1)];
  }
  return currentComboColor;
}

function drawCircles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  circles.forEach((circle, index) => {
    const circleColor = getCircleColor(comboCount);
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = circleColor;
    ctx.stroke();
    ctx.closePath();
    circle.radius += 1;
    circle.opacity -= 0.02;
    circle.age += 1;
    if (circle.age > 60 || circle.opacity <= 0) {
      circles.splice(index, 1);
    }
  });
}

function createCirclesAtInterval(x, y, numberOfCircles, interval) {
  let count = 0;
  const intervalId = setInterval(() => {
    if (count < numberOfCircles) {
      circles.push({ x, y, radius: 5, opacity: 1, age: 0 });
      count++;
    } else {
      clearInterval(intervalId);
    }
  }, interval);
}

function showComboMessage(combo) {
  const comboMessageElement = document.getElementById('comboMessage');
  comboMessageElement.innerText = `Combo x${combo}!`;
  if (combo >= 3) {
    comboMessageElement.style.display = 'block';
    setTimeout(() => comboMessageElement.style.display = 'none', 1000);
  }
}

function showLevelUpMessage() {
  const levelUpElement = document.getElementById('levelUpMessage');
  levelUpElement.style.display = 'block';
  setTimeout(() => levelUpElement.style.display = 'none', 2000);
}

canvas.addEventListener('click', async (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const currentTime = Date.now();
  const timeDifference = currentTime - lastClickTime;
  if (timeDifference > comboTimeout) comboCount = 0;
  comboCount++;
  lastClickTime = currentTime;
  if (comboCount >= 3) showComboMessage(comboCount);
  if (comboCount === 100 && !rainbowMode) {
    rainbowMode = true;
    showLevelUpMessage();
  }
  score++;
  document.getElementById('score').innerText = score;
  if (score > highscore) {
    highscore = score;
    document.getElementById('highscore').innerText = highscore;
    await saveHighscore(highscore);
  }
  createCirclesAtInterval(x, y, 5, 100);
});

function gameLoop() {
  drawCircles();
  requestAnimationFrame(gameLoop);
}

gameLoop();
