export default class TextRender {
  constructor(canvas, input, width, height) {
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(20,0, width - 20,0);

    gradient.addColorStop(0, '#DAE2F8');
    // gradient.addColorStop(.5, 'cyan');
    gradient.addColorStop(1, '#D6A4A4');

    // Set the fill style and draw a rectangle
    ctx.fillStyle = gradient;
    
    input.focus();
    
    input.addEventListener('keyup', e => {
      let text = input.value;
      const count = text.length;
      // const fontSize = 200 / (length / 20);
      const fontSize = 600 * (1 - (count / 29));
      ctx.font = `bold ${fontSize}px Ubuntu`;
      const length = ctx.measureText(text).width;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    
      ctx.fillText(text, (canvas.width / 2) - length / 2, (canvas.height / 2));
    });
  }
}
