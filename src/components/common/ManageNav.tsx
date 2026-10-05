import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationBar } from '@apps-in-toss/web-framework';

export default function NavigationManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    switch (path) {
      case '/home':
        NavigationBar.setOptions({
          withBackButton: true,
          withHomeButton: true,
          withTitle: true,
          transparentBackground: true,
        });
        break;

      case '/write':
        NavigationBar.setOptions({
          withBackButton: true,
          withHomeButton: true,
          withTitle: true,
          transparentBackground: false,
        });
        break;

      case '/write/complete':
        NavigationBar.setOptions({
          withBackButton: false,
          withHomeButton: true,
          withTitle: true,
          transparentBackground: false,
        });
        break;

      default:
        NavigationBar.setOptions({
          withBackButton: true,
          withHomeButton: true,
          withTitle: true,
          transparentBackground: false,
        });
        break;
    }
  }, [location.pathname]);

  return null;
}
