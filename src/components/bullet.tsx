import { useGLTF } from "@react-three/drei";
import { Mesh, Vector3, SphereGeometry, MeshStandardMaterial, Box3 } from "three";
import { BulletData } from "../types";
import { useRef } from "react";
import { bulletSpeed, useGlobalContext } from "../context/global-context";
import { useFrame } from "@react-three/fiber";

type BulletProps = {
  bulletData: BulletData;
};

const forwardVector = new Vector3(0, 0, -1);

// Default bullet geometry & material jika tidak ada object di model
const defaultGeometry = new SphereGeometry(0.1, 8, 8);
const defaultMaterial = new MeshStandardMaterial({ color: 0xff0000 });

export default function Bullet({ bulletData }: BulletProps) {
  // Ambil state level dari context
  const { removeBullet, targets, addScore, level } = useGlobalContext();
  const { scene } = useGLTF("/blaster.glb");
  const bulletPrototype = scene.getObjectByName("bullet") as Mesh | null;
  const ref = useRef<Mesh>(null);
  
  // Penanda agar tabrakan hanya tereksekusi 1 kali per peluru
  const hasHit = useRef(false); 

  // Siapkan kotak Bounding Box
  const bulletBox = useRef(new Box3());
  const targetBox = useRef(new Box3());

  // Use prototype geometry/material, or default if not found
  const geometry = bulletPrototype?.geometry || defaultGeometry;
  const material = bulletPrototype?.material || defaultMaterial;

  useFrame(() => {
    if (hasHit.current) return;

    const now = performance.now();
    const bulletObject = ref.current!;
    const directionVector = forwardVector
      .clone()
      .applyQuaternion(bulletObject.quaternion);

    // Gerakkan peluru
    bulletObject.position.addVectors(
      bulletData.initPosition,
      directionVector.multiplyScalar(
        (bulletSpeed * (now - bulletData.timestamp)) / 1000
      )
    );

    // Bungkus bentuk fisik peluru dengan Bounding Box
    bulletBox.current.setFromObject(bulletObject);

    [...targets.current]
      .filter((target) => target.visible)
      .forEach((target) => {
        // Bungkus bentuk fisik target balon dengan Bounding Box
        targetBox.current.setFromObject(target);

        // Cek tabrakan menggunakan intersectBox
        if (bulletBox.current.intersectsBox(targetBox.current)) {
          hasHit.current = true;
          
          removeBullet(bulletData.id);
          target.visible = false;
          addScore();

          // RUMUS KESULITAN BERDASARKAN LEVEL:
          // Waktu respawn makin cepat. Level 1 = 1000ms, turun bertahap, minimal 300ms
          const respawnTime = Math.max(300, 1000 - (level * 100)); 
          
          // Ukuran balon makin mengecil. Level 1 = 1x, makin kecil, minimal 0.4x dari ukuran asli
          const targetScale = Math.max(0.4, 1.1 - (level * 0.1));

          // Munculkan lagi balonnya setelah beberapa saat di posisi baru
          setTimeout(() => {
            target.visible = true;
            
            // Area kemunculan di depan mesin Mortal Kombat
            target.position.x = Math.random() * 0.7 - 1.5; 
            target.position.y = Math.random() * 0.6 + 1.3; 
            target.position.z = Math.random() * 1.0 - 0.6; 

            // Ubah ukuran balon agar makin kecil sesuai level
            target.scale.set(targetScale, targetScale, targetScale);
            
          }, respawnTime);
        }
      });
  });

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={material}
      quaternion={bulletData.initQuaternion}
    ></mesh>
  );
}