

/* ------------------------------
   Game Database (EXACTLY 6 GAMES)
------------------------------ */

const games = {
    "Snake Game": {
        category: "Arcade",
        description: "Control the snake, collect food and increase your score without hitting the wall or yourself."
    },
    "Tic Tac Toe": {
        category: "Puzzle",
        description: "Take turns marking X and O on a 3x3 grid to get three in a row and win."
    },
    "Memory Card Match": {
        category: "Memory",
        description: "Flip cards to reveal hidden symbols and find matching pairs in as few moves as possible."
    },
    "Brick Breaker": {
        category: "Arcade",
        description: "Move the paddle left and right to bounce the ball and smash all the bricks on screen."
    },
    "Space Shooter": {
        category: "Shooting",
        description: "Control your spaceship, shoot incoming alien enemies, and score as many points as you can."
    },
    "Running Game": {
        category: "Endless Runner",
        description: "An endless running game where your character runs automatically while you jump over hurdles."
    }
};


/* ------------------------------
   Global State & Elements
------------------------------ */

let currentCleanup = null;
let selectedGameName = "Snake Game";

const searchInput = document.getElementById("searchInput");
const noGamesMessage = document.getElementById("noGamesMessage");
const gameCards = document.querySelectorAll(".game-card");
const gameDetails = document.getElementById("gameDetails");
const detailsPlayBtn = document.getElementById("detailsPlayBtn");
const gameArea = document.getElementById("gameArea");
const gameAreaTitle = document.getElementById("gameAreaTitle");
const gameContainer = document.getElementById("gameContainer");


/* ------------------------------
   Search Feature (Filters by Name & Category)
------------------------------ */

if (searchInput) {
    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase().trim();
        let matchCount = 0;

        gameCards.forEach(card => {
            const gameName = card.getAttribute("data-name").toLowerCase();
            const category = card.querySelector(".category").textContent.toLowerCase();

            if (gameName.includes(searchText) || category.includes(searchText)) {
                card.style.display = "flex";
                matchCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (noGamesMessage) {
            noGamesMessage.style.display = (matchCount === 0) ? "block" : "none";
        }
    });
}


/* ------------------------------
   Game Details Functionality
------------------------------ */

function showGameDetails(gameName) {
    const game = games[gameName];
    if (!game) return;

    selectedGameName = gameName;
    document.getElementById("detailName").textContent = gameName;
    document.getElementById("detailCategory").textContent = game.category;
    document.getElementById("detailDescription").textContent = game.description;

    if (gameDetails) {
        gameDetails.style.display = "block";
    }
}

if (detailsPlayBtn) {
    detailsPlayBtn.addEventListener("click", function() {
        playGame(selectedGameName);
    });
}

// Add card click listeners for showing details
gameCards.forEach(card => {
    card.addEventListener("click", function (e) {
        if (e.target.classList.contains("play-btn")) return;
        const gameName = card.getAttribute("data-name");
        showGameDetails(gameName);
    });
});


/* ------------------------------
   Play Game Button Handler
------------------------------ */

function playGame(gameName) {
    // 1. Required alert message
    alert("Game is starting...");

    // 2. Update Details Section
    showGameDetails(gameName);

    // 3. Open Game Area
    openGameArea(gameName);
}


/* ------------------------------
   Game Area Manager (Open / Close)
------------------------------ */

function openGameArea(gameName) {
    // Clean up active loop if any
    if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
    }

    gameAreaTitle.textContent = gameName;
    gameArea.style.display = "block";
    gameContainer.innerHTML = "";

    // Smooth scroll to Game Area
    gameArea.scrollIntoView({ behavior: "smooth" });

    // Launch Game Implementation
    if (gameName === "Snake Game") launchSnake();
    else if (gameName === "Tic Tac Toe") launchTicTacToe();
    else if (gameName === "Memory Card Match") launchMemoryMatch();
    else if (gameName === "Brick Breaker") launchBrickBreaker();
    else if (gameName === "Space Shooter") launchSpaceShooter();
    else if (gameName === "Running Game") launchRunningGame();
}

function closeGameArea() {
    if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
    }
    gameArea.style.display = "none";
    gameContainer.innerHTML = "";
}


/* ==============================================================
   🐍 GAME 1: SNAKE GAME
   ============================================================== */

function launchSnake() {
    gameContainer.innerHTML = `
        <div class="mini-game">
            <div class="game-score-board">Score: <span id="snakeScore">0</span></div>
            <canvas id="snakeCanvas" width="360" height="360" class="game-canvas"></canvas>
            <div class="game-controls">
                <button id="snakeRestartBtn" class="btn-action">Restart Game</button>
            </div>
            <p class="control-info">Controls: Arrow Keys or W A S D</p>
        </div>
    `;

    const canvas = document.getElementById("snakeCanvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("snakeScore");
    const restartBtn = document.getElementById("snakeRestartBtn");

    const gridSize = 18;
    const tileCount = 20;
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 0, dy = -1;
    let score = 0;
    let gameInterval = null;
    let isRunning = true;

    function handleKeydown(e) {
        if (!isRunning) return;
        if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W") && dy === 0) { dx = 0; dy = -1; }
        if ((e.key === "ArrowDown" || e.key === "s" || e.key === "S") && dy === 0) { dx = 0; dy = 1; }
        if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && dx === 0) { dx = -1; dy = 0; }
        if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && dx === 0) { dx = 1; dy = 0; }
    }

    window.addEventListener("keydown", handleKeydown);

    function startSnake() {
        if (gameInterval) clearInterval(gameInterval);
        snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
        food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
        dx = 0; dy = -1;
        score = 0;
        scoreEl.textContent = score;
        isRunning = true;
        gameInterval = setInterval(gameLoop, 110);
    }

    function gameLoop() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Wall Collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return gameOver();
        }

        // Self Collision
        for (let seg of snake) {
            if (seg.x === head.x && seg.y === head.y) return gameOver();
        }

        snake.unshift(head);

        // Food Collision
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreEl.textContent = score;
            food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
        } else {
            snake.pop();
        }

        // Render
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Food
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

        // Snake
        ctx.fillStyle = "#00ffcc";
        snake.forEach(seg => {
            ctx.fillRect(seg.x * gridSize, seg.y * gridSize, gridSize - 2, gridSize - 2);
        });
    }

    function gameOver() {
        clearInterval(gameInterval);
        isRunning = false;
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff4444";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Arial";
        ctx.fillText("Final Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
    }

    restartBtn.addEventListener("click", startSnake);
    startSnake();

    currentCleanup = () => {
        clearInterval(gameInterval);
        window.removeEventListener("keydown", handleKeydown);
    };
}


/* ==============================================================
   ❌⭕ GAME 2: TIC TAC TOE
   ============================================================== */

function launchTicTacToe() {
    gameContainer.innerHTML = `
        <div class="mini-game">
            <div class="game-score-board" id="tttStatus">Player X Turn</div>
            <div class="ttt-grid" id="tttGrid">
                <div class="ttt-box" data-i="0"></div>
                <div class="ttt-box" data-i="1"></div>
                <div class="ttt-box" data-i="2"></div>
                <div class="ttt-box" data-i="3"></div>
                <div class="ttt-box" data-i="4"></div>
                <div class="ttt-box" data-i="5"></div>
                <div class="ttt-box" data-i="6"></div>
                <div class="ttt-box" data-i="7"></div>
                <div class="ttt-box" data-i="8"></div>
            </div>
            <div class="game-controls">
                <button id="tttRestartBtn" class="btn-action">Restart Game</button>
            </div>
        </div>
    `;

    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let active = true;

    const statusEl = document.getElementById("tttStatus");
    const boxes = document.querySelectorAll(".ttt-box");
    const restartBtn = document.getElementById("tttRestartBtn");

    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function handleClick(e) {
        const i = e.target.getAttribute("data-i");
        if (board[i] !== "" || !active) return;

        board[i] = currentPlayer;
        e.target.textContent = currentPlayer;
        e.target.style.color = currentPlayer === "X" ? "#00ffcc" : "#ff5555";

        checkWinner();
    }

    function checkWinner() {
        let won = false;
        for (let w of wins) {
            let a = board[w[0]], b = board[w[1]], c = board[w[2]];
            if (a !== "" && a === b && b === c) {
                won = true;
                break;
            }
        }

        if (won) {
            statusEl.textContent = `Player ${currentPlayer} Wins! 🎉`;
            active = false;
            return;
        }

        if (!board.includes("")) {
            statusEl.textContent = "It's a Draw! 🤝";
            active = false;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusEl.textContent = `Player ${currentPlayer} Turn`;
    }

    function restart() {
        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        active = true;
        statusEl.textContent = "Player X Turn";
        boxes.forEach(b => b.textContent = "");
    }

    boxes.forEach(b => b.addEventListener("click", handleClick));
    restartBtn.addEventListener("click", restart);

    currentCleanup = () => {
        boxes.forEach(b => b.removeEventListener("click", handleClick));
    };
}


/* ==============================================================
   🧠 GAME 3: MEMORY CARD MATCH (12 CARDS / 6 PAIRS)
   ============================================================== */

function launchMemoryMatch() {
    gameContainer.innerHTML = `
        <div class="mini-game">
            <div class="game-score-board">Moves: <span id="memMoves">0</span> | <span id="memStatus">Match all pairs!</span></div>
            <div class="memory-grid" id="memGrid"></div>
            <div class="game-controls">
                <button id="memRestartBtn" class="btn-action">Restart Game</button>
            </div>
        </div>
    `;

    const symbols = ['🎮', '🚀', '🐍', '🎯', '🧱', '⭐'];
    let cards = [...symbols, ...symbols];
    let flipped = [];
    let matchedCount = 0;
    let moves = 0;
    let lock = false;

    const grid = document.getElementById("memGrid");
    const movesEl = document.getElementById("memMoves");
    const statusEl = document.getElementById("memStatus");
    const restartBtn = document.getElementById("memRestartBtn");

    function init() {
        cards.sort(() => Math.random() - 0.5);
        grid.innerHTML = "";
        moves = 0;
        matchedCount = 0;
        lock = false;
        movesEl.textContent = moves;
        statusEl.textContent = "Match all pairs!";

        cards.forEach((symbol, index) => {
            const card = document.createElement("div");
            card.className = "memory-box";
            card.dataset.symbol = symbol;
            card.dataset.id = index;
            card.addEventListener("click", flipCard);
            grid.appendChild(card);
        });
    }

    function flipCard() {
        if (lock || this.classList.contains("flipped")) return;

        this.classList.add("flipped");
        this.textContent = this.dataset.symbol;
        flipped.push(this);

        if (flipped.length === 2) {
            moves++;
            movesEl.textContent = moves;
            checkMatch();
        }
    }

    function checkMatch() {
        let [c1, c2] = flipped;
        if (c1.dataset.symbol === c2.dataset.symbol) {
            matchedCount++;
            flipped = [];
            if (matchedCount === symbols.length) {
                statusEl.textContent = "🎉 You Matched All Cards!";
            }
        } else {
            lock = true;
            setTimeout(() => {
                c1.classList.remove("flipped");
                c2.classList.remove("flipped");
                c1.textContent = "";
                c2.textContent = "";
                flipped = [];
                lock = false;
            }, 800);
        }
    }

    restartBtn.addEventListener("click", init);
    init();
}


/* ==============================================================
   🧱 GAME 4: BRICK BREAKER
   ============================================================== */

function launchBrickBreaker() {
    gameContainer.innerHTML = `
        <div class="mini-game">
            <div class="game-score-board">Score: <span id="brickScore">0</span></div>
            <canvas id="brickCanvas" width="450" height="300" class="game-canvas"></canvas>
            <div class="game-controls">
                <button id="brickRestartBtn" class="btn-action">Restart Game</button>
            </div>
            <p class="control-info">Controls: Left / Right Arrow Keys or A / D</p>
        </div>
    `;

    const canvas = document.getElementById("brickCanvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("brickScore");
    const restartBtn = document.getElementById("brickRestartBtn");

    let animId = null;
    let score = 0;
    let isRunning = true;

    const paddle = { w: 70, h: 10, x: (canvas.width - 70) / 2, speed: 6, dx: 0 };
    const ball = { x: canvas.width / 2, y: canvas.height - 30, dx: 3, dy: -3, r: 6 };

    const rows = 3, cols = 6;
    const bw = 60, bh = 15, padding = 8, topOffset = 30, leftOffset = 20;
    let bricks = [];

    function initBricks() {
        bricks = [];
        for (let c = 0; c < cols; c++) {
            bricks[c] = [];
            for (let r = 0; r < rows; r++) {
                bricks[c][r] = { x: 0, y: 0, active: 1 };
            }
        }
    }

    function handleKeyDown(e) {
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") paddle.dx = paddle.speed;
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") paddle.dx = -paddle.speed;
    }

    function handleKeyUp(e) {
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") paddle.dx = 0;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function gameLoop() {
        if (!isRunning) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Move paddle
        paddle.x += paddle.dx;
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;

        // Draw Bricks & Collision
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                let b = bricks[c][r];
                if (b.active === 1) {
                    let bx = c * (bw + padding) + leftOffset;
                    let by = r * (bh + padding) + topOffset;
                    b.x = bx; b.y = by;

                    ctx.fillStyle = r === 0 ? "#ff4444" : (r === 1 ? "#ffbb00" : "#00ffcc");
                    ctx.fillRect(bx, by, bw, bh);

                    // Ball Collision
                    if (ball.x > bx && ball.x < bx + bw && ball.y > by && ball.y < by + bh) {
                        ball.dy = -ball.dy;
                        b.active = 0;
                        score += 10;
                        scoreEl.textContent = score;

                        if (score === rows * cols * 10) {
                            isRunning = false;
                            ctx.fillStyle = "#00ffcc";
                            ctx.font = "24px Arial";
                            ctx.textAlign = "center";
                            ctx.fillText("YOU WIN! 🎉", canvas.width / 2, canvas.height / 2);
                        }
                    }
                }
            }
        }

        // Draw Paddle
        ctx.fillStyle = "#00ffcc";
        ctx.fillRect(paddle.x, canvas.height - paddle.h - 10, paddle.w, paddle.h);

        // Draw Ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.closePath();

        // Bounce Walls
        if (ball.x + ball.dx > canvas.width - ball.r || ball.x + ball.dx < ball.r) ball.dx = -ball.dx;
        if (ball.y + ball.dy < ball.r) ball.dy = -ball.dy;
        else if (ball.y + ball.dy > canvas.height - ball.r - 10) {
            if (ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
                ball.dy = -ball.dy;
            } else {
                isRunning = false;
                ctx.fillStyle = "#ff4444";
                ctx.font = "24px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
                return;
            }
        }

        ball.x += ball.dx;
        ball.y += ball.dy;

        animId = requestAnimationFrame(gameLoop);
    }

    function reset() {
        if (animId) cancelAnimationFrame(animId);
        score = 0;
        scoreEl.textContent = score;
        isRunning = true;
        paddle.x = (canvas.width - paddle.w) / 2;
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 30;
        ball.dx = 3; ball.dy = -3;
        initBricks();
        gameLoop();
    }

    restartBtn.addEventListener("click", reset);
    reset();

    currentCleanup = () => {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
    };
}


/* ==============================================================
   🚀 GAME 5: SPACE SHOOTER
   ============================================================== */

function launchSpaceShooter() {
    gameContainer.innerHTML = `
        <div class="mini-game">
            <div class="game-score-board">Score: <span id="spaceScore">0</span></div>
            <canvas id="spaceCanvas" width="400" height="320" class="game-canvas"></canvas>
            <div class="game-controls">
                <button class="btn-action" onclick="moveSpace(-15)">Left ⬅️</button>
                <button class="btn-action" onclick="shootSpace()">Shoot 🚀</button>
                <button class="btn-action" onclick="moveSpace(15)">Right ➡️</button>
                <button id="spaceRestartBtn" class="btn-action">Restart</button>
            </div>
            <p class="control-info">Controls: Left/Right Arrow or A/D to move, Space to shoot</p>
        </div>
    `;

    const canvas = document.getElementById("spaceCanvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("spaceScore");
    const restartBtn = document.getElementById("spaceRestartBtn");

    let isRunning = true;
    let score = 0;
    let animId = null;
    let frame = 0;

    const ship = { x: 185, y: 275, w: 30, h: 30 };
    let bullets = [];
    let enemies = [];

    window.moveSpace = function(dir) {
        ship.x += dir;
        if (ship.x < 0) ship.x = 0;
        if (ship.x > canvas.width - ship.w) ship.x = canvas.width - ship.w;
    };

    window.shootSpace = function() {
        if (!isRunning) return;
        bullets.push({ x: ship.x + 13, y: ship.y, w: 4, h: 8 });
    };

    function handleKey(e) {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveSpace(-15);
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveSpace(15);
        if (e.code === "Space") {
            e.preventDefault();
            shootSpace();
        }
    }

    window.addEventListener("keydown", handleKey);

    function gameLoop() {
        if (!isRunning) return;
        frame++;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Ship
        ctx.font = "24px Arial";
        ctx.fillText("🚀", ship.x, ship.y + 22);

        // Spawn Enemies
        if (frame % 45 === 0) {
            enemies.push({ x: Math.random() * (canvas.width - 25), y: 0, w: 25, h: 25, speed: 2 });
        }

        // Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];
            b.y -= 6;
            ctx.fillStyle = "#00ffcc";
            ctx.fillRect(b.x, b.y, b.w, b.h);
            if (b.y < 0) bullets.splice(i, 1);
        }

        // Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            let enemy = enemies[i];
            enemy.y += enemy.speed;

            ctx.font = "20px Arial";
            ctx.fillText("👾", enemy.x, enemy.y + 18);

            // Bullet Collision
            for (let j = bullets.length - 1; j >= 0; j--) {
                let b = bullets[j];
                if (b.x < enemy.x + enemy.w && b.x + b.w > enemy.x && b.y < enemy.y + enemy.h && b.y + b.h > enemy.y) {
                    enemies.splice(i, 1);
                    bullets.splice(j, 1);
                    score += 10;
                    scoreEl.textContent = score;
                    break;
                }
            }

            // Ship Collision
            if (ship.x < enemy.x + enemy.w && ship.x + ship.w > enemy.x && ship.y < enemy.y + enemy.h && ship.y + ship.h > enemy.y) {
                return gameOver();
            }

            if (enemy.y > canvas.height) enemies.splice(i, 1);
        }

        animId = requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        isRunning = false;
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff4444";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    }

    function reset() {
        if (animId) cancelAnimationFrame(animId);
        isRunning = true;
        score = 0;
        frame = 0;
        scoreEl.textContent = 0;
        bullets = [];
        enemies = [];
        ship.x = 185;
        gameLoop();
    }

    restartBtn.addEventListener("click", reset);
    reset();

    currentCleanup = () => {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener("keydown", handleKey);
    };
}


/* ==============================================================
   🏃 GAME 6: RUNNING GAME (GENERIC RUNNER CHARACTER - NOT DINO)
   ============================================================== */

function launchRunningGame() {
    gameContainer.innerHTML = `
        <div class="mini-game">
            <div class="game-score-board">Score: <span id="runScore">0</span></div>
            <canvas id="runCanvas" width="450" height="220" class="game-canvas"></canvas>
            <div class="game-controls">
                <button id="runJumpBtn" class="btn-action">Jump 🦘</button>
                <button id="runRestartBtn" class="btn-action">Restart Game</button>
            </div>
            <p class="control-info">Controls: Space or Up Arrow to Jump</p>
        </div>
    `;

    const canvas = document.getElementById("runCanvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("runScore");
    const jumpBtn = document.getElementById("runJumpBtn");
    const restartBtn = document.getElementById("runRestartBtn");

    let isRunning = true;
    let score = 0;
    let animId = null;
    let frame = 0;
    let speed = 5;

    const runner = { x: 40, y: 140, w: 30, h: 35, vy: 0, gravity: 0.75, isJumping: false };
    let obstacles = [];

    function jump() {
        if (!runner.isJumping && isRunning) {
            runner.vy = -12;
            runner.isJumping = true;
        }
    }

    function handleKey(e) {
        if (e.code === "Space" || e.code === "ArrowUp") {
            e.preventDefault();
            jump();
        }
    }

    window.addEventListener("keydown", handleKey);
    jumpBtn.addEventListener("click", jump);

    function gameLoop() {
        if (!isRunning) return;
        frame++;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Ground Line
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 175);
        ctx.lineTo(canvas.width, 175);
        ctx.stroke();

        // Runner Physics
        runner.vy += runner.gravity;
        runner.y += runner.vy;
        if (runner.y >= 140) {
            runner.y = 140;
            runner.vy = 0;
            runner.isJumping = false;
        }

        // Draw Generic Runner Emoji / Character (🏃)
        ctx.font = "28px Arial";
        ctx.fillText("🏃", runner.x, runner.y + 25);

        // Score and Increasing Speed
        if (frame % 5 === 0) {
            score++;
            scoreEl.textContent = score;
        }
        speed = 5 + Math.floor(score / 150) * 0.5;

        // Spawn Obstacles (Hurdles 🚧)
        if (frame % Math.max(50, Math.floor(100 - speed * 3)) === 0 && Math.random() > 0.3) {
            if (obstacles.length === 0 || canvas.width - obstacles[obstacles.length - 1].x > 160) {
                obstacles.push({ x: canvas.width, y: 145, w: 20, h: 30 });
            }
        }

        // Move Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.x -= speed;

            ctx.font = "22px Arial";
            ctx.fillText("🚧", obs.x, obs.y + 22);

            // Collision Check
            if (runner.x < obs.x + obs.w && runner.x + runner.w > obs.x && runner.y < obs.y + obs.h && runner.y + runner.h > obs.y) {
                return gameOver();
            }

            if (obs.x + obs.w < 0) {
                obstacles.splice(i, 1);
            }
        }

        animId = requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        isRunning = false;
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff4444";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Arial";
        ctx.fillText("Final Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
    }

    function reset() {
        if (animId) cancelAnimationFrame(animId);
        isRunning = true;
        score = 0;
        speed = 5;
        frame = 0;
        scoreEl.textContent = 0;
        obstacles = [];
        runner.y = 140;
        gameLoop();
    }

    restartBtn.addEventListener("click", reset);
    reset();

    currentCleanup = () => {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener("keydown", handleKey);
    };
}


/* ==============================================================
   🦖 GAME 7: JUMPING DINO GAME
   ============================================================== */

function launchJumpingDino() {
    gameContainer.innerHTML = `
        <div class="mini-game">
            <div class="game-score-board">Score: <span id="dinoScore">0</span></div>
            <canvas id="dinoCanvas" width="450" height="220" class="game-canvas"></canvas>
            <div class="game-controls">
                <button id="dinoJumpBtn" class="btn-action">Jump 🦖</button>
                <button id="dinoRestartBtn" class="btn-action">Restart Game</button>
            </div>
            <p class="control-info">Controls: Space or Up Arrow to Jump</p>
        </div>
    `;

    const canvas = document.getElementById("dinoCanvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("dinoScore");
    const jumpBtn = document.getElementById("dinoJumpBtn");
    const restartBtn = document.getElementById("dinoRestartBtn");

    let isRunning = true;
    let score = 0;
    let animId = null;
    let frame = 0;
    let speed = 5;

    const dino = { x: 40, y: 140, w: 32, h: 35, vy: 0, gravity: 0.75, isJumping: false };
    let obstacles = [];

    function jump() {
        if (!dino.isJumping && isRunning) {
            dino.vy = -12;
            dino.isJumping = true;
        }
    }

    function handleKey(e) {
        if (e.code === "Space" || e.code === "ArrowUp") {
            e.preventDefault();
            jump();
        }
    }

    window.addEventListener("keydown", handleKey);
    jumpBtn.addEventListener("click", jump);

    function gameLoop() {
        if (!isRunning) return;
        frame++;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Ground Line
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 175);
        ctx.lineTo(canvas.width, 175);
        ctx.stroke();

        // Dino Physics
        dino.vy += dino.gravity;
        dino.y += dino.vy;
        if (dino.y >= 140) {
            dino.y = 140;
            dino.vy = 0;
            dino.isJumping = false;
        }

        // Draw Dino
        ctx.font = "30px Arial";
        ctx.fillText("🦖", dino.x, dino.y + 25);

        // Score
        if (frame % 5 === 0) {
            score++;
            scoreEl.textContent = score;
        }
        speed = 5 + Math.floor(score / 150) * 0.5;

        // Spawn Cactus Obstacles (🌵)
        if (frame % Math.max(50, Math.floor(100 - speed * 3)) === 0 && Math.random() > 0.3) {
            if (obstacles.length === 0 || canvas.width - obstacles[obstacles.length - 1].x > 160) {
                obstacles.push({ x: canvas.width, y: 145, w: 20, h: 30 });
            }
        }

        // Move Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.x -= speed;

            ctx.font = "24px Arial";
            ctx.fillText("🌵", obs.x, obs.y + 24);

            // Collision
            if (dino.x < obs.x + obs.w && dino.x + dino.w > obs.x && dino.y < obs.y + obs.h && dino.y + dino.h > obs.y) {
                return gameOver();
            }

            if (obs.x + obs.w < 0) {
                obstacles.splice(i, 1);
            }
        }

        animId = requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        isRunning = false;
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff4444";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Arial";
        ctx.fillText("Final Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
    }

    function reset() {
        if (animId) cancelAnimationFrame(animId);
        isRunning = true;
        score = 0;
        speed = 5;
        frame = 0;
        scoreEl.textContent = 0;
        obstacles = [];
        dino.y = 140;
        gameLoop();
    }

    restartBtn.addEventListener("click", reset);
    reset();

    currentCleanup = () => {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener("keydown", handleKey);
    };
}


/* ==============================================================
   🎯 GAME 8: TARGET SHOOTING
   ============================================================== */

function launchTargetShooting() {
    gameContainer.innerHTML = `
        <div class="mini-game">
            <div class="game-score-board">Score: <span id="targetScore">0</span> | Time: <span id="targetTime">30</span>s</div>
            <div class="target-area" id="targetArea"></div>
            <div class="game-controls">
                <button id="targetRestartBtn" class="btn-action">Restart Game</button>
            </div>
        </div>
    `;

    const area = document.getElementById("targetArea");
    const scoreEl = document.getElementById("targetScore");
    const timeEl = document.getElementById("targetTime");
    const restartBtn = document.getElementById("targetRestartBtn");

    let score = 0;
    let timeLeft = 30;
    let timer = null;
    let isRunning = true;

    function spawnTarget() {
        if (!isRunning) return;
        area.innerHTML = "";
        const target = document.createElement("div");
        target.className = "target-item";
        target.textContent = "🎯";

        const maxX = area.clientWidth - 50;
        const maxY = area.clientHeight - 50;
        const x = Math.floor(Math.random() * Math.max(10, maxX));
        const y = Math.floor(Math.random() * Math.max(10, maxY));

        target.style.left = x + "px";
        target.style.top = y + "px";

        target.addEventListener("click", () => {
            if (!isRunning) return;
            score += 10;
            scoreEl.textContent = score;
            spawnTarget();
        });

        area.appendChild(target);
    }

    function startTimer() {
        if (timer) clearInterval(timer);
        score = 0;
        timeLeft = 30;
        isRunning = true;
        scoreEl.textContent = score;
        timeEl.textContent = timeLeft;

        spawnTarget();

        timer = setInterval(() => {
            timeLeft--;
            timeEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                isRunning = false;
                area.innerHTML = `
                    <div class="target-game-over">
                        <h3>Time's Up! ⏱️</h3>
                        <p>Your Final Score: ${score}</p>
                    </div>
                `;
            }
        }, 1000);
    }

    restartBtn.addEventListener("click", startTimer);
    startTimer();

    currentCleanup = () => {
        isRunning = false;
        if (timer) clearInterval(timer);
    };
}


/* ==============================================================
   ✂️📄🪨 GAME 9: ROCK PAPER SCISSORS
   ============================================================== */

function launchRockPaperScissors() {
    gameContainer.innerHTML = `
        <div class="mini-game">
            <div class="game-score-board" id="rpsResult">Choose your move to start!</div>
            <div class="rps-choices">
                <button class="rps-btn" data-choice="Rock">🪨 Rock</button>
                <button class="rps-btn" data-choice="Paper">📄 Paper</button>
                <button class="rps-btn" data-choice="Scissors">✂️ Scissors</button>
            </div>
            <div class="rps-score-details">
                <div>Player: <span id="rpsPlayerScore">0</span></div>
                <div>Computer: <span id="rpsCompScore">0</span></div>
            </div>
        </div>
    `;

    const resultEl = document.getElementById("rpsResult");
    const playerScoreEl = document.getElementById("rpsPlayerScore");
    const compScoreEl = document.getElementById("rpsCompScore");
    const buttons = document.querySelectorAll(".rps-btn");

    let playerScore = 0;
    let compScore = 0;
    const choices = ["Rock", "Paper", "Scissors"];

    function playRPS(playerChoice) {
        const compChoice = choices[Math.floor(Math.random() * 3)];

        if (playerChoice === compChoice) {
            resultEl.textContent = `Tie! Both chose ${playerChoice}`;
        } else if (
            (playerChoice === "Rock" && compChoice === "Scissors") ||
            (playerChoice === "Paper" && compChoice === "Rock") ||
            (playerChoice === "Scissors" && compChoice === "Paper")
        ) {
            playerScore++;
            playerScoreEl.textContent = playerScore;
            resultEl.textContent = `You Win! ${playerChoice} beats ${compChoice} 🎉`;
        } else {
            compScore++;
            compScoreEl.textContent = compScore;
            resultEl.textContent = `You Lose! ${compChoice} beats ${playerChoice} 😞`;
        }
    }

    buttons.forEach(btn => {
        btn.addEventListener("click", function() {
            playRPS(this.dataset.choice);
        });
    });

    currentCleanup = () => {};
}