export default function Grapher(canvas, options) {
  if (!canvas) throw 'No value passed for canvas argument'
  if (!canvas.nodeName || canvas.nodeName.toLowerCase() !== 'canvas') throw 'First argument must be canvas DOM element'

  const toDraw = [];

  // const defaultState = {
  //   fillStyle: 'white',
  //   strokeStyle: 'black',

  // };


  const ctx = canvas.getContext('2d');

  // default properties
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';

  // checks if object, from https://stackoverflow.com/a/14706877
  if (options) {
    if (!isObject(options)) throw 'Options argument must be an object';
  }

  function addPoints(points, options) {
    if (typeof points !== 'object' || !points || !points.length) throw 'Must pass in array of points';

    if (options) {
      if (!isObject(options)) throw 'Options argument must be an object';
    }

    drawPoints(points, 3);
    return;
  }

  function drawPoints(points, radius) {
    for (let i = 0; i < points.length; i++) {
      ctx.beginPath();
      ctx.arc(points[i].x * stride + 5, points[i].y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
    }
  }

  function isObject(obj) {
    return obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]';
  }

  return {
    ctx,
    addPoints
  };
}