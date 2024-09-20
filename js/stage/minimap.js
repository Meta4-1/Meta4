function MiniMap(game) {
	Entity.call(this, game, 0, 0);
	this.sheet = ASSET_MANAGER.getAsset("img/META4map-mini.gif");
	
}

MiniMap.prototype = new Entity();
MiniMap.prototype.constructor = MiniMap;

MiniMap.prototype.draw = function (ctx) {
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	
	ctx.globalAlpha = 0.7;
	var padding = 5;
	
	//draw map
	ctx.drawImage(this.sheet, 0, 0, 200, 200, padding, padding, 100, 100);
	
	//draw hero dot
	ctx.fillStyle = "red";
	ctx.beginPath();
	var x = padding + (this.game.hero.x + this.game.hero.width / 2 - this.game.map.bounds.x1) / 5730 * 100;
	var y = padding + (this.game.hero.y + this.game.hero.height - this.game.map.bounds.y1) / 5730 * 100;
	ctx.arc(x, y, 3, 0, 2 * Math.PI);
	ctx.fill();
	
	
	//draw key locations
	ctx.fillStyle = "white";
	var bosses = game.enemies.filter(function(d) { return d instanceof Boss && !(d instanceof DrDarkabolical); });
	for (var i = 0; i < bosses.length; i++) {
		var boss = bosses[i];
		ctx.beginPath();
		var x = padding + (boss.x + boss.width / 2 - this.game.map.bounds.x1) / 5730 * 100;
		var y = padding + (boss.y + boss.height - this.game.map.bounds.y1) / 5730 * 100;
		ctx.arc(x, y, 2, 0, 2 * Math.PI);
		ctx.fill();		
	}
	
	ctx.restore();
}