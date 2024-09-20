function FalseFloorTomb(game, x, y) {
	FalseFloor.call(this, game, x, y);
	this.sheet = ASSET_MANAGER.getAsset("img/sheetPit.png");
    this.animation = new Animation(this.sheet, 289, 0, 95, 96, 0.2, 1, true, false);
}
FalseFloorTomb.prototype = new FalseFloor();
FalseFloorTomb.prototype.constructor = FalseFloorTomb;