"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';

type SportItems = {
  basketball: string;
  football: string;
  soccer: string;
};

const sportItems: SportItems = {
  basketball: '/basketball.png',
  football: '/football.png',
  soccer: '/soccer.png',
};

export default function Home() {
  const [sport, setSport] = useState<string>('');
  const [items, setItems] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const handleDrop = () => {
    if (sportItems[sport as keyof SportItems]) {
      setItems([...items, sportItems[sport as keyof SportItems]]);
      setError('');
    } else {
      setError('Pick another sport');
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <input
        type="text"
        value={sport}
        onChange={(e) => setSport(e.target.value.toLowerCase())}
        placeholder="Enter your favorite sport"
      />
      <button onClick={handleDrop}>Go</button>
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
