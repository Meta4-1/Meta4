function FalseFloor(game, x, y) {
	FlatTerrain.call(this, game, x, y);
}

FalseFloor.prototype = new FlatTerrain();
FalseFloor.prototype.constructor = FalseFloor;

FalseFloor.prototype.draw = function(ctx){
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.5);
}