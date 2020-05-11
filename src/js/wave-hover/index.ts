import vert from './vert'
import frag from './frag';

/*
 *  Class for simple PixiJS displacement map sketch
 */
export default class HoverMap {
	gl: WebGLRenderingContext | WebGL2RenderingContext;
	program: WebGLProgram | null;
	isHovering: boolean;
	start: number | null;
	width: number;
	height: number;
	imgSrc: string;
	imgDis: string;
	constructor() {
		const canvas = document.getElementById('sandbox') as HTMLCanvasElement;
		this.imgSrc = `${ASSET_PATH}/assets/hover/Hover-Image.jpg`;
		this.imgDis = `${ASSET_PATH}/assets/hover/displacement.png`;
		this.width = canvas.width;
		this.height = canvas.height;

		this.gl = (canvas as HTMLCanvasElement).getContext('webgl') as WebGLRenderingContext;
		this.isHovering = false;
		this.start = null;
		this.program = null;

		this.init = this.init.bind(this);
		this.bindEvents = this.bindEvents.bind(this);
		this.initShader = this.initShader.bind(this);
		this.initBuffers = this.initBuffers.bind(this);
		this.loadImage = this.loadImage.bind(this);
		this.loadImages = this.loadImages.bind(this);
		this.initTextures = this.initTextures.bind(this);
		this.createProgram = this.createProgram.bind(this);
		this.createShader = this.createShader.bind(this);
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.render = this.render.bind(this);

		this.init();

	}

	init() {
		const {
			bindEvents,
			initShader,
			initBuffers,
			render,
		} = this;

		bindEvents();
		initShader(vert, frag);
		initBuffers();
		window.requestAnimationFrame(render);
	}

	bindEvents() {
		this.gl.canvas.addEventListener('mouseenter', this.onMouseEnter);
		this.gl.canvas.addEventListener('mouseleave', this.onMouseLeave);
	}

	destroy() {
		this.gl.canvas.removeEventListener('mouseenter', this.onMouseEnter);
		this.gl.canvas.removeEventListener('mouseleave', this.onMouseLeave);
	}

	onMouseEnter() {
		this.isHovering = true;
	}

	onMouseLeave() {
		this.isHovering = false;
	}

	initShader(
		vertSource: string,
		fragSource: string,
	) {
		const {
			gl,
			createShader,
			createProgram,
		} = this;

		if (!gl) return;
		const vertShader = createShader(gl, gl.VERTEX_SHADER, vertSource) as WebGLShader;
		const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragSource)  as WebGLShader;
		this.program = createProgram(gl, vertShader, fragShader);
	}

	initBuffers() {
		const {
			gl,
			program,
			width,
			height,
			loadImage,
			imgSrc,
			imgDis,
		} = this;

		const posAttrLoc = gl.getAttribLocation(program as WebGLProgram, 'a_position');
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

		const positions = [
			-1, 1, 0,
			-1, -1, 0,
			1, -1, 0,
			1, 1, 0
		];

		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(positions),
			gl.STATIC_DRAW
		);

		gl.enableVertexAttribArray(posAttrLoc);

		const size = 3,
			type = gl.FLOAT,
			normalize = false,
			stride = 0,
			offset = 0;

		gl.vertexAttribPointer(
			posAttrLoc,
			size,
			type,
			normalize,
			stride,
			offset
		);

		const uvAttrLoc = gl.getAttribLocation(program as WebGLProgram, 'a_uv');

		const arrUv = [
			0.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
		];
		const bufUV = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufUV);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrUv), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(uvAttrLoc);
		gl.vertexAttribPointer(uvAttrLoc, 2, gl.FLOAT, false, 0, 0);	//UV only has two floats per component

		const arrIndex = [0, 1, 2, 2, 3, 0];
		const bufIndex = gl.createBuffer();
		// const indexCount = arrIndex.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIndex);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrIndex), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		gl.viewport(0, 0, width, height);

		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);

		const resolution = gl.getUniformLocation(program as WebGLProgram, 'u_resolution');
		gl.uniform2f(resolution, width, height);

		this.loadImages([imgSrc, imgDis], this.initTextures);
	}

	initTextures(
		images: any[]
	) {
		const {
			program,
			gl,
		} = this;

		const imgLocation = gl.getUniformLocation(
			program as WebGLProgram,
			'u_texture'
		);
		const displacementLocation = gl.getUniformLocation(
			program as WebGLProgram,
			'u_displacement'
		);

		gl.uniform1i(imgLocation, 0);  // texture unit 0
		gl.uniform1i(displacementLocation, 1);  // texture unit 1

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, images[0]);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, images[1]);
	}

	loadImages(
		srcs: string[],
		callback: Function
	) {
		const {
			loadImage,
		} = this;
		let counter = 0;
		const images: any[] = [srcs[0], srcs[1]];

		for (let i = 0; i < srcs.length; i++) {
			loadImage(
				srcs[i],
				i === 0 ? this.gl.CLAMP_TO_EDGE : this.gl.REPEAT,
				hasLoaded
			);
		}

		function hasLoaded(img: WebGLTexture, src: string) {
			images[images.indexOf(src)] = img;
			counter++;
			if(counter === srcs.length) callback(images);
		}
	}

	loadImage(
		src: string,
		wrap: number,
		callback: Function,
	) {
		const {
			gl,
		} = this;

		const img = new Image();
		img.onload = () => {
			const texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);

			// Set the parameters so we can render any size image.
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

			// Upload the image into the texture.
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			callback(texture, src);
		}
		img.src = src;
	}

	render(
		timestamp: number
	) {
		const {
			gl,
			program,
			render,
		} = this;

		if (!this.start) this.start = timestamp;
		const progress = timestamp - this.start;

		const delta = gl.getUniformLocation(program as WebGLProgram, 'u_delta');
		gl.uniform1f(delta, progress / 1000);

		const hovering = gl.getUniformLocation(program as WebGLProgram, 'u_hover');
		gl.uniform1f(hovering, this.isHovering ? 1.0 : 0.0);

		const force = gl.getUniformLocation(program as WebGLProgram, 'u_force');
		gl.uniform1f(force, this.isHovering ? 0.3 : 0.1);

		//gl.drawArrays(gl.TRIANGLES, 0, 6);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		window.requestAnimationFrame(render);
	}

	createProgram(
		gl: WebGLRenderingContext,
		vertexShader: WebGLShader,
		fragmentShader: WebGLShader
	): WebGLProgram | null {
		const program = gl.createProgram() as WebGLProgram;
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		const success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (success) {
			return program;
		}

		console.log(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}

	createShader(
		gl: WebGLRenderingContext,
		type: number,
		source: string,
	): WebGLShader | null {
		const shader = gl.createShader(type) as WebGLShader;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) {
			return shader;
		}

		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
}