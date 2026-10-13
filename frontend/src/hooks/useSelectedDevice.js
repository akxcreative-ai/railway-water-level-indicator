import { useState, useEffect } from 'react';

const KEY = 'wli_selected_device';

export const getSelectedDevice = () => localStorage.getItem(KEY) || 'WLI-001';

export const useSelectedDevice = () => {
  const [deviceId, setDeviceIdState] = useState(getSelectedDevice());

  useEffect(() => {
    const onChange = (e) => setDeviceIdState(e.detail);
    window.addEventListener('wli-device-change', onChange);
    return () => window.removeEventListener('wli-device-change', onChange);
  }, []);

  const setDeviceId = (id) => {
    localStorage.setItem(KEY, id);
    window.dispatchEvent(new CustomEvent('wli-device-change', { detail: id }));
  };

  return [deviceId, setDeviceId];
};
