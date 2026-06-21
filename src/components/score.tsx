import { PositionalAudio, Text } from "@react-three/drei";
import { useGlobalContext } from "../context/global-context";
import { useEffect, useRef } from "react";
import { PositionalAudio as PAudio } from "three";

function formatScoreText(score: number) {
  return score.toString().padStart(4, "0");
}

export default function Score() {
  const { score, level, isVictory } = useGlobalContext(); 
  const soundRef = useRef<PAudio>(null);

  useEffect(() => {
    if (score > 0) {
      const scoreSound = soundRef.current!;
      if (scoreSound.isPlaying) scoreSound.stop();
      scoreSound.play();
    }
  }, [score]);

  const finalPosition: [number, number, number] = [-2.0, 1.7, -0.1]; 
  const finalRotation: [number, number, number] = [0, 1.45, 0]; 

  return (
    <group position={finalPosition} rotation={finalRotation}>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[2.2, 1.8]} /> 
        <meshBasicMaterial color="black" />
      </mesh>

      <Text
        color={0xffa276}
        font="/SpaceMono-Bold.ttf"
        fontSize={0.4}
        anchorX={"center"}
        anchorY={"middle"}
        textAlign={"center"}
        lineHeight={1.2}
      >
        {/* Render teks berbeda jika sudah menang */}
        {isVictory ? `VICTORY!\nCLEARED` : `LVL ${level}\n${formatScoreText(score)}`}
        
        <PositionalAudio ref={soundRef} url="/score.ogg" loop={false} />
      </Text>
    </group>
  );
}