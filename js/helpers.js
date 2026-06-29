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

function removeBody(body){
    Composite.remove(engine.world, body);

    spawnedBodies = spawnedBodies.filter(function(item){
        return item !== body;
    });
}

function pupilsIdle(){
    Body.setPosition(leftPupil, {x : leftPupilOriginX, y : leftPupilOriginY});
    Body.setPosition(rightPupil, {x : rightPupilOriginX, y : rightPupilOriginY});
}

function pupilsLookAt(targetPosition){
    const maxDistance = 30;

    let leftPupilDir = getNormalVector(
        {x : leftPupilOriginX, y : leftPupilOriginY}, 
        targetPosition);

    Body.setPosition(leftPupil, {
        x: leftPupilOriginX + leftPupilDir.x * maxDistance,
        y: leftPupilOriginY + leftPupilDir.y * maxDistance
    });

    let rightPupilDir = getNormalVector(
        {x : rightPupilOriginX, y : rightPupilOriginY}, 
        targetPosition);

    Body.setPosition(rightPupil, {
        x: rightPupilOriginX + rightPupilDir.x * maxDistance,
        y: rightPupilOriginY + rightPupilDir.y * maxDistance
    });

}


