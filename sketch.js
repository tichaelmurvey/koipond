let backgroundColor = "#006aa3";
let fish = [];
let food = [];
let numFish = 12;
let biteDistance = 30;
let huntDistance = 300;
let smellDistance = 10000;
let started = false;
let scaleFactor = 1;
function setup() {
    angleMode(DEGREES);
    createCanvas(windowWidth+200, windowHeight+200);
    if(width < 1000){
        scaleFactor = 0.7;
        numFish = 6;
    }
    background(backgroundColor);
    for (let i = 0; i < numFish; i++) {
        fish.push(new Fish(random(width), 0));
        //fish.push(new Fish(width / 2, height / 2));
    }
}

function draw() {
    if (started) {
    background(backgroundColor);
        //Pause icon in top right
        push();
        noStroke();
        translate(150, height-200);
        //Two lines making a very small pause icon
        fill(255, 255, 255, 100);
        rect(0, 0, 40, 40);
        fill(255, 255, 255, 230);
        rect(10, 5, 5, 30);
        rect(25, 5, 5, 30);
        pop();

    for (let i = 0; i < food.length; i++) {
        food[i].update();
    }
    for (let i = 0; i < fish.length; i++) {
        fish[i].update();
    }
}
}

class Fish {
    constructor(x, y) {
        this.joints = [];
        this.size = Math.round(random(30, 50))*scaleFactor;
        this.numjoints = Math.round(random(4, 6));
        this.speed = random(1.3, 2);
        this.turnspeed_default = 0.6;
        this.turnspeed = this.turnspeed_default;
        this.destination = null;
        this.manouver = null;
        this.rotationDirection = 1;
        this.beelinecounter = 0;
        this.circlecounter = 0;
        this.targetAngle = 0;
        this.position = createVector(x, y);
        this.colors = colourFish();
        //Add head
        this.joints.push(new Joint(x, y, 0, this.numjoints, this.colors, this.size))

        //Add body
        for (let i = 1; i < this.numjoints; i++) {
            this.joints.push(new Joint(this.joints[i - 1].getBackPos().x, this.joints[i - 1].getBackPos().y, i, this.numjoints, this.colors, this.size));
        }
    }

    update() {
        //Update position
        this.position = normaliseScreenPos(createVector(this.joints[0].getFrontPos().x, this.joints[0].getFrontPos().y));
        //Normalise position to screen locations
        if(this.position )
        if (this.manouver == null) {
            this.lookForFood();
        }
        if (this.destination == null) {
             this.wander();
        }
        // if (this.closeToEdge()) {
        //     this.moveTowards(width / 2 + random(-width / 4, width / 4), height / 2 + random(-height / 4, height / 4));
        // }
        // Teleport to the other side if it goes off screen
        // if (this.position.x > width) {
        //     this.joints[0].setFrontPos(0, this.position.y);
        // }
        // if (this.position.x < 0) {
        //     this.joints[0].setFrontPos(width, this.position.y);
        // }
        // if (this.position.y > height) {
        //     this.joints[0].setFrontPos(this.position.x, 0);
        // }
        // if (this.position.y < 0) {
        //     this.joints[0].setFrontPos(this.position.x, height);
        // }
        //Look for food
        //Swim
        if (this.destination) {
            this.seekManager();
        }
        if (this.manouver) {
            this.joints[0].swim(this.speed);
            for (let i = 1; i < this.numjoints; i++) {
                this.joints[i].goto(this.joints[i - 1].getFrontPos().x, this.joints[i - 1].getFrontPos().y);
            }
        }
        if (this.manouver === "turn") {
            this.turnManager();
            this.joints[0].rotate(this.turnspeed, this.speed, this.rotationDirection);
        }
        else if (this.manouver === "wander") {
            this.joints[0].rotate(this.turnspeed, this.speed, this.rotationDirection);
        }
        else if (this.manouver === "beeline") {
            //this.joints[0].rotate(this.turnspeed, this.speed, 0);
            if (this.beelinecounter < 50) {
                this.beelinecounter++;
            } else {
                this.beelinecounter = 0;
                this.manouver = null;
            }
        }




        //display current angle
        fill(255);
        // textSize(32);
        // text(this.closeToEdge(), 10, 30);
        // text(this.joints[0].angle, 10, 60);
        //text(this.position, 10, 90);
        //let angle = getTargetAngle(this.position, createVector(mouseX, mouseY));
        // text(
        //     'angle between: ' +
        //     angle.toFixed(2),
        //     10,
        //     90
        // );
        //Update body
        this.joints[0].show();
        for (let i = this.joints.length-1; i >= 1; i--) {
            this.joints[i].show();
        }
    }

    wander() {
        if (!this.manouver) {
            this.turnspeed = this.turnspeed_default;
            //Get current angle of fish
            let currentAngle = this.joints[0].angle;

            //Pick a random angle within 30 degrees of current angle
            this.targetAngle = currentAngle + 360 + this.rotationDirection * random(60, 90);
            this.targetAngle = this.targetAngle % 360;

            //Begin manouvering
            this.manouver = "wander";
        }
        //Check if fish has reached target angle to within 1 degree
        if (abs(this.joints[0].angle - this.targetAngle) < 10) {
            this.manouver = null;
            this.rotationDirection = this.rotationDirection * -1;
        }
    }
    turn(speed = 1) {
        if (!this.manouver) {
            //this.turnspeed = this.turnspeed_default;
            ////console.log("starting turn at", this.joints[0].angle, "to", this.targetAngle);
            this.manouver = "turn";
            //Find direction to turn
            let currentAngle = this.joints[0].angle;
            let degrees = degreesBetween(currentAngle, this.targetAngle);
            if (degrees > 0) {
                this.rotationDirection = 1;
            }
            else {
                this.rotationDirection = -1;
            }
            ////console.log( "current angle", currentAngle, "target angle", this.targetAngle, "degrees", degrees, "rotation direction", this.rotationDirection)    
        }
    }
    turnManager() {
        if (abs(degreesBetween(this.targetAngle, this.joints[0].angle)) < 1) {
            this.manouver = null;
        }
    }
    closeToEdge() {
        let buffer = 50;
        if (this.joints[0].getFrontPos().x < buffer || this.joints[0].getFrontPos().x > width - buffer || this.joints[0].getFrontPos().y < buffer || this.joints[0].getFrontPos().y > height - buffer) {
            return true;
        }
        else {
            return false;
        }
    }
    moveTowards(x, y) {
        this.destination = createVector(x, y);
        this.targetAngle = getTargetAngle(this.position, this.destination);
        this.manouver = null;
    }
    seekManager() {
        if (!this.manouver) {
            //Update target angle
            this.targetAngle = getTargetAngle(this.position, this.destination);
            //Check if fish is more than 20 degrees away from target angle
            ////console.log("current angle", this.joints[0].angle, "target angle", this.targetAngle, "degrees", degreesBetween(this.joints[0].angle, this.targetAngle), "rotation direction", this.rotationDirection)
            //Check if within 50 pixels of destination and need to turn
            //console.log("distance to destination", this.position.dist(this.destination))
            if (this.position.dist(this.destination) < huntDistance) {
                //console.log("ON THE HUNT");
                //Check if we've already circled a couple times
                if (this.circlecounter > 3) {
                    //console.log("circled too much, going straight");
                    this.manouver = "beeline";
                }
                //Check if fish is more than 1 degrees away from target angle
                else if (abs(degreesBetween(this.joints[0].angle, this.targetAngle)) < 3) {
                    //Beeline for the object
                    //console.log("beelining for destination");
                    this.manouver = "beeline";
                } else {
                    //Note that we've circled once
                    this.circlecounter++;
                    //console.log("circlecounter", this.circlecounter);
                    //Turn towards target angle
                    this.turn();
                }
            } else {
                this.circlecounter = 0;
                if (abs(degreesBetween(this.joints[0].angle, this.targetAngle)) > 3) {
                    //console.log("standard boring turn towards destination");
                    this.turn();
                } else {
                    //console.log("meandering forwards")
                    this.targetAngle = getTargetAngle(this.position, this.destination) + random(-5, 5);
                    this.turn();
                }
            }
        } else {
            //Check if close to target destination
            if (this.position.dist(this.destination) < biteDistance) {
                //console.log("reached destination");
                this.turnspeed = this.turnspeed_default;
                this.destination = null;
                this.manouver = null;
                this.circlecounter = 0;
                //Check if touching food
                for (let i = 0; i < food.length; i++) {
                    if (this.position.dist(food[i].getPosition()) < biteDistance) {
                        //console.log("ate food");
                        food[i].kill();
                    }
                }
            }

        }

    }
    lookForFood() {
        //Check if there is food in the area
        let closestFood = null;
        for (let i = 0; i < food.length; i++) {
            if (this.position.dist(food[i].getPosition()) < smellDistance) {
                if (!closestFood) {
                    closestFood = food[i];
                } else {
                    if (this.position.dist(food[i].getPosition()) < this.position.dist(closestFood.getPosition())) {
                        closestFood = food[i];
                    }
                }
            }
        }
        if (closestFood) {
        this.moveTowards(closestFood.getPosition().x, closestFood.getPosition().y);
        }
    }
    getPosition() {
        return this.position;
    }
}



function getTargetAngle(v1, v2) {
    return (createVector(v1.x, 0).angleBetween(createVector(v2.x - v1.x, v2.y - v1.y)) + 360) % 360;
}

function degreesBetween(angle1, angle2) {
    //Calculate distance between two angles on a 360 degree circle
    let degrees = angle2 - angle1;
    if (degrees > 180) {
        degrees = degrees - 360;
    }
    if (degrees < -180) {
        degrees = degrees + 360;
    }
    return degrees;
}


class Joint {
    constructor(x, y, i, numjoints, colors, size) {
        this.previousRotation = 0;
        this.totalnumjoints = numjoints;
        this.frontpos = createVector(x-5, y-5);
        this.backpos = createVector(0, 0);
        this.angle = random(0, 360)
        this.velocity = createVector(0, 0);
        //distnace between joints
        this.len = size*0.7*(1 - i / numjoints);
        this.size = size;
        this.turndrag = 0.03;
        this.calculateBackPos();
        this.index = i;
        this.colors = colors;
    }
    show() {
        this.calculateBackPos;
        stroke(244, 66, 66);
        strokeWeight(5);
        this.drawJoint();
    }
    getFrontPos() {
        return this.frontpos;
    }
    setFrontPos(x, y){
        this.frontpos.x = x;
        this.frontpos.y = y;
    }
    getBackPos() {
        return this.backpos;
    }
    calculateBackPos() {
        this.backpos.x = this.frontpos.x - this.len * cos(this.angle);
        this.backpos.y = this.frontpos.y - this.len * sin(this.angle);
    }
    //Moves to a given point, usually the back of the next segment
    rotate(rotationAmount, speed, direction) {
        //Check if the fish is turning in the same direction as the previous rotation
        let rotation = rotationAmount * speed * direction
        ////console.log("rotation", rotation, "previous rotation", this.previousRotation)
        if (direction == 0) {
            if(abs(this.previousRotation) < 0.2) {
                this.previousRotation = 0;
            }
            else if (this.previousRotation > 0) {
                this.angle += this.previousRotation - rotationAmount * speed * this.turndrag;
                this.previousRotation = this.previousRotation - rotationAmount * speed * this.turndrag;
            } else {
                this.angle += this.previousRotation + rotationAmount * speed * this.turndrag;
                this.previousRotation = this.previousRotation + rotationAmount * speed * this.turndrag;
            }
        }
        else if (Math.abs(this.previousRotation - rotation) < 0.2) {
            this.angle += rotation;
            this.previousRotation = rotation;
        }

        else {
            //Reduce rotation speed if the fish is turning in the opposite direction
            this.angle += this.previousRotation + rotation * this.turndrag;
            this.previousRotation = this.previousRotation + rotation * this.turndrag;
        }
        this.angle = this.angle % 360;
        if (this.angle < 0) {
            this.angle += 360;
        }
    }
    swim(speed) {
        let dir = p5.Vector.fromAngle(radians(this.angle), speed);
        this.frontpos.add(dir);
        this.calculateBackPos();
    }
    goto(x, y) {
        let target = createVector(x, y);
        let dir = p5.Vector.sub(target, this.frontpos);
        this.angle = dir.heading();
        dir.setMag(this.size*0.7);
        dir.mult(-1);
        this.frontpos = p5.Vector.add(target, dir);
        this.calculateBackPos();
    }
    drawJoint() {
        let average = normaliseScreenPos(this.frontpos);
        //Head
        if (this.index == 0) {
            let headsize = this.size*0.9;
            push();
            noStroke();
            translate(average.x, average.y);
            rotate(this.angle);
            fill(this.colors.head)    
            rectMode(CENTER);
            rect(0,0, headsize*1.3, headsize, 5, 100, 100, 5)
            //eyes
            fill(0);
            circle(headsize/5, -headsize / 4, headsize / 6, );
            fill(this.colors.head)
            circle(headsize/5-1, -headsize / 4 , headsize / 6, );
            fill(0);
            circle(headsize/5, +headsize / 4, headsize / 6, );
            fill(this.colors.head)
            circle(headsize/5-1, +headsize / 4 , headsize / 6, );
            pop();
        } 
        // //Body with fins
        else if(this.index == 1) {
            push();
            noStroke();
            translate(average.x, average.y);
            rotate(this.angle);
            fill(this.colors.body)    
            rectMode(CENTER);
            rect(0,0, this.size*1.1, this.size*0.9, 5, 5, 5, 5)
            //fins on the top and bottom of the body
            let finSize = this.size*0.25;
            fill(this.colors.fin);
            triangle(-this.size*0.2, -this.size*0.45, -this.size*0.1, -this.size*0.45 - finSize, finSize, -this.size*0.45);
            triangle(-this.size*0.2, this.size*0.45, -this.size*0.1, this.size*0.45 + finSize, finSize, this.size*0.45);
            pop();
        }
        //Tail
        else if (this.index == (this.totalnumjoints - 1)) {
            //Tail
            push();
            let jointlength =this.size*(4/this.index)
            let jointwidth = this.size*(1.5/this.index)
            let finbase = jointwidth/2;
            let finFlare = finbase*1.5 + 5;
            let finwidth = jointlength/2.5;
            //Trapezoid tail fin
            fill(this.colors.tail);
            noStroke();
            translate(average.x, average.y);
            rotate(this.angle);
            rectMode(CENTER);
            rect(0,0, jointlength, jointwidth, 5 ,5 ,5 ,5)
            quad(
                //top right
                finwidth-jointlength/2, -finbase,
                //bottom right
                finwidth-jointlength/2, finbase, 
                //bottom left
                -jointlength/2, finFlare, 
                //top left
                -jointlength/2, -finFlare)
            pop();  
        } 
        else {
            push();
            noStroke();
            translate(average.x, average.y);
            rotate(this.angle);
            if(this.index % 2 == 0) {
                fill(this.colors.bodysecondary)
            }
            else {
                fill(this.colors.body)
            }
            rectMode(CENTER);
            rect(0,0, this.size*(3/this.index), this.size*(1.5/this.index), 5 ,5 ,5 ,5)
            pop();

        }
        // noStroke();
        // fill(255, 0, 0);
        // circle(this.frontpos.x, this.frontpos.y, 12);
        // fill(0, 255, 255);
        // circle(this.backpos.x, this.backpos.y, 4);

        //Generic body
        // else {
        //     let margin = 10;
        //     let widthFront = this.size;
        //     let widthBack = 20;
    
        //     //set up four corners
        //     let p1 = createVector(-widthFront / 2, margin);
        //     let p2 = createVector(widthFront / 2, margin);
        //     let p3 = createVector(0, -dist(this.frontpos.x, this.frontpos.y, this.backpos.x, this.backpos.y)).add(widthBack / 2, -margin);
        //     let p4 = createVector(0, -dist(this.frontpos.x, this.frontpos.y, this.backpos.x, this.backpos.y)).add(-widthBack / 2, -margin);
        //     const trapPoints = [p1, p2, p3, p4];
    
        //     // translate to front point
        //     for (let i = 0; i < trapPoints.length; i++) {
        //         let h = this.frontpos.copy();
        //         h.sub(this.backpos);
        //         trapPoints[i].rotate(h.heading());
        //         trapPoints[i].rotate(90);
        //         trapPoints[i].add(this.frontpos);
        //     }
    
        //     // plot
        //     quad(trapPoints[0].x, trapPoints[0].y,
        //         trapPoints[1].x, trapPoints[1].y,
        //         trapPoints[2].x, trapPoints[2].y,
        //         trapPoints[3].x, trapPoints[3].y);
        // }
         }

}

class Food {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.size = 5;
    }
    update() {
        this.show()
    }
    show() {
        fill(255, 0, 0);
        ellipse(this.position.x, this.position.y, this.size);

    }
    getPosition() {
        return this.position;
    }
    getSize() {
        return this.size;
    }
    kill() {
        var i = food.indexOf(this);
        food.splice(i, 1);
    }
}

//reset destination on click
function mousePressed() {

    //Check if mouse coordinates are within the pause button at (150, height-200);
    if(mouseX > 150 && mouseX < 150 + 70 && mouseY > height-200 && mouseY < height-200 + 70){
        started = !started;
    }
    else  if(!started){
        started = true;
        food.push(new Food(mouseX, mouseY));
    } else {
        food.push(new Food(mouseX, mouseY));
    }
    //set each fish to move towards the mouse
    // for(let i = 0; i < fish.length; i++){
    //     fish[i].moveTowards(mouseX, mouseY);
    // }
    //Add food at mouse position
}

//Fish colours 



function colourFish() {
    let red = "#E8494C"
let lightred = "#FC706A"
let darkred = "#B5393E"
let white = "#FFF6E8"
let lightorange = "#F79A44"
let darkorange = "#E66E29"
let orange = "#F08637"
let yellow = "#FFBC38"
let lightyellow = "#FFCC4D"
let darkyellow = "#F9A12C"

let primaryColors = [
    [red, lightred, darkred],
    [orange, lightorange, darkorange],
    [yellow, lightyellow, darkyellow]
]

let colors = [
    red, lightred, white, lightorange, orange, yellow, lightyellow, darkyellow
]

    let palette = random(primaryColors);
    const shuffledPalette = palette.sort((a, b) => 0.5 - Math.random());
    let primaryColor = shuffledPalette[0];
    let secondaryColor = shuffledPalette[1];
    let tertiaryColor = shuffledPalette[2];

    let diceroll = random(0, 100)
    //Single color fish
    //With different colours for all parts
    if(diceroll < 20){
        return (
            {
                head: primaryColor,
                body: secondaryColor,
                bodysecondary: secondaryColor,
                tail: tertiaryColor,
                fin: tertiaryColor
            }
        )
    }
    //With matching head and tail
    if(diceroll < 30){
        return (
            {
                head: primaryColor,
                body: secondaryColor,
                bodysecondary: secondaryColor,
                tail: primaryColor,
                fin: tertiaryColor
            }
        )

    }
    //With matching head and body
    if(diceroll < 50){
        return (
            {
                head: primaryColor,
                body: primaryColor,
                bodysecondary: secondaryColor,
                tail: tertiaryColor,
                fin: tertiaryColor
            }
        )
        }
    //Mottled fish
    //Mottled body, consistent head and fins
    if(diceroll < 60){
        return (
            {
                head: primaryColor,
                body: random([white, random(colors)]),
                bodysecondary: secondaryColor,
                tail: tertiaryColor,
                fin: tertiaryColor
            }
        )
    }
    //Mottled head and fins, consistent body
    if(diceroll < 80){
        let mottle = random([white, random(colors)])
        return (
            {
                head: mottle,
                body: primaryColor,
                bodysecondary: secondaryColor,
                tail: mottle,
                fin: mottle
            }
        )
    }
    //Mottled head, body and fins
    if(diceroll < 100){
        let mottle = random([white, random(colors)])
        return (
            {
                head: mottle,
                body: mottle,
                bodysecondary: secondaryColor,
                tail: mottle,
                fin: mottle
            }
        )
    }
    //Single color with accents
}


function normaliseScreenPos(screenPos){
    let average = createVector(screenPos.x, screenPos.y)//p5.Vector.add(this.frontpos, this.backpos).div(2);
    if(average.x < 0){
        average.x =  average.x % width + width;
    } else if (average.x > width) {
        average.x = average.x % width;
    }
    if(average.y < 0){
        average.y = height + average.y % height;
    } else if (average.y > height) {
        average.y = average.y % height;
    }
    return average;
}