const canvas = document.getElementById("gamelmao");
canvas.width = 640;
canvas.height = 576;
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false; //I WANT NICE SPRITES :))))))

//the project version
const projectProp = {
    verMajor : 0,
    verMinor : 1,
    verPatch : 9,
    verDescrp : "I will buy a Switch with the money!"
}

//the webpage title
document.title = `Zelda Survival - ${projectProp.verMajor}.${projectProp.verMinor}.${projectProp.verPatch}`

//TODO: Add a Gameboy color on background behind the screen
//It makes the game looks more with the original Awakening

//TODO: Make layers for the tiles:
/*
    Layer render for them {
        1-Ground tiles (made!)
        2-Walls - Objects (made!)
        2-Ground Items - Also in the Layer 2
    }
    4-Dropped Items
    5-Entities (Enemies, Player, etc..) (made!)
*/

//types of tileset
let tileset = {
    dungeons : new Image(), //I think that I should make one imagefile for all the tilesets
	overworld : new Image(),
	overworld_obj : new Image()
};

let linkSpr = new Image();
let hudImg = new Image();
let itemSpr = new Image();

tileset["dungeons"].src = "assets/tileset/dungeons/dungeons_t.png";
tileset["overworld"].src = "assets/tileset/overworld/overworld_t_g.png";
tileset["overworld_obj"].src = "assets/tileset/overworld/overworld_t_obj.png";

linkSpr.src = "assets/linksprtest.png"; //loads links sprites
hudImg.src = "assets/hud/weaponHud.png"; //loads the hud sprites
itemSpr.src = "assets/itemSprites.png"; //loads the item being used by links sprites

let selectedBlock = 38; //the block that Link's is using, but now it is useless I think

//print the game name on the console guys!
console.log("Zelda Survival (change name later)");
console.log("Version "+projectProp.verMajor+"."+projectProp.verMinor+"."+projectProp.verPatch+" - "+projectProp.verDescrp);

//I need to make new soundtracks
let musicList = {};
musicList["titleScreen"] = new Audio('assets/songs/ballad_of_a_new_start.mp3');

//Ballad of a new Start i think that I will use in the credits screen
//ALERT! The Ballad of a new Start isn't ready yet

//super alert, maybe the zelda songs will be scrapped

let biomeTiles = [ //specific tiles for each biome
	[0, 1, 2, 16, 17, 18, 32, 33, 34], //grass fields
	[3, 4, 5, 19, 20, 21, 35, 36, 37], //sepian mounts
	[6, 7, 8, 22, 23, 24, 38, 39, 40], //dark forest
	[9, 10, 11, 25, 26, 27, 41, 42, 43], //mytical forest
	[12] //desert of wastes
];

let specialTiles = [ //special tiles that have different interactions with link
	[38, 39, 256], //this tiles the player won't collide
	[16, 17, 18, 19],
]

let basesprSize = 16; //the base sprite size that the sprites use in the image
let sprSize = 64; //the size that the sprites are rescaloned to be good on the big screen
let dungeonType = 0; //this definies what type of wall the dungeon needs to have
let tileset2use = "overworld"; //what tileset is being used to draw things on the screen

let worldSize = { //the size that the world is generated
	width : 16,
	height : 16,
}

let biomeTypes = [ //the types of biomes
	"Grass Field",
	"Sepian Mounts",
	"Dark Forest",
	"Mytical Forest",
	"Desert of Wastes"
]

let rupees = 415; //rupees 4 me!

let linkLife = { //its links life, what do you think that it is?
	life : 3.5,
	maxLife : 4
}

let controls = { //the controls to control link, bruh
	left:false,
	down:false,
	up:false,
	right:false,
	a:false,
	b:false,
	select:false,
	start:false
}

//Some things for object world generation:
let objTax = { //the var to create the objects in the world
	tree : 20,
	bush : 20,
	rock : 20
}

let transiting = false; //it is used when you gonna transit between on screen and another
let transSide = { //in which side you r transiting
	right : false,
	left : false,
	up : false,
	down : false
}

let mouse = { //mouse position
	x:0,
	y:0,
	down:false
}

let devMode = { //some dev tools
	on : true,
	debugTxt : true,
	showlinkColl : false,
	linkColl : true,
	showItemColl : false,
	hideObj : false,
	hideGrnd : false,
	hideHud : false,
	hideEntities : false
}

let tilesetImgW = (tileset[tileset2use].naturalWidth/16); //it is used for world drawing

let playerProp = { //player properties
	x : 0, //player X
	y : 0, //player Y
	sprX: 0, //sprite X offset pos
	sprY: 0, //sprite Y offset pos
	sclx : sprSize/2,
	scly : (sprSize/2)+16,
	sclxP : basesprSize,
	sclyP : basesprSize,
	direction: 0, //player direction
	frame: 0, //player animation actual frame
	fTimer: 0, //player frame timer
	fDelay: 8, //time during a frame and another
	totalF: 2, //max frames for animation
	fState: 0, //kind of animation
	useItem: 0 //the item that is currently being used
}

let tileAnim = { //used for make the flowers on the ground animated
	fTimer : 0, //tile frame timer
	frame : 0, //tile animation actual frame
	fDelay : 16, //time during a frame and another
	totalF : 4, //max frames for animation
}

let playerSprites = [ //a map of which animation to use, x offset, y offset, and a lot of another things
//so now u can add and modify animations easily and fast
	[ //direction - down
		//animation
		[[0, 0, 8], [0, 1, 8]], //frame -walking normal
		[[0, 2, 8], [0, 3, 8]], //walking with shield
		[[4, 0, 3, 0, 0], [4, 1, 3, 0, 0], [4, 1, 8, 0, 3]], //using item/sword
		[[4, 2, 8], [4, 3, 8]], //swimming
		[[8, 0, 8], [8, 1, 8]]
	],
	[ //direction - right
		//animation
		[[1, 0, 8], [1, 1, 8]], //frame - walking normal
		[[1, 2, 8], [1, 3, 8]], //walking with shield
		[[5, 0, 3, 0, 0], [5, 1, 3, 0, 0], [5, 1, 8, 3, 0]], //using item/sword
		[[5, 2, 8], [5, 3, 8]], //swimming
		[[9, 0, 8], [9, 1, 8]]
	],
	[ //direction - up
		//animation
		[[2, 0, 8], [2, 1, 8]], //frame - walking normal
		[[2, 2, 8], [2, 3, 8]], //walking with shield
		[[6, 0, 3], [6, 1, 3], [6, 1, 8, 0, -3]], //using item/sword
		[[6, 2, 8], [6, 3, 8]], //swimming
		[[10, 0, 8], [10, 1, 8]]
	],
	[ //direction - left
		//animation
		[[3, 0, 8], [3, 1, 8]], //frame - walking normal
		[[3, 2, 8], [3, 3, 8]], //walking with shield
		[[7, 0, 3], [7, 1, 3], [7, 1, 8, -3, 0]], //using item/sword
		[[7, 2, 8], [7, 3, 8]], //swimming
		[[11, 0, 8], [11, 1, 8]]
	]
]

let itemsSprProp = [ //a similar thing for the links animation, but it supports mirroring the sprites
	//item - sword
	[
		[ //direction - down
			[-16, 8, 0, 0, false, false],
			[-13, 13, 1, 0, false, false],
			[0, 16, 2, 0, false, false],
			{
				offX : 2,
				offY : 12,
				sclx: 4,
				scly: 12,
				sclxP: basesprSize,
				sclyP: basesprSize
			}
		],
		[ //right
			[0, -16, 2, 0, false, true],
			[13, -13, 1, 0, true, true],
			[16, 9, 0, 0, true, false],
			{
				offX: 12,
				offY: 4,
				sclx: 12,
				scly: 4,
				sclxP: basesprSize,
				sclyP: basesprSize
			}
		],
		[ //up 
			[16, 1, 0, 0, true, false],
			[13, -13, 1, 0, true, true],
			[-8, -16, 2, 0, false, true],
			{
				offX : 2,
				offY : -12,
				sclx : 4,
				scly : 12,
				sclxP: basesprSize,
				sclyP: basesprSize
			}
		],
		[ //left
			[-8, -16, 2, 0, false, true],
			[-13, -13, 1,0, false, true],
			[-16, -1, 0, 0, false, true],
			{
				offX: -12,
				offY: 4,
				sclx: 12,
				scly: 4,
				sclxP: basesprSize,
				sclyP: basesprSize
			}
		],
	],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[
		[ //direction - down
			[-16, 8, 3, 0, false, false],
			[-13, 13, 4, 0, false, false],
			[0, 16, 5, 0, false, false],
			{
				offX : 2,
				offY : 12,
				sclx: 4,
				scly: 12,
				sclxP: basesprSize,
				sclyP: basesprSize
			}
		],
		[ //right
			[0, -16, 5, 0, false, true],
			[13, -13, 4, 0, true, true],
			[16, 9, 3, 0, true, false],
			{
				offX: 12,
				offY: 4,
				sclx: 12,
				scly: 4,
				sclxP: basesprSize,
				sclyP: basesprSize
			}
		],
		[ //up 
			[16, 1, 3, 0, true, false],
			[13, -13, 4, 0, true, true],
			[-8, -16, 5, 0, false, true],
			{
				offX : 2,
				offY : -12,
				sclx : 4,
				scly : 12,
				sclxP: basesprSize,
				sclyP: basesprSize
			}
		],
		[ //left
			[-8, -16, 5, 0, false, true],
			[-13, -13, 4,0, false, true],
			[-16, -1, 3, 0, false, true],
			{
				offX: -12,
				offY: 4,
				sclx: 12,
				scly: 4,
				sclxP: basesprSize,
				sclyP: basesprSize
			}
		]
		//x offset, y offset, x sprite pos, y sprite pos, invert horizontal, invert vertical
	]
]

let camera = { //camera properties
	x : 0, //its used for camera transition
	y : 0, //its also used for camera transition
	offsetX : 0, //what focus the camera in a frame
	offsetY : 0 //ditto
}

let moveX = 0; //what allows the player to move in X
let moveY = 0; //what allows the player to move in Y

let handItem = [0, 1]; //the item that is the main hand

const keys={}; //the keys that exist
const keyPr={}; //the key is pressed?

//10 tiles of left to right
//8 tiles of up to down (not 9, the last is used for hud, which for some reason is also part of the map)

let perChunkWorld = []; //your world per chunk
let mapGroundList = []; //the ground of your world
let mapObjList = []; //the most inneficient way to add objects to your world

//here is where the world is generated

function generateWorld() {
	
	//verifies if u aren't idiot and is erasing a entire world
	if (perChunkWorld.length!==0 && mapGroundList.length!==0 && mapObjList.length!==0) {
		let eraseWorld = confirm("Your world will be lost if you create a new! you really want to proceed?");
		if (!eraseWorld) {
			return 0;
		}
	}
	
	//erase your world
	perChunkWorld = [];
	mapGroundList = [];
	mapObjList = [];
	
	//Generate World 8x10 Chunks
	for (let y=0; y<worldSize.height; y++) {
		perChunkWorld[y] = [];
		for (let x=0; x<worldSize.height; x++) {
			perChunkWorld[y][x] = Math.round(Math.random()*(biomeTypes.length-1));
			//perChunkWorld[y][x] = 0;
		}
	}
	
	//Turn the chunks in a real world
	for (let y=0; y<worldSize.height; y++) {
		//first, it creates the y part
		for (let i=0; i<8; i++){
			mapGroundList[(y*8)+i] = [];
			//it starts creating 8 spaces in Y part 
		}
		for (let x=0; x<worldSize.width; x++) {
			for (let i=0; i<8; i++) {
				for (let j=0; j<10; j++) {
					mapGroundList[(y*8)+i][(x*10)+j] = biomeTiles[perChunkWorld[y][x]][0];
					//and after it will create 10 X spaces in each 8 Y spaces
				}
			}
		}
	}
	
	//Checks the world tile to make them look normal
	for (let y=0; y<mapGroundList.length; y++) {
		for (let x=0; x<mapGroundList[0].length; x++) {
			let currTile = mapGroundList[y][x];
			if (perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]==4) {
				continue;
			}
			if (1==1) { //ignore that check
				let validTiles = new Set(biomeTiles[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]]);
				let tileright, tiledown, tileup, tileleft = "no";
				
				if (mapGroundList[y][x+1]!==undefined) {
					tileright = mapGroundList[y][x+1];
				}
				if (y+1!=mapGroundList.length) {
					tiledown = mapGroundList[y+1][x];
				}
				if (y!=0 && mapGroundList[y-1][x]!==undefined) {
					tileup = mapGroundList[y-1][x];
				}
				if (mapGroundList[y][x-1]!==undefined) {
					tileleft = mapGroundList[y][x-1];
				}
				
				if (validTiles.has(tileright)) {
					if (validTiles.has(tileleft)) {
						if (validTiles.has(tileup)) {
							if (validTiles.has(tiledown)) {
								mapGroundList[y][x] = biomeTiles[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]][4];
							} else {
								mapGroundList[y][x] = biomeTiles[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]][7];
							}
						} else {
							if (validTiles.has(tiledown)) {
								mapGroundList[y][x] = biomeTiles[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]][1];
							}
						}
					} else {
						if (validTiles.has(tileup)) {
							if (validTiles.has(tiledown)) {
								mapGroundList[y][x] = biomeTiles[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]][3];
							} else {
								mapGroundList[y][x] = biomeTiles[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]][6];
							}
						} else {
							mapGroundList[y][x] = biomeTiles[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]][0];
						}
					}
				} else {
					if (validTiles.has(tileleft)) {
						if (validTiles.has(tileup)) {
							if (validTiles.has(tiledown)) {
								mapGroundList[y][x] = biomeTiles[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]][5];
							} else {
								mapGroundList[y][x] = biomeTiles[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]][8];
							}
						} else {
							mapGroundList[y][x] = biomeTiles[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]][2];
						}
					}
				}
			}
		}
	}
	
	//adds flowers into the ground
	for (let y=0; y<mapGroundList.length; y++) { //the world is better and beautifull now
		for (let x=0; x<mapGroundList[0].length; x++) {
			let detailsOnGround = Math.round(Math.random()*4);
			if (detailsOnGround==0) { //improve that sh*t
				switch(mapGroundList[y][x]) {
					case 17:
						mapGroundList[y][x]=48;
						break;
					case 23:
						mapGroundList[y][x]=54;
						break;
					case 20:
						mapGroundList[y][x]=51;
						break;
					case 26:
						mapGroundList[y][x]=57;
						break;
				}
			}
		}
	}
	
	//generates the objects on the world (just like trees, rocks, bushes, etc...)
	
	for (let y=0; y<mapGroundList.length; y++) { //creating space on the object list
		mapObjList[y] = [];
		for (let x=0; x<mapGroundList[0].length; x++) {
			mapObjList[y][x] = 256;
		}
	}

	for (let y=mapObjList.length-1; y>0; y--) { //object random generation
		for (let x=mapObjList[0].length-1; x>0; x--) {
			let tree = Math.round(Math.random()*objTax.tree);
			let bush = Math.round(Math.random()*objTax.bush);
			let rock = Math.round(Math.random()*objTax.rock);

			//console.log(tree);
			if (tree==1) {
				if (x>1 && y>1) {
					if (y!=8*Math.floor(y/8)) {
						if (x!=10*Math.floor(x/10)) {
							if (perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]==2) {
								if (mapObjList[y][x]==256 && mapObjList[y][x-1]==256) {
									if (mapObjList[y][x]!=30 || mapObjList[y][x]!=31) {
										if (mapObjList[y][x]==15 || mapObjList[y][x]==13) {
											mapObjList[y][x]=47;
										} else if (mapObjList[y][x]==14 || mapObjList[y][x]==12) {
											mapObjList[y][x]=12;
										} else {
											mapObjList[y][x]=31;
										}
										if (mapObjList[y][x-1]==15) {
											mapObjList[y][x-1]=13;
										} else if (mapObjList[y][x-1]==14) {
											mapObjList[y][x-1]=46;
										} else {
											mapObjList[y][x-1]=30;
										}
										mapObjList[y-1][x]=15;
										mapObjList[y-1][x-1]=14;
										//break;
									}
								}
							} else if (perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]==4) {
								if (mapObjList[y][x]==256 && mapObjList[y][x-1]==256) {
									if (mapObjList[y][x]!=22 || mapObjList[y][x]!=23) {
										if (mapObjList[y][x]==7 || mapObjList[y][x]==7) {
											mapObjList[y][x]=22;
										} else if (mapObjList[y][x]==6 || mapObjList[y][x]==6) {
											mapObjList[y][x]=7;
										} else {
											mapObjList[y][x]=23;
										}
										if (mapObjList[y][x-1]==7) {
											mapObjList[y][x-1]=7;
										} else if (mapObjList[y][x-1]==6) {
											mapObjList[y][x-1]=23;
										} else {
											mapObjList[y][x-1]=22;
										}
										mapObjList[y-1][x]=7;
										mapObjList[y-1][x-1]=6;
										//break;
									}
								}
							} else {
								if (mapObjList[y][x]==256 && mapObjList[y][x-1]==256) {
									if (mapObjList[y][x]!=20 || mapObjList[y][x]!=21) {
										if (mapObjList[y][x]==5 || mapObjList[y][x]==3) {
											mapObjList[y][x]=37;
										} else if (mapObjList[y][x]==4 || mapObjList[y][x]==2) {
											mapObjList[y][x]=2;
										} else {
											mapObjList[y][x]=21;
										}
										if (mapObjList[y][x-1]==5) {
											mapObjList[y][x-1]=3;
										} else if (mapObjList[y][x-1]==4) {
											mapObjList[y][x-1]=36;
										} else {
											mapObjList[y][x-1]=20;
										}
										mapObjList[y-1][x]=5;
										mapObjList[y-1][x-1]=4;
										//break;
									}
								}
							}
						}
					} else {
						/* console.log("Trees shouldn't spawn here")
						console.log(x);
						console.log(y); */
					}
				}
			}
			if (bush==1) {
				if (x>1 && y>1) {
					if (mapObjList[y][x]==256) {
						for (let i=0; i<biomeTiles.length; i++) {
							for (let biom=0; biom<biomeTiles[i].length; biom++) {
								if(biomeTypes[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]]!=biomeTypes[4]) {
									if (mapGroundList[y][x]==biomeTiles[i][biom]) {
										mapObjList[y][x]=16+i;
									}
								}
							}
						}
						alreadyBush=true;
					}
				}
			}
			if (rock==1) {
				if (x>1 && y>1) {
					if (mapObjList[y][x]==256) {
						for (let i=0; i<biomeTiles.length; i++) {
							for (let biom=0; biom<biomeTiles[i].length; biom++) {
								if (mapGroundList[y][x]==biomeTiles[i][biom]) {
									if (biomeTypes[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]]!=biomeTypes[4]) {
										if (i==1) {
											mapObjList[y][x]=32;
										} else {
											mapObjList[y][x]=32+i;
										}
									}
								}
							}
						}
						alreadyRock=true;
					}
				}
			}
		}
		//break;
	}
	
	//prints some useless stuff
	console.log(`Map Y List ${mapGroundList.length} per block: 8`);
	console.log(`Map X List ${mapGroundList[0].length} per block: 10`);
	console.log(`${worldSize.width} Vertical Chunks and ${worldSize.height} Horizontal Chunks`);
}

//yeah, it needs to call this function
generateWorld();

tileset[tileset2use].onload = () => {
    gameLoop(); //only starts the game when the image load
};

document.addEventListener("keydown", function(event) {
	keys[event.key]=true;
	keyPr[event.key]=true;
});

document.addEventListener("keyup", function(event) {
	keys[event.key]=false;
	if (event.key == "p") {
		generateMapImage();
	}
});

document.addEventListener("mousemove", function(event) {
	mouse.x = event.clientX - 8;
	mouse.y = event.clientY - 8;
});

document.addEventListener("touchmove", function(event) {
	mouse.x = event.clientX - 8;
	mouse.y = event.clientY - 8;
});

document.addEventListener('mousedown', () => {
	mouse.down = true
});

document.addEventListener('mouseup', () => {
	mouse.down = false
});

document.addEventListener('touchstart', () => {
	mouse.down = true
});

document.addEventListener('touchend', () => {
	mouse.down = false
});


let lastTime = performance.now();
let fps = 0;

function gameLoop() {
	const currentTime = performance.now();
	let deltaTime = currentTime - lastTime;
	lastTime = currentTime;

	fps = Math.round(1000 / deltaTime);

	_update(deltaTime); //what constantly calls the loop
	_draw();
	
	requestAnimationFrame(gameLoop);
}

let lazy = (sprSize/basesprSize)*4;


function checkCollisionInTiles(obj1, tX, tsclX, tY, tsclY) {
	let obj1prop = {
		left : obj1.x+obj1.sclxP,
		right : obj1.x+obj1.sclx,
		up : obj1.y-obj1.sclyP,
		down : obj1.y+obj1.scly
	}
	let obj2prop = {
		left : tX-basesprSize,
		right : tsclX+tX,
		up : tY-basesprSize,
		down : tY+(basesprSize*2),
	}
	return(obj1prop.right>obj2prop.left && obj1prop.left<obj2prop.right && obj1prop.down>obj2prop.up && obj1prop.up<obj2prop.down);
}

function checkCollisionWithObj(obj, mapPoint, xory) {
	let dontcol = false;
	let cameraOffY = camera.offsetY - 1;
	let cameraOffX = camera.offsetX - 1;
	for(let y=0; y<8*3; y++) {
		if(y+(cameraOffY*8)<0 || y+(cameraOffY*8)>mapObjList.length) {
			continue;
		}
		for (let x=0; x<10*3; x++) {
			if(x+(cameraOffX*10)<0 || x+(cameraOffX*10)>mapGroundList[y].length) {
				continue;
			}
			dontcol=false;
			const tile = mapObjList[y+(cameraOffY*8)][x+(cameraOffX*10)];
			
			for (i=0; i<specialTiles[0].length; i++) {
				if (mapObjList[y+(cameraOffY*8)][x+(cameraOffX*10)]==specialTiles[0][i]) {
					dontcol=true;
				}
			}
			
			if (dontcol==false) {
				const tileX = (x*sprSize) + camera.x-(80*8);
				const tileY = (y*sprSize) + camera.y-(64*8);
			
				if (checkCollisionInTiles(obj, tileX, sprSize, tileY, sprSize)) {
					if (mapPoint) {
						if (xory==0) {
							return x-10;
						} else if (xory==1) {
							return y-8;
						}
					} else {
						return true;
					}
				}
			}
		}
	}
	
	return false;
}
const plyspeed = (sprSize/basesprSize);
let playerInListXPos = 0;
let playerInListYPos = 0;

function exportMap() {
	const mapGroundData = mapGroundList.map((row, y) =>
		row.map((value, x) => `${x},${y}=${value}`).join("\n")
	).join("\n");

	const mapObjData = mapObjList.map((row, y) =>
		row.map((value, x) => `${x},${y}=${value}`).join("\n")
	).join("\n");
	
	const chunksData = perChunkWorld.map((row, y) => 
		row.map((value, x) => `${x},${y}=${value}`).join("\n")
	).join("\n");

	const mapList = `Map Ground:\n${mapGroundData}\n\nMap Objects:\n${mapObjData}\n\nChunk Data:\n${chunksData}\nGAMEVERSION: \n${projectProp.verMajor}.${projectProp.verMinor}.${projectProp.verPatch} - ${projectProp.verDescrp}`;

	const blob = new Blob([mapList], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	
	const fileName = prompt("Insert your world name: ");

	a.href = url;
	a.download = `${fileName}.txt`;
	document.body.appendChild(a);
	a.click();

	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function destroyTile(tileY, tileX, mapPart, item, currItem) {
	if (item) {
		if (currItem==0) {
			
			let desTiles = new Set(specialTiles[1]);
			
			if (desTiles.has(mapPart[tileY][tileX])) {
				mapPart[tileY][tileX] = 256;
			}
			
		}
	} else {
		mapPart[tileY][tileX] = 256;
	}
}

function importMapList(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split("\n");

        // Find section indexes properly
        const mapGroundStart = lines.indexOf("Map Ground:") + 1;
        const mapObjectsStart = lines.indexOf("Map Objects:") + 1;
        const chunkDataStart = lines.indexOf("Chunk Data:") + 1;
		
        const mapObjectsEnd = chunkDataStart - 2; // Stop parsing objects before Chunk Data
        const mapGroundEnd = mapObjectsStart - 2; // Stop parsing ground before Map Objects

        // Initialize empty 2D arrays
        mapGroundList = [];
        mapObjList = [];
        perChunkWorld = [];

        // Parse Map Ground section correctly
        lines.slice(mapGroundStart, mapGroundEnd).forEach(line => {
            if (!line.includes("=")) return;
            const [position, value] = line.split("=");
            const [x, y] = position.split(",").map(Number);
            if (!mapGroundList[y]) mapGroundList[y] = [];
            mapGroundList[y][x] = Number(value);
        });

        // Parse Map Objects section correctly
        lines.slice(mapObjectsStart, mapObjectsEnd).forEach(line => {
            if (!line.includes("=")) return;
            const [position, value] = line.split("=");
            const [x, y] = position.split(",").map(Number);
            if (!mapObjList[y]) mapObjList[y] = [];
            mapObjList[y][x] = Number(value);
        });

        // Parse Chunk Data section correctly
        lines.slice(chunkDataStart).forEach(line => {
            if (!line.includes("=")) return;
            const [position, value] = line.split("=");
            const [x, y] = position.split(",").map(Number);
            if (!perChunkWorld[y]) perChunkWorld[y] = [];
            perChunkWorld[y][x] = Number(value);
        });
		
		playerProp.x = 0;
		playerProp.y = 0;
		camera.offsetX = 0;
		camera.offsetY = 0;
		camera.x = 0;
		camera.y = 0;

        console.log("Imported Map Ground List:", mapGroundList);
        console.log("Imported Map Object List:", mapObjList);
        console.log("Imported Chunk Map:", perChunkWorld);
    };

    reader.readAsText(file);
}

const exportButton = document.createElement("button");
exportButton.textContent = "Export Map";
exportButton.onclick = exportMap;
document.body.appendChild(exportButton);

const uploadInput = document.createElement("input");
uploadInput.type = "file";
uploadInput.accept = ".txt"; // Restrict to .txt files
uploadInput.onchange = importMapList;
document.body.appendChild(uploadInput);

function generateMapImage() {
	
	if (!tileset["overworld"].complete) {
		alert("Tileset wasn't loaded yet");
		return;
	}
	
	const totalTilesX = mapGroundList[0].length;
	const totalTilesY = mapGroundList.length;
	
	const imageCanvas = document.createElement("canvas");
	const imageCtx = imageCanvas.getContext("2d");
	
	imageCtx.imageSmoothingEnabled = false;
	
	imageCanvas.width = totalTilesX * basesprSize;
	imageCanvas.height = totalTilesY * basesprSize;
	
	for (let y=0; y<totalTilesY; y++) {
		for (let x=0; x<totalTilesX; x++) {
			const tile = mapGroundList[y][x];
			if (tile==256) continue;
			
			const imgX = tile % tilesetImgW;
			const imgY = Math.floor(tile/tilesetImgW);
			
			imageCtx.drawImage(tileset["overworld"], imgX*basesprSize, imgY*basesprSize, basesprSize, basesprSize, x*basesprSize, y*basesprSize, basesprSize, basesprSize);
		}
	}
	
	for (let y=0; y<totalTilesY; y++) {
		for (let x=0; x<totalTilesX; x++) {
			const tile = mapObjList[y][x];
			if (tile==256) continue;
			
			const imgX = tile % tilesetImgW;
			const imgY = Math.floor(tile/tilesetImgW);
			
			imageCtx.drawImage(tileset["overworld_obj"], imgX*basesprSize, imgY*basesprSize, basesprSize, basesprSize, x*basesprSize, y*basesprSize, basesprSize, basesprSize);
		}
	}
		
	const imgData = imageCanvas.toDataURL("image/png");
	
	const mapName = prompt("Insert screenshot name:");
	
	const a = document.createElement("a");
	a.href = imgData;
	a.download = `${mapName}.png`;
	a.click();
}

function _update(deltaTime) {
	let deltaX = 0;
	let deltaY = 0;
	
	if (sprSize!=64 && devMode.on) {
		devMode.linkColl = false;
	}
	
	if(keys["d"]) {controls.right=true} else {controls.right=false};
	if(keys["s"]) {controls.down=true} else {controls.down=false};
	if(keys["w"]) {controls.up=true} else {controls.up=false};
	if(keys["a"]) {controls.left=true} else {controls.left=false};
	if(keys["b"]) {controls.b=true} else {controls.b=false};
	if(keys["n"]) {controls.a=true} else {controls.a=false};
		
	if (!transiting) {
		if (playerProp.fState!=2) {
			if(controls.right ) {moveX=-1} else if (controls.left ) {moveX=1} else {moveX=0};
			if(controls.up ) {moveY=-1} else if (controls.down ) {moveY=1} else {moveY=0};
			if(controls.right ) {
				deltaX+=plyspeed;
				if (controls.down !=true && controls.up !=true && controls.left !=true) {
					playerProp.direction = 1;
				}
			}
			if(controls.left ) {
				deltaX-=plyspeed;
				if (controls.down !=true && controls.up !=true && controls.right !=true) {
					playerProp.direction = 3;
				}
			}
			if(controls.up ) {
				deltaY-=plyspeed;
				if (controls.down !=true && controls.left !=true && controls.right !=true) {
					playerProp.direction = 2;
				}
			}
			if(controls.down ) {
				deltaY+=plyspeed;
				if (controls.up !=true && controls.left !=true && controls.right !=true) {
					playerProp.direction = 0;
				}
			}
			if(keys["j"]) {
				mapObjList[playerInListYPos][playerInListXPos] = selectedBlock;
			}
			
			if(controls.b) {
				if (playerProp.fState!=2) {
					playerProp.useItem=0;
					if (handItem[0]==1) {
						playerProp.fState=4;
					} else {
						playerProp.fState=2
					}
					if (playerProp.fState!==4) {
						playerProp.frame=0;
						playerProp.fTimer=0;
					}
				}
			} else {
				if (playerProp.fState==4 && !controls.a) {
					if (handItem[0]==1) {
						playerProp.fState=1;
					} else {
						playerProp.fState=0;
					}
				}
			}
			if(controls.a) {
				if (playerProp.fState!=2) {
					playerProp.useItem=1;
					if (handItem[1]==1) {
						playerProp.fState=4;
					} else {
						playerProp.fState=2
					}
					if (playerProp.fState!==4) {
						playerProp.frame=0;
						playerProp.fTimer=0;
					}
				}
			} else {
				if (playerProp.fState==4 && !controls.b) {
					if (handItem[1]==1) {
						playerProp.fState=1;
					} else {
						playerProp.fState = 0;
					}
				}
			}
		}
		
		if (playerProp.fState!==2) {
			playerProp.x+=deltaX;
		}
		
		if (checkCollisionWithObj(playerProp)) {
			playerProp.x -= deltaX;
		} else if (camera.offsetX==worldSize.width-1 && (playerProp.x+((sprSize/basesprSize)*4))+playerProp.sclx>640) {
			playerProp.x -= deltaX;
		} else if (camera.offsetX==0 && playerProp.x+((sprSize/basesprSize)*4)<0) {
			playerProp.x -= deltaX;
		}
		
		if (playerProp.fState!==2) {
			playerProp.y+=deltaY;
		}
		
		if (checkCollisionWithObj(playerProp)) {
			playerProp.y-=deltaY;
		} else if (camera.offsetY==worldSize.height-1 && playerProp.y+playerProp.scly+((sprSize/basesprSize)*4)>512) {
			playerProp.y -= deltaY;
		} else if (camera.offsetY==0 && playerProp.y+((sprSize/basesprSize)*4)<0) {
			playerProp.y -= deltaY;
		}
		
		if (playerProp.fState==2 && itemsSprProp[handItem[playerProp.useItem]] && itemsSprProp[handItem[playerProp.useItem]].length!==0) {
			let hitboxX = playerProp.x+itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].offX*(sprSize/basesprSize);
			let hitboxY = playerProp.y+itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].offY*(sprSize/basesprSize);
			let hitboxSclx = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].sclx*(sprSize/basesprSize);
			let hitboxScly = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].scly*(sprSize/basesprSize);
			let hitboxSclxP = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].sclxP;
			let hitboxSclyP = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].sclyP;
			
			let itemObj = {
				x : hitboxX,
				y : hitboxY,
				sclx: hitboxSclx,
				scly: hitboxScly,
				sclxP: hitboxSclxP,
				sclyP: hitboxSclyP,
			}
			
			if (checkCollisionWithObj(itemObj)) {
				let tileX = checkCollisionWithObj(itemObj, true, 0);
				let tileY = checkCollisionWithObj(itemObj, true, 1);
				/* console.log("Colliding")
				console.log(`X: ${tileX} Y: ${tileY} PLX: ${playerProp.x} PLY: ${playerProp.y}`)
				console.log(`ITEMX: ${hitboxX} ITEMY: ${hitboxY} ITEMSCLX: ${hitboxX+hitboxSclx} ITEMSCLY: ${hitboxY+hitboxScly}`)
				console.log(`OBJX: ${tileX*basesprSize*(sprSize/basesprSize)} OBJY: ${tileY*basesprSize*(sprSize/basesprSize)}`) */
				//mapObjList[tileY+(camera.offsetY*8)][tileX+(camera.offsetX*10)] = 256;
				destroyTile(tileY+(camera.offsetY*8), tileX+(camera.offsetX*10), mapObjList, true, playerProp.useItem)
			}
		}
		
		//checks for sprite animation
		if (handItem[1]==1 || handItem[0]==1) {
			if (playerProp.fState==0) {
				playerProp.fState=1;
			}
		} else {
			if (playerProp.fState==1) {
				playerProp.fState=0;
			}
		}
		
		playerProp.fDelay = playerSprites[playerProp.direction][playerProp.fState][playerProp.frame][2];
		//playerProp.totalF = playerSprites[playerProp.direction][playerProp.fState].length;
		
		//animation code is here
		if (playerProp.fState!==2) {
			if (moveX!==0 || moveY!==0) {
				playerProp.fTimer++;
				if (playerProp.fTimer >= playerProp.fDelay) {
					playerProp.frame = (playerProp.frame + 1) % playerProp.totalF;
					playerProp.fTimer = 0;
					playerProp.fDelay = playerSprites[playerProp.direction][playerProp.fState][playerProp.frame][2];
					playerProp.totalF = playerSprites[playerProp.direction][playerProp.fState].length;
				}
			} else {
				playerProp.frame=0;
				playerProp.fTimer=0;
			}	
		} else {
			playerProp.fTimer++;
			if (playerProp.fTimer >= playerProp.fDelay) {
				playerProp.frame = (playerProp.frame + 1) % playerProp.totalF;
				playerProp.fTimer = 0;
				if (playerProp.fState==2 && playerProp.frame+1<playerProp.totalF) {
					playerProp.fState=0;
				}
				playerProp.fDelay = playerSprites[playerProp.direction][playerProp.fState][playerProp.frame][2];
				playerProp.totalF = playerSprites[playerProp.direction][playerProp.fState].length;
			}
		}
		//use something like this on the tile animation
		
	} else if (transiting) {
		if (transSide.down) {
			if (camera.y>-512) {
				camera.y-=lazy;
				playerProp.y-=lazy;
			} else {
				camera.offsetY+=1;
				camera.y=0;
				playerProp.y=0;
				transSide.down = false;
				transiting = false;
			}
		}
		if (transSide.up) {
			if (camera.y<512) {
				camera.y+=lazy;
				playerProp.y+=lazy;
			} else {
				camera.offsetY-=1;
				camera.y=0;
				playerProp.y=448;
				transSide.up = false;
				transiting = false;
			}
		}
		if (transSide.right) {
			if (camera.x>-640) {
				camera.x-=lazy;
				playerProp.x-=lazy;
			} else {
				camera.offsetX+=1;
				camera.x=0;
				playerProp.x=16;
				transSide.right = false;
				transiting = false;
			}
		}
		if (transSide.left) {
			if (camera.x<640) {
				camera.x+=lazy;
				playerProp.x+=lazy;
			} else {
				camera.offsetX-=1;
				camera.x=0;
				playerProp.x=564;
				transSide.left = false;
				transiting=false
			}
		}
	}
	
	playerInListXPos=Math.round((playerProp.x/sprSize)+camera.offsetX*10);
	playerInListYPos=Math.round((playerProp.y/sprSize)+camera.offsetY*8);
	//Player map change
	if (playerProp.y+playerProp.scly+((sprSize/basesprSize)*4)>512 && transiting==false && camera.offsetY<perChunkWorld.length-1) {
		transiting = true;
		transSide.down = true;
	}if (playerProp.y+((sprSize/basesprSize)*4)<0 && transiting==false) {
		if (camera.offsetY>0) {
			transiting = true;
			transSide.up = true;
		}
	}if ((playerProp.x+((sprSize/basesprSize)*4))+playerProp.sclx>640 && transiting==false && camera.offsetX<perChunkWorld[0].length-1) {
		//if (((camera.offsetX)*8)*2<=mapGroundList[0].length) {
		transiting = true;
		transSide.right = true;
		//}
	}if (playerProp.x+((sprSize/basesprSize)*4)<0 && transiting==false) {
		if (camera.offsetX>0) {
			transiting = true;
			transSide.left = true;
		}
	}
	//tile animation guys
	if (tileAnim.fTimer >= tileAnim.fDelay) {
		tileAnim.frame = (tileAnim.frame + 1) % tileAnim.totalF;
		tileAnim.fTimer = 0;
	}
	tileAnim.fTimer++;
	
	if (rupees>999) {
		rupees=999;
	}
	
	if (linkLife.life>linkLife.maxLife) {
		linkLife.life=linkLife.maxLife
	}
}

function drawPlayer() {
	let plyoffsetX = 0;
	let plyoffsetY = 0;
	if (playerSprites[playerProp.direction][playerProp.fState][playerProp.frame][3]!==undefined) {
		plyoffsetX = playerSprites[playerProp.direction][playerProp.fState][playerProp.frame][3];
	}
	if (playerSprites[playerProp.direction][playerProp.fState][playerProp.frame][4]!==undefined) {
		plyoffsetY = playerSprites[playerProp.direction][playerProp.fState][playerProp.frame][4];
	}
	if (linkSpr.complete) {
		ctx.drawImage(linkSpr, playerSprites[playerProp.direction][playerProp.fState][playerProp.frame][0]*basesprSize, playerSprites[playerProp.direction][playerProp.fState][playerProp.frame][1]*basesprSize, basesprSize, basesprSize, playerProp.x+(plyoffsetX*(sprSize/basesprSize)), playerProp.y+(plyoffsetY*(sprSize/basesprSize)), sprSize, sprSize);
		//ctx.fillRect(playerProp.sclxP+playerProp.x, playerProp.sclyP+playerProp.y, playerProp.sclx, playerProp.scly); //this is for link's collision your dumbass
	}
	
	if (playerProp.fState===2){
		ctx.save();
		
		if (itemsSprProp[handItem[playerProp.useItem]]!==undefined && itemsSprProp[handItem[playerProp.useItem]].length!==0) {
			let offsetX = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][playerProp.frame][0]*(sprSize/basesprSize);
			let offsetY = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][playerProp.frame][1]*(sprSize/basesprSize);
			let spriteX = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][playerProp.frame][2];
			let spriteY = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][playerProp.frame][3];
			
			let drawX = (playerProp.x+(plyoffsetX*(sprSize/basesprSize)))+ offsetX;
			let drawY = (playerProp.y+(plyoffsetY*(sprSize/basesprSize)))+ offsetY;
			
			let mirrorX = 0;
			let mirrorY = 0;
			
			if (itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][playerProp.frame][4]) {
				mirrorX = -1;
			} else {
				mirrorX = 1;
			}
			if (itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][playerProp.frame][5]) {
				mirrorY = -1;	
			} else {
				mirrorY = 1;
			}
			
			if (devMode.showItemColl && devMode.on) {
				let hitboxX = playerProp.x+itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].offX*(sprSize/basesprSize);
				let hitboxY = playerProp.y+itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].offY*(sprSize/basesprSize);
				let hitboxSclx = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].sclx*(sprSize/basesprSize);
				let hitboxScly = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].scly*(sprSize/basesprSize);
				let hitboxSclxP = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].sclxP;
				let hitboxSclyP = itemsSprProp[handItem[playerProp.useItem]][playerProp.direction][itemsSprProp[handItem[playerProp.useItem]][playerProp.direction].length-1].sclyP;
				
				let itemObj = {
					x : hitboxX,
					y : hitboxY,
					sclx: hitboxSclx,
					scly: hitboxScly,
					sclxP: hitboxSclxP,
					sclyP: hitboxSclyP
				}
				
				if (devMode.showItemColl) {
					ctx.fillStyle="#ff0000"
					ctx.fillRect(itemObj.x, itemObj.y, itemObj.sclx, itemObj.scly)
					ctx.fillStyle="#00ff00"
					ctx.fillRect(itemObj.x+itemObj.sclxP, itemObj.y+itemObj.sclyP, itemObj.sclx, itemObj.scly)
				}
			}
			
			//if (playerProp.useItem==0)
			ctx.translate(drawX+sprSize/2,drawY+sprSize/2);
			ctx.scale(mirrorX, mirrorY);
			ctx.drawImage(itemSpr, spriteX*basesprSize, spriteY*basesprSize, basesprSize, basesprSize, -sprSize/2, -sprSize/2, sprSize, sprSize);

		}
		ctx.restore();
	}
}

function drawHud() {
	if (hudImg.complete) {
		//main A and B buttons
		ctx.drawImage(hudImg, 0, 0, basesprSize*2+1, basesprSize, sprSize/basesprSize, 512, sprSize*2, sprSize);
		ctx.drawImage(hudImg, handItem[0]*(basesprSize/2), basesprSize, basesprSize/2, basesprSize, ((sprSize/basesprSize)+basesprSize*2)-(sprSize/basesprSize), 512, sprSize/2, sprSize)
		ctx.drawImage(hudImg, (basesprSize*2)+1, 0, basesprSize*2+1, basesprSize, (sprSize/basesprSize+sprSize*2)+7*4, 512, sprSize*2, sprSize);
		ctx.drawImage(hudImg, handItem[1]*(basesprSize/2), basesprSize, basesprSize/2, basesprSize, (((sprSize/basesprSize+sprSize*2)+7*4)+basesprSize*2)-(sprSize/basesprSize), 512, sprSize/2, sprSize)
		//rupees counter (I need to use Rupees for something)
		ctx.drawImage(hudImg, (basesprSize/2)*9, 0, basesprSize/2, basesprSize/2, 81*(sprSize/basesprSize), 512, sprSize/2, sprSize/2);
		//the numbers guys
		let rupeeList = rupees.toString().split("");
		let rupeeLen = rupees.toString().length;
		//TODO: Make the numbers always have 3 houses, for example: 5 become 005
		for (let i=0; i<rupeeLen; i++) {
			ctx.drawImage(
				hudImg, 
				4*(basesprSize/2)+(rupeeList[i]*(basesprSize/2)),
				(basesprSize/2)*4,
				basesprSize/2,
				basesprSize/2,
				81*(sprSize/basesprSize)+(i*(8*(sprSize/basesprSize))),
				512+(8*(sprSize/basesprSize)),
				sprSize/2,
				sprSize/2
			);
		}
		//The hearts that are in the hud
		
		let xDraw = 0;
		let yDraw = 0;
		let fixLife = false;
		if (!Number.isInteger(linkLife.life)) {
			fixLife = true;
		}
		let mainLife = Math.floor(linkLife.life);
		for (let i=0; i<linkLife.maxLife; i++) {
			xDraw = (81*(sprSize/basesprSize))+((sprSize/2)*3)+(i*(8*(sprSize/basesprSize)));
			yDraw=512+((sprSize/2)*(Math.floor(i/7)));
			ctx.drawImage(hudImg, (basesprSize/2), basesprSize*2, basesprSize/2, basesprSize/2, xDraw, yDraw, sprSize/2, sprSize/2);
		}
		if (mainLife==0) {
			for (let i=0; i<1; i++) { //repeat for me
				xDraw = (81*(sprSize/basesprSize))+((sprSize/2)*3)+(i*(8*(sprSize/basesprSize)));
				yDraw=512+((sprSize/2)*(Math.floor(i/7)));
				ctx.drawImage(hudImg, (basesprSize/2)*2, basesprSize*2, basesprSize/2, basesprSize/2, xDraw, yDraw, sprSize/2, sprSize/2);
			}
		} else {
			for (let i=0; i<mainLife; i++) { //repeat for me
				xDraw = (81*(sprSize/basesprSize))+((sprSize/2)*3)+(i*(8*(sprSize/basesprSize)));
				yDraw=512+((sprSize/2)*(Math.floor(i/7)));
				ctx.drawImage(hudImg, (basesprSize/2)*3, basesprSize*2, basesprSize/2, basesprSize/2, xDraw, yDraw, sprSize/2, sprSize/2);
				if (fixLife) {
					if (i+1==mainLife) {
						i++;
						xDraw = (81*(sprSize/basesprSize))+((sprSize/2)*3)+(i*(8*(sprSize/basesprSize)));
						yDraw=512+((sprSize/2)*(Math.floor(i/7)));
						ctx.drawImage(hudImg, (basesprSize/2)*2, basesprSize*2, basesprSize/2, basesprSize/2, xDraw, yDraw, sprSize/2, sprSize/2);
					}
				}
			}
		}
	}
}

function drawScene(){
	if (tileset[tileset2use].complete) {
		//BUG FIX GUYS!!1!
		let imgX = 0;
		let imgY = 0;
		let cameraOffY = camera.offsetY - 1;
		let cameraOffX = camera.offsetX - 1;
        for (let y = 0; y < 8*3; y++) {
			//if((camera.offsetY*8)*2<=mapGroundList.length) {
				if(y+(cameraOffY*8)<0 || y+(cameraOffY*8)>mapGroundList.length) {
					continue;
				}
				if (!devMode.on || devMode.on && !devMode.hideGrnd) {
					for (let x = 0; x < 10*3; x++) {
						//if ((y * sprSize)+camera.y-(camera.offsetY*(8*sprSize))<768 || (x * sprSize)+camera.x-(camera.offsetX*(10*sprSize))<896) {
							if(x+(cameraOffX*10)<0 || x+(cameraOffX*10)>mapGroundList[y].length) {
								continue;
							}
							let tile = mapGroundList[y+(cameraOffY*8)][x+(cameraOffX*10)];
							tilesetImgW = (tileset[tileset2use].naturalWidth/16);
							tilesetImgH = (tileset[tileset2use].naturalHeight/16);
							imgX = tile % tilesetImgW; // Compute horizontal frame
							imgY = Math.floor(tile / tilesetImgW); // Compute vertical frame
							if ((x * sprSize)+camera.x-((10*sprSize))>=-sprSize || (x * sprSize)+camera.x-((10*sprSize))<=sprSize*11 || (y * sprSize)+camera.y-((8*sprSize))>=-sprSize || (y * sprSize)+camera.y-((8*sprSize))<=sprSize*11) {
								if (tile==48 || tile==54 || tile==51 || tile==57) {
									switch(tileAnim.frame) {
										case 1:
											imgX+=1;
											break;
										case 2:
											imgX+=2;
											break;
										case 3:
											imgY+=1;
											break;
									}	
								}
								
								ctx.drawImage(
									tileset[tileset2use],
									imgX * basesprSize,
									imgY * basesprSize,
									basesprSize,
									basesprSize,
									(x * sprSize)+camera.x-(80*8),
									(y * sprSize)+camera.y-(64*8), 
									sprSize, sprSize);
							}
							/* if (checkCollisionInTiles(playerProp, (x * sprSize)+camera.x-(camera.offsetX*(10*sprSize)), sprSize, (y * sprSize)+camera.y-(camera.offsetY*(8*sprSize)), sprSize)) {
								ctx.globalAlpha = 0.5;
								ctx.fillRect((x * sprSize)+camera.x-(camera.offsetX*(10*sprSize)),(y * sprSize)+camera.y-(camera.offsetY*(8*sprSize)), sprSize, sprSize);
								ctx.globalAlpha = 1;
							} */
						//} else {
							//break;
						//}
					}
				}
			//}
		}
		for (let y=0; y<8*3; y++) {
			if(y+(cameraOffY*8)<0 || y+(cameraOffY*8)>mapObjList.length) {
				continue;
			}
			if (!devMode.on || devMode.on && !devMode.hideObj) {
					for (let x = 0; x < 10*3; x++) {
						//if ((y * sprSize)+camera.y-(camera.offsetY*(8*sprSize))<768 || (x * sprSize)+camera.x-(camera.offsetX*(10*sprSize))<896) {
							if(x+(cameraOffX*10)<0 || x+(cameraOffX*10)>mapObjList[y].length) {
								continue;
							}
							let tile = mapObjList[y+(cameraOffY*8)][x+(cameraOffX*10)];
							tilesetImgW = (tileset["overworld_obj"].naturalWidth/16);
							tilesetImgH = (tileset["overworld_obj"].naturalHeight/16);
							imgX = tile % 16; // Compute horizontal frame
							imgY = Math.floor(tile / 16); // Compute vertical frame
							if ((x * sprSize)+camera.x-((10*sprSize))>=-sprSize || (x * sprSize)+camera.x-((10*sprSize))<=sprSize*11 || (y * sprSize)+camera.y-((8*sprSize))>=-sprSize || (y * sprSize)+camera.y-((8*sprSize))<=sprSize*11) {
								ctx.drawImage(
								tileset["overworld_obj"],
								imgX * basesprSize,
								imgY * basesprSize,
								basesprSize,
								basesprSize,
								(x * sprSize)+camera.x-((10*8)*8),
								(y * sprSize)+camera.y-((8*8)*8), 
								sprSize, sprSize);
							}
						//} else {
							//break;
						//}
					}
				}
		}
    }
}

function _draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height); //it cleans the screen
	ctx.fillStyle = "#ffffff";
	drawScene();
	drawPlayer();
	ctx.fillStyle = "#ff0000";
	ctx.globalAlpha=0.5;
	//ctx.fillRect((playerInListXPos-(camera.offsetX*10))*sprSize, (playerInListYPos-(camera.offsetY*8))*sprSize, sprSize, sprSize);
	ctx.globalAlpha=1;
	ctx.fillStyle = "#000000";
	//drawPlayer();
	//the hud is behind the player for some reason
	//remember to move it back after the tests
	ctx.fillStyle = "#FFFF8C";
    ctx.fillRect(0, 512, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
	if (!devMode.on || devMode.on && !devMode.hideHud) {
		drawHud();
	}
	if (devMode.on && devMode.debugTxt) {
		ctx.fillText(`Player X: ${playerProp.x} Player Y: ${playerProp.y}`, 0, 520);
		ctx.fillText(`Player ScaleX point: ${playerProp.sclx+playerProp.x} Player ScaleY point: ${playerProp.scly+playerProp.y}`, 0, 530);
		ctx.fillText(`Player Current Animation Frame: ${playerProp.frame}`, 0, 540);
		ctx.fillText(`Player Direction: ${playerProp.direction}`, 0, 550);
		ctx.fillText(`Player In List X: ${playerInListXPos} Y: ${playerInListYPos}`, 0, 560);
		ctx.fillText(`Current Tile Animation Frame: ${tileAnim.frame}`, 0, 570);
		ctx.fillText(`Mouse X: ${mouse.x} Y: ${mouse.y} down: ${mouse.down}`, 0, 20);
		ctx.fillText(`Current Biome: ${biomeTypes[perChunkWorld[camera.offsetY][camera.offsetX]]}`,0,30);
		ctx.fillText(`Camera Offset X: ${camera.offsetX} Y: ${camera.offsetY}`,0 , 40);
	}
}
