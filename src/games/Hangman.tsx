import React, { useState, useEffect } from 'react';
import { HelpCircle, Trophy, RotateCcw } from 'lucide-react';

type Category = 'animals' | 'celebrities' | 'movies' | 'sports' | 'food';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Word {
  word: string;
  hint: string;
  difficulty: Difficulty;
}

const WORD_LIST: Record<Category, Word[]> = {
  animals: [
    { word: 'ELEPHANT', hint: 'Largest land mammal with a trunk', difficulty: 'easy' },
    { word: 'PENGUIN', hint: 'Flightless bird that loves the cold', difficulty: 'easy' },
    { word: 'GIRAFFE', hint: 'Tallest land animal with a long neck', difficulty: 'easy' },
    { word: 'PLATYPUS', hint: 'Egg-laying mammal with a duck bill', difficulty: 'medium' },
    { word: 'CHAMELEON', hint: 'Reptile that changes color', difficulty: 'hard' }
  ],
  celebrities: [
    { word: 'BEYONCE', hint: 'Queen B, famous singer', difficulty: 'easy' },
    { word: 'DICAPRIO', hint: 'Titanic actor who finally won an Oscar', difficulty: 'medium' },
    { word: 'SPIELBERG', hint: 'Director of Jurassic Park and E.T.', difficulty: 'medium' },
    { word: 'ZENDAYA', hint: 'Euphoria and Spider-Man actress', difficulty: 'easy' },
    { word: 'SCHWARZENEGGER', hint: 'I\'ll be back', difficulty: 'hard' }
  ],
  movies: [
    { word: 'INCEPTION', hint: 'Dream within a dream', difficulty: 'medium' },
    { word: 'AVATAR', hint: 'Blue aliens on Pandora', difficulty: 'easy' },
    { word: 'INTERSTELLAR', hint: 'Space travel through a black hole', difficulty: 'hard' },
    { word: 'JAWS', hint: 'Dangerous shark', difficulty: 'easy' },
    { word: 'PULPFICTION', hint: 'Quentin Tarantino\'s masterpiece', difficulty: 'medium' }
  ],
  sports: [
    { word: 'BASKETBALL', hint: 'Slam dunk sport', difficulty: 'medium' },
    { word: 'TENNIS', hint: 'Love means zero', difficulty: 'easy' },
    { word: 'VOLLEYBALL', hint: 'Beach sport with a net', difficulty: 'medium' },
    { word: 'CRICKET', hint: 'Popular in India and England', difficulty: 'easy' },
    { word: 'BADMINTON', hint: 'Shuttlecock sport', difficulty: 'medium' }
  ],
  food: [
    { word: 'SPAGHETTI', hint: 'Italian noodles', difficulty: 'medium' },
    { word: 'SUSHI', hint: 'Japanese raw fish dish', difficulty: 'easy' },
    { word: 'GUACAMOLE', hint: 'Avocado-based dip', difficulty: 'hard' },
    { word: 'PIZZA', hint: 'Italian pie with toppings', difficulty: 'easy' },
    { word: 'CROISSANT', hint: 'French crescent-shaped pastry', difficulty: 'medium' }
  ]
};

const MAX_TRIES = 6;

const HANGMAN_DRAWINGS = [
  // 0 mistakes (empty gallows)
  `
  +---+
  |   |
      |
      |
      |
      |
=========`,
  // 1 mistake (head)
  `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
  // 2 mistakes (head and torso)
  `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
  // 3 mistakes (head, torso, and one arm)
  `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
  // 4 mistakes (head, torso, and both arms)
  `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
  // 5 mistakes (head, torso, both arms, and one leg)
  `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
  // 6 mistakes (complete hangman)
  `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`
];

function Hangman() {
  const [category, setCategory] = useState<Category>('animals');
  const [currentWord, setCurrentWord] = useState<Word>({ word: '', hint: '', difficulty: 'easy' });
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [remainingTries, setRemainingTries] = useState(MAX_TRIES);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showHint, setShowHint] = useState(false);

  const initializeGame = () => {
    const wordList = WORD_LIST[category];
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWord(randomWord);
    setGuessedLetters(new Set());
    setRemainingTries(MAX_TRIES);
    setGameStatus('playing');
    setShowHint(false);
  };

  useEffect(() => {
    initializeGame();
  }, [category]);

  const calculateWordScore = (word: string, remainingTries: number, difficulty: Difficulty) => {
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 };
    return Math.round(
      word.length * 10 * difficultyMultiplier[difficulty] * (remainingTries / MAX_TRIES)
    );
  };

  const guessLetter = (letter: string) => {
    if (gameStatus !== 'playing') return;

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.word.includes(letter)) {
      const newRemainingTries = remainingTries - 1;
      setRemainingTries(newRemainingTries);
      
      if (newRemainingTries === 0) {
        setGameStatus('lost');
        setStreak(0);
      }
    } else {
      const isWon = [...currentWord.word].every(char => newGuessedLetters.has(char));
      if (isWon) {
        const wordScore = calculateWordScore(currentWord.word, remainingTries, currentWord.difficulty);
        setScore(prev => prev + wordScore);
        setHighScore(prev => Math.max(prev, score + wordScore));
        setStreak(prev => prev + 1);
        setGameStatus('won');
      }
    }
  };

  const renderWord = () => {
    return currentWord.word.split('').map((letter, index) => (
      <span key={index} className="mx-1 text-4xl font-mono">
        {guessedLetters.has(letter) ? letter : '_'}
      </span>
    ));
  };

  const renderKeyboard = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return (
      <div className="grid grid-cols-7 gap-2 max-w-md mx-auto">
        {alphabet.map(letter => {
          const isGuessed = guessedLetters.has(letter);
          const isCorrect = currentWord.word.includes(letter) && isGuessed;
          const isWrong = !currentWord.word.includes(letter) && isGuessed;

          return (
            <button
              key={letter}
              onClick={() => guessLetter(letter)}
              disabled={isGuessed || gameStatus !== 'playing'}
              className={`
                p-2 text-lg font-bold rounded transition-colors
                ${isGuessed
                  ? isCorrect
                    ? 'bg-green-600 cursor-not-allowed'
                    : isWrong
                      ? 'bg-red-600 cursor-not-allowed'
                      : 'bg-gray-700 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'}
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Hangman</h1>

      {showTutorial && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 max-w-md">
          <h2 className="text-xl font-bold mb-2">How to Play</h2>
          <p className="text-gray-300 mb-2">Guess the word one letter at a time. Don't let the hangman complete!</p>
          <ul className="list-disc list-inside text-gray-300 mb-4">
            <li>Choose a category</li>
            <li>Click letters to guess</li>
            <li>Use hints wisely</li>
            <li>6 wrong guesses and you lose</li>
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
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            <option value="animals">Animals</option>
            <option value="celebrities">Celebrities</option>
            <option value="movies">Movies</option>
            <option value="sports">Sports</option>
            <option value="food">Food</option>
          </select>

          <button
            onClick={() => setShowHint(true)}
            className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700 flex items-center gap-2"
            disabled={showHint}
          >
            <HelpCircle size={20} />
            Show Hint
          </button>
        </div>

        <div className="flex gap-4 items-center justify-center bg-gray-800 p-3 rounded-lg">
          <Trophy className="text-yellow-400" />
          <div className="text-sm">
            <span className="text-yellow-400">Score: {score}</span>
            {' • '}
            <span className="text-purple-400">High Score: {highScore}</span>
            {' • '}
            <span className="text-green-400">Streak: {streak}</span>
          </div>
          <button
            onClick={() => {
              setScore(0);
              setHighScore(0);
              setStreak(0);
            }}
            className="p-1 hover:bg-gray-700 rounded"
            title="Reset Stats"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="mb-8 text-center">
        <pre className="font-mono text-sm mb-4 text-purple-400">
          {HANGMAN_DRAWINGS[MAX_TRIES - remainingTries]}
        </pre>
        <p className="text-xl mb-2">Tries Remaining: {remainingTries}</p>
        {showHint && (
          <p className="text-lg mb-4 text-purple-300">
            Hint: {currentWord.hint}
            <span className="ml-2 text-xs text-gray-400">
              (Difficulty: {currentWord.difficulty})
            </span>
          </p>
        )}
        <div className="mb-8">{renderWord()}</div>
      </div>

      {gameStatus === 'playing' ? (
        renderKeyboard()
      ) : (
        <div className="text-center">
          <p className="text-2xl mb-4">
            {gameStatus === 'won' 
              ? `Congratulations! You won! (+${calculateWordScore(currentWord.word, remainingTries, currentWord.difficulty)} points)`
              : `Game Over! The word was: ${currentWord.word}`}
          </p>
          <button
            onClick={initializeGame}
            className="px-6 py-2 bg-purple-600 rounded hover:bg-purple-700"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default Hangman;