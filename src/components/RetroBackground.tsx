import { useEffect, useRef } from "react";
import * as THREE from "three";

export function RetroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create flowing particles
    const geometry = new THREE.BufferGeometry();
    const particles = 15000;
    const positions = new Float32Array(particles * 3);
    const colors = new Float32Array(particles * 3);

    const color1 = new THREE.Color("#ea384c"); // Retro red
    const color2 = new THREE.Color("#221F26"); // Dark background

    for (let i = 0; i < particles * 3; i += 3) {
      const radius = Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;

      positions[i] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i + 2] = radius * Math.cos(theta);

      const mixRatio = Math.random();
      const particleColor = new THREE.Color().lerpColors(
        color1,
        color2,
        mixRatio
      );

      colors[i] = particleColor.r;
      colors[i + 1] = particleColor.g;
      colors[i + 2] = particleColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    camera.position.z = 5;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      const positions = geometry.attributes.position.array as Float32Array;
      const time = Date.now() * 0.0001;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + positions[i + 1]) * 0.002;
        positions[i + 1] += Math.cos(time + positions[i]) * 0.002;
        positions[i + 2] += Math.sin(time + positions[i]) * 0.002;
      }

      geometry.attributes.position.needsUpdate = true;
      points.rotation.y += 0.0005;
      points.rotation.x += 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Mouse movement effect
    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

      points.rotation.x += mouseY * 0.0005;
      points.rotation.y += mouseX * 0.0005;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 -z-20" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-fashion-retro-black/80 via-black/60 to-fashion-retro-red/30 pointer-events-none" />
    </>
  );
}
