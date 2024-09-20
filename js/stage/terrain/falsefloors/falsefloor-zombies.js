function FalseFloorZombie(game, x, y) {
	FalseFloor.call(this, game, x, y);
	this.sheet = ASSET_MANAGER.getAsset("img/sheetPit.png");
    this.animation = new Animation(this.sheet, 386, 0, 93, 95, 0.2, 1, true, false);
}

FalseFloorZombie.prototype = new FalseFloor();
FalseFloorZombie.prototype.constructor = FalseFloorZombie;

FalseFloorZombie.prototype.update = function() {
	if (this.collide(this.game.hero)) {
		this.removeFromWorld = true;
		this.game.entities.push(new Pit(this.game, this.x, this.y));
	}
}