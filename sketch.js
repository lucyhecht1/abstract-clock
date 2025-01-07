let ballX, ballY; // Basketball position
let soccerBalls = []; // Array to track soccer balls in the goal
let ballBag = []; // Array to track balls in the bag
let hoopX, hoopY; // Hoop position
let goalX, goalY; // Soccer goal position
let lastMinute; // To track when the minute changes
let lastHour; // To track when the hour changes

function setup() {
    createCanvas(800, 600); // Canvas size
    ballX = 50; // Starting position of the basketball
    ballY = height / 3; // Centered vertically
    hoopX = width - 100; // Position of the hoop
    hoopY = height / 2.5; // Centered vertically
    goalX = width - 215; // Soccer goal position (right side)
    goalY = height - 220; // Soccer goal position (bottom of the screen)
    lastMinute = minute(); // Track the current minute
    lastHour = hour(); // Track the current hour

    // Initialize the bag of 59 balls with random positions inside the bag
    let currentMinute = minute()
    for (let i = 0; i < 59 - currentMinute; i++) {
        let x, y;

        // Ensure the ball is within the bag boundaries
        do {
            x = random(78, 258); // Horizontal range between the sides of the bag
            y = random(height - 130, height - 65); // Vertical range from top to bottom of the bag
        } while (!isInsideBag(x, y)); // Only add if the ball is inside the half-ellipse

        ballBag.push({ x, y });
    }

    // Initialize the goal with 'minutes' number of balls
    for (let i = 0; i < currentMinute; i++) {
        let x = random(goalX + 10, goalX + 180); // Random x position within the goal
        let y = random(goalY + 10, goalY + 130); // Random y position within the goal
        soccerBalls.push({ x, y }); // Add the ball to the soccer goal
    }
}

let movingBall = null; // The ball currently moving to the goal
let glideStartTime = null; // Timestamp when the gliding starts
let glideDuration = 1; // Duration for the gliding animation (5 seconds)

function draw() {
    background(30); // Background color
    drawTitle(); // Draw the title "Game Time!"
    drawHoop(); // Draw the basketball hoop
    drawGoal(); // Draw the soccer goal
    drawBall(); // Draw the basketball
    drawBagBalls(); // Draw the bag of balls
    drawBag(); // Draw the bag for the balls
    drawSoccerBalls(); // Draw the soccer balls in the goal
    drawCrowd(); // Draw the cheering crowd based on the hour


    let currentMinute = minute(); // Get the current minute
    let currentHour = hour(); // Get the current hour
    let currentSecond = second(); // Get the current second

    // Reset soccer goal and refill the bag if the hour changes
    if (currentHour !== lastHour) {
        lastHour = currentHour;
        soccerBalls = []; // Clear all soccer balls
        refillBag(); // Refill the bag with 59 balls
    }

    // Trigger gliding when the minute changes
    if (currentMinute !== lastMinute) {
        lastMinute = currentMinute; // Update the last minute
        console.log(currentMinute); // Print the current minute to the console
        if (ballBag.length > 0) {
            glideStartTime = millis(); // Record the starting time of the glide
            movingBall = ballBag.pop(); // Remove the last ball from the bag
            movingBall.targetX = random(goalX + 10, goalX + 180); // Set target x position in the goal
            movingBall.targetY = random(goalY + 10, goalY + 130); // Set target y position in the goal
        }
    }

    // Perform the gliding animation
    if (movingBall) {
        glideBallToGoal();
    }

    // Incrementally move the basketball based on the current second
    ballX = map(currentSecond, 0, 59, 50, hoopX - 20); // Map seconds to ball's X position
    ballY = height / 2.5; // Keep basketball at its height
}

function drawTitle() {
    // Draw the title text at the top
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("GAME TIME!", width / 2, 90); // Title at the top of the canvas
}

function drawGoal() {
    // Draw the soccer goal frame
    noFill();
    stroke(255);
    strokeWeight(4);

    // Adjust the arc positions to cover only one net column
    let cornerRadius = 10; // Smaller radius for the rounded corners
    arc(goalX + cornerRadius, goalY, cornerRadius * 2, cornerRadius * 2, PI, TWO_PI); // Left rounded corner
    arc(goalX + 200 - cornerRadius, goalY, cornerRadius * 2, cornerRadius * 2, PI, TWO_PI); // Right rounded corner

    // Draw the vertical sides of the goal
    line(goalX, goalY, goalX, goalY + 150); // Left vertical line
    line(goalX + 200, goalY, goalX + 200, goalY + 150); // Right vertical line

    // Draw the bottom horizontal line
    line(goalX, goalY + 150, goalX + 200, goalY + 150); // Bottom horizontal line

    // Draw the soccer goal net
    strokeWeight(1);
    for (let x = goalX; x <= goalX + 200; x += 20) { // Adjust net spacing for larger goal width
        line(x, goalY, x, goalY + 150); // Vertical net lines
    }
    for (let y = goalY; y <= goalY + 150; y += 20) { // Adjust net spacing for larger goal height
        line(goalX, y, goalX + 200, y); // Horizontal net lines
    }
}

function drawHoop() {
    // Draw the basketball hoop
    noFill();
    stroke(255, 100, 100); // Red hoop color
    strokeWeight(5);
    ellipse(hoopX, hoopY, 60, 20); // Hoop ring
}


function drawBall() {
    // Draw the basketball
    noStroke();
    fill(255, 150, 0);
    ellipse(ballX, ballY, 30, 30); // Ball shape
}

function drawBagBalls() {
    // Draw the balls remaining in the bag
    for (let i = 0; i < ballBag.length; i++) {
        let ball = ballBag[i];
        fill(255, 255, 0); // Yellow balls in the bag
        noStroke();
        ellipse(ball.x, ball.y, 15, 15); // Ball shape
    }
}
function drawBag() {
    // Draw the bag outline
    noFill(); // No fill for the bag
    stroke(139, 69, 19); // Brown bag outline color
    strokeWeight(3);

    // Draw the bottom half of the ellipse (bag base)
    arc(168, goalY + 90, 180, 100, 0, PI); // Half-ellipse for the base

    // Draw the straight sides of the bag
    line(78, goalY + 90, 78, goalY * 1.1); // Left side
    line(258, goalY + 90, 258, goalY * 1.1); // Right side
}

function drawSoccerBalls() {
    // Draw all soccer balls in the goal
    for (let i = 0; i < soccerBalls.length; i++) {
        let ball = soccerBalls[i];
        fill(255, 255, 0); // Yellow soccer ball
        noStroke();
        ellipse(ball.x, ball.y, 20, 20); // Soccer ball shape
    }
}

function glideBallToGoal() {
    let elapsedTime = (millis() - glideStartTime) / 1000; // Elapsed time in seconds

    if (elapsedTime >= glideDuration) {
        // Ball has reached the goal
        movingBall.x = movingBall.targetX;
        movingBall.y = movingBall.targetY;
        soccerBalls.push(movingBall); // Add the ball to the soccer goal
        movingBall = null; // Stop moving the ball
    } else {
        // Smoothly move the ball toward its target
        let t = elapsedTime / glideDuration; // Interpolation factor (0 to 1)
        movingBall.x = lerp(movingBall.x, movingBall.targetX, t); // Interpolate x position
        movingBall.y = lerp(movingBall.y, movingBall.targetY, t); // Interpolate y position

        // Draw the moving ball
        fill(255, 255, 0); // Yellow ball
        noStroke();
        ellipse(movingBall.x, movingBall.y, 20, 20); // Ball shape
    }
}

function moveBallToGoal() {
    // Fallback: Move one ball from the bag to the soccer goal without gliding
    if (ballBag.length > 0) {
        let ball = ballBag.pop(); // Remove the last ball from the bag
        ball.x = random(goalX + 10, goalX + 180); // Random x position within the goal
        ball.y = random(goalY + 10, goalY + 130); // Random y position within the goal
        soccerBalls.push(ball); // Add the ball to the soccer goal
    }
}

function refillBag() {
    // Refill the bag with 59 balls with random vertical spread, constrained inside the bag
    ballBag = [];
    for (let i = 0; i < 59; i++) {
        let x, y;

        // Ensure the ball is within the bag boundaries
        do {
            // Keep the balls horizontally fixed within the bag's width
            x = random(78, 258); // Horizontal range between the sides of the bag

            // Spread balls vertically within the half-ellipse's bounds
            y = random(100 - goalY, goalY + 5); // Randomize y positions within the vertical range

        } while (!isInsideBag(x, y)); // Only add if the ball is inside the bag boundary

        ballBag.push({ x, y });
    }
}

function isInsideBag(x, y) {
    // Bag boundaries
    let centerX = 170; // Center of the ellipse horizontally
    let centerY = goalY + 75; // Bottom of the bag
    let radiusX = 90; // Horizontal radius of the ellipse (adjusted to make the bag narrower)
    let radiusY = 50; // Vertical radius of the ellipse (adjusted to make the bag shallower)

    // Check if the point is inside the half-ellipse
    let inEllipse =
        ((x - centerX) ** 2) / radiusX ** 2 +
        ((y - centerY) ** 2) / radiusY ** 2 <=
        1;

    // Check if the point is inside the vertical lines (above the ellipse)
    let inVerticalLines = x >= 78 && x <= 258 && y >= 100 - goalY && y <= goalY + 5;

    // A point is inside the bag if it's in the ellipse or within the vertical lines area
    return inEllipse || inVerticalLines;
}

function drawCrowd() {
    let currentHour = hour(); // Get the current hour
    let crowdWidth = currentHour * 20; // Total width of the crowd (20 pixels per person)
    let crowdXStart = (width - crowdWidth) / 2; // Center the crowd horizontally
    let crowdYStart = height - 40; // Position the crowd at the bottom of the canvas
    let crowdSpacing = 20; // Spacing between each crowd member

    // Draw crowd members equal to the current hour
    for (let i = 0; i < currentHour; i++) {
        let x = crowdXStart + (i % 12) * crowdSpacing; // Horizontal placement in rows
        let y = crowdYStart + floor(i / 12) * crowdSpacing; // Vertical placement in rows

        // Draw a crowd member (simple circle representing the head)
        fill(255, 204, 0); // Yellow for heads
        noStroke();
        ellipse(x, y, 15, 15); // Draw the head

        // Draw the body
        stroke(255);
        strokeWeight(2);
        line(x, y + 7.5, x, y + 20); // Body line
        line(x, y + 20, x - 5, y + 25); // Left leg
        line(x, y + 20, x + 5, y + 25); // Right leg
        line(x, y + 12, x - 5, y + 15); // Left arm
        line(x, y + 12, x + 5, y + 15); // Right arm
    }
}

