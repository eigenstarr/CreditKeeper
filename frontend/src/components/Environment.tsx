import React from 'react';
import { motion } from 'framer-motion';
import type { PandaState } from '../../../shared/types';
import { getEnvironmentColors } from '../utils/pandaLogic';

interface EnvironmentProps {
  state: PandaState;
  children: React.ReactNode;
}

const Environment: React.FC<EnvironmentProps> = ({ state, children }) => {
  const colors = getEnvironmentColors(state.environment);

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-2xl">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.sky} />
            <stop offset="100%" stopColor={colors.ground} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <rect width="400" height="400" fill="url(#skyGradient)" />

        {state.environment === 'cloudy' && (
          <>
            <motion.ellipse
              cx="100"
              cy="80"
              rx="40"
              ry="25"
              fill="#95a5a6"
              opacity="0.6"
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.ellipse
              cx="250"
              cy="60"
              rx="50"
              ry="30"
              fill="#95a5a6"
              opacity="0.7"
              animate={{ x: [0, -15, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </>
        )}

        {state.environment === 'bright' && (
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '350px 50px' }}
          >
            <circle cx="350" cy="50" r="25" fill="#FDB813" opacity="0.9" />
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
                  stroke="#FDB813"
                  strokeWidth="3"
                  opacity="0.6"
                />
              );
            })}
          </motion.g>
        )}

        <ellipse cx="200" cy="380" rx="200" ry="40" fill={colors.ground} opacity="0.8" />

        <g>
          <motion.g
            animate={{ x: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <ellipse cx="80" cy="280" rx="15" ry="50" fill={colors.trees} />
            <ellipse cx="80" cy="250" rx="25" ry="40" fill={state.environment === 'bright' ? '#2ECC71' : colors.trees} />
          </motion.g>

          <motion.g
            animate={{ x: [2, -2, 2] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <ellipse cx="320" cy="290" rx="18" ry="55" fill={colors.trees} />
            <ellipse cx="320" cy="260" rx="28" ry="45" fill={state.environment === 'bright' ? '#2ECC71' : colors.trees} />
          </motion.g>
        </g>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default Environment;
