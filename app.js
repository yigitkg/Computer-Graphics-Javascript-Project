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

var bgColor = vec4(0.8, 0.8, 0.8, 1.0);

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  canvas.addEventListener("mousedown", function (event) {
    t = vec2(
      (2 * event.clientX) / canvas.width - 1,
      (2 * (canvas.height - event.clientY)) / canvas.height - 1
    );
    vertices.push(t);
  });

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  document
    .getElementById("fileInput")
    .addEventListener("change", function selectedFileChanged() {
      if (this.files.length === 0) {
        console.log("No file selected.");
        return;
      }

      const reader = new FileReader();
      reader.onload = function fileReadCompleted() {
        // when the reader is done, the content is in reader.result.
        console.log(reader.result);
      };
      reader.readAsText(this.files[0]);
    });

  var iterationDiv = document.getElementById("iterationText");

  var slider = document.getElementById("interationSlider");

  slider.oninput = function () {
    iterationCount = this.value;
    iterationDiv.innerText = "Iteration: " + iterationCount;
  };

  var m = document.getElementById("colorMenu");

  m.addEventListener("click", function () {
    cindex = m.selectedIndex;
    bgColor = colors[cindex];

    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    render();
  });

  var drawButton = document.getElementById("drawButton");

  drawButton.addEventListener("click", function () {
    snowflake(vertices, iterationCount);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
  });

  var clearButton = document.getElementById("clearButton");
  clearButton.addEventListener("click", function () {
    points = [];
    vertices = [];

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
  });

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
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

function drawLine(array) {
  for (let index = 0; index < array.length - 1; index++) {
    points.push(array[index], array[index + 1]);
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, points.length);
}
