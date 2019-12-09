import {
  cross,
  dot,
} from './math';


describe('Cross function', () => {
  test('Throws error if two args not arrays', () => {
    expect(() => {
      cross('', 'f');
    }).toThrow('Both arguments must be arrays');

    expect(() => {
      cross([1, 2, 3], '');
    }).toThrow('Both arguments must be arrays');

    expect(() => {
      cross({}, [1, 2, 3]);
    }).toThrow('Both arguments must be arrays');

    expect(() => {
      cross({}, {});
    }).toThrow('Both arguments must be arrays');

    expect(() => {
      cross([1, 2], [1]);
    }).not.toThrow('Both arguments must be arrays');
  });

  test('Throws error if arrays not of length 3', () => {
    expect(() => {
      cross([1, 2], [1,2]);
    }).toThrow('Arrays must be of length 3');

    expect(() => {
      cross([1, 2, 3], [1, 2]);
    }).toThrow('Arrays must be of length 3');

    expect(() => {
      cross([1, 2, 3], [1, 2, 3]);
    }).not.toThrow('Arrays must be of length 3');
  });

  test('Throws error if array contents not numbers', () => {
		expect(() => {
			cross(['hello', 2, 1], [1, 2, 3]);
    }).toThrow('Array contents must be of type number');

    expect(() => {
		  cross([1, 2, 1], ['hello', 'my', 'name']);
    }).toThrow('Array contents must be of type number');

    expect(() => {
			cross([1.12, 2.96, 1.5], [1.2, 3.1, 2.3]);
		}).not.toThrow('Array contents must be of type number');
  });

  test('Properly calculates and rounds result', () => {
    expect(cross([0, 0, 0], [0, 0, 0])).toStrictEqual([0, 0, 0]);
    expect(cross([0, 1, 0], [1, 0, 0])).toStrictEqual([0, 0, -1]);
    expect(cross([2, 1, 3], [4, 1, 2])).toStrictEqual([-1, 8, -2]);
    expect(cross([1.2, 1.2, 3], [2.56, 3, 35])).toStrictEqual([33, -34.32, 0.528]);
    expect(cross([-2.345, 12.533, -0.135], [1.332, -134.2, 0.4111])).toStrictEqual([-12.965, 0.784, 298.005]);
	});
});


describe('Dot Product', () => {
  test('Throws error if both arguments not arrays', () => {
    expect(() => dot(1, 2)).toThrow('Both arguments must be arrays');
    expect(() => dot([1, 2], 2)).toThrow('Both arguments must be arrays');
    expect(() => dot([], [])).toThrow('Both arguments must be arrays');
    expect(() => dot({}, '')).toThrow('Both arguments must be arrays');
    expect(() => dot([1], [2])).not.toThrow('Both arguments must be arrays');
  });

  test('Throws error arguments not of same length', () => {
    expect(() => dot([1], [1, 2])).toThrow('Both arguments must be of the same length');
    expect(() => dot([1, 2], [2])).toThrow('Both arguments must be of the same length');
    expect(() => dot([1, 2, 3, 4, 5, 12], [2, 2, 3, 4])).toThrow('Both arguments must be of the same length');
    expect(() => dot([1, 2, 3, 4, 5], [5, 4, 3, 2, 1])).not.toThrow('Both arguments must be of the same length');
  });

  test('Correctly calculates dot product', () => {
    expect(dot([1], [2])).toEqual(2);
    expect(dot([1.2], [2.3])).toEqual(2.76);
    expect(dot([1.2, 3.4], [2.3, 8.7])).toEqual(32.34);
    expect(dot([1, 2, 3], [1, 5, 7])).toEqual(32);
    expect(dot([1.35, 22.12, -33.8], [12.2, -50.1332, 7.5288])).toEqual(-1346.950);
  });
});