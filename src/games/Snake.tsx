import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

function Snake() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    generateFood();
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(currentSnake => {
      const newHead = {
        x: (currentSnake[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (currentSnake[0].y + direction.y + GRID_SIZE) % GRID_SIZE
      };

      // Check collision with self
      if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return currentSnake;
      }

      const newSnake = [newHead, ...currentSnake];

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 1);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsPaused(p => !p);
        return;
      }

      const newDirection = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      }[e.key];

      if (newDirection) {
        setDirection(current => {
          // Prevent moving in opposite direction
          if (current.x === -newDirection.x && current.y === -newDirection.y) {
            return current;
          }
          return newDirection;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, 150);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Snake Game</h1>
        <p className="text-xl mb-2">Score: {score}</p>
        {isPaused && <p className="text-yellow-400">PAUSED</p>}
      </div>

      <div 
        className="relative bg-gray-800 border-2 border-purple-500"
        style={{ 
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE
        }}
      >
        {snake.map((segment, i) => (
          <div
            key={i}
            className="absolute bg-green-500"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE
            }}
          />
        ))}
        <div
          className="absolute bg-red-500"
          style={{
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE
          }}
        />
      </div>

      {gameOver && (
        <div className="mt-4 text-center">
          <p className="text-2xl text-red-500 mb-2">Game Over!</p>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Use arrow keys to move • Space to pause
        </p>
      </div>
    </div>
  );
}

export default Snake;