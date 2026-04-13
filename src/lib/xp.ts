import { supabase } from './supabase';

export interface LevelProgress {
  level: number;
  currentXpInLevel: number;
  nextLevelXp: number;
  progressPercentage: number;
  tierName: string;
}

export const LEVEL_THRESHOLD = 100;

export function getTierName(level: number): string {
  if (level < 5) return 'Silent Seeker';
  if (level < 10) return 'Tranquil Journeyer';
  if (level < 15) return 'Radiant Soul';
  return 'Luminous Aura';
}

export function calculateLevelProgress(xp: number): LevelProgress {
  const level = Math.floor(xp / LEVEL_THRESHOLD) + 1;
  const currentXpInLevel = xp % LEVEL_THRESHOLD;
  const nextLevelXp = LEVEL_THRESHOLD;
  const progressPercentage = (currentXpInLevel / nextLevelXp) * 100;
  
  return {
    level,
    currentXpInLevel,
    nextLevelXp,
    progressPercentage,
    tierName: getTierName(level)
  };
}

export async function awardXP(userId: string, amount: number) {
  // 1. Fetch current XP
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('xp, level')
    .eq('id', userId)
    .single();

  if (fetchError || !user) {
    console.error('Error fetching user for XP award:', fetchError);
    return null;
  }

  const currentXp = user.xp || 0;
  const newXp = currentXp + amount;
  
  // Using the same formula for level calculation
  const newLevel = Math.floor(newXp / LEVEL_THRESHOLD) + 1;

  // 2. Update database
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ 
      xp: newXp, 
      level: newLevel,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating XP:', updateError);
    return null;
  }

  return updatedUser;
}
