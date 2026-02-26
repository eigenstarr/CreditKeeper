import React from 'react';
import { motion } from 'framer-motion';
import type { PandaState, EnvironmentGrade } from '../../../shared/types';
import { getEnvironmentColors } from '../utils/pandaLogic';

interface EnvironmentProps {
  state: PandaState;
  children: React.ReactNode;
}

/**
 * Environment component with 5 grades of scenery
 * Provides smooth visual transitions between states
 */
const Environment: React.FC<EnvironmentProps> = ({ state, children }) => {
  const colors = getEnvironmentColors(state.environment);

  // Determine weather effects based on environment
  const showClouds = state.environment === 'cloudy' || state.environment === 'stormy' || state.environment === 'dim';
  const showSun = state.environment === 'lush' || state.environment === 'bright';
  const showRain = state.environment === 'stormy';

  return (
    <motion.div
      className="relative w-full h-96 rounded-xl overflow-hidden shadow-2xl"
      animate={{
        filter: `saturate(${colors.saturation})`
      }}
      transition={{ duration: 1.5 }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Sky gradient - now supports gradient strings */}
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            {colors.sky.includes('gradient') ? (
              // Parse gradient if it's a gradient string
              <>
                <motion.stop
                  offset="0%"
                  animate={{ stopColor: colors.sky.match(/#[0-9A-F]{6}/gi)?.[0] || '#87CEEB' }}
                  transition={{ duration: 1.5 }}
                />
                <motion.stop
                  offset="100%"
                  animate={{ stopColor: colors.sky.match(/#[0-9A-F]{6}/gi)?.[1] || '#B0E2FF' }}
                  transition={{ duration: 1.5 }}
                />
              </>
            ) : (
              <motion.stop
                offset="0%"
                animate={{ stopColor: colors.sky }}
                transition={{ duration: 1.5 }}
              />
            )}
          </linearGradient>

          {/* Ground gradient */}
          <radialGradient id="groundGradient" cx="50%" cy="100%">
            <motion.stop
              offset="0%"
              animate={{ stopColor: colors.ground }}
              transition={{ duration: 1.5 }}
            />
            <motion.stop
              offset="100%"
              animate={{ stopColor: colors.ground }}
              stopOpacity="0.6"
              transition={{ duration: 1.5 }}
            />
          </radialGradient>
        </defs>

        {/* Sky background */}
        <rect width="400" height="400" fill="url(#skyGradient)" />

        {/* Clouds for cloudy/stormy/dim weather */}
        {showClouds && (
          <>
            <motion.ellipse
              cx="100"
              cy="80"
              rx="40"
              ry="25"
              fill={state.environment === 'stormy' ? '#696969' : '#95a5a6'}
              opacity={state.environment === 'stormy' ? 0.8 : 0.6}
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.ellipse
              cx="250"
              cy="60"
              rx="50"
              ry="30"
              fill={state.environment === 'stormy' ? '#696969' : '#95a5a6'}
              opacity={state.environment === 'stormy' ? 0.9 : 0.7}
              animate={{ x: [0, -15, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            {state.environment === 'dim' && (
              <motion.ellipse
                cx="180"
                cy="70"
                rx="45"
                ry="28"
                fill="#B0C4DE"
                opacity="0.5"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 9, repeat: Infinity }}
              />
            )}
          </>
        )}

        {/* Sun for bright/lush weather */}
        {showSun && (
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '350px 50px' }}
          >
            <motion.circle
              cx="350"
              cy="50"
              r="25"
              fill={state.environment === 'lush' ? '#FFD700' : '#FDB813'}
              animate={{ opacity: state.environment === 'lush' ? [0.9, 1, 0.9] : 0.9 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const x = 350 + Math.cos(angle) * 35;
              const y = 50 + Math.sin(angle) * 35;
              return (
                <line
                  key={i}
                  x1="350"
                  y1="50"
                  x2={x}
                  y2={y}
                  stroke={state.environment === 'lush' ? '#FFD700' : '#FDB813'}
                  strokeWidth="3"
                  opacity="0.6"
                />
              );
            })}
          </motion.g>
        )}

        {/* Rain for stormy weather */}
        {showRain && (
          <g>
            {[...Array(20)].map((_, i) => (
              <motion.line
                key={i}
                x1={20 + i * 20}
                y1="0"
                x2={15 + i * 20}
                y2="30"
                stroke="#A9A9A9"
                strokeWidth="1"
                opacity="0.4"
                animate={{
                  y: [0, 400],
                  opacity: [0, 0.4, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'linear'
                }}
              />
            ))}
          </g>
        )}

        {/* Ground */}
        <motion.ellipse
          cx="200"
          cy="380"
          rx="200"
          ry="40"
          fill="url(#groundGradient)"
          opacity="0.8"
        />

        {/* Trees with environment-based styling */}
        <g>
          <motion.g
            animate={{ x: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {/* Tree trunk */}
            <motion.ellipse
              cx="80"
              cy="280"
              rx="15"
              ry="50"
              animate={{ fill: colors.trees }}
              transition={{ duration: 1.5 }}
            />
            {/* Tree foliage */}
            <motion.ellipse
              cx="80"
              cy="250"
              rx="25"
              ry="40"
              animate={{
                fill: state.environment === 'lush' || state.environment === 'bright' ? '#2ECC71' : colors.trees
              }}
              transition={{ duration: 1.5 }}
            />
          </motion.g>

          <motion.g
            animate={{ x: [2, -2, 2] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {/* Tree trunk */}
            <motion.ellipse
              cx="320"
              cy="290"
              rx="18"
              ry="55"
              animate={{ fill: colors.trees }}
              transition={{ duration: 1.5 }}
            />
            {/* Tree foliage */}
            <motion.ellipse
              cx="320"
              cy="260"
              rx="28"
              ry="45"
              animate={{
                fill: state.environment === 'lush' || state.environment === 'bright' ? '#2ECC71' : colors.trees
              }}
              transition={{ duration: 1.5 }}
            />
          </motion.g>

          {/* Extra lush vegetation for 'lush' environment */}
          {state.environment === 'lush' && (
            <>
              <motion.g
                animate={{ x: [-1, 1, -1] }}
                transition={{ duration: 3.5, repeat: Infinity }}
              >
                <ellipse cx="150" cy="300" rx="12" ry="40" fill="#228B22" />
                <ellipse cx="150" cy="275" rx="20" ry="35" fill="#32CD32" />
              </motion.g>
              <motion.g
                animate={{ x: [1, -1, 1] }}
                transition={{ duration: 4.2, repeat: Infinity }}
              >
                <ellipse cx="270" cy="305" rx="14" ry="42" fill="#228B22" />
                <ellipse cx="270" cy="280" rx="22" ry="37" fill="#32CD32" />
              </motion.g>
            </>
          )}

          {/* Sparse/dead trees for stormy environment */}
          {state.environment === 'stormy' && (
            <motion.g
              animate={{ rotate: [0, -2, 2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ transformOrigin: '200px 300px' }}
            >
              <line x1="200" y1="320" x2="200" y2="270" stroke="#2F4F2F" strokeWidth="4" />
              <line x1="200" y1="285" x2="185" y2="275" stroke="#2F4F2F" strokeWidth="2" />
              <line x1="200" y1="285" x2="215" y2="275" stroke="#2F4F2F" strokeWidth="2" />
            </motion.g>
          )}
        </g>
      </svg>

      {/* Panda container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </motion.div>
  );
};

export default Environment;
