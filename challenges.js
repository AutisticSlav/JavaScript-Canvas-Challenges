let challenges = [];

// create a challenge
function createChallenge(name, description, callback) {
	challenges.push({
		name: name,
		safeName: name.replace(new RegExp(" ", "g"), "-").toLocaleLowerCase(),
		description: description,
		callback: callback
	});
}

// --------------------------
// Circular Motion
// --------------------------
createChallenge("Circular Motion", "Particles that move in a circle around a point.", function (vars, utilities) {
	let particles = [];

	function createParticle(color, speed, radius, size) {
		particles.push({
			radius: radius,
			angle: utilities.getRandomNumber(1, 360),
			color: color,
			speed: speed,
			size: size
		});
	}

	function clearRect() {
		let pixels = vars.ctx.getImageData(0, 0, vars.width, vars.height);
		for (let i = 3; i < pixels.data.length; i += 4) {
			pixels.data[i] = Math.floor(pixels.data[i] * 0.9);
		}
		vars.ctx.putImageData(pixels, 0, 0);
	}

	function getRandomColor() {
		return utilities.getRandomFromArray(["#8f2424", "#a32929", "#b82e2e", "#cc3333", "#d14747", "#d65c5c", "#db7070"]);
	}

	let start = function () {
		for (let i = 0; i < 10; i++) {
			createParticle(getRandomColor(), utilities.getRandomNumber(3, 6), utilities.getRandomNumber(15, 30), utilities.getRandomNumber(3, 6));
		}
	};

	let update = function () {
		clearRect();
		for (let i = 0; i < particles.length; i++) {
			let p = particles[i];
			let coords = utilities.getPointAtCircle(utilities.getCenterPoint(), p.angle, p.radius);

			vars.ctx.beginPath();
			vars.ctx.arc(coords.x, coords.y, p.size / 2, 0, 2 * Math.PI, false);
			vars.ctx.fillStyle = p.color;
			vars.ctx.fill();
			vars.ctx.closePath();

			p.angle += p.speed;
		}
	};

	return {
		start: start,
		update: update
	};
});

// --------------------------
// Matrix
// --------------------------
createChallenge("Matrix Rain", "A wierd green rain...", function (vars, utilities) {

	let i,
		columns,
		rows,
		font = 20,
		drops = [];

	function randomChar() {
		let chars = "abcdefghijklmnopqrstuvwxyz0123456789";
		return utilities.getRandomFromArray(chars.split(""));
	}

	function darkerWindow(a) {
		vars.ctx.fillStyle = "rgba(0, 0, 0, " + a + ")";
		vars.ctx.fillRect(0, 0, vars.width, vars.height);
	}

	let start = function () {

		// set size
		columns = Math.floor(vars.width / font) + 1;
		rows = Math.floor(vars.height / font) + 1;
		vars.ctx.font = font + "px matrix";
		i = 0;
		intro();
	};

	function intro() {
		if (i < rows) {

			// normal intro
			darkerWindow(0.05);
			vars.ctx.fillStyle = "#0F0";
			for (let j = 0; j < columns; j++) {
				vars.ctx.fillText(randomChar(), j * font, i * font);
			}
		}
		if (i < rows + 10) {

			// fade out
			darkerWindow(0.1);
		} else {

			// start update
			i = true;
			return;
		}

		i++;
		setTimeout(intro, 33);
	}

	let update = function () {

		// update size
		columns = Math.floor(vars.width / font) + 1;
		rows = Math.floor(vars.height / font) + 1;

		if (i === true) {

			// add drops (randomly)
			if (utilities.getRandomBoolean()) {
				drops.push({
					column: utilities.getRandomNumber(0, columns - 1),
					row: 0
				});
			}

			darkerWindow(0.1);

			// update drops
			let newDrops = [];
			vars.ctx.fillStyle = "#0F0";
			vars.ctx.font = font + "px matrix";
			for (let j = 0; j < drops.length; j++) {
				vars.ctx.fillText(randomChar(), drops[j].column * font, drops[j].row * font);
				drops[j].row++;
				if (drops[j].row < rows) {
					newDrops.push(drops[j]);
				}
			}
		}
	};

	return {
		start: start,
		update: update
	};
});

// --------------------------
// Snake
// --------------------------
createChallenge("Snake", "A snake eating some pixels.", function (vars, utilities) {

	let margin = {
			top: 0,
			left: 0
		},
		grid = {
			size: 33,
			columns: 0,
			rows: 0
		},
		food,
		snake = {
			points: [],
			length: 3,
			dead: false,
			direction: 2 // left: 0, up: 1, right: 2, down: 3
		};
	vars.ctx.font = "30px 'Titan One', cursive";
	vars.ctx.textAlign = "center";

	// start function
	let start = function () {

		// background image
		vars.canvas.style.backgroundImage = "url(../images/snake.jpg)";
		vars.canvas.style.backgroundPosition = "center";
		vars.canvas.style.backgroundSize = "cover";

		// size
		grid.columns = Math.floor(vars.width / grid.size) - 1;
		grid.rows = Math.floor(vars.height / grid.size - 1);
		margin.left = Math.floor((vars.width - grid.columns * grid.size) / 2);
		margin.top = Math.floor((vars.height - grid.rows * grid.size) / 2);

		// create the first points
		for (let i = 0; i < snake.length; i++) {
			snake.points.push({
				x: snake.length - 1 - i,
				y: 0
			});
		}

		// the keypress listener
		document.onkeydown = function (e) {

			// update direction
			if (!snake.dead) {
				switch (e.key) {
					case "ArrowLeft":
						if (snake.direction !== 2) snake.direction = 0;
						break;
					case "ArrowUp":
						if (snake.direction !== 3) snake.direction = 1;
						break;
					case "ArrowRight":
						if (snake.direction !== 0) snake.direction = 2;
						break;
					case "ArrowDown":
						if (snake.direction !== 1) snake.direction = 3;
						break;
					default:
						break;
				}
			}
		};
	};

	// update function
	let next = 2;
	let update = function () {

		if (!snake.dead) {

			// check if snake collides
			if (getThingAt(getNextCoords(snake.points[0])) === "out" || getThingAt(getNextCoords(snake.points[0])) === "snake") {
				snake.dead = true;
			} else if (getThingAt(getNextCoords(snake.points[0])) === "food") {
				snake.length++;
				food = undefined;
			}

			// render
			render();

			// update snake
			if (next === 0) {
				for (let i = snake.length - 1; i >= 0; i--) {
					if (i > 0) {
						if (typeof snake.points[i] === 'undefined') {
							snake.points[i] = {
								x: snake.points[i - 1].x,
								y: snake.points[i - 1].y
							};
						} else {
							snake.points[i].x = snake.points[i - 1].x;
							snake.points[i].y = snake.points[i - 1].y;
						}
					} else {

						// the first point
						switch (snake.direction) {
							case 0:
								snake.points[i].x--;
								break;
							case 1:
								snake.points[i].y--;
								break;
							case 2:
								snake.points[i].x++;
								break;
							case 3:
								snake.points[i].y++;
								break;
						}
					}
				}
				next = 3;
			} else {
				next--;
			}

			// create food
			if (typeof food === 'undefined') {
				let c = {
					x: Math.floor(Math.random() * grid.columns),
					y: Math.floor(Math.random() * grid.rows)
				};
				if (getThingAt(c) === "air") {
					food = c;
				}
			}
		}
	};

	// render
	function render() {

		// background
		background();

		// draw snake
		vars.ctx.fillStyle = "white";
		for (let i = 0; i < snake.points.length; i++) {
			let size = grid.size;
			let x = margin.left + (snake.points[i].x * size);
			let y = margin.top + (snake.points[i].y * size);

			// draw points
			if (i < snake.points.length - 1) {
				if (snake.points[i].x === snake.points[i + 1].x) {
					if (snake.points[i].y > snake.points[i + 1].y) {

						// snake goes down
						vars.ctx.fillRect(x + 1, y - 1, size - 2, size);
					} else {

						// snake goes up
						vars.ctx.fillRect(x + 1, y + 1, size - 2, size);
					}
				} else if (snake.points[i].y === snake.points[i + 1].y) {
					if (snake.points[i].x > snake.points[i + 1].x) {

						// snake goes right
						vars.ctx.fillRect(x - 1, y + 1, size, size - 2);
					} else {

						// snake goes left
						vars.ctx.fillRect(x + 1, y + 1, size, size - 2);
					}
				}
			} else {

				// last point
				vars.ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
			}
		}

		// draw food
		if (typeof food !== 'undefined') {
			vars.ctx.fillStyle = "red";
			vars.ctx.fillRect(margin.left + food.x * grid.size + 1, margin.top + food.y * grid.size + 1, grid.size - 2, grid.size - 2);
		}

		if (snake.dead) {
			overlay("YOU DIED!", "red");
		}
	}

	// background
	function background() {

		// clear
		vars.ctx.clearRect(0, 0, vars.width, vars.height);

		// game
		vars.ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
		vars.ctx.fillRect(margin.left - 1, margin.top - 1, grid.columns * grid.size + 1, grid.rows * grid.size + 1);
	}

	// make a text overlay
	function overlay(text, color) {
		vars.ctx.fillStyle = "rgba(10, 10, 10, 0.75)";
		vars.ctx.fillRect(0, 0, vars.width, vars.height);
		vars.ctx.fillStyle = color;
		let p = utilities.getCenterPoint();
		vars.ctx.fillText(text, p.x, p.x / 2);
	}

	// get the next tile in the direction of the snake
	function getNextCoords(coords) {
		let c = {
			x: coords.x,
			y: coords.y
		};
		switch (snake.direction) {
			case 0:
				c.x--;
				break;
			case 1:
				c.y--;
				break;
			case 2:
				c.x++;
				break;
			case 3:
				c.y++;
				break;
		}
		return c;
	}

	// get the thing at some coords
	function getThingAt(coords) {

		// check if it is in the game area
		if (coords.x > grid.columns - 1 || coords.x < 0 || coords.y > grid.rows - 1 || coords.y < 0) {
			return "out";
		} else {

			// check if it is a point of the snake
			for (let i = 0; i < snake.points.length; i++) {
				if (snake.points[i].x === coords.x && snake.points[i].y === coords.y) {
					return "snake";
				}
			}

			// check if it's food
			if (typeof food !== 'undefined') {
				if (food.x === coords.x && food.y === coords.y) {
					return "food";
				}
			}

			// else it will be nothing
			return "air";
		}
	}

	return {
		start: start,
		update: update
	};
});

// --------------------------
// Color Switch
// --------------------------
createChallenge("Color Switch", "Don't hit the wrong colors.", function (vars, utilities) {

	function Object(height, render) {
		this.height = height;
		this.render = render;
	}

	let colors = {
			pink: "#ff0080",
			purple: "#8c14fc",
			blue: "#35e2f2",
			yellow: "#f6df0e"
		},
		ball = {
			color: colors.pink,
			size: 13,
			height: vars.height / 4,
			velocity: 0
		},
		objects = [
			new Object(vars.height / 2, function () {
				vars.ctx.strokeStyle = colors.blue;
				vars.ctx.lineWidth = 10;
				vars.ctx.beginPath();
				vars.ctx.arc(utilities.getCenterPoint().x, toReal(this.height), 50, 0, 2 * Math.PI);
				vars.ctx.stroke();
			}),
			new Object(vars.height / 4 * 3, function () {
				vars.ctx.strokeStyle = colors.purple;
				vars.ctx.lineWidth = 10;
				vars.ctx.beginPath();
				vars.ctx.arc(utilities.getCenterPoint().x, toReal(this.height), 50, 0, 2 * Math.PI);
				vars.ctx.stroke();
			})
		],
		running = false;

	// start function
	let start = function () {

		// tap
		document.onkeydown = function (e) {
			if (e.code === "Space") {
				ball.velocity = 10;
				running = true;
			}
		};
		vars.canvas.addEventListener('click', function () {
			ball.velocity = 10;
			running = true;
		}, false);
	};

	// update function
	let update = function () {

		// draw
		render();

		if (running) {

			// change the velocity
			ball.velocity = Math.round(ball.velocity * 100 - 75) / 100;

			// update the ball position
			if (ball.height <= 0) {
				running = false;
			} else if (ball.height >= vars.height / 5 * 3 && ball.velocity >= 0) {
				objects.forEach(function (v) {
					v.height -= ball.velocity;
				});
			} else {
				ball.height += ball.velocity;
			}
		}
	};

	// rener
	function render() {
		vars.ctx.clearRect(0, 0, vars.width, vars.height);
		vars.ctx.fillStyle = ball.color;
		vars.ctx.beginPath();
		vars.ctx.arc(utilities.getCenterPoint().x, toReal(ball.height), ball.size, 0, 2 * Math.PI);
		vars.ctx.fill();

		objects.forEach(function (v, i) {
			v.render();
		});
	}

	function toReal(h) {
		return vars.height - h;
	}

	return {
		start: start,
		update: update
	};
});

// --------------------------
// Kepplinator
// --------------------------
createChallenge("Kepplinator", "Hobbyless planets in their spare time.", function (vars, utilities) {

	// some vars
	const G = 6.74 * Math.pow(10, -11);
	const scale = 1000000; // every pixel is 1000 km
	let speed = 1;
	let planets = [];

	function clearRect() {
		let pixels = vars.ctx.getImageData(0, 0, vars.width, vars.height);
		for (let i = 3; i < pixels.data.length; i += 4) {
			pixels.data[i] = Math.floor(pixels.data[i] * 0.9);
		}
		vars.ctx.putImageData(pixels, 0, 0);
	}

	// planet constructor
	function Planet(name, color, mass, density, position, velocity) {

		// some variables
		this.name = name;
		this.color = color;
		this.mass = mass; // kg
		this.diameter = utilities.getSphereDiameter(mass, density); // m (density: g/cm3)
		this.position = position; // pixels (depends on scale)
		this.velocity = velocity; // pixels/s (depends on scale)

		// the following two functions in one function
		this.attract = function (planet) {
			let attraction = this.getAttraction(planet);
			this.applyForce(attraction.force, attraction.direction);
		};

		// get the force in newtons and the direction accorind to Newton's law of universal gravitation
		this.getAttraction = function (planet) {
			let distance = utilities.getDistance(this.position, planet.position);
			return {
				force: G * ((this.mass * planet.mass) / Math.pow(distance.d * scale, 2)),
				direction: utilities.getDirection(distance)
			}
		};

		// apply some force so the velocity will change
		this.applyForce = function (force, direction) {
			this.velocity.x += force / this.mass * direction.x;
			this.velocity.y += force / this.mass * direction.y;
		};

		// draw the planet
		this.draw = function () {
			vars.ctx.fillStyle = this.color;
			vars.ctx.beginPath();
			vars.ctx.arc(this.position.x, this.position.y, this.diameter / scale, 0, 2 * Math.PI);
			vars.ctx.fill();
		};
	}

	// start function
	let start = function () {

		let p = utilities.getCenterPoint();
		//earth(p);
		//moonArmies(p);
		//random(p);
		doubleStarSystem(p);
	};

	function earth(p) {

		// earth and moon
		planets.push(new Planet("Earth", "#69D1FF", 5.974 * Math.pow(10, 24), 5.515, {x: p.x, y: p.y}, {x: 0, y: 0}));
		planets.push(new Planet("Moon", "#5c5c5c", 7.349 * Math.pow(10, 22), 3.341, {x: p.x + 384.4, y: p.y}, {
			x: 0,
			y: 7.8
		}));
	}

	function moonArmies(p) {

		// moon army 1
		planets.push(new Planet("Moon", "#5c5c5c", 7.349 * Math.pow(10, 22), 3.341, {x: p.x + 38.44, y: p.y}, {
			x: 0,
			y: -25
		}));
		planets.push(new Planet("Moon", "#5c5c5c", 7.349 * Math.pow(10, 22), 3.341, {x: p.x - 38.44, y: p.y}, {
			x: 0,
			y: 25
		}));
		planets.push(new Planet("Moon", "#5c5c5c", 7.349 * Math.pow(10, 22), 3.341, {x: p.x, y: p.y - 38.44}, {
			x: -25,
			y: 0
		}));
		planets.push(new Planet("Moon", "#5c5c5c", 7.349 * Math.pow(10, 22), 3.341, {x: p.x, y: p.y + 38.44}, {
			x: 25,
			y: 0
		}));

		// moon army 2
		planets.push(new Planet("Moon", "#5c5c5c", 7.349 * Math.pow(10, 22), 3.341, {x: p.x + 68.44, y: p.y}, {
			x: 0,
			y: 21
		}));
		planets.push(new Planet("Moon", "#5c5c5c", 7.349 * Math.pow(10, 22), 3.341, {x: p.x - 68.44, y: p.y}, {
			x: 0,
			y: -15
		}));
		planets.push(new Planet("Moon", "#5c5c5c", 7.349 * Math.pow(10, 22), 3.341, {x: p.x, y: p.y - 68.44}, {
			x: 8,
			y: 0
		}));
		planets.push(new Planet("Moon", "#5c5c5c", 7.349 * Math.pow(10, 22), 3.341, {x: p.x, y: p.y + 68.44}, {
			x: -25,
			y: 0
		}));
	}

	function random(p) {

		// sun
		planets.push(new Planet("Sun", "#f7ff59", 9 * Math.pow(10, 25), 1, {x: p.x, y: p.y}, {x: 0, y: 0}));

		// some random planets
		for (let i = 0; i < utilities.getRandomNumber(5, 13); i++) {
			planets.push(new Planet(
				"Planet #" + i,
				"#cc3333",
				utilities.getRandomNumber(1, 5) * Math.pow(10, 24),
				utilities.getRandomNumber(4, 5),
				{
					x: utilities.getRandomNumber(100, vars.width - 100),
					y: utilities.getRandomNumber(100, vars.height - 100)
				},
				{
					x: utilities.getRandomNumber(-50, 50),
					y: utilities.getRandomNumber(-50, 50)
				}
			));
		}
	}

	//	double star system
	function doubleStarSystem(p) {

		planets.push(new Planet("Demian", "#4ab75a", 5.974 * Math.pow(10, 24), 5.515, {x: p.x - 40, y: p.y}, {
			x: 0,
			y: 10
		}));
		planets.push(new Planet("Beatrice", "#dad84c", 5.974 * Math.pow(10, 24), 5.515, {x: p.x + 40, y: p.y}, {
			x: 0,
			y: -10
		}));
	}

	// update function
	let update = function () {

		// render
		render();

		// attract all planets
		planets.forEach(function (p1) {
			planets.forEach(function (p2) {
				if (p1 !== p2) p1.attract(p2);
			});
		});

		// move all planets
		planets.forEach(function (p) {
			p.position.x += p.velocity.x / 60;
			p.position.y += p.velocity.y / 60;
		});
	};

	// render the planets
	function render() {
		clearRect();
		planets.forEach(function (p) {
			p.draw();
		});
	}

	return {
		start: start,
		update: update,
		fps: 60
	};
});

// export module
module.exports = challenges;