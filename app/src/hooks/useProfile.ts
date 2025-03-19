import useSWR from 'swr';

import { LeaderboardPayload } from './useLeaderboard';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type UserPayload = {
  name: string;
  createdAt: string;
};

type ProfileStatsPayload = {
  best: LeaderboardPayload[];
  recent: LeaderboardPayload[];
};

export const getCurrentUser = async (): Promise<UserPayload | null> => {
  // Return null if no API URL or in development mode
  if (!API_URL) return null;
  
  try {
    const res = await fetch(`${API_URL}/currentUser`);
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

const getProfileStats = async (): Promise<ProfileStatsPayload> => {
  // Return empty data if no API URL
  if (!API_URL) return { best: [], recent: [] };
  
  try {
    const res = await fetch(`${API_URL}/profile`);
    if (!res.ok) {
      return { best: [], recent: [] };
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return { best: [], recent: [] };
  }
};

const useProfile = () => {
  const {
    data: user,
    isLoading,
    mutate,
  } = useSWR('getCurrentUser', getCurrentUser, {
    fallbackData: null,
    revalidateOnFocus: false
  });

  const { data: profileStats } = useSWR('getProfileStats', getProfileStats, {
    fallbackData: { best: [], recent: [] },
    revalidateOnFocus: false
  });

  const clearUser = () => mutate(null, false);

  return { user, clearUser, isLoading, profileStats };
};

export default useProfile;