const canvas = document.getElementById("gamelmao");
canvas.width = 640;
canvas.height = 576;
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const projectProp = {
    verMajor : 0,
    verMinor : 1,
    verPatch : 0,
    verDescrp : "Infinite Infinity"
}

document.title = `Zelda Survival - ${projectProp.verMajor}.${projectProp.verMinor}.${projectProp.verPatch}`

//TODO: Add a Gameboy color on background behind the screen
//It makes the game looks more with the original Awakening

//TODO: Make layers for the tiles:
/*
    Layer render for them {
        1-Ground tiles
        2-Walls - Objects
        2-Ground Items - Also in the Layer 2
    }
    4-Dropped Items
    5-Entities (Enemies, Player, etc..)
*/

let selectedBlock = 38;

console.log("Zelda Survival (change name later)");
console.log("Version "+projectProp.verMajor+"."+projectProp.verMinor+"."+projectProp.verPatch+" - "+projectProp.verDescrp);

let musicList = {};
musicList["titleScreen"] = new Audio('assets/songs/ballad_of_a_new_start.mp3');

//Ballad of a new Start i think that I will use in the credits screen
//ALERT! The Ballad of a new Start isn't ready yet

let biomeTiles = [
	[0, 1, 2, 16, 17, 18, 32, 33, 34],
	[3, 4, 5, 19, 20, 21, 35, 36, 37],
	[6, 7, 8, 22, 23, 24, 38, 39, 40],
	[9, 10, 11, 25, 26, 27, 41, 42, 43],
	[12]
];

let specialTiles = [
	[38, 39, 256] //this tiles the player won't collide
]


let basesprSize = 16;
let sprSize = 64;
let dungeonType = 0; //this definies what type of wall the dungeon needs to have
let tileset2use = "overworld";

let worldSize = {
	width : 16,
	height : 16,
}
let chunk = 8; //dont change it

let biomeTypes = [
	"Grass Field",
	"Sepian Mounts",
	"Dark Forest",
	"Mytical Forest",
	"Desert of Wastes"
]

let rupees = 123;

let linkLife = {
	life : 3.5,
	maxLife : 4
}

let controls = {
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
let objTax = {
	tree : 20,
	bush : 20,
	rock : 20
}

let transiting = false;
let transSide = {
	right : false,
	left : false,
	up : false,
	down : false
}

let mouse = {
	x:0,
	y:0,
	down:false
}

let devMode = {
	on : true,
	debugTxt : true,
	linkColl : true,
	hideObj : false,
	hideGrnd : false,
	hideHud : false,
	hideEntities : false
}

//10 tiles of left to right
//8 tiles of up to down (not 9, the last is used for hud, which for some reason is also part of the map)

//here is where the world is generated
let perChunkWorld = [];

//first it generates the world per chunks
for (let y=0; y<worldSize.height; y++) {
	perChunkWorld[y] = [];
	for (let x=0; x<worldSize.height; x++) {
		perChunkWorld[y][x] = Math.round(Math.random()*(biomeTypes.length-1));
		//perChunkWorld[y][x] = 0;
	}
}

let mapGroundList = [];

//after, it turns each chunk into a full map
for (let y=0; y<worldSize.height; y++) {
	for (let i=0; i<8; i++){
		mapGroundList[(y*8)+i] = [];
		//it starts creating 8 spaces in Y part 
	}
	//first, it creates the y part
	for (let x=0; x<worldSize.width; x++) {
		for (let i=0; i<8; i++) {
			for (let j=0; j<10; j++) {
				mapGroundList[(y*8)+i][(x*10)+j] = biomeTiles[perChunkWorld[y][x]][0];
				//it will create 10 X spaces in each 8 Y spaces
			}
		}
	}
}

//make the world better

function checkGroundAppear() {
	for (let y=0; y<mapGroundList.length; y++) {
		for (let x=0; x<mapGroundList[0].length; x++) {
			let currTile = mapGroundList[y][x];
			if (perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]==4) {
				continue;
			}
			if (1==1) {
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
								//mapGroundList[y][x]==biomeTiles[perChunkWorld[Math.floor(y/8)][Math.floor(x/10)]][4];
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
}

checkGroundAppear();

/* mapGroundList = [
    [0 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 2 ,6 , 7, 7, 7, 7, 7, 7, 7, 7, 8],
    [16, 17, 17, 17, 17, 17, 17, 17, 17, 18,22,23,23,23,23,23,23,23,23,24],
    [16, 17, 17, 17, 17, 17, 17, 17, 17, 18,22,23,23,23,23,23,23,23,23,24],
    [16, 17, 17, 17, 17, 17, 17, 17, 17, 18,22,23,23,23,23,23,23,23,23,24],
    [16, 17, 17, 17, 17, 17, 17, 17, 17, 18,22,23,23,23,23,23,23,23,23,24],
    [16, 17, 17, 17, 17, 17, 17, 17, 17, 18,22,23,23,23,23,23,23,23,23,24],
    [16, 17, 17, 17, 17, 17, 17, 17, 17, 18,22,23,23,23,23,23,23,23,23,24],
    [32, 33, 33, 33, 33, 33, 33, 33, 33, 34,38,39,39,39,39,39,39,39,39,40],
	[3 , 4 , 4 , 4 , 4 , 4 , 4 , 4 , 4 , 5 , 9,10,10,10,10,10,10,10,10,11],
    [19, 20, 20, 20, 20, 20, 20, 20, 20, 21,25,26,26,26,26,26,26,26,26,27],
    [19, 20, 20, 20, 20, 20, 20, 20, 20, 21,25,26,26,26,26,26,26,26,26,27],
    [19, 20, 20, 20, 20, 20, 20, 20, 20, 21,25,26,26,26,26,26,26,26,26,27],
    [19, 20, 20, 20, 20, 20, 20, 20, 20, 21,25,26,26,26,26,26,26,26,26,27],
    [19, 20, 20, 20, 20, 20, 20, 20, 20, 21,25,26,26,26,26,26,26,26,26,27],
    [19, 20, 20, 20, 20, 20, 20, 20, 20, 21,25,26,26,26,26,26,26,26,26,27],
    [35, 36, 36, 36, 36, 36, 36, 36, 36, 37,41,42,42,42,42,42,42,42,42,43]
]; //a pretty basic map to test tiles position */

//creates flowers in the ground
for (let y=0; y<mapGroundList.length; y++) { //the world is better now
	for (let x=0; x<mapGroundList[0].length; x++) {
		let detailsOnGround = Math.round(Math.random()*4);
		if (detailsOnGround==0) {
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

console.log(`Map Y List ${mapGroundList.length} per block: 8`);
console.log(`Map X List ${mapGroundList[0].length} per block: 10`)

let mapObjList = []; //the most inneficient way to add objects to your world

let tileset = {
    dungeons : new Image(),
	overworld : new Image(),
	overworld_obj : new Image()
};

function generateWorldObj() {
	mapObjList = [];
	
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
}

generateWorldObj();

//type of tileset
tileset["dungeons"].src = "assets/tileset/dungeons/dungeons_t.png";
tileset["overworld"].src = "assets/tileset/overworld/overworld_t_g.png";
tileset["overworld_obj"].src = "assets/tileset/overworld/overworld_t_obj.png";
let linkSpr = new Image();
linkSpr.src = "assets/linksprtest.png";

let hudImg = new Image();
hudImg.src = "assets/hud/weaponHud.png";

tileset[tileset2use].onload = () => {
    gameLoop(); //only starts the game when the image load
};

let tilesetImgW = (tileset[tileset2use].naturalWidth/16);
let tilesetImgH = (tileset[tileset2use].naturalHeight/16); //for future calculations

let playerProp = {
    x : 0, //player X
    y : 0, //player Y
	sclx : sprSize-((sprSize/basesprSize)*8),
	scly : sprSize-((sprSize/basesprSize)*8)+16,
    direction: 0, //player direction
    frame: 0, //player animation actual frame
    fTimer: 0, //player frame timer
    fDelay: 8, //time during a frame and another
	totalF: 2 //frames for animation
}

let tileAnim = {
	fTimer : 0,
	frame : 0,
	fDelay : 16,
	totalF : 4,
}

playerProp.sclxP = ((sprSize/basesprSize)*4);
playerProp.sclyP = ((sprSize/basesprSize)*4);

let camera = {
	x : 0,
	y : 0,
	offsetX : 0,
	offsetY : 0
}

let moveX = 0;
let moveY = 0;

const keys={};
const keyPr={};

let selItem = {
	A : 0,
	B : 8
}

let frame = 0;

document.addEventListener("keydown", function(event) {
	keys[event.key]=true;
	keyPr[event.key]=true;
});

/* document.addEventListener("click", function(event) {
	musicList["titleScreen"].volume = 0.8;
	musicList["titleScreen"].play();
}, {once : true}); */

document.addEventListener("keyup", function(event) {
	keys[event.key]=false;
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

function checkCollisionWithObj(obj) {
	let dontcol = false;
	for(let y=0; y<mapObjList.length; y++) {
		for (let x=0; x<mapObjList[0].length; x++) {
			dontcol=false;
			const tile = mapObjList[y][x];
			
			for (i=0; i<specialTiles[0].length; i++) {
				if (mapObjList[y][x]==specialTiles[0][i]) {
					dontcol=true;
				}
			}
			
			if (dontcol==false) {
				const tileX = (x*sprSize) + camera.x - (camera.offsetX * (10*sprSize));
				const tileY = (y*sprSize) + camera.y - (camera.offsetY * (8*sprSize));
			
				if (checkCollisionInTiles(obj, tileX, sprSize, tileY, sprSize)) {
					return true;
				}
			}
		}
	}
	
	return false;
}
const plyspeed = (sprSize/basesprSize);
let playerInListXPos = 0;
let playerInListYPos = 0;

function exportObjMap() {
	// Convert mapList array into a string
	let mapData = mapObjList.map(row => row.join(",")).join("\n");
	  
	// Create a Blob object
	let blob = new Blob([mapData], { type: "text/plain" });
	  
	// Create a URL for the Blob
	let url = URL.createObjectURL(blob);
	  
	// Create a link element
	let a = document.createElement("a");
	a.href = url;
	a.download = "worldObjData.dat";
	  
	a.click();
	  
	URL.revokeObjectURL(url);
	  
	mapData = mapGroundList.map(row => row.join(",")).join("\n");
	  
	// Create a Blob object
	blob = new Blob([mapData], { type: "text/plain" });
	  
	// Create a URL for the Blob
	url = URL.createObjectURL(blob);
	  
	// Create a link element
	a = document.createElement("a");
	a.href = url;
	a.download = "worldGrdData.dat";
	  
	// Programmatically click the link to trigger the download
	a.click();
	  
	// Clean up the URL object
	URL.revokeObjectURL(url);
}

const exportButton = document.createElement("button");
exportButton.textContent = "Export Objects Map List";
exportButton.onclick = exportObjMap;
document.body.appendChild(exportButton);

function _update(deltaTime) {
	let deltaX = 0;
	let deltaY = 0;
	
	if(keys["d"]) {controls.right=true} else {controls.right=false};
	if(keys["s"]) {controls.down=true} else {controls.down=false};
	if(keys["w"]) {controls.up=true} else {controls.up=false};
	if(keys["a"]) {controls.left=true} else {controls.left=false};
	
	
	if (!transiting) {
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
			//if (mapObjList[playerInListYPos][playerInListXPos]==256) {
			//for (let i=0; i<biomeTiles)
			//if (mapGroundList[playerInListXPos][playerInListYPos])
				mapObjList[playerInListYPos][playerInListXPos] = selectedBlock;
			//}
		}
		
		playerProp.x+=deltaX;
		if (checkCollisionWithObj(playerProp)) {
			playerProp.x -= deltaX;
		}
		
		playerProp.y+=deltaY;
		if (checkCollisionWithObj(playerProp)) {
			playerProp.y-=deltaY;
		}
		
		
		//animation code is here
		if (moveX!==0 || moveY!==0) {
			playerProp.fTimer++;
			if (playerProp.fTimer >= playerProp.fDelay) {
				playerProp.frame = (playerProp.frame + 1) % playerProp.totalF;
				playerProp.fTimer = 0;
			}
		} else {
			playerProp.frame=0;
			playerProp.fTimer=0;
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
		if (((camera.offsetX)*8)*2<=mapGroundList[0].length) {
			transiting = true;
			transSide.right = true;
		}
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
	if (linkSpr.complete) {
		ctx.drawImage(linkSpr, playerProp.direction*basesprSize, playerProp.frame*basesprSize, basesprSize, basesprSize, playerProp.x, playerProp.y, sprSize, sprSize);
		//ctx.fillRect(playerProp.sclxP+playerProp.x, playerProp.sclyP+playerProp.y, playerProp.sclx, playerProp.scly); //this is for link's collision your dumbass
		//ctx.fillRect(playerProp.sclxP+playerProp.x, playerProp.sclyP+playerProp.y, playerProp.sclx, playerProp.scly/2); //this is for visible drawing your dumbass
	}
}

function drawHud() {
	if (hudImg.complete) {
		//main A and B buttons
		ctx.drawImage(hudImg, 0, 0, basesprSize*2+1, basesprSize, sprSize/basesprSize, 512, sprSize*2, sprSize);
		ctx.drawImage(hudImg, selItem.A*(basesprSize/2), basesprSize, basesprSize/2, basesprSize, ((sprSize/basesprSize)+basesprSize*2)-(sprSize/basesprSize), 512, sprSize/2, sprSize)
		ctx.drawImage(hudImg, (basesprSize*2)+1, 0, basesprSize*2+1, basesprSize, (sprSize/basesprSize+sprSize*2)+7*4, 512, sprSize*2, sprSize);
		ctx.drawImage(hudImg, selItem.B*(basesprSize/2), basesprSize, basesprSize/2, basesprSize, (((sprSize/basesprSize+sprSize*2)+7*4)+basesprSize*2)-(sprSize/basesprSize), 512, sprSize/2, sprSize)
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
		let playerDraw = false;
        for (let y = 0; y < mapGroundList.length; y++) { //optomize the map draw, his length is too big to be drawed entirelly
			//if((camera.offsetY*8)*2<=mapGroundList.length) {
				if (!devMode.on || devMode.on && !devMode.hideGrnd) {
					for (let x = 0; x < mapGroundList[y].length; x++) {
						if ((y * sprSize)+camera.y-(camera.offsetY*(8*sprSize))<768 || (x * sprSize)+camera.x-(camera.offsetX*(10*sprSize))<896) {
							let tile = mapGroundList[y][x];
							tilesetImgW = (tileset[tileset2use].naturalWidth/16);
							tilesetImgH = (tileset[tileset2use].naturalHeight/16);
							imgX = tile % tilesetImgW; // Compute horizontal frame
							imgY = Math.floor(tile / tilesetImgW); // Compute vertical frame
							if ((x * sprSize)+camera.x-(camera.offsetX*(10*sprSize))>=-sprSize || (x * sprSize)+camera.x-(camera.offsetX*(10*sprSize))<=sprSize*11 || (y * sprSize)+camera.y-(camera.offsetY*(8*sprSize))>=-sprSize || (y * sprSize)+camera.y-(camera.offsetY*(8*sprSize))<=sprSize*11) {
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
									(x * sprSize)+camera.x-(camera.offsetX*(10*sprSize)),
									(y * sprSize)+camera.y-(camera.offsetY*(8*sprSize)), 
									sprSize, sprSize);
							}
							/* if (checkCollisionInTiles(playerProp, (x * sprSize)+camera.x-(camera.offsetX*(10*sprSize)), sprSize, (y * sprSize)+camera.y-(camera.offsetY*(8*sprSize)), sprSize)) {
								ctx.globalAlpha = 0.5;
								ctx.fillRect((x * sprSize)+camera.x-(camera.offsetX*(10*sprSize)),(y * sprSize)+camera.y-(camera.offsetY*(8*sprSize)), sprSize, sprSize);
								ctx.globalAlpha = 1;
							} */
						} else {
							break;
						}
					}
				}
				if (!devMode.on || devMode.on && !devMode.hideObj) {
					for (let x = 0; x < mapObjList[y].length; x++) {
						if ((y * sprSize)+camera.y-(camera.offsetY*(8*sprSize))<768 || (x * sprSize)+camera.x-(camera.offsetX*(10*sprSize))<896) {
							let tile = mapObjList[y][x];
							tilesetImgW = (tileset["overworld_obj"].naturalWidth/16);
							tilesetImgH = (tileset["overworld_obj"].naturalHeight/16);
							imgX = tile % 16; // Compute horizontal frame
							imgY = Math.floor(tile / 16); // Compute vertical frame
							if ((x * sprSize)+camera.x-(camera.offsetX*(10*sprSize))>=-sprSize || (x * sprSize)+camera.x-(camera.offsetX*(10*sprSize))<=sprSize*11 || (y * sprSize)+camera.y-(camera.offsetY*(8*sprSize))>=-sprSize || (y * sprSize)+camera.y-(camera.offsetY*(8*sprSize))<=sprSize*11) {
								/* if (tile!=256) {
									if ((y * sprSize)+camera.y-(camera.offsetY*(8*sprSize))<playerProp.sclyP+playerProp.y+(playerProp.scly/2)) {
										drawPlayer();
										playerDraw=true;
									}
								} */
								//if (tile!=256) {
									ctx.drawImage(
									tileset["overworld_obj"],
									imgX * basesprSize,
									imgY * basesprSize,
									basesprSize,
									basesprSize,
									(x * sprSize)+camera.x-(camera.offsetX*(10*sprSize)),
									(y * sprSize)+camera.y-(camera.offsetY*(8*sprSize)), 
									sprSize, sprSize);
								//}
							}
							if (devMode.on && devMode.linkColl) {
								if (checkCollisionInTiles(playerProp, (x * sprSize)+camera.x-(camera.offsetX*(10*sprSize)), sprSize, (y * sprSize)+camera.y-(camera.offsetY*(8*sprSize)), sprSize)) {
									ctx.globalAlpha = 0.5;
									ctx.fillRect((x * sprSize)+camera.x-(camera.offsetX*(10*sprSize)),(y * sprSize)+camera.y-(camera.offsetY*(8*sprSize)), sprSize, sprSize);
									ctx.globalAlpha = 1;
								}
							}
						} else {
							break;
						}
					}
				}
				if (playerDraw==false) {
					drawPlayer();
				}
			//}
		}
    }
}

function _draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height); //it cleans the screen
	ctx.fillStyle = "#ffffff";
	drawScene();
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
	}
}
