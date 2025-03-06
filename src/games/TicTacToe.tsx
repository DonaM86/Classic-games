import { useState, useEffect } from "react";
import { Trophy, RotateCcw } from "lucide-react";

type Player = "X" | "O";
type Board = (Player | null)[];
type GameMode = "ai" | "human";
type GameStats = { wins: number; losses: number; draws: number };

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columns
  [0, 4, 8],
  [2, 4, 6], // Diagonals
];

const AI_INSULTS = [
  "Ha! You thought you had a chance?",
  "Is that all you've got?",
  "Come on, is that your best move?",
  "Better luck next time, amateur!",
  "You’re making this too easy for me!",
  "Was that supposed to be a move?",
];

function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("human");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [stats, setStats] = useState<GameStats>({
    wins: 0,
    losses: 0,
    draws: 0,
  });
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [aiInsult, setAiInsult] = useState<string | null>(null); // To store insult

  const checkWinner = (
    squares: Board
  ): [Player | "Draw" | null, number[] | null] => {
    for (const line of WINNING_COMBINATIONS) {
      const [a, b, c] = line;
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return [squares[a] as Player, line];
      }
    }
    return [squares.every((square) => square !== null) ? "Draw" : null, null];
  };

  const getEmptySquares = (squares: Board): number[] => {
    return squares.reduce<number[]>(
      (acc, cell, idx) => (cell === null ? [...acc, idx] : acc),
      []
    );
  };

  const minimax = (
    squares: Board,
    depth: number,
    isMaximizing: boolean
  ): number => {
    const [result] = checkWinner(squares);
    if (result === "O") return 10 - depth; // AI wins, return a high score
    if (result === "X") return depth - 10; // Player wins, return a low score
    if (result === "Draw") return 0; // It's a draw, return 0

    const emptySquares = getEmptySquares(squares);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const move of emptySquares) {
        squares[move] = "O"; // AI move
        const score = minimax(squares, depth + 1, false); // Recursively call for the next player
        squares[move] = null; // Undo move
        bestScore = Math.max(bestScore, score); // Maximize score for AI
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const move of emptySquares) {
        squares[move] = "X"; // Player move
        const score = minimax(squares, depth + 1, true); // Recursively call for the AI's turn
        squares[move] = null; // Undo move
        bestScore = Math.min(bestScore, score); // Minimize score for player
      }
      return bestScore;
    }
  };

  const getAIMove = (squares: Board): number => {
    const emptySquares = getEmptySquares(squares);

    // In "easy" mode, AI makes random moves
    if (difficulty === "easy") {
      return emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }

    // In "medium" mode, AI will sometimes make random moves but also try to block or win
    if (difficulty === "medium" && Math.random() < 0.3) {
      return emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }

    // In "hard" mode, AI will use the minimax algorithm to find the optimal move
    let bestScore = -Infinity;
    let bestMove = emptySquares[0];

    for (const move of emptySquares) {
      squares[move] = "O"; // AI move
      const score = minimax(squares, 0, false); // Evaluate the move
      squares[move] = null; // Undo move

      if (score > bestScore) {
        bestScore = score; // Maximize the score for the AI
        bestMove = move; // Store the best move
      }
    }

    return bestMove;
  };

  useEffect(() => {
    if (gameMode === "ai" && currentPlayer === "O" && !winner) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove([...board]);
        handleClick(aiMove);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, gameMode]);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const [gameWinner, line] = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      updateStats(gameWinner);
      if (gameWinner === "O") {
        setAiInsult(AI_INSULTS[Math.floor(Math.random() * AI_INSULTS.length)]);
      }
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const updateStats = (result: Player | "Draw") => {
    setStats((prev) => {
      if (result === "Draw") return { ...prev, draws: prev.draws + 1 };
      if (result === "X") return { ...prev, wins: prev.wins + 1 };
      return { ...prev, losses: prev.losses + 1 };
    });
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine(null);
    setAiInsult(null); // Reset insult
  };

  const resetStats = () => {
    setStats({ wins: 0, losses: 0, draws: 0 });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Tic Tac Toe</h1>

      {showTutorial && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 max-w-md">
          <h2 className="text-xl font-bold mb-2">How to Play</h2>
          <p className="text-gray-300 mb-2">
            Get three in a row to win! Play against a friend or challenge the
            AI.
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4">
            <li>Click any empty square to make your move</li>
            <li>X always goes first</li>
            <li>Three difficulties available in AI mode</li>
          </ul>
          <button
            onClick={() => setShowTutorial(false)}
            className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
          >
            Got it!
          </button>
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <select
            className="bg-gray-700 text-white px-4 py-2 rounded"
            value={gameMode}
            onChange={(e) => {
              setGameMode(e.target.value as GameMode);
              resetGame();
            }}
          >
            <option value="human">vs Human</option>
            <option value="ai">vs AI</option>
          </select>

          {gameMode === "ai" && (
            <select
              className="bg-gray-700 text-white px-4 py-2 rounded"
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value as "easy" | "medium" | "hard");
                resetGame();
              }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          )}
        </div>

        <div className="flex gap-4 items-center justify-center bg-gray-800 p-3 rounded-lg">
          <Trophy className="text-yellow-400" />
          <div className="text-sm">
            <span className="text-green-400">Wins: {stats.wins}</span>
            {" • "}
            <span className="text-red-400">Losses: {stats.losses}</span>
            {" • "}
            <span className="text-gray-400">Draws: {stats.draws}</span>
          </div>
          <button
            onClick={resetStats}
            className="p-1 hover:bg-gray-700 rounded"
            title="Reset Stats"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-8">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`
              w-20 h-20 text-4xl font-bold
              ${cell ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"}
              border-2 ${
                winningLine?.includes(index)
                  ? "border-green-500"
                  : "border-purple-500"
              }
              flex justify-center items-center
            `}
            onClick={() => handleClick(index)}
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
        <div className="mt-6 text-xl font-bold">
          {winner === "Draw" ? (
            "It's a Draw!"
          ) : (
            <>
              {winner === "X" ? "You win!" : "AI wins!"}
              {winner === "O" && aiInsult && (
                <div className="text-red-500 mt-2">{aiInsult}</div>
              )}
            </>
          )}
        </div>
      )}

      <button
        onClick={resetGame}
        className="mt-6 bg-blue-600 px-6 py-2 rounded text-white hover:bg-blue-700"
      >
        Start New Game
      </button>
    </div>
  );
}

export default TicTacToe;
