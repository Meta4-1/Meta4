function Camera(game, width, height) {
	Entity.call(this, game, game.hero.x || 0, game.hero.y || 0);
	this.width = width;
	this.height = height;
}


Camera.prototype = new Entity();
Camera.prototype.constructor = Camera;


Camera.prototype.update = function () {
	this.x = this.game.hero.x + this.game.hero.width / 2;
	this.y = this.game.hero.y + this.game.hero.height / 2;
};

Camera.prototype.getBounds = function () {
	return {
		x1: this.x - this.width / 2,
		x2: this.x + this.width / 2,
		y1: this.y - this.height / 2,
		y2: this.y + this.height / 2,
	};
}

Camera.prototype.onScreen = function (entity) {
	bounds = this.getBounds();
	return (entity.x + entity.width > bounds.x1 &&
			entity.x < bounds.x2 &&
			entity.y + entity.width > bounds.y1 &&
			entity.y < bounds.y2);
}