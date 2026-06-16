import { PositionalAudio, useGLTF } from "@react-three/drei";
import {
  useXRControllerButtonEvent,
  useXRInputSourceStateContext,
} from "@react-three/xr";
import { useGlobalContext } from "../context/global-context";
import { Quaternion, Vector3, PositionalAudio as PAudio, Group } from "three";
import { useRef } from "react";

export default function Gun() {
  const { addBullet } = useGlobalContext();
  const { scene } = useGLTF("/blaster.glb");
  const state = useXRInputSourceStateContext("controller");
  const gamepad = state.inputSource.gamepad;
  const soundRef = useRef<PAudio>(null);
  
  // 1. Buat ref untuk grup pembungkus sebagai titik acuan tembakan (selalu menghadap depan VR)
  const controllerRef = useRef<Group>(null);

  useXRControllerButtonEvent(
    state,
    "xr-standard-trigger",
    (controllerState) => {
      if (controllerState === "pressed") {
        const bulletPos = new Vector3();
        const bulletQuat = new Quaternion();
        
        // 2. Ambil orientasi murni dari arah controller (group), BUKAN dari scene model
        if (controllerRef.current) {
          controllerRef.current.getWorldPosition(bulletPos);
          controllerRef.current.getWorldQuaternion(bulletQuat);
        }
        
        addBullet(bulletPos, bulletQuat);

        const laserSound = soundRef.current!;
        if (laserSound.isPlaying) {
          laserSound.stop();
        }
        laserSound.play();
        gamepad?.hapticActuators[0]?.pulse(0.5, 10);
      }
    }
  );

  return (
    <group ref={controllerRef}>
      {/* 3. Putar HANYA visual senjatanya 180 derajat (Math.PI) pada sumbu Y agar tidak kebalik */}
      <primitive object={scene} rotation={[0, Math.PI, 0]} />
      <PositionalAudio ref={soundRef} url="/laser.ogg" loop={false} />
    </group>
  );
}