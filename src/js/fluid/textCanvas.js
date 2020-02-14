/**
 * Class for rendering text on 2D canvas
 * @param {HTMLCanvasElement} canvas - canvas for 2D context
 * @param {Number} width - width of canvas in pixels
 * @param {Number} height - height of canvas in pixels
 * @param {Function} callback - callback function called once text drawn
 */
export default class TextRender {
  constructor(canvas, width, height, callback) {
    this.callback = callback;
    this.handleKeyDown = this.handleKeyDown.bind(this);

    canvas.width = width;
    canvas.height = height;

    this.ctx = canvas.getContext('2d');
    window.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Initial draw not tied to event.
   * @function initialDraw
   * @memberof TextRender.prototype
   * @param {String} message - String of message to display.
   */
  initialDraw(message) {
    const {
      ctx,
    } = this;

    const { width } = ctx.canvas;
    const { height } = ctx.canvas;

    const fontSize = 250 * (width / 1830);
    ctx.font = `bold ${fontSize}px Ubuntu`;
    const length = ctx.measureText(message).width;
    const x = (width / 2) - (length / 2);
    const y = (height / 2) + (fontSize / 2);
    this.drawChar(message, x, y);
  }

  /**
   * Event handler for keydown event
   * @function handleKeyDown
   * @memberof TextRender.prototype
   * @param {Object} event - Keydown event
   * @param {String} event.key - Keyboard character pressed
   */
  handleKeyDown({ key }) {
    // this should filter out control keys
    if (key.length > 1) return;
    this.drawChar(key);
  }

  /**
   * Draws character to canvas
   * @function drawChar
   * @memberof TextRender.prototype
   * @param {String} char - single character to be drawn to canvas
   * @param {Number} initialX - Optional initial X position.
   * @param {Number} initialY - Optional initial Y position.
   */
  drawChar(char, initialX, initialY) {
    const {
      ctx,
    } = this;

    const { width } = ctx.canvas;
    const { height } = ctx.canvas;

    const fontSize = 200 * (width / 1830);
    ctx.font = `${fontSize}px Ubuntu`;
    ctx.clearRect(0, 0, width, height);

    let x = Math.random();
    let y = Math.random();

    if (x > y) {
      y = Math.round(y);
      y = y === 1 ? height - fontSize : fontSize;
      x *= width - fontSize;
    } else {
      x = Math.round(x);
      x = x === 1 ? width - fontSize : fontSize;
      y = y * height + fontSize > height ? height - (2 * fontSize) : y * height + fontSize;
    }

    x = initialX !== undefined ? initialX : x;
    y = initialY !== undefined ? initialY : y;

    const grad = ctx.createRadialGradient(x, y - (0.5 * fontSize), 5, x, y - (0.5 * fontSize), 100);
    grad.addColorStop(1, '#01c1b1');
    grad.addColorStop(0, '#eee291');
    ctx.fillStyle = grad;
    ctx.fillText(char.toUpperCase(), x, y);
    this.callback({ x, y });
    ctx.clearRect(0, 0, width, height);
  }

  /**
   * Removes event handlers and deals with any other cleanup
   * @function destroy
   * @memberof TextRender.prototype
   */
  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
