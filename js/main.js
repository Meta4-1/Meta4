// the "main" code begins here
window.onload = function () {
	ASSET_MANAGER = new AssetManager();
	ASSET_MANAGER.queueDownload("img/sheet2.png");
	ASSET_MANAGER.queueDownload("img/sheet3.png");
	ASSET_MANAGER.queueDownload("img/sheet4.png");
	ASSET_MANAGER.queueDownload("img/sheet5.png");
	ASSET_MANAGER.queueDownload("img/sheet6.png");
	ASSET_MANAGER.queueDownload("img/sheet7.png");
	ASSET_MANAGER.queueDownload("img/META4map.gif");
	ASSET_MANAGER.queueDownload("img/META4map-mini.gif");
	ASSET_MANAGER.queueDownload("img/weaponsheet2.png");
	ASSET_MANAGER.queueDownload("img/arrow.png");
	ASSET_MANAGER.queueDownload("img/bows.png");
	ASSET_MANAGER.queueDownload("img/keys.png");
	ASSET_MANAGER.queueDownload("img/gate.png");
	ASSET_MANAGER.queueDownload("img/heartspritesheet.png");
	ASSET_MANAGER.queueDownload("img/startscreen.png");
	ASSET_MANAGER.queueDownload("img/game-over-screen.png");
	ASSET_MANAGER.queueDownload("img/win-screen.png");
	ASSET_MANAGER.queueDownload("img/sheetTree.png");
	ASSET_MANAGER.queueDownload("img/sheetSnowTree.png");
	ASSET_MANAGER.queueDownload("img/sheetTombstone.png");
	ASSET_MANAGER.queueDownload("img/sheetRock.png");
	ASSET_MANAGER.queueDownload("img/sheetPit.png");
	ASSET_MANAGER.queueDownload("img/projectiles.png");
	ASSET_MANAGER.queueDownload("img/throwingBone.gif");
	ASSET_MANAGER.queueDownload("img/purpleOrb.png");
	ASSET_MANAGER.queueDownload("img/ninjaStars.png");

	ASSET_MANAGER.downloadAll(function() {
		newGame();
		var music = new Audio('audio/meta4-theme.wav');
		music.loop = true;
		music.play();
	});
}

function newGame() {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');

	game = new GameEngine();
	var enemies = [];
	var terrain = []; 
	game.map = new Map(game);
	game.hero = new Hero(game, 3180, 4100);
	game.camera = new Camera(game, canvas.width, canvas.height);
	game.playerInfo = new PlayerInfo(game);
	
	game.enemies = enemies;
	game.terrain = terrain;
	game.addEntity(game.camera);
	game.addEntity(game.hero);
	game.bossesKilled = 0;

	new PlaceEnemies(game, 30);
	new PlaceTerrain(game, 30);
	
	game.init(ctx);
	game.start();
}