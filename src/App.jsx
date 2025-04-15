import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://random-word-api.herokuapp.com/word?length=5";
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

function App() {
  const [solution, setSolution] = useState("");
  const [guesses, setGuesses] = useState([]); // now stores { guess, status } objects
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      const response = await fetch(API_URL);
      const words = await response.json();
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setSolution(randomWord);
    };
    fetchWords();
  }, []);

  useEffect(() => {
    const handleType = (event) => {
      if (isGameOver) return;

      if (event.key === "Enter") {
        if (currentGuess.length !== WORD_LENGTH) return;

        const status = getGuessStatus(currentGuess, solution);
        const newGuesses = [...guesses, { guess: currentGuess, status }];
        setGuesses(newGuesses);
        setCurrentGuess("");

        if (currentGuess === solution || newGuesses.length === MAX_GUESSES) {
          setIsGameOver(true);
        }
      } else if (event.key === "Backspace") {
        setCurrentGuess(currentGuess.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess(currentGuess + event.key.toLowerCase());
        }
      }
    };

    window.addEventListener("keydown", handleType);
    return () => window.removeEventListener("keydown", handleType);
  }, [currentGuess, guesses, solution, isGameOver]);

  return (
    <div className="board">
      {solution}
      {Array.from({ length: MAX_GUESSES }).map((_, i) => {
        const guessObj = guesses[i];
        const isCurrentGuess = i === guesses.length;
        return (
          <Line
            key={i}
            guess={isCurrentGuess ? currentGuess : guessObj?.guess ?? ""}
            status={guessObj?.status ?? []} // doesn'tm throw error if object is not undefined/null
          />
        );
      })}
    </div>
  );
}

function Line({ guess, status = [] }) {
  const tiles = [];

  for (let i = 0; i < WORD_LENGTH; i++) {
    const char = guess[i] || "";
    const state = status[i] || "";
    tiles.push(
      <div key={i} className={`tile ${state}`}>
        {char}
      </div>
    );
  }

  return <div className="line">{tiles}</div>;
}

function getGuessStatus(guess, solution) {
  const result = Array(guess.length).fill("absent");
  const solutionLetters = solution.split("");

  // First pass: correct positions
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === solution[i]) {
      result[i] = "correct";
      solutionLetters[i] = null;
    }
  }

  // Second pass: wrong position but exists
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "correct") continue;
    const index = solutionLetters.indexOf(guess[i]);
    if (index !== -1) {
      result[i] = "present";
      solutionLetters[index] = null;
    }
  }

  return result;
}

export default App;
