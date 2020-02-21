import { overlay } from './helper';
describe('Instruction overlay', () => {
  document.body.innerHTML =
  `<div>
    <span id="username" />
  </div>`;
  const el = document.getElementById('username');


  test('Handles incorrect input argument', () => {
    expect(() => {
      overlay();
    }).toThrow('Must supply input value to indicate type of input');

    expect(() => {
      overlay('hi');
    }).toThrow('Input argument must be a number');

    expect(() => {
      overlay(2);
    }).not.toThrow('Input argument must be a number');
    
    expect(() => {
      overlay(-120);
    }).toThrow('Input argument must be a positive value from 1 to 5');

    expect(() => {
      overlay(6);
    }).toThrow('Input argument must be a positive value from 1 to 5');

    expect(() => {
      overlay(1);
    }).not.toThrow('Input argument must be a positive value from 1 to 5');
  });

  test('Handles incorrect message argument', () => {
    expect(() => {
      overlay(2, 2);
    }).toThrow('Message argument must be a string');

    expect(() => {
      overlay(2, '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001');
    }).toThrow('Message string cannot be longer than 200 characters');

    expect(() => {
      overlay(2, 'Click and drag');
    }).not.toThrow('Message string cannot be longer than 200 characters');
  })

  test('Handles incorrect parent argument', () => {
    expect(() => {
      overlay(2, 'Hello', '');
    }).toThrow('Parent argument must be a valid element');

    expect(() => {
      overlay(2, 'Hello', el);
    }).not.toThrow('Parent argument must be a valid element');
  })

  test('Handles incorrect timeout argument', () => {
    expect(() => {
      overlay(2, 'Hello', el, 'jakjfslkj');
    }).toThrow('Timeout argument must be a positive number');

    expect(() => {
      overlay(2, 'Hello', el, '');
    }).toThrow('Timeout argument must be a positive number');
  })
});