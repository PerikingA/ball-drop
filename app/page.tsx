"use client";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type SportItem = { item: string, background: string };
type LockerSportItem = { items: string[], background: string };

type SportItems = {
  basketball: SportItem;
  football: SportItem;
  soccer: SportItem;
  baseball: SportItem;
  volleyball: SportItem;
  tennis: SportItem;
  locker: LockerSportItem; // Updated to have items array
};


const sportItems: SportItems = {
  basketball: { item: '/basketball.png', background: '/basketball-bg.jpg' },
  football: { item: '/football.png', background: '/football-bg.jpg' },
  soccer: { item: '/soccer.png', background: '/soccer-bg.jpg' },
  baseball: { item: '/baseball.png', background: '/baseball-bg.jpg' },
  volleyball: { item: '/volleyball.png', background: '/vb-bg.jpg' },
  tennis: { item: '/tennis.png', background: '/tennis-bg.jpg' },
  locker: { 
    items: ['/basketball.png', '/football.png', '/soccer.png', '/baseball.png', '/volleyball.png', '/tennis.png'],
    background: '/gym-locker.jpg' 
  }
};



const INITIAL_BALL_COUNT = 10; // Number of balls in the set

export default function Home() {
  const initialTime = 25;
  const [sport, setSport] = useState<string>('');
  const [items, setItems] = useState<{ id: number, src: string, left: string }[]>([]);
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [ballCount, setBallCount] = useState<number>(INITIAL_BALL_COUNT);
  const [basketPosition, setBasketPosition] = useState<number>(50); // Initial basket position (percentage)
  const [score, setScore] = useState<number>(0);
  const [backgroundImage, setBackgroundImage] = useState<string>('/gym-locker.jpg'); // New state for background image
  const ballIdCounter = useRef<number>(0);
  const caughtBalls = useRef<Set<number>>(new Set()); // Track caught balls
  const [inputValue, setInputValue] = useState('');

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
        if (sport === 'locker') {
          // Handle the locker room separately
          const allBallImages = sportItems.locker.items;
          const newBalls = Array(ballCount).fill(null).map(() => {
            const randomImage = allBallImages[Math.floor(Math.random() * allBallImages.length)];
            return {
              id: ballIdCounter.current++,
              src: randomImage, // src is a string for locker
              left: `${Math.random() * 100}%`
            };
          });
  
          setItems(prevItems => [...prevItems, ...newBalls]);
        } else if (sportItems[sport as keyof SportItems]) {
          // Handle other sports
          const sportItem = sportItems[sport as keyof SportItems] as SportItem;
          const newBalls = Array(ballCount).fill(null).map(() => ({
            id: ballIdCounter.current++,
            src: sportItem.item, // src is a string for other sports
            left: `${Math.random() * 100}%`
          }));
  
          setItems(prevItems => [...prevItems, ...newBalls]);
        } else {
          setError('Pick another sport');
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
  

  // Handles "Enter" key press to start the timer and drop the ball
const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
  const newSport = event.currentTarget.value.toLowerCase();
  
  if (event.key === 'Enter') {
    if (sportItems[newSport as keyof SportItems]) {
      setError(''); // Clear the error if a valid sport is entered

      if (newSport === sport) {
        // Start the game if timer is not running and sport is valid
        if (!timerStarted) {
          resetTimer();
          startTimer();
          handleDrop();
        }
      } else if (newSport === 'locker') {
        // Locker room
        if (!timerStarted) {
          resetTimer();
          setSport('locker');
          setBackgroundImage(sportItems.locker.background);
        }
      } else {
        // Switch to a new sport
        resetTimer();
        setSport(newSport);
        setBackgroundImage(sportItems[newSport as keyof SportItems].background);
      }
    } else {
      setError('Invalid sport, pick another sport');
    }
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
    setScore(0);
    caughtBalls.current.clear();
  };

  // Handle ball drop based on the selected sport
  const handleDrop = () => {

    if (sport === 'locker') {
      // Drop balls with random images from the locker array
      const allBallImages = sportItems.locker.items;
      const newBalls = Array(ballCount).fill(null).map(() => {
        const randomImage = allBallImages[Math.floor(Math.random() * allBallImages.length)];
        return {
          id: ballIdCounter.current++,
          src: randomImage, // src is a string for locker
          left: `${Math.random() * 100}%`
        };
      });
      setItems(prevItems => [...prevItems, ...newBalls]);
    } else if (sportItems[sport as keyof SportItems]) {
      // Drop balls for the selected sport
      const sportItem = sportItems[sport as keyof SportItems] as SportItem;
      const newBalls = Array(ballCount).fill(null).map(() => ({
        id: ballIdCounter.current++,
        src: sportItem.item, // src is a string for other sports
        left: `${Math.random() * 100}%`
      }));
      setItems(prevItems => [...prevItems, ...newBalls]);
    } else {
      setError('Pick another sport');
    }
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
    if (basket && timeLeft > 0) {
      const basketRect = basket.getBoundingClientRect();

      setItems(prevItems => {
        const newItems = prevItems.filter(item => {
          const ball = document.getElementById(`ball-${item.id}`);
          if (ball && !caughtBalls.current.has(item.id)) {
            const ballRect = ball.getBoundingClientRect();

            if (
              ballRect.bottom >= basketRect.top &&
              ballRect.left >= basketRect.left &&
              ballRect.right <= basketRect.right
            ) {
              caughtBalls.current.add(item.id);
              setScore(prevScore => prevScore + 1);
              return false; // Remove the ball
            }
          }
          return true; // Keep the ball
        });
        
        return newItems;
      });
    }
  };

  const collisionInterval = setInterval(handleCollision, 100);

  return () => clearInterval(collisionInterval);
}, [items, timeLeft]);


  // Handle input value change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
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
            value={inputValue}
            onChange={handleChange}
            onKeyUp={handleKeyPress}
            placeholder="Enter a sport"
            style={{ marginBottom: '10px' }}
            disabled={timerStarted} // Disable input field when timer is running
          />
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
        <button 
          onClick={() => {
            if (sportItems[sport as keyof SportItems] && sport === inputValue.toLowerCase()) {
              setError(''); // Clear the error if the sport matches the background
              startTimer();
              handleDrop();
            } else {
              setError('Please enter a sport that matches the background.');
            }
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
