
const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Mouse = Matter.Mouse;
const MouseConstraint = Matter.MouseConstraint; 
const Events = Matter.Events;
const Body = Matter.Body;

// Create physics engine
const engine = Engine.create();

let width = window.innerWidth;
let height = window.innerHeight;

let spawnedBodies = [];
let grabbedBody = null;

// Create renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
    width: width,
    height: height,
    wireframes: false,
    background: "#FFF78D"
    }
});


//ASSETS
const banner_image = "../assets/sprites/banner.png";

const hotdog_stand_image = "../assets/sprites/hotdog_stand.png";
const hotdog_image = "../assets/sprites/hotdog_256x128.png";

const watermelon_image = "../assets/sprites/watermelon_64x64.png";

const eaterIdleSprite = "../assets/sprites/the_eater_idle.png";
const eaterHungrySprite = "../assets/sprites/the_eater_hungry.png";
const eaterSatisfiedSprite = "../assets/sprites/the_eater_satisfied.png";

const eatSFX = new Audio("../assets/audio/cartoon_chomp_sfx.mp3");
//const backgroundMusic = new Audio("../assets/audio/backgroundmusic.mp3");
//const sizzleSFX = new Audio("../assets/audio/sizzleSFX.mp3");

const banner = Bodies.rectangle(
    width/2,
    128,
    512,
    128,
    {
        isStatic: true,
        isSensor: true,
        render: {
            sprite: {
                texture: banner_image,
                xScale: 1,
                yScale: 1
            }
        }
    }
);

const hotdogStand = Bodies.rectangle(
    width - 128,
    height - 128,
    256,
    256,
    {
        isStatic: true,
        isSensor: true,
        render: {
            sprite: {
                texture: hotdog_stand_image,
                xScale: 2,
                yScale: 2
            }
        }
    }

)



const theEater = Bodies.rectangle(width /2, 400, 50, 50, {
    isStatic: true,
    isSensor: true,
    render: {
        sprite: {
            texture: eaterIdleSprite,
            xScale: 1,
            yScale: 1
        }
    }
});

const mouthSensor = Bodies.rectangle(
    theEater.position.x, 
    theEater.position.y + 64, 
    10, 10, 
    {
    isStatic: true,
    isSensor: true,
    label: "mouth",
    render: {
        visible: false
    }
    });

const leftPupilOriginX = theEater.position.x - 64;
const leftPupilOriginY = theEater.position.y - 32;

const leftPupil = Bodies.circle(
    leftPupilOriginX, 
    leftPupilOriginY, 
    5, 
    {
        isStatic: true,
        isSensor: true,
        render: {
            fillStyle: "black"
        }
    }
)

const rightPupilOriginX = theEater.position.x + 64;
const rightPupilOriginY = theEater.position.y - 32;

const rightPupil = Bodies.circle(
    rightPupilOriginX, 
    rightPupilOriginY,  
    5, 
    {
        isStatic: true,
        isSensor: true,
        render: {
            fillStyle: "black"
        }
    }
)

const walls = getWalls();
const ground = walls[0];
const ceiling = walls[1];
const leftWall = walls[2];
const rightWall = walls[3];


// Add everything to the world
Composite.add(engine.world, [
    banner,
    hotdogStand,
    ground,
    leftWall,
    rightWall,
    ceiling,
    leftPupil,
    rightPupil,
    theEater,
    mouthSensor
]);

let watermelon1 = spawnWatermelon(100, height - 100, 0.8);
let watermelon2 = spawnWatermelon(200, height-100, 1.5);
let watermelon3 = spawnWatermelon(150, height-200, 1);

// Allow mouse dragging
const mouse = Mouse.create(render.canvas);

const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
    stiffness: 0.2,
    render: {
        visible: false
    }
    }
});

Composite.add(engine.world, mouseConstraint);

render.mouse = mouse;

let resizeTimer;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(function () {
    location.reload();
  }, 300);
});

let satisfiedSpriteTimer = null;

function setEaterSprite(texture){
    if (theEater && theEater.render && theEater.render.sprite) {
        theEater.render.sprite.texture = texture;
    }
}

function clearSatisfiedSpriteTimer(){
    if (satisfiedSpriteTimer != null) {
        clearTimeout(satisfiedSpriteTimer);
        satisfiedSpriteTimer = null;
    }
}

//runs every frame
Events.on(engine, "beforeUpdate", function(){
    if (grabbedBody != null){
        pupilsLookAt(mouse.position,24);
        setEaterSprite(eaterHungrySprite);
    } else if (satisfiedSpriteTimer != null){
        pupilsIdle();
        setEaterSprite(eaterSatisfiedSprite);
    } else{
        pupilsIdle();
        setEaterSprite(eaterIdleSprite);
    }
});

//draws before every frame is rendered
Events.on(render, "beforeRender", function() {
});

//draws after every frame is rendered
Events.on(render, "afterRender", function() {
});

Events.on(mouseConstraint, "startdrag", function(event) {
    grabbedBody = event.body;
    grabbedBody.isGrabbed = true;

    console.log("grabbed body:", grabbedBody.label);
});

Events.on(mouseConstraint, "enddrag", function(event) {
    event.body.isGrabbed = false;
    grabbedBody = null;

    console.log("released body:", event.body.label);
});

Events.on(engine, "collisionStart", function(event){
    for (const pair of event.pairs) {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        const labels = [bodyA.label, bodyB.label];
    
        //detect when food enters mouth sensor
        if (labels.includes("food") && labels.includes("mouth")){
            const foodBody = bodyA.label === "food" ? bodyA : bodyB;
            let eatDelay = 200; //wait a little before eating the food
            eatTimer = setTimeout(function() {
                removeBody(foodBody);
                eatSFX.currentTime = 0;
                eatSFX.play();

                clearSatisfiedSpriteTimer();
                setEaterSprite(eaterSatisfiedSprite);
                satisfiedSpriteTimer = setTimeout(function() {
                    satisfiedSpriteTimer = null;
                    if (grabbedBody == null) {
                        setEaterSprite(eaterIdleSprite);
                    }
                }, 1000);

                
                openNewTabTimer = setTimeout(function() {
                    window.open("https://japerx.itch.io/");
                }, 1000); // Open new tab after 1.5 seconds
            }, eatDelay);
            
            //console.log("food entered mouth area");
        }
    }
});

Events.on(engine, "collisionEnd", function(event) {
  for (const pair of event.pairs) {
    const labels = [pair.bodyA.label, pair.bodyB.label];

    //detect when food leaves mouth sensor
    if (labels.includes("food") && labels.includes("mouth")) {
      //console.log("food left mouth area");
    }
  }
});

render.canvas.addEventListener("click", function(event) {
    const clickX = event.clientX;
    const clickY = event.clientY;
    console.log("click at:", clickX, clickY);

    //if the click is on the hotdog stand, spawn a hotdog
    const bounds = hotdogStand.bounds;
    if (clickX >= bounds.min.x && clickX <= bounds.max.x &&
        clickY >= bounds.min.y && clickY <= bounds.max.y) {
        console.log("hotdog stand clicked, spawning hotdog");
        //sizzleSFX.currentTime = 0;
        //sizzleSFX.play();
        spawnHotdog(
            clickX, 
            clickY, 
            randomRange(0.3, 0.6));
    }

});

// Run the game
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);






