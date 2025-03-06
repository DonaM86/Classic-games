import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 15;
const CELL_SIZE = 30;

type Position = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';

const INITIAL_PACMAN: Position = { x: 7, y: 11 };
const INITIAL_GHOSTS: Position[] = [
  { x: 1, y: 1 },
  { x: 13, y: 1 },
  { x: 1, y: 13 },
  { x: 13, y: 13 }
];

const WALLS = [
  // Outer walls
  ...Array.from({ length: GRID_SIZE }, (_, i) => ({ x: i, y: 0 })),
  ...Array.from({ length: GRID_SIZE }, (_, i) => ({ x: i, y: GRID_SIZE - 1 })),
  ...Array.from({ length: GRID_SIZE }, (_, i) => ({ x: 0, y: i })),
  ...Array.from({ length: GRID_SIZE }, (_, i) => ({ x: GRID_SIZE - 1, y: i })),
  // Inner obstacles
  { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
  { x: 9, y: 3 }, { x: 10, y: 3 }, { x: 11, y: 3 },
  { x: 3, y: 11 }, { x: 4, y: 11 }, { x: 5, y: 11 },
  { x: 9, y: 11 }, { x: 10, y: 11 }, { x: 11, y: 11 },
  { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 },
  { x: 7, y: 9 }, { x: 7, y: 8 }
];

function Pacman() {
  const [pacman, setPacman] = useState<Position>(INITIAL_PACMAN);
  const [ghosts, setGhosts] = useState<Position[]>(INITIAL_GHOSTS);
  const [direction, setDirection] = useState<Direction>('right');
  const [score, setScore] = useState(0);
  const [dots, setDots] = useState<Position[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const initializeDots = useCallback(() => {
    const newDots: Position[] = [];
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      for (let y = 1; y < GRID_SIZE - 1; y++) {
        if (!WALLS.some(wall => wall.x === x && wall.y === y)) {
          newDots.push({ x, y });
        }
      }
    }
    setDots(newDots);
  }, []);

  useEffect(() => {
    initializeDots();
  }, [initializeDots]);

  const isWall = (pos: Position) => {
    return WALLS.some(wall => wall.x === pos.x && wall.y === pos.y);
  };

  const moveGhosts = useCallback(() => {
    setGhosts(currentGhosts => {
      return currentGhosts.map(ghost => {
        const possibleMoves = [
          { x: ghost.x + 1, y: ghost.y },
          { x: ghost.x - 1, y: ghost.y },
          { x: ghost.x, y: ghost.y + 1 },
          { x: ghost.x, y: ghost.y - 1 }
        ].filter(pos => !isWall(pos));

        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        return randomMove || ghost;
      });
    });
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const directions: { [key: string]: Direction } = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right'
      };

      if (directions[e.key]) {
        setDirection(directions[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (gameOver || gameWon) return;

    const moveInterval = setInterval(() => {
      setPacman(current => {
        const newPos = { ...current };
        switch (direction) {
          case 'up': newPos.y--; break;
          case 'down': newPos.y++; break;
          case 'left': newPos.x--; break;
          case 'right': newPos.x++; break;
        }

        if (isWall(newPos)) return current;
        return newPos;
      });

      moveGhosts();
    }, 200);

    return () => clearInterval(moveInterval);
  }, [direction, gameOver, gameWon, moveGhosts]);

  useEffect(() => {
    // Check for dot collection
    const dotIndex = dots.findIndex(dot => dot.x === pacman.x && dot.y === pacman.y);
    if (dotIndex !== -1) {
      const newDots = [...dots];
      newDots.splice(dotIndex, 1);
      setDots(newDots);
      setScore(s => s + 10);

      if (newDots.length === 0) {
        setGameWon(true);
      }
    }

    // Check for ghost collision
    if (ghosts.some(ghost => ghost.x === pacman.x && ghost.y === pacman.y)) {
      setGameOver(true);
    }
  }, [pacman, ghosts, dots]);

  const resetGame = () => {
    setPacman(INITIAL_PACMAN);
    setGhosts(INITIAL_GHOSTS);
    setDirection('right');
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    initializeDots();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Pacman</h1>
        <p className="text-xl">Score: {score}</p>
      </div>

      <div
        className="relative bg-gray-800 border-2 border-purple-500"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE
        }}
      >
        {/* Walls */}
        {WALLS.map((wall, i) => (
          <div
            key={i}
            className="absolute bg-blue-800"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: wall.x * CELL_SIZE,
              top: wall.y * CELL_SIZE
            }}
          />
        ))}

        {/* Dots */}
        {dots.map((dot, i) => (
          <div
            key={i}
            className="absolute bg-yellow-200 rounded-full"
            style={{
              width: CELL_SIZE / 4,
              height: CELL_SIZE / 4,
              left: dot.x * CELL_SIZE + CELL_SIZE / 2.5,
              top: dot.y * CELL_SIZE + CELL_SIZE / 2.5
            }}
          />
        ))}

        {/* Pacman */}
        <div
          className="absolute bg-yellow-400 rounded-full"
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: pacman.x * CELL_SIZE + 2,
            top: pacman.y * CELL_SIZE + 2
          }}
        />

        {/* Ghosts */}
        {ghosts.map((ghost, i) => (
          <div
            key={i}
            className="absolute bg-red-500 rounded-t-2xl"
            style={{
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
              left: ghost.x * CELL_SIZE + 2,
              top: ghost.y * CELL_SIZE + 2
            }}
          />
        ))}
      </div>

      {(gameOver || gameWon) && (
        <div className="mt-4 text-center">
          <p className="text-2xl mb-2">
            {gameWon ? 'You Won!' : 'Game Over!'}
          </p>
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
          Use arrow keys to move
        </p>
      </div>
    </div>
  );
}

export default Pacman;
