/**
   * 
   * @param {Number} input - Number representing the type of input to display.
   * @param {String} message - Message to display to user.
   * @param {Element} parent - HTML element to insert overlay onto
   * @param {Number} timeout - Timeout in milliseconds before automatically hiding overlay. 
   * @param {String} color - String of Hex color to use for background.
   * @param {Boolean} button - Whether to display a "close" button.
   */
function overlay(input, message, parent, timeout, color, button) {
  if (input === undefined) throw 'Must supply input value to indicate type of input'
  if (typeof input !== 'number') throw 'Input argument must be a number'
  if (input < 1 || input > 5) throw 'Input argument must be a positive value from 1 to 5'

  if (message && typeof message !== 'string') throw 'Message argument must be a string'
  if (message && message.length > 200) throw 'Message string cannot be longer than 200 characters.'

  if (!isElement(parent)) throw 'Parent argument must be a valid element'

  if (timeout && typeof timeout !== 'number') throw 'Timeout argument must be a positive number'
}

function isElement(element) {
  return element instanceof Element || element instanceof HTMLDocument;  
}

export {
  overlay
};
