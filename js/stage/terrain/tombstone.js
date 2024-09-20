function Tombstone(game, x, y) {
	Terrain.call(this, game, x, y);
	this.width = 50;
	this.height = 38;
	this.sheet = ASSET_MANAGER.getAsset("img/sheetTombstone.png");
	var which = getRandomNumber(0, 1);
	if (which === 0) this.animation = new Animation(this.sheet, 0, 20, 56, 58, 0.2, 1, true, false);
	else if (which === 1) this.animation = new Animation(this.sheet, 56, 20, 49, 58, 0.2, 1, true, false);
	
	this.addBoundRects(this.x, this.y, this.width, this.height);
}
Tombstone.prototype = new Terrain();
Tombstone.prototype.constructor = Tombstone;