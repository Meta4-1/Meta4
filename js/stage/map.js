function Map(game) {
	Entity.call(this, game, 0, 0);
	this.sheet = ASSET_MANAGER.getAsset("img/META4map.gif");
	this.bounds = {x1: 335, y1: 335, x2: 6065, y2: 6065}
	this.boundRects = [
		{x: 2600, y: 2600, width: 490, height: 280, rotation: Math.PI / 4, bottom: true, right: true},
		{x: 2600, y: 3800, width: 490, height: 280, rotation: 3 * Math.PI / 4, top: true, right: true},
		{x: 3800, y: 3800, width: 490, height: 280, rotation: 5 * Math.PI / 4, top: true, left: true},
		{x: 3800, y: 2600, width: 490, height: 280, rotation: 7 * Math.PI / 4, bottom: true, left: true},
		{x: 3200, y: 2380, width: 1060, height: 100, rotation: 0, bottom: true},
		{x: 2380, y: 3200, width: 100, height: 1060, rotation: 0, right: true},
		{x: 4020, y: 3200, width: 100, height: 1060, rotation: 0, left: true},
		{x: 2925, y: 4025, width: 500, height: 100, rotation: 0, top: true},
		{x: 3475, y: 4025, width: 500, height: 100, rotation: 0, top: true},
		{x: 2800, y: 2800, width: 1090, height: 100, rotation: Math.PI / 4, top: true, left: true},
		{x: 3600, y: 2800, width: 1090, height: 100, rotation: 7 * Math.PI / 4, top: true, right: true},
		{x: 2760, y: 3560, width: 1090, height: 100, rotation: 3 * Math.PI / 4, bottom: true, left: true},
		{x: 3640, y: 3560, width: 1090, height: 100, rotation: 5 * Math.PI / 4, bottom: true, right: true},
		{x: 3150, y: 3990, width: 70, height: 165, rotation: 0, left: true},
		{x: 3250, y: 3990, width: 70, height: 165, rotation: 0, right: true},
		{x: 3180, y: 4075, width: 10, height: 5, rotation: 0, top: true, left: true},
		{x: 3220, y: 4075, width: 10, height: 5, rotation: 0, top: true, right: true},
	];

	this.debug = false;

	if (this.debug) {
		for (var i = 0; i < this.boundRects.length; i++) {
			this.boundRects[i].color =
				"rgb(" + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ")";
		}
	}
}


Map.prototype = new Entity();
Map.prototype.constructor = Map;


Map.prototype.draw = function (ctx) {
	ctx.drawImage(this.sheet,
		0, 0,
		6400, 6400,
		0, 0, 6400, 6400);

	if (this.debug) {
		for (var i = 0; i < this.boundRects.length; i++) {
			var rect = this.boundRects[i];
			ctx.save();
			ctx.translate(rect.x, rect.y);
			ctx.fillStyle = rect.color;
			ctx.rotate(-rect.rotation);
			ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
			ctx.restore();
		}
	}
}