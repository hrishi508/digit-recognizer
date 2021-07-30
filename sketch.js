let touchTime = Date.now()
let pg
const displaySize = 500
let imgSize = 28
let scaleFactor = 1
let clearDelay = 600


function setup() {
  createCanvas(displaySize, displaySize)
  noSmooth()
  strokeWeight(2)
  stroke(255)
  pg = createGraphics(imgSize, imgSize)
  scaleFactor = imgSize / displaySize
  pg.strokeWeight(1.6)
  pg.stroke(255)
  display()
}

function touchStarted() {
  touchTime = Date.now() - touchTime
  if (!mouseInsideCanvas()) return false
  if (touchTime > clearDelay) {
    pg.clear()
  }
  pg.line(mouseX*scaleFactor, mouseY*scaleFactor, mouseX*scaleFactor, mouseY*scaleFactor)
  display()
  return false // prevent context menu
}

function mousePressed() {
  touchStarted()
}

function touchEnded() {
  touchTime = Date.now()
  if (!mouseInsideCanvas()) return false
}

function touchMoved() {
  pg.line(mouseX*scaleFactor, mouseY*scaleFactor, pmouseX*scaleFactor, pmouseY*scaleFactor)
  display()
}

function display() {
  background(240)
  push()
  blendMode(DIFFERENCE)
  image(pg, 0, 0, displaySize, displaySize)
  pop()
  drawGrid()
}

function drawGrid() {
  for (let i=0; i<=imgSize; i++) {
    line(i/scaleFactor, 0, i/scaleFactor, displaySize)
    line(0, i/scaleFactor, displaySize, i/scaleFactor)
  }
}

function mouseInsideCanvas() {
  return (mouseX >= 0 && mouseY >= 0 && mouseX <= displaySize && mouseY <= displaySize)
}

function getPixels() {
  let pixels = new Array(imgSize*imgSize)
  pg.loadPixels()
  for (let i=1; i<=pixels.length; ++i) {
    pixels[i-1] = pg.pixels[(i<<2)-1]
  }
  return pixels
}