"use client"

import { useEffect, useRef } from "react"

interface WebGLShaderBackgroundProps {
  className?: string
}

export function WebGLShaderBackground({ className }: WebGLShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const shaderMode = Math.random() > 0.5 ? "GRID" : "LINE"
    const rotation = Math.random() * Math.PI * 2
    const colorIndex = Math.floor(Math.random() * 7)
    const colorValues = [
      "vec3(0.02,0.424,0.976)",      // blue
      "vec3(0.973,0.078,0.137)",     // red
      "vec3(0.235,0.671,0.286)",     // green
      "vec3(0.949,0.388,0.137)",     // orange
      "vec3(0.627,0.078,0.925)",     // purple
      "vec3(0.102,0.69,0.965)",      // lightblue
      "vec3(0.965,0.996,0.31)",      // yellow
    ]
    const selectedColor = colorValues[colorIndex]
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl2", { antialias: true, preserveDrawingBuffer: true })
    if (!gl) return

    const shaders: WebGLShader[] = []
    let program: WebGLProgram | null = null
    let vertexBuffer: WebGLBuffer | null = null
    let animationFrame: number | null = null
    let previousFrameTime: number | null = null
    let elapsedTime = 0
    let manuallyPaused = false
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const releaseResources = () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame)
      if (vertexBuffer) gl.deleteBuffer(vertexBuffer)
      if (program) gl.deleteProgram(program)
      shaders.forEach((shader) => gl.deleteShader(shader))
    }

    const compileShader = (shaderSource: string, shaderType: number) => {
      const shader = gl.createShader(shaderType)
      if (!shader) throw new Error("Could not create shader")
      shaders.push(shader)
      gl.shaderSource(shader, shaderSource)
      gl.compileShader(shader)
      const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
      if (!success) {
        throw new Error("Could not compile shader: " + gl.getShaderInfoLog(shader))
      }
      return shader
    }

    const createProgram = (vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
      program = gl.createProgram()
      if (!program) throw new Error("Could not create program")
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      const success = gl.getProgramParameter(program, gl.LINK_STATUS)
      if (!success) {
        throw new Error("Program failed to link: " + gl.getProgramInfoLog(program))
      }
      return program
    }

    const vertexShaderSource = `attribute vec2 aVertexPosition;
void main() {
  gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}
`

    const fragmentShaderSource = `#ifdef GL_ES
precision highp float;
#endif
uniform float u_time;
uniform vec2 u_resolution;
#define ${shaderMode}

mat2 Rot(float a) {
  float s=sin(a), c=cos(a);
  return mat2(c, -s, s, c);
}

vec3 permute(vec3 x){return mod(((x*34.)+1.)*x,289.);}

float snoise(vec2 v){
    const vec4 C=vec4(.211324865405187,.366025403784439,
    -.577350269189626,.024390243902439);
    vec2 i=floor(v+dot(v,C.yy));
    vec2 x0=v-i+dot(i,C.xx);
    vec2 i1;
    i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
    vec4 x12=x0.xyxy+C.xxzz;
    x12.xy-=i1;
    i=mod(i,289.);
    vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))
    +i.x+vec3(0.,i1.x,1.));
    vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)),0.);
    m=m*m;
    m=m*m;
    vec3 x=2.*fract(p*C.www)-1.;
    vec3 h=abs(x)-.5;
    vec3 ox=floor(x+.5);
    vec3 a0=x-ox;
    m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
    vec3 g;
    g.x=a0.x*x0.x+h.x*x0.y;
    g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.*dot(m,g);
}

void main() {
    vec2 uv = (2.0*(gl_FragCoord.xy)-u_resolution.xy)/min(u_resolution.x, u_resolution.y);   
    uv*=Rot(${rotation});
    
    uv.x+=snoise(1.+uv+vec2(1.,u_time*.1))*.15;
    uv.y+=snoise(1.+uv+vec2(-u_time*.05,1.))*.15;
    #ifdef GRID
      vec2 grid = vec2(60.,60.);
    #endif
    
    #ifdef LINE
      uv.x=1.0;
      vec2 grid = vec2(1.,60.);
    #endif  
    
    vec3 col = vec3(0.0);
    
    col = smoothstep(
      .2,
      0.01, 
      sin(grid.x*uv.x) * sin(grid.y*uv.y))
      * ${selectedColor};
    gl_FragColor = vec4(col,1.0);
}
`

    try {
      vertexBuffer = gl.createBuffer()
      if (!vertexBuffer) throw new Error("Could not create vertex buffer")
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, 1, 1, 1, 1, -1, -1, 1, 1, -1, -1, -1]),
        gl.STATIC_DRAW,
      )
      const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER)
      const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER)
      const linkedProgram = createProgram(vertexShader, fragmentShader)
      const vertexPosition = gl.getAttribLocation(linkedProgram, "aVertexPosition")
      gl.enableVertexAttribArray(vertexPosition)
      gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0)
      gl.useProgram(linkedProgram)

      const resolutionUniform = gl.getUniformLocation(linkedProgram, "u_resolution")
      const timeUniform = gl.getUniformLocation(linkedProgram, "u_time")
      const draw = () => {
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clearColor(1, 1, 1, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.uniform2f(resolutionUniform, canvas.width, canvas.height)
        gl.uniform1f(timeUniform, elapsedTime * 0.001)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }

      const isPaused = () => manuallyPaused || document.hidden || mediaQuery.matches
      const syncPlayback = () => {
        if (isPaused()) {
          if (animationFrame !== null) cancelAnimationFrame(animationFrame)
          animationFrame = null
          previousFrameTime = null
        } else if (animationFrame === null) {
          animationFrame = requestAnimationFrame(render)
        }
      }
      const render = (time: number) => {
        animationFrame = null
        if (isPaused()) {
          previousFrameTime = null
          return
        }
        if (previousFrameTime !== null) elapsedTime += time - previousFrameTime
        previousFrameTime = time
        draw()
        syncPlayback()
      }
      const resize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        canvas.style.width = "100%"
        canvas.style.height = "100%"
        draw()
      }
      const handleMouseDown = () => {
        manuallyPaused = !manuallyPaused
        syncPlayback()
      }

      resize()
      syncPlayback()
      window.addEventListener("resize", resize)
      document.addEventListener("mousedown", handleMouseDown)
      document.addEventListener("visibilitychange", syncPlayback)
      mediaQuery.addEventListener("change", syncPlayback)

      return () => {
        window.removeEventListener("resize", resize)
        document.removeEventListener("mousedown", handleMouseDown)
        document.removeEventListener("visibilitychange", syncPlayback)
        mediaQuery.removeEventListener("change", syncPlayback)
        releaseResources()
      }
    } catch (error) {
      releaseResources()
      throw error
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        background: "black",
      }}
    />
  )
}

