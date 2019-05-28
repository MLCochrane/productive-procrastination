/*
*  Class for animating SVG 
*/

export default class Loader {
    /**
	 * @param {string} id    - HTML ID of SVG to animate
	 * @param {number} index - Index of SvG child path to animate
	 * @param {number} value - How many pixels to increase by
	 * @param {number} rows  - Number of rows to repeat
     * @param {number} time  - Time in ms for how long the animation should play
	 */
    constructor(id, index, rows, value, time) {
        this.index = index;
        this.rows = rows || 1;
        this.selection = document.getElementById(id);
        this.childCount = this.selection.children.length;
        this.pathVal = this.selection.children[index].attributes.d.value;
        this.splitPath = this.pathVal.split(/(?=[a-zA-Z])/);
        this.originalOffset = 0;
        this.incrementVal = value / time;
        this.toAnimateVals = [];
        this.toMoveChars = [];
        this.time = time;
        this.start = null;
        
        this.init = this.init.bind(this);
        this.setDimensions = this.setDimensions.bind(this);

        this.pullStartVals = this.pullStartVals.bind(this);
        // this.startValCb = this.startValCb.bind(this);
        this.buildNewPath = this.buildNewPath.bind(this);
        this.setMainChar = this.setMainChar.bind(this);
        this.setNextChars = this.setNextChars.bind(this);
        this.buildNextPaths = this.buildNextPaths.bind(this);
        this.animate = this.animate.bind(this);

        this.init();
        // window.requestAnimationFrame(this.animate);

    }

    init() {
        this.setMainChar();
        this.setNextChars();
        this.setDimensions();
        this.buildNextPaths();
    }

    setDimensions() {
        this.selection.setAttribute('style', `height: ${100 / (this.rows + 1)}vh; width: 100%`);
        if (this.rows > 1) {
            this.createRows(this.rows, this.index, this.selection);
        }
    }

    createRows(rows, index, selection) {
        /*
        * Need to subtract the furthest position value
        * from the duplicated row paths
        */
        for(let i = 0; i < rows; i++) {
            const copy = selection.cloneNode(true);
            const toCopy = Array.from(copy.children).slice(index);
            let row = selection.cloneNode(false);

            
            row.setAttribute('id', `row${i}`);
            
            // function rowStartCb(index, xVal, yVal) {
            // }


            // toCopy.forEach(el => {
            //     let curIndex, xVal, yVal;
            //     // this.pullStartVals(el, rowStartCb);
            //     // copy original path over
            //     const newPath = el.attributes.d.value.split(/(?=[a-zA-z])/);
            //     el.toChange.forEach(el => {
            //         el.xVal += this.incrementVal;
            //         newPath[el.index] = `M${el.xVal}, ${el.yVal}`;
            //     });
            //     this.selection.children[el.index].attributes.d.value = newPath.join('');
            //     let newPath = el.attributes.d.value.split(/(?=[a-zA-z])/);
            //     row.appendChild(el);
            // });
            document.getElementsByClassName('page-main')[0].appendChild(row);
        }
    }

    animate(timestamp) {
        if (!this.start) this.start = timestamp;
        const progress = timestamp - this.start;
        this.buildNewPath();
        this.buildNextPaths();
        if (progress < this.time) {
            window.requestAnimationFrame(this.animate);
        }
    }

    setMainChar() {
        this.splitPath.forEach((el, index) => {
            if (el.indexOf('h') !== -1) {
                let val = Number(el.split('h')[1]);
                this.toAnimateVals.push({ index: index, val: val });
            }
        });
    }

    buildNewPath() {
        this.toAnimateVals.forEach(el => {
            el.val = (el.val > 1) 
                ? el.val += this.incrementVal
                : el.val -= this.incrementVal;
            this.splitPath[el.index] = `h${el.val}`;
        });
        this.selection.children[this.index].attributes.d.value = this.splitPath.join('');
    }

    setNextChars() {
        let offsetTest = 0;
        for (let i = this.index + 1; i < this.childCount; i++) {
            // console.log(offsetTest);
            const moveObj = {};
            moveObj.toChange = [];

            function startValCb(index, xVal, yVal) {
                moveObj.toChange.push({ index: index, xVal: xVal, yVal: yVal });
                if (offsetTest < xVal) offsetTest = xVal;
            }

            this.pullStartVals(this.selection.children[i], startValCb);
            moveObj.index = i;
            moveObj.fullPath = this.selection.children[i].attributes.d.value.split(/(?=[a-zA-z])/);
            this.toMoveChars.push(moveObj);
            if (this.originalOffset < offsetTest) this.originalOffset = offsetTest;
        }
    }

    /**
     * Parse an SVG path and get original position values
     * @name pullStartVals
     * @method
     * @param {Path} path SVG path to parse
     * @param {Function} cb Callback executed with x, y values and index position in original path
     * @private
     */
    pullStartVals(path, cb) {
        const childPathVal = path.attributes.d.value;
        const childSplitPath = childPathVal.split(/(?=[a-zA-z])/);
        childSplitPath.forEach((el, index) => {
            if (el.indexOf('M') !== -1) {
                const pathStr = el.trim().split('M')[1];
                const split = pathStr.split(',');
                const xVal = Number(split[0]);
                const yVal = Number(split[1]);
                cb(index, xVal, yVal);
            }
        });
    }

    buildNextPaths() {
        this.toMoveChars.forEach(el => {
            // copy original path over
            const newPath = el.fullPath;
            el.toChange.forEach(el => {
                el.xVal += this.incrementVal;
                newPath[el.index] = `M${el.xVal}, ${el.yVal}`;
            });
            this.selection.children[el.index].attributes.d.value = newPath.join('');
        });
    }
}