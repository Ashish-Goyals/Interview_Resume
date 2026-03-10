import {useContext, useEffect} from 'react';
import {AuthContext} from '../auth.context';
import {login, register, logout, getMe} from '../services/auth.api';
export const useAuth = () => {
  const context = useContext (AuthContext);
  const {user, setUser, loading, setLoading} = context;

  const handleLogin = async ({email, password}) => {
    try {
      setLoading (true);
      const data = await login ({email, password});
      setUser (data.user);
    } catch (error) {
      console.log (error);
    } finally {
      setLoading (false);
    }
  };

  const handleRegister = async ({username, email, password}) => {
    try {
      setLoading (true);
      const data = await register ({username, email, password});
      setUser (data.user);
    } catch (error) {
      console.log (error);
    } finally {
      setLoading (false);
    }
  };
  const handleLogout = async () => {
    try {
      setLoading (true);
      await logout ();
      setUser (null);
    } catch (error) {
      console.log (error);
    } finally {
      setLoading (false);
    }
  };

  useEffect (
    () => {
      const getAndSetUser = async () => {
        try {
          setLoading (true);
          const data = await getMe ();
          setUser (data.user);
        } catch (error) {
          console.log (error);
        } finally {
          setLoading (false);
        }
      };
      getAndSetUser ();
    },
    [setUser, setLoading]
  );

  return {
    user,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};
