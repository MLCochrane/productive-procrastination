export default class TextRender {
  constructor(canvas, input, width, height) {
    this.input = input;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    input.focus();

    input.addEventListener('keyup', e => {
      let text = input.value;
      const count = text.length;
      // const fontSize = 200 / (length / 20);
      let fontSize = 500;
      if (count > 1) fontSize *= (1 / Math.log(count + 2));
      ctx.font = `${fontSize}px Press Start`;
      const length = ctx.measureText(text).width;
      ctx.clearRect(0, 0, canvas.width, canvas.height);


      const start = (canvas.width / 2) - length / 2;
      const stop = (canvas.width / 2) + length / 2;

      ctx.fillStyle = this.calcGrad(ctx, start, stop);

      ctx.fillText(text, (canvas.width / 2) - length / 2, (canvas.height / 2) + fontSize / 4);
    });
  }

  calcGrad(ctx, start, stop) {
    const gradient = ctx.createLinearGradient(start, 0, stop, 0);

    gradient.addColorStop(0, '#f0f1c0');
    // gradient.addColorStop(.5, 'cyan');
    gradient.addColorStop(1, '#18ddb2');

    // Set the fill style and draw a rectangle
    return gradient;
  }

  setFocus() {
    this.input.focus();
  }
}
