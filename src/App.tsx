import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { GlobalProvider, useGlobalContext } from "./context/global-context";
import { Environment, Gltf, PerspectiveCamera } from "@react-three/drei";
import { createXRStore, XR } from "@react-three/xr";
import Gun from "./components/gun";
import Bullets from "./components/bullets";
import Target from "./components/target";
import Score from "./components/score";

const xrStore = createXRStore({
  controller: {
    right: Gun,
  },
});

function LevelMapMenu({ onPlay }: { onPlay: () => void }) {
  const { startGameAtLevel } = useGlobalContext();

  const handleSelectLevel = (level: number) => {
    startGameAtLevel(level);
    onPlay();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#1a1a2e",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>Pilih Misi</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        {[1, 2, 3, 4, 5].map((lvl) => (
          <button
            key={lvl}
            onClick={() => handleSelectLevel(lvl)}
            style={{
              padding: "20px 40px",
              fontSize: "1.5rem",
              borderRadius: "12px",
              backgroundColor: "#e94560",
              color: "white",
              border: "none",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Level {lvl}
          </button>
        ))}
      </div>
    </div>
  );
}

function GameApp() {
  const [gameState, setGameState] = useState<"menu" | "playing">("menu");

  return (
    <>
      {gameState === "menu" && <LevelMapMenu onPlay={() => setGameState("playing")} />}

      {gameState === "playing" && (
        <>
          <Canvas
            style={{
              width: "100vw",
              height: "100vh",
              position: "fixed",
            }}
            gl={{
              autoClear: true,
              antialias: true,
            }}
            dpr={[1, 2]}
          >
            <color args={[0x808080]} attach={"background"} />
            <PerspectiveCamera makeDefault position={[1.5, 1.6, 0]} fov={75} />
            <Environment preset="warehouse" />
            <Gltf src="/spacestation.glb" />

            <Suspense fallback={null}>
              <XR store={xrStore} />
              <Bullets />
              <Target targetIdx={0} />
              <Target targetIdx={1} />
              <Target targetIdx={2} />
              <Score />
            </Suspense>
          </Canvas>

          <div
            style={{
              position: "fixed",
              bottom: "20px",
              width: "100vw",
              display: "flex",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <button
              style={{ padding: "10px 20px", fontSize: "20px", zIndex: 5 }}
              onClick={() => xrStore.enterVR()}
            >
              Enter VR
            </button>
            <button
              style={{ padding: "10px 20px", fontSize: "20px", zIndex: 5 }}
              onClick={() => setGameState("menu")}
            >
              Kembali ke Map
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <GlobalProvider>
      <GameApp />
    </GlobalProvider>
  );
}