;(async () => {
  const model = await tf.loadLayersModel('training/tfjs-model/model.json')

  const sketch = (p) => {
    let touchTime = Date.now()
    let pg
    const displaySize = 500
    let imgSize = 28
    let scaleFactor = 1
    let clearDelay = 600
    let result

    p.setup = () => {
      p.createCanvas(displaySize, displaySize)
      p.noSmooth()
      p.strokeWeight(2)
      p.stroke(255)
      pg = p.createGraphics(imgSize, imgSize)
      scaleFactor = imgSize / displaySize
      pg.strokeWeight(1.6)
      pg.stroke(255)
      result = p.createP('draw here 👆');
      result.style('font-size', '5rem')
      display()
    }

    p.touchStarted = () => {
      touchTime = Date.now() - touchTime
      if (!mouseInsideCanvas()) return true
      if (touchTime > clearDelay) {
        pg.clear()
      }
      pg.line(
        p.mouseX * scaleFactor,
        p.mouseY * scaleFactor,
        p.mouseX * scaleFactor,
        p.mouseY * scaleFactor
      )
      display()
      if (mouseInsideCanvas()) return false // prevent context menu
    }

    p.mousePressed = () => {
      p.touchStarted()
    }

    p.touchEnded = () => {
      touchTime = Date.now()
      result.html(model.predict(tf.tensor([getPixels()])).argMax(1).dataSync()[0])
      if (mouseInsideCanvas()) return false
    }

    p.touchMoved = () => {
      pg.line(
        p.mouseX * scaleFactor,
        p.mouseY * scaleFactor,
        p.pmouseX * scaleFactor,
        p.pmouseY * scaleFactor
      )
      display()
    }

    function display() {
      p.background(240)
      p.push()
      p.blendMode(p.DIFFERENCE)
      p.image(pg, 0, 0, displaySize, displaySize)
      p.pop()
      drawGrid()
    }

    function drawGrid() {
      for (let i = 0; i <= imgSize; i++) {
        p.line(i / scaleFactor, 0, i / scaleFactor, displaySize)
        p.line(0, i / scaleFactor, displaySize, i / scaleFactor)
      }
    }

    function mouseInsideCanvas() {
      return (
        p.mouseX >= 0 &&
        p.mouseY >= 0 &&
        p.mouseX <= displaySize &&
        p.mouseY <= displaySize
      )
    }

    function getPixels() {
      let pixels = new Array(imgSize)
      let alphachannel = 3
      pg.loadPixels()
      for (let i = 0; i < pixels.length; ++i) {
        pixels[i] = []
        for (let j = 0; j < pixels.length; ++j) {
          pixelindex = pixels.length * i + j
          actualindex = (pixelindex << 2) + alphachannel
          pixels[i][j] = pg.pixels[actualindex] / 255
        }
      }
      return pixels
    }
  }

  let myp5 = new p5(sketch)
})()
