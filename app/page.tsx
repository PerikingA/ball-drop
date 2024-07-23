"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type SportItems = {
  basketball: string;
  football: string;
  soccer: string;
  baseball: string;
  volleyball: string;
  tennis: string;
};

const sportItems: SportItems = {
  basketball: '/basketball.png',
  football: '/football.png',
  soccer: '/soccer.png',
  baseball: '/baseball.png',
  volleyball: '/volleyball.png',
  tennis: '/tennis.png'
};


export default function Home() {

  const initialTime = 30;

  const [sport, setSport] = useState<string>('');
  const [items, setItems] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  // set initial time
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);

  // countdown by 1 second
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerStarted, timeLeft]);

  const handleDrop = () => {
    if (sportItems[sport as keyof SportItems]) {
      setItems([...items, sportItems[sport as keyof SportItems]]);
      setError('');
    } else {
      setError('Pick another sport');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      startTimer();
      handleDrop();
    }
  };

  const startTimer = () => {
    if (!timerStarted) {
      setTimerStarted(true);
    }
  };

  // reset timer back to initial value
  const resetTimer = () => {
    setTimeLeft(initialTime);
    setTimerStarted(false);
    setItems([]);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
        <p>Time Left: {timeLeft} seconds</p>
      </div>
      <div style={{ marginTop: '50px', textAlign: 'center' }}>
        <input
          type="text"
          value={sport}
          onChange={(e) => setSport(e.target.value.toLowerCase())}
          onKeyUp={handleKeyPress}
          placeholder="Enter your favorite sport"
          style={{ marginBottom: '10px' }}
        />
        <button 
          onClick={() => {
            startTimer();
            handleDrop();
          }} 
          disabled={timeLeft === 0}
        >
          Go
        </button>
        <button onClick={resetTimer}>Reset</button>
      </div>
      {error && <p>{error}</p>}
      {items.map((item, index) => (
        <motion.img
          key={index}
          src={item}
          alt="Dropping item"
          style={{
            position: 'absolute',
            top: 0,
            left: `${Math.random() * 100}%`, // Random horizontal position
            transform: 'translateX(-50%)',
            width: '100px',
          }}
          initial={{ y: -100, opacity: 1 }}
          animate={{ y: '100vh', opacity: 1 }}
          transition={{ duration: 2, delay: index * 0.5 }} // Staggered drop
        />
      ))}
    </div>
  );
}
