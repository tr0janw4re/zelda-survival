const canvas = document.getElementById("gamelmao");
canvas.width = 640;
canvas.height = 576;
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const projectProp = {
    verMajor : 0,
    verMinor : 0,
    verPatch : 1,
    verDescrp : "Endless Prototype"
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

let mapList = [
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [21, 127, 127, 127, 127, 127, 127, 127, 127, 23],
    [42, 43, 43, 43, 43, 43, 43, 43, 43, 44]
]; //a pretty basic map to test tiles position

let tileset = {
    dungeons : new Image(),
    overworld : new Image()
};
//type of tileset
tileset["dungeons"].src = "assets/tileset/dungeons_t.png";
tileset["overworld"].src = "assets/tileset/overworld_t.png";
let link = new Image();
link.src = "assets/linksprtest.png";

let tileset2use = "dungeons";

tileset[tileset2use].onload = () => {
    gameLoop(); //only starts the game when the image load
};

let tilesetImgW = (tileset[tileset2use].naturalWidth/16);
let tilesetImgH = (tileset[tileset2use].naturalHeight/16); //for future calculations

let playerProp = {
    x : 0,
    y : 0,
    direction: 0,
    frame: 0,
    fTimer: 0,
    fDelay: 8,
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

function _update(deltaTime) {
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
            playerProp.frame = (playerProp.frame + 1) % 2; // assume 2 frames de animação por direção
            playerProp.fTimer = 0;
        }
    } else {
        playerProp.frame=0;
        playerProp.fTimer=0;
    }

    if (playerProp.x%4!==0) {
        console.log("Invalid X position: "+playerProp.x);
    }
    if (playerProp.y%4!==0) {
        console.log("Invalid Y position: "+playerProp.y);
    }
}

function _draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height); //it cleans the screen
	if (tileset[tileset2use].complete) {
        for (let y = 0; y < mapList.length; y++) {
			for (let i = 0; i < mapList[y].length; i++) {
                //it gets what tile it need to draw
				let tile = mapList[y][i];
                if (tile==tilesetImgW*tilesetImgH) {
                    //if the tile corresponds with the last value of the screen
                    //it gets ignored
                    continue;
                }
                let imgX = 0;
                if (tile<125) { //it verifies if the tile is a wall, if it is, it change by the dungeon type
                    imgX = tile % tilesetImgW + (dungeonType*3); // Compute horizontal frame
                } else { //else, its just a ground tile
                    imgX = tile % tilesetImgW; // Compute horizontal frame
                }
				let imgY = Math.floor(tile / tilesetImgW); // Compute vertical frame
				ctx.drawImage(tileset[tileset2use],imgX * basesprSize,imgY * basesprSize,basesprSize, basesprSize,i * sprSize,y * sprSize, sprSize, sprSize);
			}
		}
    }
    ctx.drawImage(link, playerProp.direction*basesprSize, playerProp.frame*basesprSize, basesprSize, basesprSize, playerProp.x, playerProp.y, sprSize, sprSize);
    ctx.fillStyle = "#f8f8a8";
    ctx.fillRect(0, 512, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillText(playerProp.x, 0, 520);
    ctx.fillText(playerProp.y, 0, 530);
    ctx.fillText(playerProp.frame, 0, 540);
    ctx.fillText(playerProp.direction, 0, 550);
}