export const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)
  if (shader === null) throw `gl.createShader(${type}) returned null`
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }
  const infoLog = gl.getShaderInfoLog(shader)
  gl.deleteShader(shader)
  throw `gl.COMPILE_STATUS = ${success}, gl.getShaderInfoLog() = ${infoLog}`
}

export const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => {
  const program = gl.createProgram()
  if (program === null) throw `gl.createProgram() returned null`
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }
  const infoLog = gl.getProgramInfoLog(program)
  gl.deleteProgram(program)
  throw `gl.LINK_STATUS = ${success}, gl.getProgramInfoLog() = ${infoLog}`
}
