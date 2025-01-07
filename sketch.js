let ballX, ballY;
let soccerBalls = [];
let ballBag = [];
let hoopX, hoopY;
let goalX, goalY;
let lastMinute; // To track when the minute changes
let lastHour; // To track when the hour changes

function setup() {
    createCanvas(800, 600);
    ballX = 50; // Starting position of the basketball
    ballY = height / 3;
    hoopX = width - 100; // Position of the hoop
    hoopY = height / 2.5;
    goalX = width - 215; // Soccer goal position 
    goalY = height - 220;

    // Update time tracking variables before any game state initialization that might depend on them
    lastMinute = minute();
    lastHour = hour();

    refillBag();

    // Ensure that the initialization of soccer balls only happens after the time tracking variables are set
    let currentMinute = minute();
    for (let i = 0; i < currentMinute; i++) {
        let x = random(goalX + 10, goalX + 180); // Random x position within the goal
        let y = random(goalY + 10, goalY + 130); // Random y position within the goal
        soccerBalls.push({ x, y }); // Add the ball to the soccer goal
    }
}

let movingBall = null;
let glideStartTime = null;
let glideDuration = 1;

function draw() {
    background(30); // Background color
    drawTitle();
    drawHoop();
    drawGoal();
    drawBall();
    drawBagBalls();
    drawBag();
    drawSoccerBalls();
    drawCrowd();

    let currentMinute = minute();
    let currentHour = hour();
    let currentSecond = second();

    // Trigger gliding when the minute changes
    if (currentMinute !== lastMinute) {
        lastMinute = currentMinute; // Update the last minute
        console.log(currentMinute); // Print the current minute to the console

        if (ballBag.length > 1) {
            glideStartTime = millis();
            movingBall = ballBag.pop();
            movingBall.targetX = random(goalX + 10, goalX + 180);
            movingBall.targetY = random(goalY + 10, goalY + 130);
        }
    }
    // Ball glides from bag to goal
    if (movingBall) {
        glideBallToGoal();
    }
    // Incrementally move the basketball based on the current second
    ballX = map(currentSecond, 0, 60, 50, hoopX - 20); // Map seconds to ball's X position
    ballY = height / 2.5;

    // Check if the hour has changed
    if (currentHour !== lastHour) {
        lastHour = currentHour; // Update the last hour
        resetGame(); // Call the reset function
    }
}

function resetGame() {
    soccerBalls = [];
    ballBag = [];
    movingBall = null; // Ensure no ball is set to move
    glideStartTime = null; // Reset the glide start time

    // Re-fetch the current time to reset timing variables correctly
    lastMinute = minute();
    lastHour = hour();

    setup(); // Re-initialize all settings
}


function drawTitle() {
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("GAME TIME!", width / 2, 90);
}

function drawGoal() {
    // Draw the soccer goal frame
    noFill();
    stroke(255);
    strokeWeight(4);

    let cornerRadius = 10;
    arc(goalX + cornerRadius, goalY, cornerRadius * 2, cornerRadius * 2, PI, TWO_PI);
    arc(goalX + 200 - cornerRadius, goalY, cornerRadius * 2, cornerRadius * 2, PI, TWO_PI);

    line(goalX, goalY, goalX, goalY + 150);
    line(goalX + 200, goalY, goalX + 200, goalY + 150);

    line(goalX, goalY + 150, goalX + 200, goalY + 150);

    // Draw the soccer goal net
    strokeWeight(1);
    for (let x = goalX; x <= goalX + 200; x += 20) {
        line(x, goalY, x, goalY + 150);
    }
    for (let y = goalY; y <= goalY + 150; y += 20) {
        line(goalX, y, goalX + 200, y);
    }
}

function drawHoop() {
    noFill();
    stroke(255, 100, 100); // Red hoop color
    strokeWeight(5);
    ellipse(hoopX, hoopY, 60, 20);
}


function drawBall() {
    noStroke();
    fill(255, 150, 0);
    ellipse(ballX, ballY, 30, 30);
}

function drawBagBalls() {
    for (let i = 0; i < ballBag.length; i++) {
        let ball = ballBag[i];
        fill(255, 255, 0); // Yellow balls in the bag
        noStroke();
        ellipse(ball.x, ball.y, 15, 15);
    }
}
function drawBag() {
    noFill();
    stroke(139, 69, 19); // Brown
    strokeWeight(3);

    arc(168, goalY + 90, 180, 100, 0, PI); // Half-ellipse for the base
    line(78, goalY + 90, 78, goalY * 1.1); // Left side
    line(258, goalY + 90, 258, goalY * 1.1); // Right side
}

function drawSoccerBalls() {
    for (let i = 0; i < soccerBalls.length; i++) {
        let ball = soccerBalls[i];
        fill(255, 255, 0); // Yellow soccer ball
        noStroke();
        ellipse(ball.x, ball.y, 20, 20);
    }
}

function glideBallToGoal() {
    let elapsedTime = (millis() - glideStartTime) / 1000;

    if (elapsedTime >= glideDuration) {
        // Ball has reached the goal
        movingBall.x = movingBall.targetX;
        movingBall.y = movingBall.targetY;
        soccerBalls.push(movingBall); // Add the ball to the soccer goal
        movingBall = null; // Stop moving the ball
    } else {
        let t = elapsedTime / glideDuration;
        movingBall.x = lerp(movingBall.x, movingBall.targetX, t);
        movingBall.y = lerp(movingBall.y, movingBall.targetY, t);

        // Draw the moving ball
        fill(255, 255, 0); // Yellow ball
        noStroke();
        ellipse(movingBall.x, movingBall.y, 20, 20);
    }
}

function refillBag() {
    // Initialize the bag of 60 balls with random positions inside the bag
    ballBag = [];
    let currentMinute = minute()
    for (let i = 0; i < 60 - currentMinute; i++) {
        let x, y;

        // Ensure the ball is within the bag boundaries
        do {
            x = random(78, 258); // Horizontal range 
            y = random(height - 130, height - 65); // Vertical range 
        } while (!isInsideBag(x, y));

        ballBag.push({ x, y });
    }
}

function isInsideBag(x, y) {
    // Bag boundaries
    let centerX = 170;
    let centerY = goalY + 75;
    let radiusX = 90;
    let radiusY = 50;

    // Check if the point is inside the half-ellipse
    let inEllipse =
        ((x - centerX) ** 2) / radiusX ** 2 +
        ((y - centerY) ** 2) / radiusY ** 2 <=
        1;

    // Check if the point is inside the vertical lines (above the ellipse)
    let inVerticalLines = x >= 78 && x <= 258 && y >= height - 220 && y <= height - 155;

    // A point is inside the bag if it's in the ellipse or within the vertical lines area
    return inEllipse || inVerticalLines;
}

function drawCrowd() {
    let currentHour = hour();
    let crowdWidth = (currentHour % 12) * 20;
    let crowdXStart = (width - crowdWidth) / 2;
    let crowdYStart = height - 40; // Position the crowd at the bottom of the canvas
    let crowdSpacing = 20;

    // Draw crowd members equal to the current hour in 12 hour format

    let crowdCount = currentHour % 12;
    if (crowdCount === 0) {
        crowdCount = 12;
    }
    for (let i = 0; i < crowdCount; i++) {
        let x = crowdXStart + (i % 12) * crowdSpacing;
        let y = crowdYStart + floor(i / 12) * crowdSpacing;

        // Draw a crowd member (simple circle representing the head)
        fill(255, 204, 0); // Yellow for heads
        noStroke();
        ellipse(x, y, 15, 15); // Draw the head

        // Draw the body
        stroke(255);
        strokeWeight(2);
        line(x, y + 7.5, x, y + 20); // Body
        line(x, y + 20, x - 5, y + 25); // Left leg
        line(x, y + 20, x + 5, y + 25); // Right leg
        line(x, y + 12, x - 5, y + 15); // Left arm
        line(x, y + 12, x + 5, y + 15); // Right arm
    }
}