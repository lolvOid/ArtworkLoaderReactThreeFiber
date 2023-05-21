import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { TextureLoader, MeshStandardMaterial } from "three";
import * as THREE from "three";
import { Vector2 } from "three";

/**
 * @param {Texture} tex
 */
const modTexture = (
  tex,
  warpping = THREE.ClampToEdgeWrapping,
  x = 1,
  y = 1
) => {
  tex.encoding = THREE.sRGBEncoding;
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = warpping;
  tex.repeat = new Vector2(x, y);
};

const Scene = () => {
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0
  });
  const [cubeWidth, setCubeWidth] = useState(0);
  const [cubeHeight, setCubeHeight] = useState(0);
  const [file, setFile] = useState(null);
  const [texture, setTexture] = useState(null);
  const camera = useRef();
  const fitCameraToCube = (camera) => {
    const distance =
      Math.max(faceWidth, faceHeight) /
      Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    camera.position.z = distance;
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const image = new Image();
      image.src = event.target.result;
      image.onload = () => {
        setFile(image);
        setCubeWidth(image.width / 20);
        setCubeHeight(image.height / 20);
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(event.target.result, (texture) => {
          modTexture(texture);
          setTexture(texture);
        });
      };
    };
    fitCameraToCube(camera.current);
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const canvas_tex = useLoader(TextureLoader, "canvas.jpg");
  modTexture(canvas_tex, THREE.RepeatWrapping, 5, 0.5);

  const artRef = useRef();
  const sp = useRef();
  useEffect(() => {
    const image = new Image();
    image.src = "art.jpg";
    image.onload = () => {
      setImageDimensions({ width: image.width, height: image.height });
      setCubeWidth(image.width / 10);
      setCubeHeight(image.height / 10);
    };
  }, []);

  const faceWidth = cubeWidth * 0.0254;
  const faceHeight = cubeHeight * 0.0254;
  const cubeDepth = 1; // Depth in inches

  const frontMaterial = new MeshStandardMaterial({
    map: texture,
    roughness: 0.5
  });
  const canvasMaterial = new MeshStandardMaterial({
    color: 0xffffff,
    map: canvas_tex
  });

  const materials = [
    canvasMaterial, // Right side
    canvasMaterial, // Left side
    canvasMaterial, // Top side
    canvasMaterial, // Bottom side
    frontMaterial, // Front side
    canvasMaterial // Back side
  ];

  const Artwork = forwardRef((props, ref) => {
    if (!texture) return null;

    return (
      <mesh
        ref={ref}
        material={materials}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <boxGeometry args={[faceWidth, faceHeight, cubeDepth * 0.0254]} />
      </mesh>
    );
  });

  return (
    <>
      <div>
        <label htmlFor="fileInput">Load Image: </label>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={(e) => handleFileChange(e)}
        />
      </div>
      <div>
        <label htmlFor="widthInput">Cube Width (in): </label>
        <input
          type="number"
          id="widthInput"
          value={cubeWidth}
          onChange={(e) => setCubeWidth(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="heightInput">Cube Height (in): </label>
        <input
          type="number"
          id="heightInput"
          value={cubeHeight}
          onChange={(e) => setCubeHeight(e.target.value)}
        />
      </div>
      <Canvas shadows>
        <ambientLight intensity={0.1} />
        <spotLight
          ref={sp}
          position={[0, 3, 2]}
          angle={Math.PI / 4}
          penumbra={1}
          decay={1}
          intensity={2}
          castShadow
          color={"#fcce90"}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          target={artRef.current}
        />
        <Artwork ref={artRef} />

        <mesh
          position={[0, 0, (-cubeDepth * 0.0254) / 2]}
          rotation={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color={0xffffff} />
        </mesh>
        <OrbitControls />
        <PerspectiveCamera ref={camera} makeDefault position={[0, 0, 5]} />

        {/* Uncomment the line below to visualize the spotlight */}
        {/* <directionalLightHelper args={[sp.current]} /> */}
      </Canvas>
    </>
  );
};

const App = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Scene />
    </div>
  );
};

export default App;
