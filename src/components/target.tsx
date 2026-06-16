import { useGLTF } from "@react-three/drei";
import { useGlobalContext } from "../context/global-context";
import { useEffect, useMemo } from "react";

type TargetProps = {
  targetIdx: number;
};

export default function Target({ targetIdx }: TargetProps) {
  const { targets } = useGlobalContext();
  const { scene } = useGLTF("/target.glb");

  const target = useMemo(() => scene.clone(), []);

  useEffect(() => {
    // --- MUNCUL DI DEPAN MESIN MORTAL KOMBAT ---
    
    // X: Rentang -1.5 sampai -0.8 (Tepat di depan layar yang ada di X = -2.0)
    const randomX = Math.random() * 0.7 - 1.5; 
    
    // Y: Ketinggian 1.3 sampai 1.9 (Sejajar dengan teks skor)
    const randomY = Math.random() * 0.6 + 1.3; 
    
    // Z: Rentang -0.6 sampai 0.4 (Menyebar mengikuti lebar mesin)
    const randomZ = Math.random() * 1.0 - 0.6; 

    target.position.set(randomX, randomY, randomZ);
    targets.current.add(target);
  }, []);

  return <primitive object={target} />;
}