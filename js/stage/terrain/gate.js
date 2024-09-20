function Gate(game, x, y) {
	Terrain.call(this, game, x, y);
	this.width = 61;
	this.height = 64;
	this.sheet = ASSET_MANAGER.getAsset("img/gate.png");
	
	this.gateClosed = new Animation(this.sheet, 0, 0, 61, 64, 0.2, 1, true, false);
	this.gateOpening1 = new Animation(this.sheet, 0, 63, 61, 64, 0.2, 1, true, false);
	this.gateOpening2 = new Animation(this.sheet, 0, 127, 61, 64, 0.2, 1, true, false);
	this.gateOpening3 = new Animation(this.sheet, 0, 191, 61, 64, 0.2, 1, true, false);
	this.gateOpen = new Animation(this.sheet, 0, 254, 61, 64, 0.2, 1, true, false);

	this.closed = true;
	this.whichGate = 1;
	
	game.map.boundRects.push({
		x: this.x + this.width / 2,
		y: this.y + this.height / 2,
		rotation: 0,
		width: this.width,
		height: this.height,
		top: true,
		gate: true,
	});
}

Gate.prototype = new Terrain();
Gate.prototype.constructor = Gate;

Gate.prototype.update = function () {
	if (this.collide(this.game.hero)) {
		if (this.game.hero.keys.length == 0)
			this.whichGate = 1;
		else if (this.game.hero.keys.length == 1)
			this.whichGate = 2;
		else if (this.game.hero.keys.length == 2)
			this.whichGate = 3;
		else if (this.game.hero.keys.length == 3)
			this.whichGate = 4;
		else if (this.game.hero.keys.length == 4) {
			this.whichGate = 5;
			if (this.closed)
				this.game.map.boundRects = this.game.map.boundRects.filter(function(d) { return !d.gate; });
			this.closed = false;
		}
	}

	Terrain.prototype.update.call(this);
};

Gate.prototype.draw = function (ctx) {
	////use scaleby in drawFrame
	if (this.whichGate == 1)
		this.gateClosed.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	else if (this.whichGate == 2)
		this.gateOpening1.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	else if (this.whichGate == 3)
		this.gateOpening2.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	else if (this.whichGate == 4)
		this.gateOpening3.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	else if (this.whichGate == 5)
		this.gateOpen.drawFrame(this.game.clockTick, ctx, this.x, this.y);
};