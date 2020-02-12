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
   * Event handler for keydown event
   * @function handleKeyDown
   * @memberof TextRender.prototype
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
   */
  drawChar(char) {
    const {
      ctx,
    } = this;

    const { width } = ctx.canvas;
    const { height } = ctx.canvas;

    const fontSize = 200;
    ctx.font = `${fontSize}px Press Start`;
    ctx.clearRect(0, 0, width, height);
    const r = Math.floor(255 * Math.random());
    const g = Math.floor(255 * Math.random());
    const b = Math.floor(255 * Math.random());
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

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
    ctx.fillText(char, x, y);

    // ctx.fillText(char, x * width, y * height);
    this.callback({ x, y });
    ctx.clearRect(0, 0, width, height);
  }

  /**
   * Removes event handlers and deals with any other cleanup
   * @function destory
   * @memberof TextRender.prototype
   */
  destory() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
