function FlatTerrain(game, x, y) {
	Terrain.call(this, game, x, y);
	this.width = 83 / 2;
	this.height = 86 / 2;
}

FlatTerrain.prototype = new Terrain();
FlatTerrain.prototype.constructor = FlatTerrain;

FlatTerrain.prototype.collide = function (other) {
	var x = this.x + this.width * 7 / 16;
	var y = this.y + this.width * 7 / 16;
	var width = this.width / 4;
	var height = this.height / 4;
	var otherX = other.x + other.width / 2 - width / 2;
	var otherY = other.y + other.height - height / 2;
	
	return (x < otherX + width &&
	x + width > otherX &&
	y < otherY + height &&
	height + y > otherY);
}