;(async () => {
  const model = await tf.loadLayersModel('training/tfjs-model/model.json')

  const sketch = (p) => {
    let touchTime = Date.now()
    let drawCanvas
    let finalCanvas
    const displaySize = 500
    const drawSize = 22
    const finalSize = 28
    let scaleFactor = 1
    const clearDelay = 600
    let reevaluate = true

    p.setup = () => {
      p.createCanvas(displaySize, displaySize)
      p.noSmooth()
      p.strokeWeight(3)
      p.stroke(255)
      drawCanvas = p.createGraphics(drawSize, drawSize)
      scaleFactor = drawSize / displaySize
      drawCanvas.noSmooth()
      drawCanvas.pixelDensity(1)
      drawCanvas.strokeWeight(1.6)
      drawCanvas.stroke(255)
      finalCanvas = p.createGraphics(finalSize, finalSize)
      finalCanvas.noSmooth()
      finalCanvas.pixelDensity(1)
      display()
      p.touchEnded()
    }

    p.touchStarted = () => {
      if (!mouseInsideCanvas()) return true
      touchTime = Date.now() - touchTime
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
      return false // prevent context menu
    }

    p.mousePressed = () => {
      p.touchStarted()
    }

    p.touchEnded = () => {
      if (reevaluate) {
        touchTime = Date.now()
        let prediction = model.predict(tf.tensor([getPixels()])).arraySync()[0]
        displayPredictions(d3.select('#d3'), prediction)
        reevaluate = false
      }
      if (!mouseInsideCanvas()) return true
      return false // prevent context menu
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

      for (let i = 0; i < pixels.length; ++i) {
        pixels[i] = []
        for (let j = 0; j < pixels.length; ++j) {
          pixelindex = pixels.length * i + j
          actualindex = (pixelindex << 2) + alphachannel
          pixels[i][j] = [finalCanvas.pixels[actualindex] / 255]
        }
      }
      return pixels
    }

    function displayPredictions(selection, prediction) {
      const svg = selection.selectAll('svg').data([null])
      svg.enter().append('svg')
      svg.exit().remove()
      svg.attr('viewBox', '0 0 150 210').attr('width', 300)

      svg
        .selectAll('rect')
        .data([null])
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', 210)
        .attr('width', 150)
        .attr('fill', 'transparent')

      const rowGroup = svg.selectAll('g').data(prediction)
      const rowGroupEnter = rowGroup
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(0, ${20 + i * 20})`)
      rowGroup.exit().remove()

      rowGroupEnter
        .append('text')
        .attr('x', 10)
      rowGroupEnter
        .append('rect')
        .attr('x', 25)
        .attr('y', -13)
        .attr('height', 16)
        .attr('rx', 1)
      rowGroup
        .merge(rowGroupEnter)
        .select('text')
        .text((d, i) => i)
      rowGroup
        .merge(rowGroupEnter)
        .select('rect')
        .transition()
        .attr('width', (d) => 112 * d + 0.0001)
    }
  }

  let myp5 = new p5(sketch, 'p5')
})()
