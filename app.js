var canvas;
/** @type {WebGLRenderingContext} */
var gl;
var points = [];
var iterationCount = 1;
var vertices = [];
var cindex = 0;

var colors = [
  vec4(0.0, 0.0, 0.0, 1.0), // black
  vec4(1.0, 0.0, 0.0, 1.0), // red
  vec4(1.0, 1.0, 0.0, 1.0), // yellow
  vec4(0.0, 1.0, 0.0, 1.0), // green
  vec4(0.0, 0.0, 1.0, 1.0), // blue
  vec4(1.0, 0.0, 1.0, 1.0), // magenta
  vec4(0.0, 1.0, 1.0, 1.0), // cyan
];

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  var m = document.getElementById("colorMenu");

  m.addEventListener("click", function () {
    cindex = m.selectedIndex;
    console.log(colors[cindex]);
  });

  var button = document.getElementById("drawButton");
  button.addEventListener("click", function () {
    snowflake(vertices, iterationCount);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    render();
  });

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  canvas.addEventListener("mousedown", function (event) {
    t = vec2(
      (2 * event.clientX) / canvas.width - 1,
      (2 * (canvas.height - event.clientY)) / canvas.height - 1
    );
    vertices.push(t);
    console.log(`vector added ${t}`);
    console.dir(`array ${vertices}`);
  });
};
function snowflake(vertArray, count) {
  let index = 0;
  for (index; index < vertArray.length; index++) {
    divideLine(
      vertArray[index],
      vertArray[(index + 1) % vertArray.length],
      count
    );
  }
}
function divideLine(a, I, count) {
  if (count === 0) {
    var b = mix(a, I, 1 / 4);
    var h = mix(a, I, 3 / 4);
    var e = mix(a, I, 2 / 4);
    var c = calculatePoint(b, h, false);
    var g = calculatePoint(h, b, false);
    var d = calculatePoint(e, h, true);
    var f = calculatePoint(e, b, true);

    drawLine([a, b, c, d, e, f, g, h, I]);
  } else {
    var b = mix(a, I, 1 / 4);
    var h = mix(a, I, 3 / 4);
    var e = mix(a, I, 2 / 4);
    var c = calculatePoint(b, h, false);
    var g = calculatePoint(h, b, false);
    var d = calculatePoint(e, h, true);
    var f = calculatePoint(e, b, true);
    count--;
    divideLine(a, b, count);
    divideLine(b, c, count);
    divideLine(c, d, count);
    divideLine(d, e, count);
    divideLine(e, f, count);
    divideLine(f, g, count);
    divideLine(g, h, count);
    divideLine(h, I, count);
  }
}

function calculatePoint(left, right, isInner = false) {
  var angleInDegrees = 90;
  var angleInRadians = (angleInDegrees * Math.PI) / 180;
  var s1 = Math.sin(angleInRadians);
  var c1 = Math.cos(angleInRadians);
  if (!isInner) {
    var x1 =
      ((right[0] - left[0]) / 2) * c1 -
      ((right[1] - left[1]) / 2) * s1 +
      left[0];
    var y1 =
      ((right[0] - left[0]) / 2) * s1 +
      ((right[1] - left[1]) / 2) * c1 +
      left[1];
    var f = vec2(x1, y1);
  } else {
    var x1 = (right[0] - left[0]) * c1 - (right[1] - left[1]) * s1 + left[0];
    var y1 = (right[0] - left[0]) * s1 + (right[1] - left[1]) * c1 + left[1];
    var f = vec2(x1, y1);
  }
  return f;
}

function calculatePoints(left, righ) {
  var c, cd, d, de, e, eb;
}

function hypot(a, b) {
  var x = Math.sqrt(a[0] - b[0]);
  var y = Math.sqrt(a[1] - b[2]);
  var v = vec2(x, y);
  return v;
}
//this function is to draw a line with 5 points
function drawLine(array) {
  for (let index = 0; index < array.length - 1; index++) {
    points.push(array[index], array[index + 1]);
  }
}
//draw trangle, I didn't call it in main function
function triangle(a, b, c) {
  points.push(a, b);
  points.push(b, c);
  points.push(c, a);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, points.length);
}
