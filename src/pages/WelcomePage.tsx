import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();

  useEffect(() => {
    navigate(currentUser ? '/dashboard' : '/login', { replace: true });
  }, [currentUser, navigate]);

  return null;
}
