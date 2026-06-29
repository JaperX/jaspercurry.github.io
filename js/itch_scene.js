
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

let timesFed = 0;
const satisfiedThreshold = 3; // Number of food items to feed before opening a new tab

// Create renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
    width: width,
    height: height,
    wireframes: false,
    background: "#000000"
    }
});


const eatSFX = new Audio("../assets/audio/cartoon_chomp_sfx.mp3");
//const backgroundMusic = new Audio("../assets/audio/backgroundmusic.mp3");
//const sizzleSFX = new Audio("../assets/audio/sizzleSFX.mp3");

const backgroundSky = Bodies.rectangle(width / 2, height / 2, width, height, {
    isStatic: true,
    isSensor: true,
    render: {
        fillStyle: "#87CEEB"
    }
});

const backgroundGrass = Bodies.rectangle(width / 2, height - 50, width, 100, {
    isStatic: true,
    isSensor: true,
    render: {
        fillStyle: "#228B22"
    }
});

const cloudBanner = Bodies.rectangle(
    width/2,
    128,
    512,
    128,
    {
        isStatic: true,
        isSensor: true,
        render: {
            sprite: {
                texture: "../assets/sprites/cloud_banner.png",
                xScale: 1,
                yScale: 1
            }
        }
    }
);

const hotdogStand = Bodies.rectangle(
    width - 100,
    height - 100,
    256,
    256,
    {
        isStatic: true,
        isSensor: true,
        render: {
            sprite: {
                texture: "../assets/sprites/hotdog_stand.png",
                xScale: 1,
                yScale: 1
            }
        }
    }

)

const theEater = Bodies.rectangle(width /2, 400, 50, 50, {
    isStatic: true,
    isSensor: true,
    render: {
        sprite: {
            texture: "../assets/sprites/the_eater.png",
            xScale: 1,
            yScale: 1
        }
    }
});

const mouthSensor = Bodies.rectangle(
    theEater.position.x, 
    theEater.position.y, 
    10, 10, 
    {
    isStatic: true,
    isSensor: true,
    label: "mouth",
    render: {
        visible: false
    }
    });

const leftPupilOriginX = theEater.position.x - 50;
const leftPupilOriginY = theEater.position.y - 60;

const leftPupil = Bodies.circle(
    leftPupilOriginX, 
    leftPupilOriginY, 
    5, 
    {
        isStatic: true,
        isSensor: true,
        render: {
            fillStyle: "white"
        }
    }
)

const rightPupilOriginX = theEater.position.x + 50;
const rightPupilOriginY = theEater.position.y - 60;

const rightPupil = Bodies.circle(
    rightPupilOriginX, 
    rightPupilOriginY,  
    5, 
    {
        isStatic: true,
        isSensor: true,
        render: {
            fillStyle: "white"
        }
    }
)

const bellySprites = [
    "../assets/sprites/belly_stage1.png", 
    "../assets/sprites/belly_stage2.png",
    "../assets/sprites/belly_stage3.png"
];

const belly = Bodies.circle(
    theEater.position.x, 
    theEater.position.y + 150,
    50,
    {
        isStatic: true,
        isSensor: true,
        render: {
            sprite: {
                texture: bellySprites[0],
                xScale: 1,
                yScale: 1
            }
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
    backgroundSky,
    backgroundGrass,
    cloudBanner,
    hotdogStand,
    ground,
    leftWall,
    rightWall,
    ceiling,
    theEater,
    leftPupil,
    rightPupil,
    mouthSensor,
    belly
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

//runs every frame
Events.on(engine, "beforeUpdate", function(){
    if (grabbedBody != null){
        
        pupilsLookAt(mouse.position);
    } else{
        pupilsIdle();
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

                timesFed++;

                switch (timesFed) {
                    case 0:
                        belly.render.sprite.texture = bellySprites[0];
                        break;
                    case 1:
                        belly.render.sprite.texture = bellySprites[1];
                        break;
                    case 2:
                        belly.render.sprite.texture = bellySprites[2];
                        break;
                    
                    //times fed > 2, keep belly at stage 3
                    default:
                        belly.render.sprite.texture = bellySprites[2];
                        break;
                }

                if (timesFed >= satisfiedThreshold) {
                    openNewTabTimer = setTimeout(function() {
                        window.open("https://japerx.itch.io/");
                    }, 1500); // Open new tab after 1.5 seconds
                }
            }, eatDelay);
            
            console.log("food entered mouth area");
        }
    }
});

Events.on(engine, "collisionEnd", function(event) {
  for (const pair of event.pairs) {
    const labels = [pair.bodyA.label, pair.bodyB.label];

    //detect when food leaves mouth sensor
    if (labels.includes("food") && labels.includes("mouth")) {
      console.log("food left mouth area");
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






