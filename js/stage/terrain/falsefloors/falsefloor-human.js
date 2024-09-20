function FalseFloorHuman(game, x, y) {
	FalseFloor.call(this, game, x, y);
	this.sheet = ASSET_MANAGER.getAsset("img/sheetPit.png");
    this.animation = new Animation(this.sheet, 98, 0, 95, 95, 0.2, 1, true, false);
}

FalseFloorHuman.prototype = new FalseFloor();
FalseFloorHuman.prototype.constructor = FalseFloorHuman;