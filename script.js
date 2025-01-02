const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const box = 20; // Tamanho de cada bloco
let snake = [{ x: 9 * box, y: 9 * box }]; // Corpo inicial da cobra
let direction = 'RIGHT'; // Direção inicial
let food = { 
  x: Math.floor(Math.random() * 20) * box, 
  y: Math.floor(Math.random() * 20) * box 
}; // Posição inicial da comida
let bonusFood = null; // Posição do bônus (nulo inicialmente)
let foodCounter = 0; // Contador de comidas normais
let score = 0; // Pontuação inicial
let speed = 100; // Velocidade inicial em milissegundos
let game = setInterval(drawGame, speed); // Define o intervalo inicial

function drawGame() {
  // Fundo preto
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Desenhando a cobra
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? 'blue' : 'lime'; // Cabeça azul, corpo verde
    ctx.fillRect(segment.x, segment.y, box, box);
  });

  // Desenhando a comida normal
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, box, box);

  // Desenhando o bônus, se existir
  if (bonusFood) {
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(bonusFood.x + box / 2, bonusFood.y + box / 2, box / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Movendo a cobra
  let head = { ...snake[0] };

  if (direction === 'LEFT') head.x -= box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'DOWN') head.y += box;

  // Fazendo a cobra atravessar as bordas
  if (head.x < 0) head.x = canvas.width - box;
  if (head.x >= canvas.width) head.x = 0;
  if (head.y < 0) head.y = canvas.height - box;
  if (head.y >= canvas.height) head.y = 0;

  // Verificando colisão com o próprio corpo
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    clearInterval(game);
    alert('Game Over!');
  }

  // Comendo a comida normal
  if (head.x === food.x && head.y === food.y) {
    food = { 
      x: Math.floor(Math.random() * 20) * box, 
      y: Math.floor(Math.random() * 20) * box 
    };
    score++;
    foodCounter++;

    // Gerar bônus a cada 5 comidas
    if (foodCounter === 5) {
      bonusFood = { 
        x: Math.floor(Math.random() * 20) * box, 
        y: Math.floor(Math.random() * 20) * box 
      };
      foodCounter = 0; // Resetar o contador
    }
  } else {
    snake.pop();
  }

  // Comendo o bônus
  if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
    score += 5; // Adiciona 5 pontos
    bonusFood = null; // Remove o bônus

    // Cresce o corpo da cobra em 5 segmentos
    for (let i = 0; i < 5; i++) {
      snake.push({ ...snake[snake.length - 1] });
    }

    // Reduz a velocidade em 10%
    speed *= 0.9;
    if (speed < 50) speed = 50; // Velocidade mínima de 50ms

    // Reinicia o jogo com a nova velocidade
    clearInterval(game);
    game = setInterval(drawGame, speed);
  }

  snake.unshift(head);

  // Exibindo o placar
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 20);
}

// Controlando a direção com o teclado
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});
