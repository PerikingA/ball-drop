"use client";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type SportItems = {
  basketball: { item: string, background: string };
  football: { item: string, background: string };
  soccer: { item: string, background: string };
  baseball: { item: string, background: string };
  volleyball: { item: string, background: string };
  tennis: { item: string, background: string }; // Update type to include background image
};

const sportItems: SportItems = {
  basketball: { item: '/basketball.png', background: '/basketball-bg.jpg' },
  football: { item: '/football.png', background: '/football-bg.jpg' },
  soccer: { item: '/soccer.png', background: '/soccer-bg.jpg' },
  baseball: { item: '/baseball.png', background: '/baseball-bg.jpg' },
  volleyball: { item: '/volleyball.png', background: '/vb-bg.jpg' },
  tennis: { item: '/tennis.png', background: '/tennis-bg.jpg' } 
};

const INITIAL_BALL_COUNT = 20; // Number of balls in the set

export default function Home() {
  const initialTime = 7;
  const [sport, setSport] = useState<string>('');
  const [items, setItems] = useState<{ id: number, src: string, left: string }[]>([]);
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [ballCount, setBallCount] = useState<number>(INITIAL_BALL_COUNT);
  const [basketPosition, setBasketPosition] = useState<number>(50); // Initial basket position (percentage)
  const [score, setScore] = useState<number>(0);
  const [backgroundImage, setBackgroundImage] = useState<string>(''); // New state for background image
  const ballIdCounter = useRef<number>(0);
  const caughtBalls = useRef<Set<number>>(new Set()); // Track caught balls

  // Calculate speed based on ball count
  const calculateSpeed = () => {
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
            id: ballIdCounter.current++,
            src: sportItems[sport as keyof SportItems].item, // Use item image URL
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
          id: ballIdCounter.current++,
          src: sportItems[sport as keyof SportItems].item, // Use item image URL
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

  // Resets the timer, score, and clears the sport input and items
  const resetTimer = () => {
    setTimeLeft(initialTime);
    setTimerStarted(false);
    setItems([]);
    setSport('');
    setScore(0);
    caughtBalls.current.clear();
    setBackgroundImage(''); // Reset background image
  };

  // Track mouse movement to update basket position
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const newX = (event.clientX / window.innerWidth) * 100;
      setBasketPosition(newX);
    };

    if (timerStarted) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
    }

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [timerStarted]);

  // Check for collision between ball and basket
  useEffect(() => {
    const handleCollision = () => {
      const basket = document.getElementById('basket');
      if (basket && timeLeft > 0) { // Check if timeLeft > 0
        const basketRect = basket.getBoundingClientRect();

        setItems(prevItems => {
          return prevItems.filter(item => {
            const ball = document.getElementById(`ball-${item.id}`);
            if (ball && !caughtBalls.current.has(item.id)) {
              const ballRect = ball.getBoundingClientRect();

              if (
                ballRect.bottom >= basketRect.top &&
                ballRect.left >= basketRect.left &&
                ballRect.right <= basketRect.right
              ) {
                caughtBalls.current.add(item.id); // Mark the ball as caught
                setScore(prevScore => prevScore + 1);
                return false; // Remove the ball
              }
            }
            return true; // Keep the ball
          });
        });
      }
    };

    const collisionInterval = setInterval(handleCollision, 100);

    return () => clearInterval(collisionInterval);
  }, [items, timeLeft]); // Add timeLeft to the dependency array

  // Update sport and handle reset if timer is done
  const handleSportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSport = e.target.value.toLowerCase();
    if (timeLeft === 0 || sport !== newSport) {
      resetTimer(); // Reset the game if timer is done or sport is changed
    }
    if (!timerStarted) { // Allow sport change only when timer is not running
      setSport(newSport);
      setBackgroundImage(sportItems[newSport as keyof SportItems]?.background || ''); // Set background image based on sport
    }
  };

  return (
    <div 
      style={{
        position: 'relative', 
        height: '100vh', 
        overflow: 'hidden', 
        backgroundImage: `url(${backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
      }}
    >
      <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
        <p>Time Left: {timeLeft} seconds</p>
      </div>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <p>Score: {score}</p>
      </div>
      <div style={{ marginTop: '50px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            type="text"
            value={sport}
            onChange={handleSportChange}
            onKeyUp={handleKeyPress}
            placeholder="Enter your favorite sport"
            style={{ marginBottom: '10px' }}
            disabled={timerStarted} // Disable input field when timer is running
          />
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
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
      {items.map((item, index) => (
        <motion.img
          key={item.id}
          id={`ball-${item.id}`}
          src={item.src}
          alt="Dropping item"
          style={{
            position: 'absolute',
            top: 0,
            left: item.left, // Random horizontal position
            transform: 'translateX(-50%)',
            width: '35px',
            maxWidth: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
          initial={{ y: -100, opacity: 1 }}
          animate={{ y: '100vh', opacity: 1 }}
          transition={{ duration: calculateSpeed(), delay: index * 0.5 }}
        />
      ))}
      {/* Bag */}
      <img
        id="basket"
        src="/bag.png"
        alt="Bag"
        style={{
          position: 'absolute',
          bottom: '10px',
          left: `${basketPosition}%`,
          transform: 'translateX(-50%)',
          width: '120px',
          height: 'auto',
        }}
      />
    </div>
  );
}
