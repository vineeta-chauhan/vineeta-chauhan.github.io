var canvas = document.getElementById("canvas");
canvas.height = window.innerHeight - 60;
canvas.width = window.innerWidth - 20;

var context = canvas.getContext("2d");
var radius = 50;
var nStartX = 0;
var nStartY = 0;
var bIsDrawing = false;
var globalIndex = undefined;

var touchStartTimeStamp = 0;
var touchEndTimeStamp = 0;
var touchTimer = 600;

var startTimerForMouse = 0;
var endTimerForMouse = 0;
var delayRequired = 150;

var drawAreas = [];
var rendomColorValue = "#000000";
var singleClickTimer = [];

var putPoint = function(e) {
    rendomColorValue = randomColors();
    if (e.type == "touchstart") {
        nStartX = e.changedTouches[0].clientX;
        nStartY = e.changedTouches[0].clientY;
        touchStartTimeStamp = e.timeStamp;
    } else {
        startTimerForMouse = e.timeStamp;
        nStartX = e.clientX;
        nStartY = e.clientY;
    }
    console.log(nStartX, nStartY, "  putPoint");
    if (!isPointInCircle({ x: nStartX, y: nStartY }, drawAreas)) {
        bIsDrawing = true;
    }
    radius = 0;
};

var previousRadious = 0;
var drawPoint = function(e) {
    if (bIsDrawing) reDraw();
    if (!bIsDrawing) return;
    if (e.type == "touchmove") {
        var nDeltaX = nStartX - e.changedTouches[0].clientX;
        var nDeltaY = nStartY - e.changedTouches[0].clientY;
    } else {
        var nDeltaX = nStartX - e.clientX;
        var nDeltaY = nStartY - e.clientY;
    }
    radius = Math.sqrt(nDeltaX * nDeltaX + nDeltaY * nDeltaY);
    if (radius < previousRadious) {
        clearArc(context, nStartX, nStartY, previousRadious);
    }
    context.fillStyle = rendomColorValue;
    context.beginPath();
    context.arc(nStartX, nStartY, radius, 0, Math.PI * 2);
    context.fill();
    previousRadious = radius;
};

var checkCircle = function(e) {
    singleClickTimer.push(
        setTimeout(() => {
            if (endTimerForMouse - startTimerForMouse < delayRequired) {
                context.font = "20px Arial";
                context.fillStyle = "black";
                if (isPointInCircle({ x: nStartX, y: nStartY }, drawAreas)) {
                    context.fillText("Hit", nStartX, nStartY);
                } else {
                    context.fillText("Miss", nStartX, nStartY);
                }
            }
        }, 150)
    );
};

var stopPoint = function(e) {
    previousRadious = 0;
    drawAreas.push({
        x: nStartX,
        y: nStartY,
        r: radius,
        color: rendomColorValue
    });
    if (e.type == "touchend") {
        touchEndTimeStamp = e.timeStamp;
        if (touchEndTimeStamp - touchStartTimeStamp >= touchTimer) {
            doubleClickHandler();
        }
    } else {
        endTimerForMouse = e.timeStamp;
    }
    bIsDrawing = false;
    reDraw();
};

function randomColors() {
    return (
        "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
    );
}

function isPointInCircle(point, array) {
    for (let i = 0; i < array.length; i++) {
        if (point.x == array[i].x && point.y == array[i].y) continue;
        var x = point.x - array[i].x;
        var y = point.y - array[i].y;
        if (Math.sqrt(x * x + y * y) <= array[i].r) {
            globalIndex = i;
            return true;
        }
    }
    return false;
}

var doubleClickHandler = e => {
    singleClickTimer.map(ele => clearTimeout(ele));
    singleClickTimer = [];
    globalIndex = undefined;
    if (isPointInCircle({ x: nStartX, y: nStartY }, drawAreas)) {
        clearArc(
            context,
            drawAreas[globalIndex].x,
            drawAreas[globalIndex].y,
            drawAreas[globalIndex].r
        );
        drawAreas.splice(globalIndex, 1);
    }
    reDraw();
};

function clearArc(context, x, y, radius) {
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = "white";
    context.stroke();
    context.restore();
}

function reDraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawAreas.map(ele => {
        context.fillStyle = ele.color;
        context.beginPath();
        context.arc(ele.x, ele.y, ele.r, 0, Math.PI * 2);
        context.fill();
    });

}

function buttonClickHandler(e) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawAreas = [];
    context = canvas.getContext("2d");
    canvas = document.getElementById("canvas");
    radius = 50;
    nStartX = 0;
    nStartY = 0;
    bIsDrawing = false;
    globalIndex = undefined;
    singleClickTimer = [];
    rendomColorValue = "#000000";
}

canvas.addEventListener("mousedown", putPoint);
canvas.addEventListener("mousemove", drawPoint);
canvas.addEventListener("mouseup", stopPoint);
canvas.addEventListener("touchstart", putPoint);
canvas.addEventListener("touchmove", drawPoint);
canvas.addEventListener("touchend", stopPoint);
canvas.addEventListener("click", checkCircle);
canvas.addEventListener("dblclick", doubleClickHandler);
