import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { getMissions, completeMission, updateProfile } from '../api';
import type { Mission } from '../../../shared/types';

const Learn: React.FC = () => {
  const { profile, setProfile, setCurrentScreen } = useApp();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const data = await getMissions();
      const updatedMissions = data.map((m) => ({
        ...m,
        completed: profile?.completedMissions.includes(m.id) || false
      }));
      setMissions(updatedMissions);
    } catch (err) {
      console.error('Failed to load missions:', err);
    }
  };

  const handleCompleteMission = async (mission: Mission) => {
    if (!profile) return;

    setLoading(true);
    try {
      await completeMission(mission.id);

      const newXP = profile.financialXP + mission.xpReward;
      const newCompleted = [...profile.completedMissions, mission.id];

      const updatedProfile = {
        ...profile,
        financialXP: newXP,
        completedMissions: newCompleted
      };

      await updateProfile(profile.customerId, {
        financialXP: newXP,
        completedMissions: newCompleted
      });

      setProfile(updatedProfile);

      setMissions((prev) =>
        prev.map((m) => (m.id === mission.id ? { ...m, completed: true } : m))
      );

      setSelectedMission(null);
    } catch (err) {
      console.error('Failed to complete mission:', err);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = missions.filter((m) => m.completed).length;
  const totalXP = profile?.financialXP || 0;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Financial Education</h1>
            <p className="text-gray-600">Complete missions to earn XP and badges</p>
          </div>
          <motion.button
            className="btn-secondary"
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentScreen('pet')}
          >
            Back
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-sm font-semibold mb-1">Total XP</div>
            <div className="text-4xl font-bold">{totalXP}</div>
          </div>
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-sm font-semibold mb-1">Completed</div>
            <div className="text-4xl font-bold">
              {completedCount} / {missions.length}
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-sm font-semibold mb-1">Streak</div>
            <div className="text-4xl font-bold">{profile?.streak || 0} days</div>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-semibold">
            ℹ️ XP and missions do not affect your panda's health - only real credit data does
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.id}
            className={`card cursor-pointer transition-all ${
              mission.completed
                ? 'bg-green-50 border-2 border-green-300'
                : 'hover:border-forest-green'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => !mission.completed && setSelectedMission(mission)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      mission.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {mission.completed ? '✓' : index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{mission.title}</h3>
                </div>
                <p className="text-gray-600 ml-11">{mission.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">+{mission.xpReward}</div>
                <div className="text-sm text-gray-600">XP</div>
              </div>
            </div>

            {selectedMission?.id === mission.id && (
              <motion.div
                className="mt-4 pt-4 border-t border-gray-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                {mission.scenario && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-gray-800">{mission.scenario}</p>
                    {mission.correctAnswer && (
                      <p className="text-sm text-gray-600 mt-2">
                        Answer: <span className="font-semibold">{mission.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                )}
                <motion.button
                  className="btn-primary w-full"
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteMission(mission);
                  }}
                  disabled={loading}
                >
                  {loading ? 'Completing...' : 'Complete Mission'}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {completedCount === missions.length && missions.length > 0 && (
        <motion.div
          className="card bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
          <p className="text-lg">You've completed all available missions!</p>
          <p className="text-sm mt-2 opacity-90">
            Keep checking back for new missions and continue your credit journey.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Learn;
