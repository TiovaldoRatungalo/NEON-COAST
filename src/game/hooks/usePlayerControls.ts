/**
 * usePlayerControls — Raw keyboard/gamepad input state.
 * Reads keys every frame without React re-renders.
 */
'use client';

import { useEffect, useRef } from 'react';

export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  run: boolean;
  interact: boolean; // F — enter/exit vehicle
}

const INITIAL_INPUT: PlayerInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  run: false,
  interact: false,
};

export function usePlayerControls(): React.RefObject<PlayerInput> {
  const input = useRef<PlayerInput>({ ...INITIAL_INPUT });

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      // Prevent game keys from scrolling the page
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    input.current.forward  = down; break;
        case 'KeyS': case 'ArrowDown':  input.current.backward = down; break;
        case 'KeyA': case 'ArrowLeft':  input.current.left     = down; break;
        case 'KeyD': case 'ArrowRight': input.current.right    = down; break;
        case 'Space':                    input.current.jump     = down; break;
        case 'ShiftLeft':                input.current.run      = down; break;
        case 'KeyF':                     input.current.interact = down; break;
      }
    };

    const onDown = (e: KeyboardEvent) => onKey(e, true);
    const onUp   = (e: KeyboardEvent) => onKey(e, false);

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
    };
  }, []);

  return input;
}
