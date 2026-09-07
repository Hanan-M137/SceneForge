//The id: 202316455
let seed = 6455;
let n = 8 + (seed % 8);
let p = 3 + (seed % 4);
let d = 4 + (seed % 3);

//variables
let currentModule = 0;

//For Module1 + 2 + 3
let palette = [];

//For Module1
let shapes = [];
let useAlpha = true;

//For Module2
let triangleCount = 0;
let chaosPoints = [];
let chaosIterations = 5000;
let recursionCalls = 0;

//For Module3 
let transformAngle;
let transformScale;

//For Module4
let cameraMode = "perspective";
let orbitCamera = true;
let webglCanvas;

//For Module5
let measurementResults = [];
let measurementsDone = false;
let sceneResults = [];
let sceneMeasurementsDone = false;
let shapesResults = [];
let recursionResults = [];
let showAnalysis = true;

//RNG (written by hand from the seed)
//next(x) = (1103515245*x + 12345) % 2147483648
let rngState = seed;
function next() {
  rngState = (1103515245 * rngState + 12345) % 2147483648;
  return rngState;
}
function rngRange(min, max) {
  let r = next() / 2147483648;
  return min + r * (max - min);
}

//setup
function buildShapes(count) {
  let result = [];

  for (let i = 0; i < count; i++) {

    let shapeTypes = [
      "rect",
      "circle",
      "triangle"
    ];

    let typeIndex = floor(rngRange(0, shapeTypes.length));
    let type = shapeTypes[typeIndex];

    let shape = {
      type: type,
      x: rngRange(100, 700),
      y: rngRange(150, 550),
      size: rngRange(40, 100),
      paletteIndex: floor(rngRange(0, p))
    };

    result.push(shape);
  }
    return result;
}

function countTransformOps(shapeArray) {
  return shapeArray.length * 6; //6 because:
  // Each shape is drawn twice in Module 3 (order A and order B),
  // and each draw applies 3 transforms (translate, rotate, scale).
  // 2 x 3 = 6 transform operations per shape.
}

function setup() {
  createCanvas(800, 600);

  // WEBGL canvas is used only for Module 4
  webglCanvas = createGraphics(800, 600, WEBGL);

  for (let i = 0; i < p; i++) {
    palette.push(
      color(
        rngRange(60, 255),
        rngRange(60, 255),
        rngRange(60, 255)
      ));
  }

  //shapes for Module1
  shapes = buildShapes(n);

  //Chaos Game points
  generateChaosGame();

  //Module3 transformation values
  transformAngle = radians(seed % 360);
  transformScale = 1 + (seed % 3) * 0.2;
}

//draw
function draw() {
  background(240);
  fill(0);
  textSize(16);

  text("Seed: " + seed, 20, 30);
  text("Shapes (n): " + n, 20, 50);
  text("Palette (p): " + p, 20, 80);
  text("Depth (d): " + d, 20, 105);

  if (currentModule === 0) {
    drawMenu();
  }

  else if (currentModule === 1) {
    drawModule1();
  }

  else if (currentModule === 2) {
    drawModule2();
  }

  else if (currentModule === 3) {
    drawModule3();
  }

  else if (currentModule === 4) {
    drawModule4();
  }

  else if (currentModule === 5) {
    drawModule5();
  }
}

function drawMenu() {
  fill(0);
  textSize(30);
  text("SCENEFORGE",50,150);
  textSize(20);

  text("Choose module number - press on the keyboard",50,180);
  text("1. Draw Scene",50,220);
  text("2. Sierpinski Gasket + Chaos Game",50,260);
  text("3. Transform Scene",50,300);
  text("4. 3D View",50,340);
  text("5. Measure Algorithms",50,380);
  
  textSize(12);
  text("Press 0 to come back here",50,420);
  text("Remark: [A] alpha (M1) - [C] orbit cam (M4) - [T] analysis/results (M5)", 50, 440);
}

//keyboard
function keyPressed() {

  if (key === '0') {
    currentModule = 0;
  }

  else if (key === '1') {
    currentModule = 1;
  }

  else if (key === '2') {
    currentModule = 2;
    triangleCount = 0;
  }

  else if (key === '3') {
    currentModule = 3;
  }

  else if (key === '4') {
    currentModule = 4;
  }

  else if (key === '5') {
    currentModule = 5;

    if (!measurementsDone) {
      runFractalMeasurements();
      runShapesMeasurements();
      runRecursionMeasurements();
    }

    if (!sceneMeasurementsDone) {
      runSceneMeasurements();
    }
  }


  if (currentModule === 1) {
    if (key === 'a' || key === 'A') 
      useAlpha = !useAlpha;  
  }
  
  if (currentModule === 5) {
    if (key === 't' || key === 'T') {
      showAnalysis = !showAnalysis;
    }
  }
  
  if (currentModule === 4) {
    if (key === 'p' || key === 'P') {
      cameraMode = "perspective";
    }

    if (key === 'o' || key === 'O') {
      cameraMode = "orthographic";
    }

    if (key === 'c' || key === 'C') {
      orbitCamera = !orbitCamera;
    }
  }
}


//MODULE1: Draw Scene
function drawModule1() {
  for (let i = 0; i < shapes.length; i++) {
    let shape = shapes[i];

    let c = palette[shape.paletteIndex];
    fill(red(c), green(c), blue(c), useAlpha ? 160 : 255);

    //Rectangle
    if (shape.type === "rect") {
      rect(shape.x, shape.y, shape.size, shape.size)
    }
      
    //Circle
    else if (shape.type === "circle") {
      circle(shape.x, shape.y, shape.size);
    }


    //Triangle
    else if (shape.type === "triangle") {
      triangle(
        shape.x, shape.y - shape.size / 2,
        shape.x - shape.size / 2, shape.y + shape.size / 2,
        shape.x + shape.size / 2, shape.y + shape.size / 2);
    }
  }
  fill(0);
   textSize(12);
   text("Alpha blending: " + (useAlpha ? "ON (press A or a)" : "OFF (press A)"), 20, 580);
}
   

//MODULE2: Sierpinski Gasket + Chaos Game
function drawModule2() {
  fill(0);
  textSize(22);

  text("Sierpinski Gasket",40,150);
  textSize(16);
  text("Depth: " + d,40,175);

  //Reset counter every frame
  triangleCount = 0;


  //Main triangle
  let x1 = 200;
  let y1 = 190;

  let x2 = 60;
  let y2 = 480;

  let x3 = 340;
  let y3 = 480;

  //Draw recursive gasket
  sierpinski(x1, y1,x2, y2,x3, y3,d,0);
  fill(0);
  text("Triangles drawn: " + triangleCount,40,525);

  //Chaos Game
  textSize(22);
  text("Chaos Game",470,150);
  textSize(16);
  text("Iterations: " + chaosIterations,470,175);

  strokeWeight(1);

  for (let i = 0;i < chaosPoints.length;i++) {

    let pt = chaosPoints[i];
    stroke(palette[i % p]);
    point(pt.x,pt.y);
   }
  
  noStroke();

  fill(0);
  textSize(16);
  text("Both methods create the Sierpinski fractal.", 400, 545);
  text("Recursion divides triangles; Chaos Game uses random points.", 400,   570);
}



function sierpinski(x1, y1, x2, y2, x3, y3, depth, level) {

  recursionCalls++;

  if (depth === 0) {
    //Colour according to recursion level
    let colorIndex = level % p;
    fill(palette[colorIndex]);
    noStroke();
    triangle(x1, y1, x2, y2, x3, y3);
    triangleCount++;
    return;
  }
  
  let mx12 = (x1 + x2) / 2;
  let my12 = (y1 + y2) / 2;
  let mx23 = (x2 + x3) / 2;
  let my23 = (y2 + y3) / 2;
  let mx31 = (x3 + x1) / 2;
  let my31 = (y3 + y1) / 2;

  sierpinski(x1, y1, mx12, my12, mx31, my31, depth - 1, level + 1);
  sierpinski(mx12, my12, x2, y2, mx23, my23, depth - 1, level + 1);
  sierpinski(mx31, my31, mx23, my23, x3, y3, depth - 1, level + 1);
}

//CHAOS GAME
function generateChaosGame() {
  chaosPoints = [];
  // Triangle vertices
  let vertices = [
    { x: 600, y: 190 },
    { x: 460, y: 480 },
    { x: 740, y: 480 }
  ];

  let current = { x: 600, y: 350 };

  for (let i = 0; i < chaosIterations; i++) {
    //Choose random vertex
    let chosenVertex = vertices[floor(rngRange(0, 3))];

    //Move halfway toward chosenVertex
    current = {
      x: (current.x + chosenVertex.x) / 2,
      y: (current.y + chosenVertex.y) / 2
    };

    chaosPoints.push({ x: current.x, y: current.y });
  }
}

//MODULE3: Transform Scene
function drawModule3() {

  fill(0);
  textSize(22);
  text("Module 3 - Transform Scene", 40, 150);

  textSize(16);
  text("Transformations use the seeded shapes", 40, 180);
  text("Left: Translate → Rotate → Scale", 40, 205);
  text("Right: Rotate → Translate → Scale", 420, 205);

  for (let i = 0; i < shapes.length; i++) {
    let shape = shapes[i];
    
    push();
    translate(shape.x - 200, shape.y - 100);
    rotate(transformAngle + i * 0.1);
    scale(transformScale);
    drawShapeAtOrigin(shape);
    pop();

    push();
    rotate(transformAngle + i * 0.1);
    translate(shape.x - 600, shape.y - 100);
    scale(transformScale);
    drawShapeAtOrigin(shape);
    pop();
  }

  push();
  translate(400, 500);
  rotate(frameCount * 0.03);
  fill(palette[0]);
  rectMode(CENTER);
  rect(0, 0, 70, 70);
  rectMode(CORNER);
  pop();

  fill(0);
  textSize(15);
  text("Animated shape", 350, 550);
}


function drawShapeAtOrigin(shape) {

  fill(palette[shape.paletteIndex]);
  noStroke();
  
  if (shape.type === "rect") {
    rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
  }

  else if (shape.type === "circle") {
    circle(0, 0, shape.size);
  }

  else if (shape.type === "triangle") {
    triangle(
      0, -shape.size / 2,
      -shape.size / 2, shape.size / 2,
      shape.size / 2, shape.size / 2);
  }
}

// MODULE4: 3D view
function drawModule4() {
  webglCanvas.background(240);
  
  let angle = frameCount * 0.01;
  let radius = 400;
  let camX = radius * cos(angle);
  let camZ = radius * sin(angle);


  if (cameraMode === "perspective") {
    webglCanvas._renderer.perspective();
  }

  else {
    webglCanvas._renderer.ortho(-width / 2, width / 2, -height / 2, height / 2, 0.1, 2000);
  }

  if (orbitCamera) {
    webglCanvas._renderer.camera(
      camX, -200, camZ,
      0, 0, 0,
      0, 1, 0);
  }
  
  webglCanvas.push();
  webglCanvas.rotateX(frameCount * 0.01);
  webglCanvas.rotateY(frameCount * 0.015);
  webglCanvas.normalMaterial();
  webglCanvas.box(150);
  webglCanvas.pop();

  webglCanvas.push();
  webglCanvas.translate(-220, 100, 0);
  webglCanvas.normalMaterial();
  webglCanvas.sphere(60);
  webglCanvas.pop();

  webglCanvas.push();
  webglCanvas.translate(220, 100, 0);
  webglCanvas.normalMaterial();
  webglCanvas.cone(60, 120);
  webglCanvas.pop();

  image(webglCanvas, 0, 0);

  fill(0);
  textSize(24);
  text("Module 4 - 3D View", 40, 160);

  textSize(16);
  text("WEBGL Camera", 40, 190);
  text("Press P = Perspective", 40, 220);
  text("Press O = Orthographic", 40, 245);
  text("Press C = Toggle Camera Orbit", 40, 270);
  text("Current view: " + cameraMode, 40, 300);
  text("Perspective: far objects appear smaller.", 40, 340);
  text("Orthographic: objects keep their size.", 40, 365);
}


//MODULE5: Measure Algorithms
function runFractalMeasurements() {
  measurementResults = [];
  let depthsToTest = [1, 2, 3, 4, 5];

  for (let i = 0; i < depthsToTest.length; i++) {

    let depth = depthsToTest[i];
    let runTotals = 0;

    for (let run = 0; run < 3; run++) {
      triangleCount = 0;
      sierpinski(200, 190, 60, 480, 340, 480, depth, 0);
      runTotals = runTotals + triangleCount;
    }

    let avgTriangles = runTotals / 3;
    measurementResults.push({ depth: depth, avgTriangles: avgTriangles });
  }

  measurementsDone = true;
}

function runSceneMeasurements() {
  sceneResults = [];
  let sizesToTest = [5, 10, 20, 40, 80];

  for (let i = 0; i < sizesToTest.length; i++) {

    let size = sizesToTest[i];
    let runTotals = 0;

    for (let run = 0; run < 3; run++) {
      let testShapes = buildShapes(size);
      runTotals = runTotals + countTransformOps(testShapes);
    }

    let avgDrawn = runTotals / 3;
    sceneResults.push({ size: size, avgDrawn: avgDrawn });
  }
  sceneMeasurementsDone = true;
}

//A1: shapes drawn - measured vs theory (n)
function runShapesMeasurements() {

  shapesResults = [];
  let sizesToTest = [5, 10, 20, 40, 80];

  for (let i = 0; i < sizesToTest.length; i++) {

    let size = sizesToTest[i];
    let runTotals = 0;

    for (let run = 0; run < 3; run++) {
      let testShapes = buildShapes(size);
      runTotals = runTotals + testShapes.length;
    }

    let avgShapes = runTotals / 3;
    shapesResults.push({ size: size, avgShapes: avgShapes });
  }
}

//A4: recursion calls - measured vs theory ((3^(d+1)-1)/2)
function runRecursionMeasurements() {

  recursionResults = [];
  let depthsToTest = [1, 2, 3, 4, 5];

  for (let i = 0; i < depthsToTest.length; i++) {

    let depth = depthsToTest[i];
    let runTotals = 0;

    for (let run = 0; run < 3; run++) {
      recursionCalls = 0;
      sierpinski(200, 190, 60, 480, 340, 480, depth, 0);
      runTotals = runTotals + recursionCalls;
    }

    let avgCalls = runTotals / 3;
    recursionResults.push({ depth: depth, avgCalls: avgCalls });
  }
}

function drawLineChart(px, py, pw, ph, dataPoints, theoryFn, xKey, title) {
  let maxY = 0;

  for (let i = 0; i < dataPoints.length; i++) {

    let measured = dataPoints[i].value;
    let theory = theoryFn(dataPoints[i][xKey]);

    if (measured > maxY) maxY = measured;
    if (theory > maxY) maxY = theory;
  }

  stroke(0);
  line(px, py, px, py + ph);
  line(px, py + ph, px + pw, py + ph);
  noStroke();
  fill(0);
  textSize(13);
  text(title, px, py - 10);

  let stepX = pw / (dataPoints.length - 1);

  stroke(30, 90, 200);
  strokeWeight(2);
  noFill();
  beginShape();

  for (let i = 0; i < dataPoints.length; i++) {

    let x = px + i * stepX;
    let y = py + ph - (dataPoints[i].value / maxY) * ph;
    vertex(x, y);
  }

  endShape();

  stroke(220, 90, 30);
  strokeWeight(2);
  noFill();
  beginShape();

  for (let i = 0; i < dataPoints.length; i++) {

    let x = px + i * stepX;
    let theory = theoryFn(dataPoints[i][xKey]);
    let y = py + ph - (theory / maxY) * ph;
    vertex(x, y);
  }

  endShape();

  strokeWeight(1);

  noStroke();
  textSize(10);

  for (let i = 0; i < dataPoints.length; i++) {

    let x = px + i * stepX;
    let ym = py + ph - (dataPoints[i].value / maxY) * ph;

    fill(30, 90, 200);
    circle(x, ym, 6);

    let theory = theoryFn(dataPoints[i][xKey]);
    let yt = py + ph - (theory / maxY) * ph;

    fill(220, 90, 30);
    circle(x, yt, 6);

    fill(0);
    text(dataPoints[i][xKey], x - 5, py + ph + 15);
  }

  // Legend
  fill(30, 90, 200);
  rect(px, py + ph + 30, 10, 10);
  fill(0);
  text("measured", px + 15, py + ph + 39);

  fill(220, 90, 30);
  rect(px + 90, py + ph + 30, 10, 10);
  fill(0);
  text("theory", px + 105, py + ph + 39);
}

function drawFractalPlot(px, py, pw, ph) {

  let data = [];

  for (let i = 0; i < measurementResults.length; i++) {
    data.push({ depth: measurementResults[i].depth, value: measurementResults[i].avgTriangles });
  }

  drawLineChart(
    px, py, pw, ph, data,
    function(d) { return pow(3, d); },
    "depth",
    "Plot 1: Fractal Triangles vs Depth");
}

function drawScenePlot(px, py, pw, ph) {
  let data = [];
  for (let i = 0; i < sceneResults.length; i++) {
    data.push({ size: sceneResults[i].size, value: sceneResults[i].avgDrawn });
  }

  drawLineChart(
    px, py, pw, ph, data,
    function(n) { return 6 * n; },
    "size",
    "Plot 2: Transforms vs Scene Size");
}

function drawModule5() {

  fill(0);
  textSize(20);
  text("Module 5 - Compare Results (4 algorithms)", 40, 130);

  textSize(12);
  text("Press T to toggle between analysis and results", 40, 150);

  if (showAnalysis) {
    drawAnalysisTable();
    return;
  }

  // A1 - shapes drawn
  text("A1  shapes drawn: measured vs. theory (n)", 40, 180);
  for (let i = 0; i < shapesResults.length; i++) {
    let r = shapesResults[i];
    text("n " + r.size + " -> measured: " + r.avgShapes + "  theory: " + r.size, 40, 200 + i * 18);
  }

  // A2 - fractal triangles
  text("A2  fractal triangles: measured vs. theory (3^depth)", 430, 180);
  for (let i = 0; i < measurementResults.length; i++) {
    let r = measurementResults[i];
    let theoretical = pow(3, r.depth);
    text("d " + r.depth + " -> measured: " + r.avgTriangles + "  theory: " + theoretical, 430, 200 + i * 18);
  }

  // A3 - transforms
  text("A3  scene transforms: measured vs. theory (6n)", 40, 320);
  for (let i = 0; i < sceneResults.length; i++) {
    let r = sceneResults[i];
    let theoretical = 6 * r.size;
    text("n " + r.size + " -> measured: " + r.avgDrawn + "  theory: " + theoretical, 40, 340 + i * 18);
  }

  // A4 - recursion calls
  text("A4  recursion calls: measured vs. theory ((3^(d+1)-1)/2)", 430, 320);
  for (let i = 0; i < recursionResults.length; i++) {
    let r = recursionResults[i];
    let theoretical = (pow(3, r.depth + 1) - 1) / 2;
    text("d " + r.depth + " -> measured: " + r.avgCalls + "  theory: " + theoretical, 430, 340 + i * 18);
  }

  drawFractalPlot(40, 450, 260, 130);
  drawScenePlot(340, 450, 260, 130);
}

function drawAnalysisTable() {

  fill(20);
  textSize(13);
  text("Theoretical analysis (paper), before running anything", 40, 180);

  let cols = [40, 130, 260, 460, 620];
  let headers = ["ALGORITHM", "INPUT SIZE", "BASIC OPERATION", "C()", "CLASS"];

  fill(100);
  textSize(11);
  for (let i = 0; i < headers.length; i++) {
    text(headers[i], cols[i], 210);
  }

  stroke(200);
  line(40, 218, 760, 218);
  noStroke();

  let rows = [
    ["A1  shapes drawn",    "n = shapes", "one shape emitted",      "C(n) = n",              "O(n)  linear"],
    ["A2  fractal triangles","d = depth",  "one base-case triangle", "C(d) = 3^d",            "O(3^d)  exponential"],
    ["A3  scene transforms", "n = shapes", "one affine transform",   "C(n) = 6n",             "O(n)  linear"],
    ["A4  recursion calls",  "d = depth",  "one call to sierpinski", "C(d) = (3^(d+1)-1)/2",  "O(3^d)  exponential"]
  ];

  fill(20);
  textSize(11);
  for (let r = 0; r < rows.length; r++) {
    let y = 236 + r * 26;
    for (let c = 0; c < rows[r].length; c++) {
      text(rows[r][c], cols[c], y);
    }
    stroke(235);
    line(40, y + 8, 760, y + 8);
    noStroke();
  }

  fill(20);
  textSize(12);
  text("How each count was derived", 40, 360);

  fill(70);
  textSize(11);
  let notes = [
    "A1: draw() visits the seeded array once, emitting one shape per record -> C(n) = n.",
    "A2: level 0 holds 1 triangle, level k holds 3^k. Every base case sits at level d -> C(d) = 3^d.",
    "A3: each shape is drawn twice (order A, order B), 3 transforms per draw -> C(n) = 2 x 3 x n = 6n.",
    "A4: T(d) = 1 + 3*T(d-1), T(0) = 1  =>  T(d) = 3^0 + 3^1 + ... + 3^d = (3^(d+1) - 1) / 2.",
    "",
    "A2 and A4 share the same growth class (exponential): recursion calls are 3^d up to a constant",
    "factor of 3/2, same shape as the triangle count itself.",
    "",
    "A1 and A3 share the same growth class (linear): both scale directly with the number of shapes,",
    "only the constant factor (1 vs 6) differs."
  ];

  for (let i = 0; i < notes.length; i++) {
    text(notes[i], 40, 380 + i * 16);
  }
}
