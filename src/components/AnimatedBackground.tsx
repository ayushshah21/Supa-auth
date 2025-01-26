import { useEffect, useRef } from "react";
import * as THREE from "three";

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0A0A0A"); // Very dark background
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const particles = 5000; // Reduced from 15000
    const positions = new Float32Array(particles * 3);
    const colors = new Float32Array(particles * 3);

    const color1 = new THREE.Color("#EA384D"); // Bright red
    const color2 = new THREE.Color("#330D11"); // Very dark red

    for (let i = 0; i < particles * 3; i += 3) {
      const radius = Math.random() * 20; // Increased spread
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;

      positions[i] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i + 2] = radius * Math.cos(theta);

      const mixRatio = Math.random() * 0.9; // More variance in color
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
      size: 0.04, // Slightly smaller for better clarity
      vertexColors: true,
      transparent: true,
      opacity: 0.6, // Slightly more opaque
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    camera.position.z = 8; // Moved camera back for better perspective

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      const positions = geometry.attributes.position.array as Float32Array;
      const time = Date.now() * 0.00005; // Slower movement

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + positions[i + 1]) * 0.001;
        positions[i + 1] += Math.cos(time + positions[i]) * 0.001;
        positions[i + 2] += Math.sin(time + positions[i]) * 0.001;
      }

      geometry.attributes.position.needsUpdate = true;
      points.rotation.y += 0.0001; // Slower rotation
      points.rotation.x += 0.00005;

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

    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      {/* Three.js container */}
      <div ref={containerRef} className="fixed inset-0 -z-20" />

      {/* Dark gradient overlay - more subtle transition */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black/90 via-[#0A0A0A]/85 to-[#1A1A1A]/85 pointer-events-none" />

      {/* Very subtle red glow */}
      <div className="fixed inset-0 -z-15 bg-[#EA384D]/3 mix-blend-overlay pointer-events-none blur-xl" />
    </>
  );
}
