;(async () => {
  const model = await tf.loadLayersModel('training/tfjs-model/model.json')

  const sketch = (p) => {
    let touchTime = Date.now()
    let drawCanvas
    let finalCanvas
    const displaySize = 500
    const drawSize = 20
    const finalSize = 28
    let scaleFactor = 1
    const clearDelay = 600
    let result
    let reevaluate = false

    p.setup = () => {
      p.createCanvas(displaySize, displaySize)
      p.noSmooth()
      p.strokeWeight(3)
      p.stroke(255)
      drawCanvas = p.createGraphics(drawSize, drawSize)
      scaleFactor = drawSize / displaySize
      drawCanvas.noSmooth()
      drawCanvas.strokeWeight(1.6)
      drawCanvas.stroke(255)
      finalCanvas = p.createGraphics(finalSize, finalSize)
      result = p.createP('draw here 👆')
      result.style('font-size', '2rem')
      display()
    }

    p.touchStarted = () => {
      touchTime = Date.now() - touchTime
      if (!mouseInsideCanvas()) return true
      if (touchTime > clearDelay) {
        drawCanvas.clear()
      }
      drawCanvas.line(
        p.mouseX * scaleFactor,
        p.mouseY * scaleFactor,
        p.mouseX * scaleFactor,
        p.mouseY * scaleFactor
      )
      reevaluate = true
      display()
      if (mouseInsideCanvas()) return false // prevent context menu
    }

    p.mousePressed = () => {
      p.touchStarted()
    }

    p.touchEnded = () => {
      touchTime = Date.now()
      if (reevaluate) {
        let prediction = model.predict(tf.tensor([getPixels()])).arraySync()[0]
        result.html(
          prediction
            .map((x, i) => `<p>${i} :\t${Math.round(x * 100)}</p>`)
            .join('')
        )
        reevaluate = false
      }
      if (mouseInsideCanvas()) return false
    }

    p.touchMoved = () => {
      drawCanvas.line(
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
      p.image(drawCanvas, 0, 0, displaySize, displaySize)
      p.pop()
      drawGrid()
    }

    function drawGrid() {
      for (let i = 0; i <= drawSize; i++) {
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
      let pixels = new Array(finalSize)
      let alphachannel = 3
      finalCanvas.clear()
      finalCanvas.image(
        drawCanvas,
        (finalSize - drawSize) / 2,
        (finalSize - drawSize) / 2
      )
      finalCanvas.loadPixels()
      console.log(Math.sqrt(finalCanvas.pixels.length >> 2))
      for (let i = 0; i < pixels.length; ++i) {
        pixels[i] = []
        for (let j = 0; j < pixels.length; ++j) {
          pixelindex = pixels.length * i + j
          actualindex = (pixelindex << 2) + alphachannel
          pixels[i][j] = finalCanvas.pixels[actualindex] / 255
        }
      }
      return pixels
    }
  }

  let myp5 = new p5(sketch)
})()
