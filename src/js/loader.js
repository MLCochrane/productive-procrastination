/*
*  Class for animating SVG 
*/

export default class Loader {
    /**
	 * @param {string} id - HTML ID of SVG to animate
	 * @param {number} index - Index of SvG child path to animate
	 * @param {number} value - How many pixels to increase by
     * @param {number} time - Time in ms for how long the animation should play
	 */
    constructor(id, index, value, time) {
        this.index = index;
        this.selection = document.getElementById(id);
        this.pathVal = this.selection.children[index].attributes.d.value;
        this.splitPath = this.pathVal.split(/(?=[a-zA-Z])/);
        this.incrementVal = value / time;
        this.toAnimateVals = [];
        this.toMoveChars = [];
        this.time = time;
        this.start = null;
        
        this.init = this.init.bind(this);
        this.buildNewPath = this.buildNewPath.bind(this);
        this.moveNextChars = this.moveNextChars.bind(this);
        this.animate = this.animate.bind(this);

        this.init();
        window.requestAnimationFrame(this.animate);

    }

    init() {
        this.moveNextChars();
        this.splitPath.forEach((el, index) => {
            if (el.indexOf('h') !== -1) {
                let val = Number(el.split('h')[1]);
                this.toAnimateVals.push({index: index, val: val});
            }
        });
    }

    animate(timestamp) {
        if (!this.start) this.start = timestamp;
        const progress = timestamp - this.start;
        this.selection.children[this.index].attributes.d.value = this.buildNewPath();
        if (progress < this.time) {
            window.requestAnimationFrame(this.animate);
        }
    }

    buildNewPath() {
        this.toAnimateVals.forEach(el => {
            el.val = (el.val > 1) 
                ? el.val += this.incrementVal
                : el.val -= this.incrementVal;
            this.splitPath[el.index] = `h${el.val}`;
        });
        return this.splitPath.join('');
    }

    moveNextChars() {
        const childCount = this.selection.children.length;
        for (let i = this.index + 1; i < childCount; i++) {
            console.log(this.selection.children[i]);
        }
    }
}