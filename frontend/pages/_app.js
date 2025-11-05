import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return <Component {...pageProps} />;
}

export default MyApp;
