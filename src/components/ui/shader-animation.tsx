"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface ShaderAnimationProps {
  analyser?: AnalyserNode | null
}

export function ShaderAnimation({ analyser }: ShaderAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    camera: THREE.Camera
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    uniforms: any
    animationId: number
  } | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  useEffect(() => {
    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
    }
  }, [analyser])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `

    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float bass;
      uniform float mid;
      uniform float treble;
      uniform float energy;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 0.05;
        float lineWidth = 0.002 + energy * 0.006;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i = 0; i < 5; i++){
            float offset = mod(uv.x + uv.y, 0.2 + bass * 0.15);
            float radius = fract(t - 0.01 * float(j) + float(i) * 0.01) * (5.0 + mid * 3.0);
            color[j] += lineWidth * float(i * i) / abs(radius - length(uv) + offset);
          }
        }

        // Tint channels based on audio bands
        color.r *= 1.0 + bass * 0.8;
        color.g *= 1.0 + mid * 0.5;
        color.b *= 1.0 + treble * 0.6;

        gl_FragColor = vec4(color, 1.0);
      }
    `

    const camera = new THREE.Camera()
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      bass: { type: "f", value: 0.0 },
      mid: { type: "f", value: 0.0 },
      treble: { type: "f", value: 0.0 },
      energy: { type: "f", value: 0.0 },
    }

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)

    container.appendChild(renderer.domElement)

    const onWindowResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      uniforms.resolution.value.x = renderer.domElement.width
      uniforms.resolution.value.y = renderer.domElement.height
    }

    onWindowResize()
    window.addEventListener("resize", onWindowResize, false)

    const animate = () => {
      const animationId = requestAnimationFrame(animate)
      uniforms.time.value += 0.05

      // Extract audio frequency bands
      if (analyser && dataArrayRef.current) {
        analyser.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>)
        const data = dataArrayRef.current
        const len = data.length

        // Bass: first ~15% of bins
        const bassEnd = Math.floor(len * 0.15)
        let bassSum = 0
        for (let i = 0; i < bassEnd; i++) bassSum += data[i]
        const bassAvg = bassSum / bassEnd / 255

        // Mid: 15%-50%
        const midEnd = Math.floor(len * 0.5)
        let midSum = 0
        for (let i = bassEnd; i < midEnd; i++) midSum += data[i]
        const midAvg = midSum / (midEnd - bassEnd) / 255

        // Treble: 50%-100%
        let trebleSum = 0
        for (let i = midEnd; i < len; i++) trebleSum += data[i]
        const trebleAvg = trebleSum / (len - midEnd) / 255

        const overallEnergy = (bassAvg + midAvg + trebleAvg) / 3

        // Smooth lerp
        uniforms.bass.value += (bassAvg - uniforms.bass.value) * 0.15
        uniforms.mid.value += (midAvg - uniforms.mid.value) * 0.15
        uniforms.treble.value += (trebleAvg - uniforms.treble.value) * 0.15
        uniforms.energy.value += (overallEnergy - uniforms.energy.value) * 0.12
      }

      renderer.render(scene, camera)

      if (sceneRef.current) {
        sceneRef.current.animationId = animationId
      }
    }

    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: 0,
    }

    animate()

    return () => {
      window.removeEventListener("resize", onWindowResize)

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId)

        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement)
        }

        sceneRef.current.renderer.dispose()
        geometry.dispose()
        material.dispose()
      }
    }
  }, [analyser])

  return (
    <div ref={containerRef} className="w-full h-full" />
  )
}
