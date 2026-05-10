/* Estrutura Principal
gameLoop()
 ├── update()
 │     ├── moveSnake()
 │     ├── checkCollision()
 │     ├── checkFood()
 │     └── checkBonusFood()
 │
 └── render()
       ├── drawBackground()
       ├── drawSnake()
       ├── drawFood()
       ├── drawBonusFood()
       └── drawScore()
*/

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const box = 20; // Tamanho de cada bloco
let snake = [{ x: 9 * box, y: 9 * box }]; // Corpo inicial da cobra
let direction = 'RIGHT'; // Direção inicial
let bonusFood = null; // Posição do bônus (nulo inicialmente)
let foodCounter = 0; // Contador de comidas normais
let score = 0; // Pontuação inicial
let speed = 100; // Velocidade inicial em milissegundos
let game = setInterval(gameLoop, speed);
let food = foodRandomPosition();

let aiEnabled = true; // Integração IA

function gameLoop() {
  update();
  render();
}

function update() {

  if (aiEnabled) {
    aiMove();
  }

  moveSnake();
  checkCollision();
  checkFood();
  checkBonusFood();
}

function render() {
  drawBackground();
  drawSnake();
  drawFood();
  drawBonusFood();
  drawScore();
}

function drawBackground() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? 'blue' : 'lime';

    ctx.fillRect(
      segment.x + 1,
      segment.y + 1,
      box - 2,
      box - 2
    );
  });
}

function drawFood() {
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, box, box);
}

function drawBonusFood() {
  if (!bonusFood) return;

  ctx.fillStyle = 'gold';

  ctx.beginPath();

  ctx.arc(
    bonusFood.x + box / 2,
    bonusFood.y + box / 2,
    box / 2,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '10px Arial';
  ctx.fillText(`Score: ${score}`, 10, 20);
}

function moveSnake() {

  let head = { ...snake[0] };

  if (direction === 'LEFT') head.x -= box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'DOWN') head.y += box;

  // atravessar parede
  if (head.x < 0) head.x = canvas.width - box;
  if (head.x >= canvas.width) head.x = 0;
  if (head.y < 0) head.y = canvas.height - box;
  if (head.y >= canvas.height) head.y = 0;

  snake.unshift(head);
}

function checkCollision() {

  const head = snake[0];

  if (
    snake
      .slice(1)
      .some(segment =>
        segment.x === head.x &&
        segment.y === head.y
      )
  ) {
    clearInterval(game);
    alert('Game Over!');
  }
}

function checkFood() {

  const head = snake[0];

  if (head.x === food.x && head.y === food.y) {

    food = foodRandomPosition();

    score++;
    foodCounter++;

    if (foodCounter === 5) {
      bonusFood = foodRandomPosition();
      foodCounter = 0;
    }

  } else {
    snake.pop();
  }
}

function checkBonusFood() {

  const head = snake[0];

  if (
    bonusFood &&
    head.x === bonusFood.x &&
    head.y === bonusFood.y
  ) {

    score += 5;

    bonusFood = null;

    for (let i = 0; i < 5; i++) {
      snake.push({ ...snake[snake.length - 1] });
    }

    speed *= 0.9;

    if (speed < 80) speed = 80;

    clearInterval(game);

    game = setInterval(gameLoop, speed);
  }
}

function foodRandomPosition() {
  let position;

  do {
    position = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box
    };
  } while (
    snake.some(segment =>
      segment.x === position.x &&
      segment.y === position.y
    )
  );

  return position;
}

function willCollide(x, y) {

  return snake.some(segment =>
    segment.x === x &&
    segment.y === y
  );
}

function aiMove() {

  const head = snake[0];

  const moves = [
    {
      dir: 'UP',
      x: head.x,
      y: head.y - box
    },

    {
      dir: 'DOWN',
      x: head.x,
      y: head.y + box
    },

    {
      dir: 'LEFT',
      x: head.x - box,
      y: head.y
    },

    {
      dir: 'RIGHT',
      x: head.x + box,
      y: head.y
    }
  ];

  // Evita voltar pra trás
  const opposite = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT'
  };

  // Filtra movimentos válidos
  const safeMoves = moves.filter(move => {

    // Não pode voltar
    if (opposite[direction] === move.dir) {
      return false;
    }

    // Teleporte das paredes
    let testX = move.x;
    let testY = move.y;

    if (testX < 0) testX = canvas.width - box;
    if (testX >= canvas.width) testX = 0;

    if (testY < 0) testY = canvas.height - box;
    if (testY >= canvas.height) testY = 0;

    // Verifica colisão
    return !willCollide(testX, testY);
  });

  // Se não houver saída
  if (safeMoves.length === 0) {
    return;
  }

  // Ordena por distância até comida
  safeMoves.sort((a, b) => {

    const distA =
      Math.abs(food.x - a.x) +
      Math.abs(food.y - a.y);

    const distB =
      Math.abs(food.x - b.x) +
      Math.abs(food.y - b.y);

    return distA - distB;
  });

  // Escolhe melhor movimento
  direction = safeMoves[0].dir;
}

// Controlando a direção com o teclado
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});
