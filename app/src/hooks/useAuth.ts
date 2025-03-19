import useSWR from 'swr';
import useProfile from './useProfile';

// Dummy implementation that returns null instead of session
export const getUser = async () => {
  return null;
};

const useAuth = () => {
  const { clearUser } = useProfile();

  // Always returns null with no validation
  const { isValidating, error } = useSWR('getUser', getUser, {
    fallbackData: null,
  });

  // No-op functions that do nothing
  const logout = () => {
    clearUser();
    console.log("Logout clicked (authentication disabled)");
  };

  const login = () => {
    console.log("Login clicked (authentication disabled)");
  };

  return { isValidating, error, logout, login };
};

export default useAuth;
