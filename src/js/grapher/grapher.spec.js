import Grapher from './grapher';

const points = [{x:0,y:50},{x:1,y:65},{x:2,y:58},{x:3,y:70},{x:4,y:62}, {x: 5, y: 82}];
const points2 = [{x:0,y:50},{x:1,y:65},{x:2,y:58},{x:3,y:70},{x:4,y:62}];

describe('Grapher initializes', () => {
  test('throws error if no canvas argument supplied', () => {
    expect(() => {
      const graph = new Grapher();
    }).toThrow('No value passed for canvas argument');
  });

  test('throws error if canvas argument not DOM node', () => {
		expect(() => {
			const graph = new Grapher('fam');
		}).toThrow('First argument must be canvas DOM element');
  });

  test('throws error if canvas argument not canvas node type', () => {
    document.body.innerHTML =
    `
    <div>
      <div id="graph"></div>
    </div>
    `
    const canvas = document.getElementById('graph');

		expect(() => {
			const graph = new Grapher(canvas);
		}).toThrow('First argument must be canvas DOM element');
	});

  test('takes canvas and returns context', () => {
    document.body.innerHTML =
			'<div>' +
			'  <canvas id="graph"/>' +
      '</div>';

    const canvas = document.getElementById('graph');
    const graph = new Grapher(canvas);
    expect(graph.ctx.canvas).toBeDefined();
  });
});

describe('Grapher takes optional options and sets state', () => {
  let graph;
  beforeEach(() => {
    document.body.innerHTML =
      '<div>' +
      '  <canvas id="graph"/>' +
      '</div>';
  });

  test('throws error if options argument not an object', () => {
    const canvas = document.getElementById('graph');

    expect(() => {
      graph = new Grapher(canvas, []);
    }).toThrow('Options argument must be an object');

    expect(() => {
      graph = new Grapher(canvas, {});
    }).not.toThrow('Options argument must be an object');
  });

});

describe('Graphing points', () => {
  let graph;
  beforeEach(() => {
    document.body.innerHTML =
      '<div>' +
      '  <canvas id="graph"/>' +
      '</div>';
    const canvas = document.getElementById('graph');
    graph = new Grapher(canvas);
  });

  test('addPoints method exsists', () => {
    expect(typeof graph.addPoints).toBe('function');
  });

  test('throws error if no argument passed', () => {
    expect(() => {
      graph.addPoints();
    }).toThrow('Must pass in array of points');
  });

  test('throws error if points not an array', () => {
    expect(() => {
      graph.addPoints('');
    }).toThrow('Must pass in array of points');

    expect(() => {
      graph.addPoints('12dfg');
    }).toThrow('Must pass in array of points');

    expect(() => {
      graph.addPoints(points);
    }).not.toThrow('Must pass in array of points');
  });

  test('throws error if options argument not an object', () => {
    expect(() => {
      graph.addPoints(points, 'stroke');
    }).toThrow('Options argument must be an object');

    expect(() => {
      graph.addPoints(points, []);
    }).toThrow('Options argument must be an object');

    expect(() => {
      graph.addPoints(points, {});
    }).not.toThrow('Options argument must be an object');
  });
});
