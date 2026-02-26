import React from 'react';
import { motion } from 'framer-motion';
import type { AppMode } from '../../../shared/types';

interface ModeToggleProps {
  mode: AppMode;
  onToggle: (mode: AppMode) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onToggle }) => {
  return (
    <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-md">
      <motion.button
        className={`px-6 py-2 rounded-full font-semibold transition-colors ${
          mode === 'real'
            ? 'bg-forest-green text-white'
            : 'bg-transparent text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => onToggle('real')}
        whileTap={{ scale: 0.95 }}
      >
        Real Mode
      </motion.button>
      <motion.button
        className={`px-6 py-2 rounded-full font-semibold transition-colors ${
          mode === 'projected'
            ? 'bg-sky-blue text-white'
            : 'bg-transparent text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => onToggle('projected')}
        whileTap={{ scale: 0.95 }}
      >
        Projected Mode
      </motion.button>
    </div>
  );
};

export default ModeToggle;
