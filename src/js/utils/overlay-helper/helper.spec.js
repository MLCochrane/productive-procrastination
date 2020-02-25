/* eslint-disable no-undef */
import {
  toContainHTML,
} from '@testing-library/jest-dom/matchers';

import overlay from './helper';

expect.extend({
  toContainHTML,
});

describe('Instruction overlay inputs', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = `
    <div>
    <div id="parent"></div>
    </div>`;
    el = document.getElementById('parent');
  });

  test('Handles incorrect input argument', () => {
    expect(() => {
      overlay({
        input: 'hi',
      });
    }).toThrow('Input argument must be a number');

    expect(() => {
      overlay({
        input: 2,
      });
    }).not.toThrow('Input argument must be a number');

    expect(() => {
      overlay({
        input: -120,
      });
    }).toThrow('Input argument must be a positive value from 1 to 5');

    expect(() => {
      overlay({
        input: 6,
      });
    }).toThrow('Input argument must be a positive value from 1 to 5');

    expect(() => {
      overlay({
        input: 1,
      });
    }).not.toThrow('Input argument must be a positive value from 1 to 5');
  });

  test('Handles incorrect message argument', () => {
    expect(() => {
      overlay({
        message: 2,
      });
    }).toThrow('Message argument must be a string');

    expect(() => {
      overlay({
        message: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
      });
    }).toThrow('Message string cannot be longer than 200 characters');

    expect(() => {
      overlay({
        message: 'Click and drag',
      });
    }).not.toThrow('Message string cannot be longer than 200 characters');
  });

  test('Handles incorrect parent argument', () => {
    expect(() => {
      overlay({
        parent: '',
      });
    }).toThrow('Parent argument must be a valid element');

    expect(() => {
      overlay({
        parent: el,
      });
    }).not.toThrow('Parent argument must be a valid element');
  });

  test('Handles incorrect timeout argument', () => {
    expect(() => {
      overlay({
        parent: el,
        timeout: 'jakjfslkj',
      });
    }).toThrow('Timeout argument must be a positive number');

    expect(() => {
      overlay({
        parent: el,
        timeout: [],
      });
    }).toThrow('Timeout argument must be a positive number');

    expect(() => {
      overlay({
        parent: el,
        timeout: 1000,
      });
    }).not.toThrow('Timeout argument must be a positive number');
  });

  test('Handles inncorrect color values', () => {
    const options = {
      parent: el,
    };

    expect(() => {
      options.color = '';
      overlay(options);
    }).toThrow('Color argument must be a valid CSS color');

    expect(() => {
      options.color = 'rgb(1)';
      overlay(options);
    }).toThrow('Color argument must be a valid CSS color');

    expect(() => {
      options.color = '#22';
      overlay(options);
    }).toThrow('Color argument must be a valid CSS color');

    expect(() => {
      options.color = '#ffzf01';
      overlay(options);
    }).toThrow('Color argument must be a valid CSS color');

    expect(() => {
      options.color = '#ff00ff';
      overlay(options);
    }).not.toThrow('Color argument must be a valid CSS color');

    expect(() => {
      options.color = '#eee';
      overlay(options);
    }).not.toThrow('Color argument must be a valid CSS color');

    expect(() => {
      options.color = 'rgb(0,0,0)';
      overlay(options);
    }).not.toThrow('Color argument must be a valid CSS color');

    expect(() => {
      options.color = 'rgba(0, 0, 0, 1)';
      overlay(options);
    }).not.toThrow('Color argument must be a valid CSS color');
  });

  test('Handles inncorrect button values', () => {
    const options = {
      parent: el,
    };
    expect(() => {
      options.button = 'f';
      overlay(options);
    }).toThrow('Button argument must be a boolean');

    expect(() => {
      options.button = 1;
      overlay(options);
    }).toThrow('Button argument must be a boolean');

    expect(() => {
      options.button = true;
      overlay(options);
    }).not.toThrow('Button argument must be a boolean');

    expect(() => {
      options.button = false;
      overlay(options);
    }).not.toThrow('Button argument must be a boolean');
  });
});

describe('Intruction overlay DOM modification', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <div id="parent"></div>
      </div>`;
    el = document.getElementById('parent');
  });

  test('Adds new element to parent element', () => {
    const options = {
      input: 2,
      parent: el,
    };
    overlay(options);
    expect(el.innerHTML).toEqual(
      '<div class="input-overlay" data-input-type="drag"></div>',
    );
  });

  test('Sets default input type data attribute', () => {
    overlay({
      parent: el,
    });
    expect(el.innerHTML).toEqual(
      '<div class="input-overlay" data-input-type="mousemove"></div>',
    );
  });

  test('Sets scroll input type data attribute', () => {
    const options = {
      input: 3,
      parent: el,
    };
    overlay(options);
    expect(el.innerHTML).toEqual(
      '<div class="input-overlay" data-input-type="scroll"></div>',
    );
  });
});
