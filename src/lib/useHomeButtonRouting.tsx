import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { graniteEvent } from '@apps-in-toss/web-framework';

export function useHomeButtonRouting() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = graniteEvent.addEventListener('homeEvent', {
      // 토스 홈 버튼 클릭 시 홈으로 이동
      onEvent: () => {
        navigate('/home', { replace: true });
      },
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);
}
