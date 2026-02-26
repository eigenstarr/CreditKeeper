import React from 'react';
import { motion } from 'framer-motion';
import type { PandaState } from '../../../shared/types';

interface RedPandaProps {
  state: PandaState;
}

const RedPanda: React.FC<RedPandaProps> = ({ state }) => {
  const { mood, energy } = state;

  const pandaVariants = {
    happy: {
      y: [0, -10, 0],
      rotate: [0, 5, -5, 0],
      transition: { duration: 2, repeat: Infinity }
    },
    neutral: {
      y: [0, -5, 0],
      transition: { duration: 3, repeat: Infinity }
    },
    sad: {
      y: [0, -2, 0],
      rotate: [0, -2, 0],
      transition: { duration: 4, repeat: Infinity }
    },
    weak: {
      y: 0,
      opacity: [1, 0.8, 1],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  const eyeState = {
    happy: { scaleY: 0.3, translateY: -2 },
    neutral: { scaleY: 1, translateY: 0 },
    sad: { scaleY: 0.6, translateY: 2 },
    weak: { scaleY: 0.4, translateY: 3 }
  };

  const getEyeAnimation = () => {
    if (mood === 'happy') return eyeState.happy;
    if (mood === 'sad') return eyeState.sad;
    if (mood === 'weak') return eyeState.weak;
    return eyeState.neutral;
  };

  return (
    <motion.svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      variants={pandaVariants}
      animate={mood}
      style={{ filter: `brightness(${energy / 100 + 0.2})` }}
    >
      <defs>
        <linearGradient id="pandaBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D84315" />
          <stop offset="100%" stopColor="#BF360C" />
        </linearGradient>
      </defs>

      <g transform="translate(100, 100)">
        <ellipse cx="0" cy="20" rx="45" ry="55" fill="url(#pandaBody)" />

        <ellipse cx="-30" cy="-35" rx="18" ry="25" fill="#D84315" />
        <ellipse cx="30" cy="-35" rx="18" ry="25" fill="#D84315" />

        <circle cx="-30" cy="-38" r="12" fill="#FFF3E0" />
        <circle cx="30" cy="-38" r="12" fill="#FFF3E0" />

        <ellipse cx="0" cy="-20" rx="35" ry="30" fill="#FFCCBC" />

        <motion.ellipse
          cx="-12"
          cy="-25"
          rx="4"
          ry="6"
          fill="#000"
          animate={getEyeAnimation()}
        />
        <motion.ellipse
          cx="12"
          cy="-25"
          rx="4"
          ry="6"
          fill="#000"
          animate={getEyeAnimation()}
        />

        <ellipse cx="0" cy="-15" rx="3" ry="4" fill="#000" />

        {mood === 'happy' && (
          <motion.path
            d="M -8 -8 Q 0 -4 8 -8"
            stroke="#000"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{ d: ['M -8 -8 Q 0 -4 8 -8', 'M -8 -8 Q 0 -2 8 -8'] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          />
        )}

        {mood === 'sad' && (
          <path d="M -8 -6 Q 0 -10 8 -6" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {mood === 'weak' && (
          <line x1="-8" y1="-8" x2="8" y2="-8" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        )}

        {mood === 'neutral' && (
          <line x1="-8" y1="-8" x2="8" y2="-8" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        )}

        <ellipse cx="-35" cy="5" rx="15" ry="20" fill="#D84315" />
        <ellipse cx="35" cy="5" rx="15" ry="20" fill="#D84315" />

        <ellipse cx="-18" cy="45" rx="12" ry="18" fill="#D84315" />
        <ellipse cx="18" cy="45" rx="12" ry="18" fill="#D84315" />

        <ellipse cx="5" cy="55" rx="25" ry="12" fill="#FFAB91" opacity="0.6" />

        {mood === 'happy' && (
          <motion.g
            animate={{
              rotate: [0, 20, -20, 0],
              x: [0, 5, -5, 0]
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <path d="M 45 10 Q 70 0 75 -10 L 70 -8 Q 68 5 65 10 Z" fill="#8D6E63" />
          </motion.g>
        )}

        {mood !== 'happy' && (
          <path d="M 45 10 Q 60 15 65 10 L 63 12 Q 58 15 55 12 Z" fill="#8D6E63" />
        )}
      </g>
    </motion.svg>
  );
};

export default RedPanda;
