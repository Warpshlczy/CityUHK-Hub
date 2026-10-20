import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * 彩蛋解锁态。按需求「仅本次会话」——只存内存，不落 localStorage / sessionStorage，
 * 刷新页面即回到未解锁状态。
 */
interface PlaygroundContextValue {
  unlocked: boolean;
  unlock: () => void;
}

const PlaygroundContext = createContext<PlaygroundContextValue | null>(null);

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  // useCallback 保持引用稳定：PixelPet 的点击回调在挂载时的闭包里捕获它
  const unlock = useCallback(() => setUnlocked(true), []);
  const value = useMemo(() => ({ unlocked, unlock }), [unlocked, unlock]);

  return <PlaygroundContext.Provider value={value}>{children}</PlaygroundContext.Provider>;
}

export function usePlayground(): PlaygroundContextValue {
  const value = useContext(PlaygroundContext);
  if (!value) throw new Error('usePlayground 必须在 PlaygroundProvider 内使用');
  return value;
}
