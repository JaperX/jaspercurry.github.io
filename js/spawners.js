const hotdogSpritePath = "../assets/sprites/hotdog_256x128.png";
const watermelonSpritePath = "../assets/sprites/watermelon_64x64.png";

function spawnHotdog(x,y, scale){
    const defaultSize = {x : 256, y : 128};
    let hotdog = Bodies.rectangle(
        x, y, 
        defaultSize.x * scale,
        defaultSize.y * scale,
        {
        restitution: 0.5,
        frction: 0.3,
        label: "food",
        render: {
            sprite: {
                texture: hotdogSpritePath,
                xScale: scale,
                yScale: scale
            }
        }});

    spawnedBodies.push(hotdog);
    Composite.add(engine.world, hotdog);
    return hotdog;
}

function spawnWatermelon(x, y, scale) {
    const defaultRadius = 32;
    let watermelon = Bodies.circle(x, y, defaultRadius * scale, {
        restitution: 0.8, // bounciness
        friction: 0.05,
        label: "food",
        render: {
            sprite: {
                texture: watermelonSpritePath,
                xScale: scale,
                yScale: scale
            }
        }});

    spawnedBodies.push(watermelon);
    Composite.add(engine.world, watermelon);
    return watermelon;
}

function getWalls(){
    const wallThickness = 50;
    const ground = Bodies.rectangle(
    width / 2,
    height + wallThickness / 2,
    width,
    wallThickness,
    { isStatic: true,
        render: {
            visible: false
        }
    });

    const ceiling = Bodies.rectangle(
    width / 2,
    -wallThickness / 2,
    width,
    wallThickness,
    { isStatic: true,
        render: {
            visible: false
        }
    });

    const leftWall = Bodies.rectangle(
    -wallThickness / 2,
    height / 2,
    wallThickness,
    height,
    { isStatic: true,
        render: {
            visible: false
        }
    });

    const rightWall = Bodies.rectangle(
    width + wallThickness / 2,
    height / 2,
    wallThickness,
    height,
    { isStatic: true,
        render: {
            visible: false
        }
    });

    return [ground, ceiling, leftWall, rightWall];
}
