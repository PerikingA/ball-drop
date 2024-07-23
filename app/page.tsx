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

const INITIAL_BALL_COUNT = 20; // Number of balls in the set

export default function Home() {
  const initialTime = 30;
  const [sport, setSport] = useState<string>('');
  const [items, setItems] = useState<{src: string, left: string}[]>([]);
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [ballCount, setBallCount] = useState<number>(INITIAL_BALL_COUNT); 

  // Calculate speed based on ball count
  const calculateSpeed = () => {
    // Slowest speed for the first few seconds, increasing speed as time progresses
    const maxSpeed = 1; // Slowest speed
    const minSpeed = 0.35; // Fastest speed
    const speedRange = maxSpeed - minSpeed;
    const progress = (initialTime - timeLeft) / initialTime;
    return Math.max(minSpeed, maxSpeed - speedRange * progress);
  };

  // Countdown by 1 second and handle ball dropping
  useEffect(() => {
    let dropInterval: NodeJS.Timeout;
    let timerInterval: NodeJS.Timeout;

    if (timerStarted && timeLeft > 0) {
      // Add balls per second
      dropInterval = setInterval(() => {
        if (sportItems[sport as keyof SportItems]) {
          const newBalls = Array(ballCount).fill(null).map(() => ({
            src: sportItems[sport as keyof SportItems],
            left: `${Math.random() * 100}%`
          }));

          setItems(prevItems => [...prevItems, ...newBalls]);
        }
      }, 1000);

      // Countdown timer
      timerInterval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(dropInterval);
        clearInterval(timerInterval);
      };
    } else if (timeLeft === 0) {
      setTimerStarted(false); 
    }

    return () => clearInterval(dropInterval);
  }, [timerStarted, timeLeft, sport, ballCount]);

  // Handles ball drop based on the selected sport
  const handleDrop = () => {
    if (sportItems[sport as keyof SportItems]) {
      setItems(prevItems => [
        ...prevItems,
        ...Array(ballCount).fill(null).map(() => ({
          src: sportItems[sport as keyof SportItems],
          left: `${Math.random() * 100}%`
        }))
      ]);
      setError('');
    } else {
      setError('Pick another sport');
    }
  };

  // Handles "Enter" key press to start the timer and drop the ball
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !timerStarted) {
      startTimer(); // Start the timer when "Enter" is pressed
      handleDrop(); // Drops balls immediately
    }
  };

  // Starts the timer and ensures the ball starts dropping
  const startTimer = () => {
    if (!timerStarted && sportItems[sport as keyof SportItems]) {
      setTimerStarted(true); 
      setTimeLeft(initialTime); 
    }
  };

  // Resets the timer and clears the sport input and items
  const resetTimer = () => {
    setTimeLeft(initialTime); 
    setTimerStarted(false); 
    setItems([]); 
    setSport('');
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
          onChange={(e) => {
            if (!timerStarted) { // Allow sport change only when timer is not running
              setSport(e.target.value.toLowerCase());
            }
          }}
          onKeyUp={handleKeyPress}
          placeholder="Enter your favorite sport"
          style={{ marginBottom: '10px' }}
          disabled={timerStarted} // Disable input field when timer is running
        />
        <button 
          onClick={() => {
            startTimer(); // Start the timer and drop the ball
          }} 
          disabled={timeLeft === 0 || timerStarted} 
        >
          Go
        </button>
        <button onClick={resetTimer}>Reset</button>
      </div>
      {error && <p>{error}</p>}
      {items.map((item, index) => (
        <motion.img
          key={`${item.src}-${index}`} // Unique key to ensure independent drops
          src={item.src}
          alt="Dropping item"
          style={{
            position: 'absolute',
            top: 0,
            left: item.left, // Random horizontal position
            transform: 'translateX(-50%)',
            width: '25px',
            maxWidth: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
          initial={{ y: -100, opacity: 1 }}
          animate={{ y: '100vh', opacity: 1 }}
          transition={{ duration: calculateSpeed(), delay: index * 0.5 }}
        />
      ))}
    </div>
  );
}
