import { useState, useEffect, SetStateAction } from 'react';


export function useAuthWindow() {
  const [authResult, setAuthResult] = useState(null);

  useEffect(() => {
    const handleMessage = (event: { origin: string; data: { type: string; payload: SetStateAction<null>; }; }) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'AUTH_RESULT') {
        setAuthResult(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const openAuthWindow = (url: string | URL | undefined, callback_origin: string, challenge: string) => {
    if (!url) {
      url = window.location.origin;
    }


    url = url + '?callback_origin=' + callback_origin + "&challenge=" + challenge;

    const windowWidth = 500;
    const windowHeight = 500;
    const windowLeft = (window.outerWidth / 2) + window.screenX - (windowWidth / 2);
    const windowTop = (window.outerHeight / 2) + window.screenY - (windowHeight / 2);


    const authWindow = window.open(
      url,
      'AuthWindow',
      `width=${windowWidth},height=${windowHeight},left=${windowLeft},top=${windowTop}`
    );

    if (authWindow) {
      authWindow.focus();
    }
  };


  return { authResult, openAuthWindow, };
}
