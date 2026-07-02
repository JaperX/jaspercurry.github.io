function getNormalVector(startPos, endPos) {
  const xDir = endPos.x - startPos.x;
  const yDir = endPos.y - startPos.y;

  const length = Math.sqrt(xDir * xDir + yDir * yDir);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: xDir / length,
    y: yDir / length
  };
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

function removeBody(body){
    Composite.remove(engine.world, body);

    spawnedBodies = spawnedBodies.filter(function(item){
        return item !== body;
    });
}

let idleLookTarget = null;
let lastIdleLookChange = 0;

function pupilsIdle(){
    const now = performance.now();

    if (idleLookTarget == null || now - lastIdleLookChange >= 3000) {
        const eyeCenterX = (leftPupilOriginX + rightPupilOriginX) / 2;
        const eyeCenterY = (leftPupilOriginY + rightPupilOriginY) / 2;
        const outwardDistance = 120;
        const verticalSpread = 40;

        const direction = Math.random() < 0.5 ? -1 : 1;
        const targetX = eyeCenterX + direction * outwardDistance;
        const targetY = eyeCenterY + randomRange(-verticalSpread, verticalSpread);

        idleLookTarget = {
            x: targetX,
            y: targetY
        };
        lastIdleLookChange = now;
    }

    pupilsLookAt(idleLookTarget,16);
}

function pupilsLookAt(targetPosition, maxDistance){
    const smoothAmount = 0.15;

    let leftPupilDir = getNormalVector(
        {x : leftPupilOriginX, y : leftPupilOriginY}, 
        targetPosition);

    const leftTargetX = leftPupilOriginX + leftPupilDir.x * maxDistance;
    const leftTargetY = leftPupilOriginY + leftPupilDir.y * maxDistance;

    Body.setPosition(leftPupil, {
        x: lerp(leftPupil.position.x, leftTargetX, smoothAmount),
        y: lerp(leftPupil.position.y, leftTargetY, smoothAmount)
    });

    let rightPupilDir = getNormalVector(
        {x : rightPupilOriginX, y : rightPupilOriginY}, 
        targetPosition);

    const rightTargetX = rightPupilOriginX + rightPupilDir.x * maxDistance;
    const rightTargetY = rightPupilOriginY + rightPupilDir.y * maxDistance;

    Body.setPosition(rightPupil, {
        x: lerp(rightPupil.position.x, rightTargetX, smoothAmount),
        y: lerp(rightPupil.position.y, rightTargetY, smoothAmount)
    });

}


