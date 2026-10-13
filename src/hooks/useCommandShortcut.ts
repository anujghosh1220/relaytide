import { useEffect } from 'react';
import { useIsApplePlatform } from './useMediaQuery';

/** Registers the Cmd/Ctrl + key shortcut that toggles the command palette. */
export function useCommandShortcut(key: string, onToggle: () => void) {
  const isApple = useIsApplePlatform();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (!(isApple ? event.metaKey : event.ctrlKey)) return;
      event.preventDefault();
      onToggle();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isApple, key, onToggle]);
}
