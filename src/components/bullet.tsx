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
const defaultGeometry = new SphereGeometry(0.1, 8, 8);
const defaultMaterial = new MeshStandardMaterial({ color: 0xff0000 });

export default function Bullet({ bulletData }: BulletProps) {
  const { removeBullet, targets, addScore, level, score } = useGlobalContext();
  const { scene } = useGLTF("/blaster.glb");
  const bulletPrototype = scene.getObjectByName("bullet") as Mesh | null;
  const ref = useRef<Mesh>(null);
  
  const hasHit = useRef(false); 
  const bulletBox = useRef(new Box3());
  const targetBox = useRef(new Box3());

  const geometry = bulletPrototype?.geometry || defaultGeometry;
  const material = bulletPrototype?.material || defaultMaterial;

  useFrame(() => {
    if (hasHit.current) return;

    const now = performance.now();
    const bulletObject = ref.current!;
    const directionVector = forwardVector
      .clone()
      .applyQuaternion(bulletObject.quaternion);

    bulletObject.position.addVectors(
      bulletData.initPosition,
      directionVector.multiplyScalar(
        (bulletSpeed * (now - bulletData.timestamp)) / 1000
      )
    );

    bulletBox.current.setFromObject(bulletObject);

    [...targets.current]
      .filter((target) => target.visible)
      .forEach((target) => {
        targetBox.current.setFromObject(target);

        if (bulletBox.current.intersectsBox(targetBox.current)) {
          hasHit.current = true;
          
          removeBullet(bulletData.id);
          target.visible = false;
          addScore();

          // Hanya lakukan respawn musuh kalau skor saat ini di bawah 240
          if (score < 240) {
            const respawnTime = Math.max(300, 1000 - (level * 100)); 

            setTimeout(() => {
              target.visible = true;
              target.position.x = Math.random() * 4.0 - 2.0; 
              target.position.z = Math.random() * 4.0 - 2.0; 
            }, respawnTime);
          }
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