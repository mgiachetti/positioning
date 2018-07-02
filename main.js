
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
class Kalman {
    constructor() {
    }
}

//
class Player {
    constructor(x=100, y=100) {
        this.pos = [x, y];
        this.velocity = [600, 600];
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
    }

    distanceToAnchors() {
        return anchors.map(pos => {
            return dist(this.pos, pos);
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
    ctx.beginPath();
    ctx.fillStyle = 'blue';
    const anchorRad = 40;
    anchors.forEach(pos => {
        const [x, y] = pos;
        ctx.moveTo(x + anchorRad, y);
        ctx.arc(x, y, anchorRad, 0, 2*Math.PI);
    });
    
    ctx.fill();
}

function drawPlayers(ctx) {
    ctx.beginPath();
    ctx.fillStyle = 'red';
    const anchorRad = 40;
    players.forEach(player => {
        const [x, y] = player.pos;
        ctx.moveTo(x + anchorRad, y);
        ctx.arc(x, y, anchorRad, 0, 2*Math.PI);
    });
    
    ctx.fill();
}

function drawAnchorsDistance(ctx) {
    const error = 10;
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 5;
    ctx.beginPath();
    players[0].distanceToAnchors().forEach((dist, i) => {
        const noise = (2*gaussianRand() - 1) * error;
        const rad = dist + noise;
        const [x, y] = anchors[i];
        const dang = 0.5 * Math.PI * i;
        const k = i % 3 == 0 ? 1 : -1;
        ctx.moveTo(x + rad * k, y);
        ctx.arc(x, y, rad, dang, dang + k*Math.PI*0.5, k != 1);
    });
    ctx.stroke();
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

    document.getElementById('debugData').textContent = Object.keys(debugVars).map(key => `${key}: ${debugVars[key]}`).join('\n');
}

function movePlayers(elapsed) {
    players.forEach(p => p.move(elapsed));
}

function update(elapsed) {
    movePlayers(elapsed);
    players[0].distanceToAnchors().forEach((dist, i) => {
        debugVars[`Dist anchor ${i}`] = `${dist.toFixed(2)} m`;
    });
}

function loop() {
    const elapsed = 1/30.0; 
    update(elapsed);
    render();
}

setInterval(loop, 1000.0/30.0);
