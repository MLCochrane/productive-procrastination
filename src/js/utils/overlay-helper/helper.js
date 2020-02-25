/**
 * Checks if passed argument is an element of not
 * @function isElement
 * @param {any} element - Argument to check if an element.
 * @returns {Boolean}
 */
function isElement(element) {
  return element instanceof Element || element instanceof HTMLDocument;
}

/**
 * Checks inputs and throws relevant error if necessary.
 * @function checkInputs
 */
function checkInputs({
  input,
  message,
  parent,
  timeout,
  color,
  button,
}) {
  let msg = '';
  const colorReg = /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d.]+%?\))$/;
  if (input && typeof input !== 'number') msg = 'Input argument must be a number';
  else if (input < 1 || input > 5) msg = 'Input argument must be a positive value from 1 to 5';
  else if (message && typeof message !== 'string') msg = 'Message argument must be a string';
  else if (message && message.length > 200) msg = 'Message string cannot be longer than 200 characters.';
  else if (!isElement(parent)) msg = 'Parent argument must be a valid element';
  else if (timeout && typeof timeout !== 'number') msg = 'Timeout argument must be a positive number';
  else if (color != null && !colorReg.test(color)) msg = 'Color argument must be a valid CSS color';
  else if (button != null && typeof button !== 'boolean') msg = 'Button argument must be a boolean';

  return msg === '' ? { error: 0, msg: '' } : { error: 1, msg };
}

/**
   * Creates input instruction overlay
   * @function overlay
   * @param {Object} options - Options object for specifying params.
   * @param {Number} options.input - Number representing the type of input to display.
   * @param {String} options.message - Message to display to user.
   * @param {Element} options.parent - HTML element to insert overlay onto
   * @param {Number} options.timeout - Timeout in milliseconds before automatically hiding overlay.
   * @param {String} options.color - String of Hex color to use for background.
   * @param {Boolean} options.button - Whether to display a "close" button.
   */
export default function overlay(options) {
  if (options != null) {
    const { error, msg } = checkInputs(options); // eslint-disable-line prefer-rest-params
    if (error) throw new Error(msg);
  }

  const config = {
    input: options.input || 1,
    message: options.message || '',
    parent: options.parent || document.body,
    timeout: options.timeout || 3000,
    color: options.color || 'rgba(57,70,70,0.8)',
    button: options.button || false,
  };

  let inputType = '';
  switch (config.input) {
    case 1:
      inputType = 'mousemove';
      break;
    case 2:
      inputType = 'drag';
      break;
    case 3:
      inputType = 'scroll';
      break;
    case 4:
      inputType = 'click';
      break;
    default:
      break;
  }

  const element = document.createElement('div');
  element.classList.add('input-overlay');
  element.setAttribute('data-input-type', inputType);
  config.parent.appendChild(element);
}
