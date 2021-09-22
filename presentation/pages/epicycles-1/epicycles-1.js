// gian marco todesco - gianmarco.todesco@gmail.com
// Lezione "Curve Animate", 15 gennaio 2020

'use strict'

const canvas = document.getElementById('c')
const ctx = canvas.getContext('2d')
let width, height

// ciclo principale: cancella il canvas e disegna il nuovo fotogramma
function mainLoop () {
    width = canvas.width
    height = canvas.height
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(width / 2, height / 2)
    draw()
    ctx.restore()
    requestAnimationFrame(mainLoop)
}
requestAnimationFrame(mainLoop)

// --------------------------------------------------------
// parametri:
// --------------------------------------------------------

// eslint-disable-next-line prefer-const
let omega = 0.6 // velocità del secondo cerchio (radianti/secondo)

// raggi dei vari cerchi.
// n.b. l'ultimo cerchio rappresenta il punto blu è ha raggio zero 
// eslint-disable-next-line prefer-const
let radii = [120, 50, 20, 0]

// eslint-disable-next-line prefer-const
let maxCurveLength = 1000 // massimo numero di punti della linea rossa

// --------------------------------------------------------
// variabili
// --------------------------------------------------------

// posizioni correnti
let positions = []

// la traccia lasciata dal punto blu
const curve = []

// --------------------------------------------------------
// funzione principale di disegno
// --------------------------------------------------------

function draw () {
    // aggiorna le posizioni
    compute()

    // disegno i cerchi
    ctx.fillStyle = 'rgb(200,200,200,0.5)'
    ctx.strokeStyle = 'gray'
    ctx.lineWidth = 1
    for (let i = 0; i < positions.length - 1; i++) {
        fillCircle(positions[i][0], positions[i][1], radii[i])
    }

    // disegno la linea che congiunge i centri
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'teal'
    ctx.moveTo(0, 0)
    for (let i = 1; i < positions.length; i++) {
        ctx.lineTo(positions[i][0], positions[i][1])
    }
    ctx.stroke()

    // disegno i centri dei cerchi
    ctx.fillStyle = 'black'
    ctx.strokeStyle = 'gray'
    ctx.lineWidth = 1
    for (let i = 0; i < positions.length - 1; i++) {
        fillCircle(positions[i][0], positions[i][1], 2)
    }

    // il punto blu
    ctx.fillStyle = 'blue'
    const k = positions.length - 1
    fillCircle(positions[k][0], positions[k][1], 3)

    // la traccia rossa
    drawCurve()
}

// --------------------------------------------------------
// aggiorna le posizioni in base al tempo
// --------------------------------------------------------

function compute () {
    // tempo in secondi dall'inizio
    const time = performance.now() * 0.001

    // numero di cerchi
    // (tolgo uno perchè il punto blu non è un cerchio)
    const m = radii.length - 1

    // calcolo gli angoli di rotazione dei vari
    // cerchi (a partire dal secondo: il primo è fermo)
    const angles = []
    angles.push(time * omega)
    for (let i = 1; i < m; i++) {
        angles.push(angles[i - 1] * (1 + radii[i - 1] / radii[i]))
    }

    // calcolo la posizione dei centri
    positions = []
    var x = 0; var y = 0 // il primo cerchio è centrato sull'origine
    positions.push([x, y])
    for (let i = 0; i < m; i++) {
    // distanza fra il centro del cerchio i-esimo e
    // del cerchio (i+1)-esimo
        var d = radii[i] + radii[i + 1]
        var phi = angles[i]
        x += Math.cos(phi) * d
        y += Math.sin(phi) * d
        positions.push([x, y])
    }

    // il punto blu lascia una traccia
    addPointToCurve(x, y)
}

// --------------------------------------------------------
// altre funzioni di servizio
// --------------------------------------------------------

// aggiunge un punto alla traccia
// se necessario cancella i punti più vecchi
function addPointToCurve (x, y) {
    curve.push([x, y])
    if (curve.length > maxCurveLength) {
        curve.splice(0, curve.length - maxCurveLength)
    }
}

// disegna la curva rossa
function drawCurve () {
    if (curve.length < 2) return
    ctx.beginPath()
    ctx.moveTo(curve[0][0], curve[0][1])
    for (let i = 1; i < curve.length; i++) {
        ctx.lineTo(curve[i][0], curve[i][1])
    }
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    ctx.stroke()
}

// disegna un disco
function fillCircle (x, y, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fill()
}
