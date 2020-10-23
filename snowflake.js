/** @type {WebGLRenderingContext} */

var canvas;
var gl;
var points = [];
var iterationCount = 7; //global iteration value
var vertices = [
  // three vertices
  vec2(-0.5, -0.5),
  vec2(0, Math.sqrt(3) * 0.5 - 0.5),
  vec2(0.5, -0.5),
];

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  //call function to divide three lines
  snowflake(vertices[0], vertices[1], vertices[2], iterationCount);

  //snoflake(vertices[0],vertices[1],vertices[2],2);
  //triangle(vertices[0], vertices[1], vertices[2]);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();
};
//this function is to divide three lines
function snowflake(a, b, c, count) {
  divideLine(a, b, count);
  //   divideLine(b, c, count);
  //   divideLine(c, a, count);
}
//this function for divide each line and draw the koch line
function divideLine(a, b, count) {
  if (count === 0) {
    var left;
    var right;
    left = mix(a, b, 1 / 4);
    right = mix(a, b, 3 / 4);
    var f = calculatePoint(left, right);
    drawLine(a, left, f, right, b);
  } else {
    var ab = mix(a, b, 0.25);
    var ba = mix(b, a, 0.25);
    var v = calculatePoint(ab, ba);
    count--;
    divideLine(a, ab, count);
    divideLine(ba, b, count);
    divideLine(ab, v, count);
    divideLine(v, ba, count);
  }
  return f;
}
//this function is to rotate the line and find the point
function calculatePoint(center, p) {
  var angleInDegrees = 90;
  var angleInRadians = (angleInDegrees * Math.PI) / 180;
  var s1 = Math.sin(angleInRadians);
  var c1 = Math.cos(angleInRadians);
  var x1 = (p[0] - center[0]) * c1 - (p[1] - center[1]) * s1 + center[0];
  var y1 = (p[0] - center[0]) * s1 + (p[1] - center[1]) * c1 + center[1];
  var f = vec2(x1, y1);
  return f;
}
//this function is to draw a line with 5 points
function drawLine(a, b, c, d, e) {
  points.push(a, b);
  points.push(b, c);
  points.push(c, d);
  points.push(d, e);
}
//draw trangle, I didn't call it in main function
function triangle(a, b, c) {
  points.push(a, b); // (-1, -1), (0, 1), (1, -1)
  points.push(b, c);
  points.push(c, a);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, points.length);
}
