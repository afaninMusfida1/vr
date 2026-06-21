import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Object3D, Quaternion, Vector3 } from "three";
import { BulletData } from "../types";

export interface IGlobalContext {
  score: number;
  level: number;
  isVictory: boolean;
  bullets: BulletData[];
  targets: React.MutableRefObject<Set<Object3D>>;
  addScore: () => void;
  addBullet: (position: Vector3, quaternion: Quaternion) => void;
  removeBullet: (id: BulletData["id"]) => void;
  startGameAtLevel: (selectedLevel: number) => void;
}

export const bulletSpeed = 10;
export const bulletTimeToLive = 2;

const GlobalContext = createContext<IGlobalContext | undefined>(undefined);

export const GlobalProvider = ({ children }: PropsWithChildren) => {
  const [bullets, setBullets] = useState<BulletData[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isVictory, setIsVictory] = useState(false);
  const targets = useRef<Set<Object3D>>(new Set());

  const removeBullet = useCallback(
    (id: BulletData["id"]) => {
      const updatedBullets = bullets.filter((bullet) => bullet.id !== id);
      setBullets(updatedBullets);
    },
    [bullets]
  );

  const addBullet = useCallback(
    (position: Vector3, quaternion: Quaternion) => {
      const newBullet = {
        id: Math.random().toString(36).substring(7),
        initPosition: position,
        initQuaternion: quaternion,
        timestamp: performance.now(),
      };
      setBullets((prev) => [...prev, newBullet]);
      setTimeout(() => {
        removeBullet(newBullet.id);
      }, bulletTimeToLive * 1000);
    },
    [removeBullet]
  );

  // addScore sekarang HANYA mengurus penambahan skor saja
  const addScore = useCallback(() => {
    setScore((prevScore) => prevScore + 10);
  }, []);

  // Gunakan useEffect untuk memantau perubahan skor dan mengatur Level & Victory
  useEffect(() => {
    // Rumus: Skor 0-40 = Lvl 1, 50-90 = Lvl 2, 100-140 = Lvl 3, dst. Maksimal Lvl 5.
    const calculatedLevel = Math.min(Math.floor(score / 50) + 1, 5);
    setLevel(calculatedLevel);

    if (score >= 250) {
      setIsVictory(true);
    }
  }, [score]);

  const startGameAtLevel = useCallback((selectedLevel: number) => {
    // Cukup atur skornya, useEffect di atas akan otomatis menyesuaikan levelnya
    setScore((selectedLevel - 1) * 50);
    setBullets([]);
    setIsVictory(false);
  }, []);

  const value = useMemo(
    () => ({
      bullets,
      targets,
      score,
      level,
      isVictory,
      addBullet,
      removeBullet,
      addScore,
      startGameAtLevel,
    }),
    [bullets, targets, score, level, isVictory, addBullet, removeBullet, addScore, startGameAtLevel]
  );

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};