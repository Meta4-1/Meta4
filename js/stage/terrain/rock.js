function Rock(game, x, y) {
	Terrain.call(this, game, x, y);
	this.width = 35;
	this.height = 35;
	this.sheet = ASSET_MANAGER.getAsset("img/sheetRock.png");
	this.animation = new Animation(this.sheet, 52, 8, 33, 36, 0.2, 1, true, false);
	
	this.addBoundRects(this.x, this.y, this.width, this.height);
}
Rock.prototype = new Terrain();
Rock.prototype.constructor = Rock;