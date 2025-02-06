import useSWR from 'swr';

export type LeaderboardPayload = {
  id?: string;
  createdAt?: string | undefined;
  name: string;
  wpm: number;
  type: string;
  time: number;
};

// Mock data to return instead of making API calls
const mockLeaderboardData = {
  daily: [],
  allTime: []
};

export const getLeaderboard = async () => {
  // Return mock data instead of making an API call
  return mockLeaderboardData;
};

const useLeaderboard = () => {
  // Use the mock data as fallbackData
  const { data } = useSWR('getLeaderboard', getLeaderboard, {
    fallbackData: mockLeaderboardData,
  });

  const createLeaderboardData = async (data: LeaderboardPayload) => {
    // Do nothing, just return success
    return { success: true };
  };

  return {
    daily: [],
    allTime: [],
    isLoading: false,
    createLeaderboardData,
  };
};

export default useLeaderboard;
