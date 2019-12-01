function cross(vecA, vecB) {
  if (typeof vecA !== 'object' || !vecA || !vecA.length) throw 'Both arguments must be arrays';
  if (typeof vecB !== 'object' || !vecB || !vecB.length) throw 'Both arguments must be arrays';

  if (vecA.length !== 3 || vecB.length !== 3) throw 'Arrays must be of length 3';

  for (let i = 0; i < 3; i++) {
    if (typeof vecA[i] !== 'number' || typeof vecB[i] !== 'number') throw 'Array contents must be of type number';
  }

  let xCom = (vecA[1] * vecB[2]) - (vecA[2] * vecB[1]);
  let yCom = (vecA[2] * vecB[0]) - (vecA[0] * vecB[2]);
  let zCom = (vecA[0] * vecB[1]) - (vecA[1] * vecB[0]);

  xCom = Number.parseFloat(xCom.toFixed(3)),
  yCom = Number.parseFloat(yCom.toFixed(3)),
  zCom = Number.parseFloat(zCom.toFixed(3))

  return [
    xCom,
    yCom,
    zCom
  ];
}

function dot(vecA, vecB) {
  let sum;
  for (let i = 0; i < vecA.length; i++) {
    sum += vecA[i] * vecB[i];
  }
  return sum;
}

export {cross, dot};