import { useState, useCallback, useEffect } from 'react';
import { getUserData, setUserData } from '../services/storage';

export function useStorage(userId, type, defaultValue) {
  const [data, setData] = useState(() => {
    const stored = getUserData(userId, type);
    return stored !== null ? stored : defaultValue;
  });

  useEffect(() => {
    const stored = getUserData(userId, type);
    setData(stored !== null ? stored : defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, type]);

  const update = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setUserData(userId, type, next);
      return next;
    });
  }, [userId, type]);

  return [data, update];
}

export function useHistory(userId) {
  const [history, setHistory] = useStorage(userId, 'history', []);

  const addEntry = useCallback((entry) => {
    setHistory(prev => {
      const next = [{ ...entry, id: Date.now() + Math.random(), timestamp: Date.now() }, ...prev];
      return next.slice(0, 500);
    });
  }, [setHistory]);

  return [history, addEntry, setHistory];
}
