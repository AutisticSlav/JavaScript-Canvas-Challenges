function setup(callback) {

	// variables
	let vars = {
		canvas: document.getElementById("canvas"),
		ctx: this.canvas.getContext("2d"),
		width: window.innerWidth,
		height: window.innerHeight,
		mouse: {
			x: 0,
			y: 0
		},
	};

	// utilities
	let utilities = {
		getRandomNumber: function (min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		},
		getRandomFromArray: function (array) {
			return array[Math.floor(Math.random() * (array.length - 1))];
		},
		getPointAtCircle: function (coords, degrees, radius) {
			let radiants = degrees * Math.PI / 180;
			return {
				x: Math.cos(radiants) * radius + coords.x,
				y: Math.sin(radiants) * radius + coords.y
			};
		},
		getCenterPoint: function () {
			return {
				x: vars.width / 2,
				y: vars.height / 2
			};
		},
		getRandomBoolean: function () {
			return Math.floor(Math.random() * 2) === 1;
		},
		getDistance: function (p1, p2) {
			let xd = p2.x - p1.x;
			let yd = p2.y - p1.y;
			return {
				x: xd,
				y: yd,
				d: Math.sqrt(xd*xd + yd*yd)
			}
		},
		getDirection: function (distance) {
			return {
				x: distance.x / distance.d,
				y: distance.y / distance.d
			};
		},
		round: function (number, decimals) {
			decimals = Math.pow(10, decimals);
			return Math.round(number * decimals) / decimals;
		},
		getSphereDiameter: function (mass, density) { // mass: kg, density: g/cm3
			return Math.pow((mass / (density * 1000)) / (4 / 3 * Math.PI), 1 / 3) * 2; // in m
		}
	};

	vars.canvas.addEventListener('mousemove', function (e) {
		let r = vars.canvas.getBoundingClientRect();
		vars.mouse.x = e.clientX - r.left;
		vars.mouse.y = e.clientY - r.top;
	});

	window.addEventListener('resize', function () {
		vars.width = window.innerWidth;
		vars.height = window.innerHeight;
		vars.canvas.width = vars.width;
		vars.canvas.height = vars.height;
	}, false);

	// start callback
	vars.canvas.width = vars.width;
	vars.canvas.height = vars.height;
	let challenge = callback(vars, utilities);
	let ms = 33;
	if (typeof challenge.fps !== "undefined") ms = 1000 / challenge.fps;
	challenge.start();
	setInterval(challenge.update, ms);
}

function description() {
	document.getElementsByClassName("description")[0].classList.toggle("visible");
}