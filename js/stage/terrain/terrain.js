function Terrain(game, x, y) {
	Entity.call(this, game, x, y);
}
Terrain.prototype = new Entity();
Terrain.prototype.constructor = Terrain;

Terrain.prototype.draw = function (ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
	Entity.prototype.draw.call(this);
}

function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1.0)) + min;
}

Terrain.prototype.addBoundRects = function(x, y, width, height) {
	this.game.map.boundRects.push({
		x: x + width / 6,
		y: y + height / 6,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		bottom: true, right: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6 * 3,
		y: y + height / 6,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		bottom: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6 * 5,
		y: y + height / 6,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		bottom: true, left: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6,
		y: y + height / 6 * 3,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		right: true,
	});
	
	// this.game.map.boundRects.push({
		// x: x + width / 6 * 3,
		// y: y + height / 6 * 3,
		// rotation: 0,
		// width: width / 3,
		// height: height / 3,
		// right: true,
	// });
	
	this.game.map.boundRects.push({
		x: x + width / 6 * 5,
		y: y + height / 6 * 3,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		left: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6,
		y: y + height / 6 * 5,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		top: true, right: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6 * 3,
		y: y + height / 6 * 5,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		top: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6 * 5,
		y: y + height / 6 * 5,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		top: true, left: true,
	});
}