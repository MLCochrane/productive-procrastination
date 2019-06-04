import $ from 'jquery';

export default class Player {
	constructor(url) {
		this.url = url;
		this.init();
	}

	init() {
		this.createMarkup();
		this.getScrollAmt();
		this.bindEvents();
	}

	createMarkup() {
		$('.content').append(`
		<div class="slider-container">
			<div class="video-wrapper">
				<div id="video-placeholder"></div>
			</div>
			<div class="hover-detective"></div>
			<button class="start">Watch Now</button>
			<button class="play">Play</button>
			<button class="pause">Pause</button>
			<svg class="loading" viewBox="0 0 50 50"><style type="text/css">.st0{fill:#FFFFFF;stroke:#FFFFFF;stroke-miterlimit:10;}</style><path class="st0" d="M37.1,8.1c0,2.5-1.3,4.7-3.3,5.9c-0.2,0.1-0.5,0.2-0.7,0.1c-1.3-0.3-2.7-0.4-4.1-0.4 c-10.1,0-18.4,7.5-18.4,16.9c0,8.5,6.8,15.5,15.6,16.7c0.1,0,0.1,0.2,0,0.2l-0.1,0C15.9,48,6.3,41.5,3.5,31.5 C-0.8,16.3,10.5,2.6,25,2.6c4.2,0,8.1,1.1,11.4,3.1c0.2,0.1,0.4,0.3,0.5,0.6C37,6.9,37.1,7.5,37.1,8.1z"/><path class="st0" d="M36.7,5.9c0.3,0.7,0.4,1.5,0.4,2.3c0,2.6-1.5,4.9-3.6,6.1"/></svg>
			<div class="close">X</div>
		</div>`)
	}

	getScrollAmt() {
		this.maxHeight = window.innerWidth / (16 / 9);
		if (window.innerWidth <= 755) {
			this.origHeight = 321;
		} else {
			this.origHeight = 525;
		}
	}

	bindEvents() {
		$('.start').on('click', e => {
			// Load video and hide button
			this.loadVideo();
			$(e.currentTarget).toggle();
			$('.hover-detective').css('display', 'inherit');
			$('.loading').toggle();
		});

		// Custom controls for video
		$('.play').on('click', () => {
			$('.hover-detective').css('display', 'inherit');
			this.player.playVideo();
		});
		$('.pause').on('click', () => {
			$('.hover-detective').css('display', 'none');
			this.player.pauseVideo();
		});

		$('.close').on('click', () => {
			this.transitionPlayer('close', this.origHeight);
			$('.hover-detective').css('display', 'none');
			this.player.destroy();
		});

		// // Mouse move event for displaying buttons
		// // let moving;
		// $('.slider-container').on('mousemove', () => {
		//   console.log('container')
		//   // clearTimeout(moving);
		//   // moving = setTimeout(() => {
		//   //   console.log('count');
		//   // }, 100);
		// });
		//
		let timeout;
		$('.hover-detective').on('mousemove', () => {
			$('.pause').css('display', 'inherit');
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				$('.pause').css('display', 'none');
			}, 400);
		});

		// Reset height variables on resize
		let resizeWindow;
		$(window).on('resize', () => {
			clearTimeout(resizeWindow);
			resizeWindow = setTimeout(() => {
				this.getScrollAmt();
			}, 100);
		});
	}

	loadVideo() {
		this.addScript().then(e => {
			const vidID = this.getId();
			setTimeout(() => {
				this.initYoutube(vidID);
			}, 1000);
		}).catch(e => {
			console.log(e);
		})
	}

	addScript() {
		return new Promise((resolve, reject) => {
			let tag = document.createElement('script');
			tag.type = 'text/javascript';
			tag.src = "https://www.youtube.com/iframe_api";
			$(tag).on('load', () => resolve(tag));
			$(tag).on('error', () => reject(tag));
			document.body.appendChild(tag);
		});
	}

	// Get ID from share link
	getId() {
		let id = (this.url).split('/');
		id = id[id.length - 1];
		return id;
	}

	// Init the youtube player with ID
	initYoutube(id) {
		this.player = new YT.Player('video-placeholder', {
			videoId: id,
			playerVars: {
				autoplay: 1,
				controls: 0,
			},
			events: {
				'onReady': this.onPlayerReady.bind(this),
				'onStateChange': this.onStateChange.bind(this),
			}
		});
	}

	onPlayerReady() {
		// When video player is ready, animate the player view
		this.transitionPlayer('open', this.maxHeight);
		$('.loading').toggle();
	}

	onStateChange(e) {
		if (e.data === 1) {
			// console.log('Playing');
			$('.play').css('display', 'none');
			$('.pause').css('display', 'none');
		} else if (e.data === 2) {
			// console.log('Paused');
			$('.play').css('display', 'inherit');
			$('.pause').css('display', 'none');
		} else if (e.data === 0) {
			// Close open view and destroy the player
			this.transitionPlayer('close', this.origHeight);
			$('button').toggle();
			this.player.destroy();
		}
	}

	// Animations for opening and closing the player
	transitionPlayer(status, height) {
		const el = $('.slider-container');
		$(el).animate({
			height: height,
		}, {
			duration: 500,
			complete: () => {
				if (status === 'open') {
					$(el).css('height', 'auto');
				} else {
					$(el).removeAttr('style');
				}
			}
		});
	}
}
