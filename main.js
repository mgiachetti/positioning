
function add(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

function subtract(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1]];
}

function scale1D(v, factor) {
    return [v1[0] * factor, v1[1] * factor];
}

function scale(v1, v2) {
    return [v1[0] * v2[0], v1[1] * v2[1]];
}

function distSqr(v1, v2) {
    const t = subtract(v1, v2);
    return t[0]*t[0] + t[1]*t[1];
}

function dist(v1, v2) {
    return Math.sqrt(distSqr(v1,v2));
}

const standardError = 10;
// goal 7,32 x 2,44 x 0.9 http://www.oficad.com/medidas_y_dimesnsiones/campo%20de%20futbol.gif
const fieldWidth = 10000;
const fieldheight = 7000;
const goalHeight = 732;
const goalWidth = 90;
const largeAreaHeight = 4032;
const largeAreaWidth = 1650;
const smallAreaHeight = 1832;
const smallAreaWidth = 550;
const centerRadius = 915;
const cornerRadius = 100;
const penaltyWidth = 1100;

function gaussianRand() {
    var rand = 0;
    for (var i = 0; i < 6; i += 1) {
        rand += Math.random();
    }
    return rand / 6;
}

//
class Player {
    constructor(x=100, y=100) {
        this.pos = [x, y];
        this.velocity = [600, 200];
        this.recalculateDistances();
    }
    move(elapsed) {
        this.pos = [this.pos[0] + this.velocity[0] * elapsed, this.pos[1] + this.velocity[1] * elapsed];
        if (this.pos[0] < 0) {
            this.pos[0] *= -1;
            this.velocity[0] *= -1
        }

        if (this.pos[0] > fieldWidth) {
            this.pos[0] = 2*fieldWidth - this.pos[0];
            this.velocity[0] *= -1
        }

        if (this.pos[1] < 0) {
            this.pos[1] *= -1;
            this.velocity[1] *= -1
        }

        if (this.pos[1] > fieldheight) {
            this.pos[1] = 2*fieldheight - this.pos[1];
            this.velocity[1] *= -1
        }
        this.recalculateDistances();
    }

    recalculateDistances() {
        this.distanceToAnchors = anchors.map(pos => {
            const noise = (gaussianRand() - 0.5) * 2 * 3 * standardError;
            return dist(this.pos, pos) + noise;
        });
    }
}

function getValue(selector) {
    const elem = document.querySelector(selector);
    if (!elem) {
        return undefined;
    }

    return elem.value;
}

const anchors = [
    [-100, -100],
    [fieldWidth + 100, -100],
    [fieldWidth + 100, fieldheight+100],
    [-100, fieldheight+100],
];

const anchorKalmans = [];

const anchorColors = [
    'blue',
    'green',
    'purple',
    'gray',
];

const players = [
    new Player(100, 100),
];

const debugVars = {};

function drawField(ctx) {
    const width = fieldWidth;
    const height = fieldheight;

    // grass
    ctx.fillStyle = '#74FF95';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 20;

    // outside lines
    ctx.beginPath();
    ctx.strokeRect(0, 0, width, height);

    // left
    ctx.moveTo(0, height/2 - goalHeight*0.5);
    ctx.lineTo(-goalWidth, height/2 - goalHeight*0.5);
    ctx.lineTo(-goalWidth, height/2 + goalHeight*0.5);
    ctx.lineTo(0, height/2 + goalHeight*0.5);

    // right
    ctx.moveTo(width, height/2 - goalHeight*0.5);
    ctx.lineTo(width+goalWidth, height/2 - goalHeight*0.5);
    ctx.lineTo(width+goalWidth, height/2 + goalHeight*0.5);
    ctx.lineTo(width, height/2 + goalHeight*0.5);


    // Small Area
    // left
    ctx.moveTo(0, height/2 - smallAreaHeight*0.5);
    ctx.lineTo(smallAreaWidth, height/2 - smallAreaHeight*0.5);
    ctx.lineTo(smallAreaWidth, height/2 + smallAreaHeight*0.5);
    ctx.lineTo(0, height/2 + smallAreaHeight*0.5);

    // right
    ctx.moveTo(width, height/2 - smallAreaHeight*0.5);
    ctx.lineTo(width - smallAreaWidth, height/2 - smallAreaHeight*0.5);
    ctx.lineTo(width - smallAreaWidth, height/2 + smallAreaHeight*0.5);
    ctx.lineTo(width, height/2 + smallAreaHeight*0.5);

    // Large Area
    // left
    ctx.moveTo(0, height/2 - largeAreaHeight*0.5);
    ctx.lineTo(largeAreaWidth, height/2 - largeAreaHeight*0.5);
    ctx.lineTo(largeAreaWidth, height/2 + largeAreaHeight*0.5);
    ctx.lineTo(0, height/2 + largeAreaHeight*0.5);

    // right
    ctx.moveTo(width, height/2 - largeAreaHeight*0.5);
    ctx.lineTo(width - largeAreaWidth, height/2 - largeAreaHeight*0.5);
    ctx.lineTo(width - largeAreaWidth, height/2 + largeAreaHeight*0.5);
    ctx.lineTo(width, height/2 + largeAreaHeight*0.5);

    // Large Area Circle
    const ang = Math.acos((largeAreaWidth - penaltyWidth) / centerRadius);
    const dy = Math.sin(ang) * centerRadius;
    // left
    ctx.moveTo(largeAreaWidth, height/2 + dy);
    ctx.arc(penaltyWidth, height/2, centerRadius, -ang, ang);
    // right
    ctx.moveTo(width - largeAreaWidth, height/2 + dy);
    ctx.arc(width - penaltyWidth, height/2, centerRadius, Math.PI - ang, Math.PI + ang);

    // right
    ctx.moveTo(width - largeAreaWidth, height/2 + dy);
    ctx.arc(width - penaltyWidth, height/2, centerRadius, Math.PI - ang, Math.PI + ang);

    // center
    ctx.moveTo(width*0.5, 0);
    ctx.lineTo(width*0.5, height);
    // circle
    ctx.moveTo(width*0.5 + centerRadius, height*0.5);
    ctx.arc(width*0.5, height*0.5, centerRadius, 0, 2*Math.PI);

    // corners
    // top left
    ctx.moveTo(cornerRadius, height);
    ctx.arc(0, height, cornerRadius, 0, -0.5*Math.PI, true);
    // top right
    ctx.moveTo(width - cornerRadius, height);
    ctx.arc(width, height, cornerRadius, Math.PI, Math.PI + 0.5*Math.PI);
    // bottom left
    ctx.moveTo(cornerRadius, 0);
    ctx.arc(0, 0, cornerRadius, 0, 0.5*Math.PI);
    // bottom right
    ctx.moveTo(width - cornerRadius, 0);
    ctx.arc(width, 0, cornerRadius, Math.PI, Math.PI - 0.5*Math.PI, true);

    ctx.stroke();

    // Penalty
    ctx.beginPath();
    const penaltyRadius = 30;
    ctx.fillStyle = '#000000';
    // left
    ctx.moveTo(penaltyWidth + penaltyRadius, height/2);
    ctx.arc(penaltyWidth, height/2, penaltyRadius, 0, 2*Math.PI);
    // right
    ctx.moveTo(width - penaltyWidth + penaltyRadius, height/2);
    ctx.arc(width - penaltyWidth, height/2, penaltyRadius, 0, 2*Math.PI);
    // center
    ctx.moveTo(width/2 + penaltyRadius, height/2);
    ctx.arc(width/2, height/2, penaltyRadius, 0, 2*Math.PI);

    ctx.fill();
}

function drawAnchors(ctx) {
    
    
    const anchorRad = 40;
    anchors.forEach((pos, i) => {
        ctx.beginPath();
        ctx.fillStyle = anchorColors[i];
        const [x, y] = pos;
        ctx.moveTo(x + anchorRad, y);
        ctx.arc(x, y, anchorRad, 0, 2*Math.PI);
        ctx.fill();
    });
    
    
}

function drawPlayers(ctx) {
    ctx.beginPath();
    ctx.fillStyle = 'red';
    const playerRad = 40;
    players.forEach(player => {
        const [x, y] = player.pos;
        ctx.moveTo(x + playerRad, y);
        ctx.arc(x, y, playerRad, 0, 2*Math.PI);
    });
    
    ctx.fill();
}

function drawEstimatedPosition(ctx) {
    ctx.beginPath();
    ctx.fillStyle = 'blue';
    const rad = 40;
    const [x, y] = estimatedPosition;
    ctx.moveTo(x + rad, y);
    ctx.arc(x, y, rad, 0, 2*Math.PI);
    ctx.fill();
}

function drawAnchorsDistance(ctx) {
    // ctx.strokeStyle = 'blue';
    ctx.lineWidth = 10;
    // ctx.beginPath();
    players[0].distanceToAnchors.forEach((dist, i) => {
        ctx.beginPath();
        ctx.strokeStyle = anchorColors[i];
        const [x, y] = anchors[i];
        ctx.moveTo(x + dist, y);
        ctx.arc(x, y, dist, 0, 2*Math.PI);
        ctx.stroke();
    });
    // ctx.stroke();
}

function render() {
    const canvas = document.getElementById('canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // clear
    ctx.fillStyle = `#ffffff`;
    ctx.clearRect(0, 0, width, height);
    ctx.fillRect(0, 0, width, height);

    // axis
    // ctx.strokeStyle = '#000000';
    // ctx.moveTo(10, 10);
    // ctx.lineTo(10, height - 10);
    // ctx.lineTo(width - 10, height - 10);
    
    // // top arrow
    // ctx.moveTo(5, 15);
    // ctx.lineTo(10, 10);
    // ctx.lineTo(15, 15);

    // // right arrow
    // ctx.moveTo(width - 15, height - 15);
    // ctx.lineTo(width - 10, height - 10);
    // ctx.lineTo(width - 15, height - 5);

    // ctx.stroke();
    
    // plot graphic
    // check transform https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform
    // ctx.setTransform(1, 0, 0, -1, 10, height - 10);

    const offset = 40;
    const sx = (width-2*offset) / fieldWidth;
    const sy = (height-2*offset) / fieldheight;
    const scale = Math.min(sx, sy);
    ctx.setTransform(1, 0, 0, -1, offset, height - offset);
    ctx.transform(scale, 0, 0, scale, 0, 0);

    drawField(ctx);
    drawAnchors(ctx);
    drawPlayers(ctx);

    drawAnchorsDistance(ctx);
    drawEstimatedPosition(ctx);

    document.getElementById('debugData').textContent = Object.keys(debugVars).map(key => `${key}: ${debugVars[key]}`).join('\n');
}

function movePlayers(elapsed) {
    players.forEach(p => p.move(elapsed));
}

function update(elapsed) {
    movePlayers(elapsed);
    players[0].distanceToAnchors.forEach((dist, i) => {
        debugVars[`Dist anchor ${i}`] = `${dist.toFixed(2)} m`;
    });
}

let estimatedPosition = [0,0];
let estimatedError = 0;
let acumError = 0;
function calculatePosition() {
    const [d0, d1, , d3] = players[0].distanceToAnchors;
    const h = dist(anchors[0], anchors[3]);

    let y = (d0*d0 - d3*d3 + h*h) / (2*h);
    let x = Math.sqrt(d0*d0 - y*y);

    y += anchors[0][1];
    x += anchors[0][0];

    if (Math.abs(dist([x,y], anchors[1]) - d1) > Math.abs(dist([-x,y], anchors[1]) - d1)) {
        // x has two posible solutions if distance to the third anchor do not match mirror it
        x = -x;
    }
    estimatedPosition[0] = x;
    estimatedPosition[1] = y;
    estimatedError = dist(estimatedPosition, players[0].pos);
    if (!isNaN(estimatedError)) {
        acumError += estimatedError;
    }
    debugVars['Estimated Position'] = estimatedPosition;
    debugVars['Estimated Error'] = estimatedError;
    debugVars['Estimated Acum Error'] = acumError; 
}

const fps = 30;
const frameTime = 1.0/fps;
const speed = 0.2;
function loop() {
    const elapsed = frameTime;
    update(elapsed);
    calculatePosition();
    calculateErrors();
    render();
    // requestAnimationFrame()
}

const positionFilter = new Kalman(4, 2);
initFilters();
function calculateErrors() {
    players[0].distanceToAnchors.forEach((anchorDist, i) => {
        if (i == 0) {
            const filter = anchorKalmans[i];
            filter.predict();
            filter.measurementUpdate(new Matrix([[anchorDist]]));
            const filteredDistance = filter.x.values[0][0];
            const realDistance = dist(anchors[i], players[0].pos);
            debugVars[`Dist anchor ${i} filtered`] = filteredDistance;
            debugVars[`Dist anchor ${i} filtered error`] = Math.abs(filteredDistance - realDistance);
            debugVars[`Dist anchor ${i} error`] = Math.abs(anchorDist - realDistance);
            if (debugVars[`Dist anchor ${i} error acum`] == undefined) {
                debugVars[`Dist anchor ${i} filtered error acum`] = 0;
                debugVars[`Dist anchor ${i} error acum`] = 0;
            }
            debugVars[`Dist anchor ${i} filtered error acum`] += debugVars[`Dist anchor ${i} filtered error`] || 0 ;
            debugVars[`Dist anchor ${i} error acum`] += debugVars[`Dist anchor ${i} error`] || 0;
            debugVars[`Dist anchor ${i} error reduced`] =  `${100*(1 - debugVars[`Dist anchor ${i} filtered error acum`] / debugVars[`Dist anchor ${i} error acum`]) | 0}%`;
            // debugVars[`Dist anchor ${i} filtered error`] = Math.abs(filteredDistance - realDistance);
        }
    });

    positionFilter.predict();
    positionFilter.measurementUpdate(new Matrix([[estimatedPosition[0]],[estimatedPosition[1]]]));
    const filteredPosition = [positionFilter.x.values[0][0], positionFilter.x.values[1][0]];
    if (debugVars[`Estimated position filtered error acum`] == undefined) {
        debugVars[`Estimated position filtered error acum`] = 0;
    }
    debugVars[`Estimated position filtered error`] = dist(filteredPosition, players[0].pos);;
    debugVars[`Estimated position filtered error acum`] += dist(filteredPosition, players[0].pos);
    debugVars[`Estimated position error reduced`] =  `${100*(1 - debugVars[`Estimated position filtered error acum`] / acumError) | 0}%`;
}

function initFilters() {
    positionFilter.F = new Matrix([
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ]);

    positionFilter.P = new Matrix([
        [10000, 0.0, 0.0, 0.0],
        [0.0, 10000, 0.0, 0.0],
        [0.0, 0.0, 1000.0, 0.0],
        [0.0, 0.0, 0.0, 1000.0],
    ]);

    positionFilter.R = new Matrix([
        [standardError, 0],
        [0, standardError],
    ]);

    positionFilter.Q = new Matrix([
        [1, 0.0, 0.0, 0.0],
        [0.0, 1, 0.0, 0.0],
        [0.0, 0.0, 1, 0.0],
        [0.0, 0.0, 0.0, 1],
    ]);
    
    for (let i = 0; i < anchors.length; i++) {
        const filter = new Kalman(2, 1);
        filter.F = new Matrix([
            [1, 1],
            [0, 1],
        ]);

        filter.P = new Matrix([
            [10000, 0.0],
            [0, 1000],
        ]);

        filter.R = new Matrix([
            [standardError],
        ]);

        filter.Q = new Matrix([
            [1, 0.0],
            [0, 1],
        ]);
        
        anchorKalmans[i] = filter;
    }
}

setInterval(loop, frameTime*1000 / speed);

// estabilization test
function test(standardError, n) {
    let x = 0, y = 0;
    for (let i = 0; i < n; ++i) {
        x += (gaussianRand()-0.5)*3*standardError;
        y += (gaussianRand()-0.5)*3*standardError;
    }
    return ((x/n) ** 2 + (y/n)**2) ** 0.5;
}

function errorAvg(error, n) {
    const samples = 30;
    let sum = 0;
    for(let i = 0; i < samples; i++) {
        sum += test(error, n);
    }
    return sum / samples;
}


function iterateCircle(c, r, fn) {
    const [cx,  cy] = c;
    const dang = 0.1 * (r/90.0)*Math.PI / 180.0;
    for (let i = 0; i < 2*Math.PI; i += dang) {
        const x = Math.cos(i) * r + cx;
        const y = Math.sin(i) * r + cy;
        fn([x, y]);
    }
}


function renderTest() {
    const canvas = document.getElementById('canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // clear
    ctx.fillStyle = `#ffffff`;
    ctx.clearRect(0, 0, width, height);
    ctx.fillRect(0, 0, width, height);

    ctx.setTransform(1, 0, 0, 1, width/2, height/2);

    const ps = [
        [50, 75],
        [150, 30],
    ];

    const anchors = [
        [0, 0],
        [200, 0],
    ];

    const distancePointsToAnchors = ps.map(p => anchors.map(ap => dist(p, ap)));

    function drawCircle(p, color, r) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(p[0] + r, p[1]);
        ctx.arc(p[0], p[1], r, 0, 2*Math.PI);
        ctx.stroke();
    }

    function drawPoint(p, color) {
        drawCircle(p, color, 2);
    }
    
    anchors.forEach(p => drawPoint(p, 'blue'));
    ps.forEach(p => drawPoint(p, 'green'));

    iterateCircle(anchors[0], distancePointsToAnchors[0][0], (P) => {
        if (
            P[0] < 0.0 || P[1] < 0.0
        ) {
            return;
        }
        let dibuja = false;
        iterateCircle(P, distancePointsToAnchors[0][1], (B) => {
            if (B[0] < 0 || Math.abs(B[1]) > 1) {
                return;
            }
            let dibujaAnchor = false;
            iterateCircle(B, distancePointsToAnchors[1][1], (Q) => {
                if (
                    Q[0] < 0 || Q[1] < 0 ||
                    Q[0] > B[0] ||
                    Math.abs(dist(Q, anchors[0]) - distancePointsToAnchors[1][0]) > 1
                ) {
                    return;
                }
                
                drawPoint(Q, 'red');
                
                dibujaAnchor = true;
            })
            if (dibujaAnchor) {
                drawPoint(B, 'gray');
                dibuja = true;
            }
        })

        if (dibuja) {
            drawPoint(P, 'red');
        }
    });

    anchors.forEach(p => drawPoint(p, 'purple'));
    ps.forEach(p => drawPoint(p, 'green'));


    // ctx.strokeStyle = '#000000';
    // ctx.moveTo(10, 10);
    // ctx.lineTo(10, height - 10);
    // ctx.lineTo(width - 10, height - 10);
    

}

// renderTest();
