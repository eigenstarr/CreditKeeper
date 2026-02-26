import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PandaState, PandaMood } from '../../../shared/types';

interface RedPandaProps {
  state: PandaState;
  showAttention?: boolean;
  onAnimationComplete?: () => void;
}

/**
 * Enhanced Red Panda Component with 8 Emotional States
 *
 * Features:
 * - Smooth state transitions with morph animations
 * - Idle animations (breathing, blinking)
 * - Attention animations
 * - Posture changes based on mood
 * - Accessibility through posture/face cues (not just color)
 */
const RedPanda: React.FC<RedPandaProps> = ({ state, showAttention = false, onAnimationComplete }) => {
  const { mood, energy } = state;
  const [isBlinking, setIsBlinking] = useState(false);

  // Blinking animation loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000 + Math.random() * 2000); // Random interval 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Body animation variants for each mood
  const bodyVariants = {
    thriving: {
      y: [0, -15, 0],
      rotate: [0, 3, -3, 3, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    },
    content: {
      y: [0, -8, 0],
      rotate: [0, 2, -2, 0],
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
    },
    motivated: {
      y: [0, -10, -5, 0],
      rotate: [0, 5, -5, 0],
      scale: [1, 1.02, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
    },
    neutral: {
      y: [0, -5, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
    },
    concerned: {
      y: [0, -3, 0],
      rotate: [0, -1, 1, 0],
      transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
    },
    tired: {
      y: [0, -2, 0],
      rotate: [0, -2, 0],
      scale: [1, 0.98, 1],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    },
    stressed: {
      y: [0, 2, -2, 0],
      rotate: [0, -3, 3, -3, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    },
    sick: {
      y: 5,
      rotate: [-5, -7, -5],
      opacity: [1, 0.7, 1],
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  // Eye states for each mood
  const getEyeState = (mood: PandaMood) => {
    switch (mood) {
      case 'thriving':
        return { scaleY: 0.2, translateY: -3, shine: true }; // Happy squint
      case 'content':
        return { scaleY: 0.4, translateY: -1, shine: true };
      case 'motivated':
        return { scaleY: 1.2, translateY: -2, shine: true }; // Wide alert eyes
      case 'neutral':
        return { scaleY: 1, translateY: 0, shine: false };
      case 'concerned':
        return { scaleY: 1.1, translateY: 1, shine: false }; // Slightly wider, worried
      case 'tired':
        return { scaleY: 0.5, translateY: 2, shine: false }; // Half-closed
      case 'stressed':
        return { scaleY: 0.7, translateY: 3, shine: false }; // Droopy
      case 'sick':
        return { scaleY: 0.3, translateY: 4, shine: false }; // Nearly closed
    }
  };

  // Mouth expressions for each mood
  const getMouthPath = (mood: PandaMood) => {
    switch (mood) {
      case 'thriving':
        return 'M -10 -6 Q 0 -2 10 -6'; // Big smile
      case 'content':
        return 'M -8 -8 Q 0 -5 8 -8'; // Gentle smile
      case 'motivated':
        return 'M -10 -7 Q 0 -4 10 -7'; // Determined smile
      case 'neutral':
        return 'M -8 -8 L 8 -8'; // Straight line
      case 'concerned':
        return 'M -8 -7 Q 0 -9 8 -7'; // Slight frown
      case 'tired':
        return 'M -8 -6 Q 0 -8 8 -6'; // Sad curve
      case 'stressed':
        return 'M -10 -5 Q 0 -9 10 -5'; // Worried frown
      case 'sick':
        return 'M -8 -4 Q 0 -7 8 -4'; // Weak frown
    }
  };

  // Body posture adjustments
  const getBodyPosture = (mood: PandaMood) => {
    switch (mood) {
      case 'thriving':
        return { bodyY: 15, headY: -25 }; // Upright, alert
      case 'content':
      case 'motivated':
        return { bodyY: 18, headY: -22 };
      case 'neutral':
      case 'concerned':
        return { bodyY: 20, headY: -20 }; // Normal
      case 'tired':
        return { bodyY: 25, headY: -15 }; // Slouched
      case 'stressed':
        return { bodyY: 28, headY: -12 }; // More slouched
      case 'sick':
        return { bodyY: 32, headY: -8 }; // Lying down
    }
  };

  const eyeState = getEyeState(mood);
  const posture = getBodyPosture(mood);
  const brightness = Math.max(0.5, Math.min(1.2, energy / 100 + 0.3));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      <motion.svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
        variants={bodyVariants}
        animate={mood}
        style={{
          filter: `brightness(${brightness}) contrast(${0.9 + energy / 500})`,
          transition: 'filter 1s ease-in-out'
        }}
      >
        <defs>
          {/* Body gradient that changes with mood */}
          <linearGradient id="pandaBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <motion.stop
              offset="0%"
              animate={{
                stopColor: mood === 'thriving' || mood === 'motivated' ? '#E64A19' :
                           mood === 'sick' || mood === 'stressed' ? '#A63603' : '#D84315'
              }}
              transition={{ duration: 1 }}
            />
            <motion.stop
              offset="100%"
              animate={{
                stopColor: mood === 'thriving' || mood === 'motivated' ? '#D84315' :
                           mood === 'sick' || mood === 'stressed' ? '#6D2818' : '#BF360C'
              }}
              transition={{ duration: 1 }}
            />
          </linearGradient>

          {/* Eye shine effect */}
          {eyeState.shine && (
            <radialGradient id="eyeShine">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          )}
        </defs>

        <g transform="translate(110, 110)">
          {/* Main body with posture adjustment */}
          <motion.ellipse
            cx="0"
            cy={posture.bodyY}
            rx="48"
            ry="58"
            fill="url(#pandaBody)"
            animate={{ cy: posture.bodyY }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />

          {/* Ears */}
          <motion.ellipse
            cx="-32"
            cy="-38"
            rx="19"
            ry="26"
            fill="#D84315"
            animate={{ cy: posture.headY - 13 }}
            transition={{ duration: 1 }}
          />
          <motion.ellipse
            cx="32"
            cy="-38"
            rx="19"
            ry="26"
            fill="#D84315"
            animate={{ cy: posture.headY - 13 }}
            transition={{ duration: 1 }}
          />

          {/* Inner ears */}
          <motion.circle
            cx="-32"
            cy="-41"
            r="13"
            fill="#FFF3E0"
            animate={{ cy: posture.headY - 16 }}
            transition={{ duration: 1 }}
          />
          <motion.circle
            cx="32"
            cy="-41"
            r="13"
            fill="#FFF3E0"
            animate={{ cy: posture.headY - 16 }}
            transition={{ duration: 1 }}
          />

          {/* Head/face */}
          <motion.ellipse
            cx="0"
            cy="-20"
            rx="38"
            ry="33"
            fill="#FFCCBC"
            animate={{ cy: posture.headY }}
            transition={{ duration: 1 }}
          />

          {/* Eyes with blinking */}
          <AnimatePresence>
            {!isBlinking && (
              <>
                <motion.ellipse
                  cx="-13"
                  cy="-25"
                  rx="5"
                  ry="7"
                  fill="#000"
                  initial={{ scaleY: 0 }}
                  animate={{
                    cy: posture.headY - 5 + eyeState.translateY,
                    scaleY: eyeState.scaleY
                  }}
                  exit={{ scaleY: 0 }}
                  transition={{ duration: 0.1 }}
                />
                <motion.ellipse
                  cx="13"
                  cy="-25"
                  rx="5"
                  ry="7"
                  fill="#000"
                  initial={{ scaleY: 0 }}
                  animate={{
                    cy: posture.headY - 5 + eyeState.translateY,
                    scaleY: eyeState.scaleY
                  }}
                  exit={{ scaleY: 0 }}
                  transition={{ duration: 0.1 }}
                />

                {/* Eye shine for positive moods */}
                {eyeState.shine && (
                  <>
                    <circle cx="-11" cy={posture.headY - 7} r="2" fill="url(#eyeShine)" />
                    <circle cx="15" cy={posture.headY - 7} r="2" fill="url(#eyeShine)" />
                  </>
                )}
              </>
            )}
          </AnimatePresence>

          {/* Nose */}
          <motion.ellipse
            cx="0"
            cy="-15"
            rx="3.5"
            ry="5"
            fill="#000"
            animate={{ cy: posture.headY + 5 }}
            transition={{ duration: 1 }}
          />

          {/* Mouth with mood-based expression */}
          <motion.path
            d={getMouthPath('neutral')}
            stroke="#000"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            animate={{
              d: getMouthPath(mood),
              y: posture.headY + 20
            }}
            transition={{ duration: 1 }}
          />

          {/* Arms */}
          <motion.ellipse
            cx="-38"
            cy="8"
            rx="16"
            ry="22"
            fill="#D84315"
            animate={{ cy: posture.bodyY - 12 }}
            transition={{ duration: 1 }}
          />
          <motion.ellipse
            cx="38"
            cy="8"
            rx="16"
            ry="22"
            fill="#D84315"
            animate={{ cy: posture.bodyY - 12 }}
            transition={{ duration: 1 }}
          />

          {/* Legs */}
          <motion.ellipse
            cx="-20"
            cy="50"
            rx="13"
            ry="20"
            fill="#D84315"
            animate={{ cy: posture.bodyY + 30 }}
            transition={{ duration: 1 }}
          />
          <motion.ellipse
            cx="20"
            cy="50"
            rx="13"
            ry="20"
            fill="#D84315"
            animate={{ cy: posture.bodyY + 30 }}
            transition={{ duration: 1 }}
          />

          {/* Belly/chest accent */}
          <motion.ellipse
            cx="5"
            cy="60"
            rx="28"
            ry="14"
            fill="#FFAB91"
            opacity="0.5"
            animate={{ cy: posture.bodyY + 40 }}
            transition={{ duration: 1 }}
          />

          {/* Tail - animated based on mood */}
          <motion.g
            animate={
              mood === 'thriving' || mood === 'motivated'
                ? {
                    rotate: [0, 25, -15, 25, 0],
                    x: [0, 3, -3, 0]
                  }
                : mood === 'sick' || mood === 'stressed'
                ? {
                    rotate: [-10, -5, -10],
                    y: [0, 2, 0]
                  }
                : {
                    rotate: [0, 10, -10, 0]
                  }
            }
            transition={{
              duration: mood === 'thriving' || mood === 'motivated' ? 1.2 : 2.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <motion.path
              d="M 48 15 Q 75 5 82 -5 L 78 -3 Q 72 8 68 15 Z"
              fill="#8D6E63"
              animate={{ y: posture.bodyY - 5 }}
              transition={{ duration: 1 }}
            />
          </motion.g>

          {/* Attention indicator (when showAttention is true) */}
          <AnimatePresence>
            {showAttention && (
              <motion.g
                initial={{ opacity: 0, y: -60, scale: 0 }}
                animate={{ opacity: 1, y: -70, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                <circle cx="0" cy="0" r="15" fill="#FFD700" opacity="0.3" />
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  fontSize="20"
                  fill="#FFD700"
                >
                  !
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </g>
      </motion.svg>
    </motion.div>
  );
};

export default RedPanda;
