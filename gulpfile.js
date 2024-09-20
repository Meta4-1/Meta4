var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    gp_plumber = require('gulp-plumber');

var scripts = [
	'js/engine/gameengine.js',
	'js/engine/assetmanager.js',
	'js/engine/animation.js',
	'js/engine/playerinfo.js',
    'js/engine/enemyInfo.js',
	'js/stage/map.js',
	'js/stage/minimap.js',
	'js/stage/camera.js',
	'js/stage/placeEnemies.js',
	'js/stage/placeTerrain.js',
	'js/players/player.js',
	'js/players/enemies/enemy.js',
	'js/players/enemies/bosses/boss.js',
	'js/players/hero.js',
	'js/players/enemies/bosses/dr-darkabolical.js',
	'js/players/enemies/bosses/armored-goblin.js',
	'js/players/enemies/bosses/black-knight.js',
	'js/players/enemies/basic/black-rat.js',
	'js/players/enemies/undead/blonde-zombie.js',
	'js/players/enemies/basic/brown-rat.js',
	'js/players/enemies/bosses/death.js',
	'js/players/enemies/basic/dog.js',
	'js/players/enemies/human/eyepatch.js',
	'js/players/enemies/goblin/helmet-goblin.js',
	'js/players/enemies/dark/hood.js',
	'js/players/enemies/tomb/mummy.js',
	'js/players/enemies/dark/scarf.js',
	'js/players/enemies/tomb/skeleton.js',
	'js/players/enemies/bosses/skeleton-king.js',
	'js/players/enemies/human/stitches.js',
	'js/players/enemies/undead/suburban-zombie.js',
	'js/players/enemies/undead/suit-zombie.js',
	'js/players/enemies/human/viking.js',
	'js/players/enemies/goblin/wizard-goblin.js',
	'js/items/item.js',
	'js/items/weapons/weapon.js',
	'js/items/weapons/swords/sword.js',
	'js/items/weapons/swords/sword1.js',
	'js/items/weapons/swords/sword2.js',
	'js/items/weapons/swords/sword3.js',
	'js/items/weapons/bows/bow.js',
	'js/items/weapons/bows/bow1.js',
	'js/items/weapons/bows/bow2.js',
	'js/items/weapons/bows/bow3.js',
	'js/items/weapons/bows/arrow.js',
    'js/items/weapons/enemyWeapons/blueOrb.js',
	'js/items/weapons/enemyWeapons/bone.js',
	'js/items/weapons/enemyWeapons/purpleOrb.js',
	'js/items/weapons/enemyWeapons/ninjaStar.js',
	'js/items/key.js',
	'js/stage/terrain/terrain.js',
	'js/stage/terrain/gate.js',
	'js/stage/terrain/tree.js',
	'js/stage/terrain/snowtree.js',
	'js/stage/terrain/tombstone.js',
	'js/stage/terrain/rock.js',
	'js/stage/terrain/flatterrain.js',
	'js/stage/terrain/pit.js',
	'js/stage/terrain/falsefloors/falsefloor.js',
	'js/stage/terrain/falsefloors/falsefloor-zombies.js',
	'js/stage/terrain/falsefloors/falsefloor-snow.js',
	'js/stage/terrain/falsefloors/falsefloor-tomb.js',
	'js/stage/terrain/falsefloors/falsefloor-human.js',
	'js/items/heart.js',
	'js/main.js',
];
	
gulp.task('concat-minify', function(){
    return gulp.src(scripts)
        .pipe(gp_plumber())
        .pipe(gp_concat('game.js'))
        .pipe(gulp.dest('js'))
        .pipe(gp_uglify())
        .pipe(gp_rename('game.min.js'))
        .pipe(gulp.dest('js'));
});

gulp.task('default', ['concat-minify'], function(){});