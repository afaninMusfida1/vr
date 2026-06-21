import { useGLTF } from "@react-three/drei";
import { useGlobalContext } from "../context/global-context";
import { useEffect, useMemo } from "react";

type TargetProps = {
  targetIdx: number;
};

const getEnemyModel = (level: number) => {
  switch (level) {
    case 1:
      return "/target.glb";
    case 2:
      return "/zombie.glb";
    case 3:
      return "/drone.glb";
    case 4:
      return "/robot.glb";
    case 5:
      return "/boss.glb";
    default:
      return "/boss.glb"; // Level 6 ke atas pakai boss
  }
};

export default function Target({ targetIdx }: TargetProps) {
  const { targets, level } = useGlobalContext();
  const modelPath = getEnemyModel(level);
  const { scene } = useGLTF(modelPath);

  // Clone scene agar tiap musuh punya objek fisik sendiri (tidak nyangkut satu sama lain)
  const target = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    let randomX = 0;
    let randomY = 0;
    let randomZ = 0;
    let scale = 1;

    // --- LOGIKA POSISI DAN SKALA UNTUK SEMUA LEVEL ---
    
    if (level === 1) {
      // LEVEL 1 (BALON): Melayang ngumpul di depan layar arcade
      randomX = Math.random() * 0.7 - 1.5;
      randomY = Math.random() * 0.6 + 1.3;
      randomZ = Math.random() * 1.0 - 0.6;
      scale = 1.0;
      
    } else if (level === 2) {
      // LEVEL 2 (ZOMBIE): Muncul di area bawah (lantai), menyebar
      randomX = Math.random() * 2.0 - 2.5; 
      randomY = 0.2; 
      randomZ = Math.random() * 3.0 - 1.5;
      
      // HAJAR SKALANYA JADI KECIL BANGET:
      // Coba 0.02 dulu. Kalau masih segede gaban, jadikan 0.005 atau 0.001
      scale = 0.00002; 
      
      
    } else if (level === 3) {
      // LEVEL 3 (DRONE): Terbang tinggi, area sangat lebar biar baling-balingnya nggak tabrakan
      randomX = Math.random() * 3.0 - 2.5;
      randomY = Math.random() * 1.0 + 1.5; // Melayang tinggi (1.5 sampai 2.5)
      randomZ = Math.random() * 4.0 - 2.0;
      scale = 0.5; // Drone raksasa dikecilkan jadi 5%
      
    } else if (level === 4) {
      // LEVEL 4 (ROBOT): Muncul di area lantai menyebar
      randomX = Math.random() * 2.0 - 2.5;
      randomY = 0.3; // Dekat lantai
      randomZ = Math.random() * 3.0 - 1.5;
      scale = 1.5; // Sesuaikan ukuran robot
      
    } else {
      // LEVEL 5+ (BOSS): Raksasa, ditaruh agak mundur dan melebar biar nggak menuhin layar
      randomX = Math.random() * 4.0 - 3.0; 
      randomY = 0.5; // Ketinggian menyesuaikan kaki boss
      randomZ = Math.random() * 4.0 - 2.0;
      scale = 0.02; // Perkecil drastis biar jadi seukuran wajar di dalam ruangan
    }

    target.position.set(randomX, randomY, randomZ);
    target.scale.set(scale, scale, scale);
    targets.current.add(target);

    return () => {
      targets.current.delete(target);
    };
  }, [target, targets, level]);

  return <primitive object={target} />;
}

// Preload semua aset di awal supaya perpindahan level lancar dan tidak ada delay/error 404
useGLTF.preload("/target.glb");
useGLTF.preload("/zombie.glb");
useGLTF.preload("/drone.glb");
useGLTF.preload("/robot.glb");
useGLTF.preload("/boss.glb");