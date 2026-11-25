import {useEffect, useState} from 'react';

export function useRetryDelay() {
  const [until, setUntil] = useState(0);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!until) return;
    const timer = setInterval(() => {
      const seconds = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) setUntil(0);
    }, 250);
    return () => clearInterval(timer);
  }, [until]);

  function handleFailure(error) {
    if (error.status !== 429) return;
    const seconds = error.retryAfterSeconds || 30;
    setRemaining(seconds);
    setUntil(Date.now() + seconds * 1000);
  }

  return [remaining, handleFailure];
}
