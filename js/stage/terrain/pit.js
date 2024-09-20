function Pit(game, x, y) {
	FlatTerrain.call(this, game, x, y);
	this.sheet = ASSET_MANAGER.getAsset("img/sheetPit.png");
	this.animation = new Animation(this.sheet, 584, 0, 83, 86, 0.2, 1, true, false);
}

Pit.prototype = new FlatTerrain();
Pit.prototype.constructor = Pit;

Pit.prototype.draw = function(ctx){
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.5);
}