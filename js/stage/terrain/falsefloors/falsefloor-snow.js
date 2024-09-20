function FalseFloorSnow(game, x, y) {
	FalseFloor.call(this, game, x, y);
	this.sheet = ASSET_MANAGER.getAsset("img/sheetPit.png");
    this.animation = new Animation(this.sheet, 97, 102, 100, 99, 0.2, 1, true, false);
}

FalseFloorSnow.prototype = new FalseFloor();
FalseFloorSnow.prototype.constructor = FalseFloorSnow;