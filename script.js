const canvas = document.getElementById("gamelmao");
canvas.width = 640;
canvas.height = 576;
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const projectProp = {
    verMajor : 0,
    verMinor : 0,
    verPatch : 2,
    verDescrp : "More than Creator's Mind!"
}

//TODO: Add a Gameboy color on background behind the screen
//It makes the game looks more with the original Awakening

//TODO: Make layers for the tiles:
/*
    Layer render for them {
        1-Ground tiles
        2-Walls
        3-Ground Items
    }
    4-Dropped Items
    5-Entities (Enemies, Player, etc..)
*/

console.log("Zelda Survival (change name later)");
console.log("Version "+projectProp.verMajor+"."+projectProp.verMinor+"."+projectProp.verPatch+" - "+projectProp.verDescrp);

let basesprSize = 16;
let sprSize = 64;
let dungeonType = 0; //this definies what type of wall the dungeon needs to have
let tileset2use = "overworld";

window.history.pushState({}, '', '/new-url-text');

let transiting = false;
let transSide = {
	right : false,
	left : false,
	up : false,
	down : false
}

/* let mapList = [
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [42, 43, 43, 43, 43, 43, 43, 43, 43, 44]
]; //a pretty basic map to test tiles position */

//10 tiles of left to right
//8 tiles of up to down (not 9, the last is used for hud, which for some reason is also part of the map)

let mapList = [
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
]; //a pretty basic map to test tiles position

/* for (let y=0; y<16; y++) {
	for (let x=0; x<20; x++) {
		mapList[y][x] = Math.round(Math.random()*37);
	}
} */


let tileset = {
    dungeons : new Image(),
	overworld : new Image()
};

//type of tileset
tileset["dungeons"].src = "assets/tileset/dungeons_t.png";
tileset["overworld"].src = "assets/tileset/overworld_t.png";
let linkSpr = new Image();
linkSpr.src = "assets/linksprtest.png";

tileset[tileset2use].onload = () => {
    gameLoop(); //only starts the game when the image load
};

let tilesetImgW = (tileset[tileset2use].naturalWidth/16);
let tilesetImgH = (tileset[tileset2use].naturalHeight/16); //for future calculations

console.log(tilesetImgW);
console.log(tilesetImgH);

let playerProp = {
    x : 0, //player X
    y : 0, //player Y
	sclx : sprSize-((sprSize/basesprSize)*8),
	scly : sprSize-((sprSize/basesprSize)*8),
    direction: 0, //player direction
    frame: 0, //player animation actual frame
    fTimer: 0, //player frame timer
    fDelay: 8, //time during a frame and another
	totalF: 2 //frames for animation
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


let frame = 0;

document.addEventListener("keydown", function(event) {
	keys[event.key]=true;
	keyPr[event.key]=true;
});

document.addEventListener("keyup", function(event) {
	keys[event.key]=false;
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

function _update(deltaTime) {
	if (!transiting) {
		if(keys["d"] || keys["a"]) {moveX=1} else {moveX=0};
		if(keys["w"] || keys["s"]) {moveY=1} else {moveY=0};
		if(keys["d"]) {
			playerProp.x+=1*(sprSize/basesprSize);
			if (keys["s"]!=true && keys["w"]!=true && keys["a"]!=true) {
				playerProp.direction = 1;
			}
		}
		if(keys["a"]) {
			playerProp.x-=1*(sprSize/basesprSize);
			if (keys["s"]!=true && keys["w"]!=true && keys["d"]!=true) {
				playerProp.direction = 3;
			}
		}
		if(keys["w"]) {
			playerProp.y-=(1*(sprSize/basesprSize));
			if (keys["s"]!=true && keys["a"]!=true && keys["d"]!=true) {
				playerProp.direction = 2;
			}
		}
		if(keys["s"]) {
			playerProp.y+=1*(sprSize/basesprSize);
			if (keys["w"]!=true && keys["a"]!=true && keys["d"]!=true) {
				playerProp.direction = 0;
			}
		}

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
	//Player map change
	if (playerProp.y+playerProp.scly+((sprSize/basesprSize)*4)>=512 && transiting==false) {
		if (((camera.offsetY+1)*8)*2<=mapList.length) {
			transiting = true;
			transSide.down = true;
		}
	}if (playerProp.y+((sprSize/basesprSize)*4)<=0 && transiting==false) {
		if (camera.offsetY>0) {
			transiting = true;
			transSide.up = true;
		}
	}if ((playerProp.x+((sprSize/basesprSize)*4))+playerProp.sclx>=640 && transiting==false) {
		if (((camera.offsetX+1)*8)*2<=mapList[0].length) {
			transiting = true;
			transSide.right = true;
		}
	}if (playerProp.x+((sprSize/basesprSize)*4)<=0 && transiting==false) {
		if (camera.offsetX>0) {
			transiting = true;
			transSide.left = true;
		}
	}
}



function drawScene(){
	if (tileset[tileset2use].complete) {
		//BUG FIX GUYS!!1!
		let imgX = 0;
		let imgY = 0;
        for (let y = 0; y < mapList.length; y++) { //optomize the map draw, his lenght is too big to be drawed entirelly
			//if((camera.offsetY*8)*2<=mapList.length) {
				for (let x = 0; x < mapList[y].length; x++) {
						let tile = mapList[y][x];
						tilesetImgW = (tileset[tileset2use].naturalWidth/16);
						tilesetImgH = (tileset[tileset2use].naturalHeight/16);
						imgX = tile % tilesetImgW; // Compute horizontal frame
						imgY = Math.floor(tile / tilesetImgW); // Compute vertical frame
						if ((x * sprSize)+camera.x-(camera.offsetX*(10*sprSize))>=-sprSize || (x * sprSize)+camera.x-(camera.offsetX*(10*sprSize))<=sprSize*11 || (y * sprSize)+camera.y-(camera.offsetY*(8*sprSize))>=-sprSize || (y * sprSize)+camera.y-(camera.offsetY*(8*sprSize))<=sprSize*11) {
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
						if (checkCollisionInTiles(playerProp, (x * sprSize)+camera.x-(camera.offsetX*(10*sprSize)), sprSize, (y * sprSize)+camera.y-(camera.offsetY*(8*sprSize)), sprSize)) {
							ctx.globalAlpha = 0.5;
							ctx.fillRect((x * sprSize)+camera.x-(camera.offsetX*(10*sprSize)),(y * sprSize)+camera.y-(camera.offsetY*(8*sprSize)), sprSize, sprSize);
							ctx.globalAlpha = 1;
						}
				}
			//}
		}
    }
}

function _draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height); //it cleans the screen
	ctx.fillStyle = "#ffffff";
	drawScene();
	
	if (linkSpr.complete) {
		ctx.drawImage(linkSpr, playerProp.direction*basesprSize, playerProp.frame*basesprSize, basesprSize, basesprSize, playerProp.x, playerProp.y, sprSize, sprSize);
		ctx.fillRect(playerProp.sclxP+playerProp.x, playerProp.sclyP+playerProp.y, playerProp.sclx, playerProp.scly);
	}
	//the hud is behind the player for some reason
	//remember to move it back after the tests
	ctx.fillStyle = "#FFFF8C";
    ctx.fillRect(0, 512, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillText(playerProp.x, 0, 520);
    ctx.fillText(playerProp.y, 0, 530);
    ctx.fillText(playerProp.frame, 0, 540);
    ctx.fillText(playerProp.direction, 0, 550);
	ctx.fillText(playerProp.sclx+playerProp.x, 0, 560);
}
