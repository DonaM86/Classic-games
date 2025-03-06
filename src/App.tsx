import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { TowerControl as GameController, Menu } from 'lucide-react';
import Snake from './games/Snake';
import Pacman from './games/Pacman';
import TicTacToe from './games/TicTacToe';
import Hangman from './games/Hangman';

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden fixed top-4 right-4 z-50 p-2 bg-purple-600 rounded-full"
        >
          <Menu size={24} />
        </button>

        {/* Sidebar Navigation */}
        <nav className={`
          fixed top-0 left-0 h-full w-64 bg-gray-800 p-6 transform transition-transform duration-200 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}>
          <div className="flex items-center gap-2 mb-8">
            <GameController className="text-purple-500" size={32} />
            <h1 className="text-2xl font-bold">Classic Games</h1>
          </div>
          
          <div className="space-y-4">
            {[
              { path: '/snake', name: 'Snake' },
              { path: '/pacman', name: 'Pacman' },
              { path: '/tictactoe', name: 'Tic Tac Toe' },
              { path: '/hangman', name: 'Hangman' }
            ].map((game) => (
              <Link
                key={game.path}
                to={game.path}
                className="block py-2 px-4 rounded hover:bg-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {game.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className={`
          min-h-screen transition-all duration-200 ease-in-out
          md:ml-64
        `}>
          <Routes>
            <Route path="/" element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Welcome to Classic Games</h1>
                  <p className="text-gray-400">Select a game from the menu to start playing!</p>
                </div>
              </div>
            } />
            <Route path="/snake" element={<Snake />} />
            <Route path="/pacman" element={<Pacman />} />
            <Route path="/tictactoe" element={<TicTacToe />} />
            <Route path="/hangman" element={<Hangman />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;