var canvas = null;
var ctx = null;
var spritesheet = null;
var spritesheetLoaded = false;

// Mundo em grid: array 2d
var world = [[]];

// tamanho do mundo nos sprites
var worldWidth = 16;
var worldHeight = 16;

// tamanho de cada quadro do sprite em pixels
var tileWidth = 32;
var tileHeight = 32;

// o inicio e o fim do path
var pathStart = [worldWidth,worldHeight];
var pathEnd = [0,0];
var currentPath = [];
var caminho = true;
var primeira =true;


if (typeof console == "undefined") var console = { log: function() {} };


function onload()
{


    if (primeira) {
        console.log('Page loaded.');
        canvas = document.getElementById('gameCanvas');
        canvas.width = worldWidth * tileWidth;
        canvas.height = worldHeight * tileHeight;
        ctx = canvas.getContext("2d");
        spritesheet = new Image();
        spritesheet.src = '../assets/image/spritesheet.png';
        primeira = false
        spritesheet.onload = loaded;
    }

    if (caminho) {
        canvas.removeEventListener('click', rock, false);
        canvas.addEventListener("click", canvasClick, false);
    } else {
        canvas.removeEventListener('click', canvasClick, false);
        canvas.addEventListener("click", rock, false);
    }
}

// quando estiver tudo certo com os sprites
function loaded()
{
  console.log('Spritesheet loaded.');
  spritesheetLoaded = true;
  createWorld();
}

// criar mundo
function createWorld()
{
  console.log('Creating world...');

  // create emptiness
  for (var x=0; x < worldWidth; x++)
  {
    world[x] = [];

    for (var y=0; y < worldHeight; y++)
    {
      world[x][y] = 0;
    }
  }

  redraw();

}

function redraw()
{
  if (!spritesheetLoaded) return;

    console.log('redrawing...');

    var spriteNum = 0;

    // clear the screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var x=0; x < worldWidth; x++)
    {
        for (var y=0; y < worldHeight; y++)
        {
        // choose a sprite to draw
        switch(world[x][y])
        {
            case 1:
            spriteNum = 1;
            break;
            default:
            spriteNum = 0;
            break;
        }

        // draw it
        // ctx.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
        ctx.drawImage(spritesheet,
            spriteNum*tileWidth, 0,
            tileWidth, tileHeight,
        x*tileWidth, y*tileHeight,
          tileWidth, tileHeight);
        }
    }

    // draw the path
    console.log('Current path length: '+currentPath.length);
    for (rp=0; rp<currentPath.length; rp++)
    {
        switch(rp)
        {
            case 0:
            spriteNum = 2; // start
            break;
            case currentPath.length-1:
            spriteNum = 3; // end
            break;
            default:
            spriteNum = 4; // path node
            break;
        }

        ctx.drawImage(spritesheet,
            spriteNum*tileWidth, 0,
            tileWidth, tileHeight,
            currentPath[rp][0]*tileWidth,
            currentPath[rp][1]*tileHeight,
            tileWidth, tileHeight);
    }
}

// evento de click que colooca inicio do pathfinding
function canvasClick(e)
{
  var x;
  var y;

  if (e.pageX != undefined && e.pageY != undefined)
  {
    x = e.pageX;
    y = e.pageY;
  }
  else
  {
    x = e.clientX + document.body.scrollLeft +
      document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop +
      document.documentElement.scrollTop;
  }

  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  var cell =
      [
        Math.floor(x/tileWidth),
        Math.floor(y/tileHeight)
      ];
  console.log('we clicked tile '+cell[0]+','+cell[1]);

  pathStart = pathEnd;
  pathEnd = cell;

  // calcular o path
  currentPath = findPath(world,pathStart,pathEnd);
  redraw();
}


function findPath(world, pathStart, pathEnd)
{
    var abs = Math.abs;
    var max = Math.max;
    var pow = Math.pow;
    var sqrt = Math.sqrt;

    var maxWalkableTileNum = 0;

    var worldWidth = world[0].length;
    var worldHeight = world.length;

    var worldSize = worldWidth * worldHeight;
    var distanceFunction = ManhattanDistance;
    var findNeighbours = function(){};

    function ManhattanDistance(Point, Goal)
    {
        return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
    }

    function DiagonalDistance(Point, Goal)
    {
        return max(abs(Point.x - Goal.x), abs(Point.y - Goal.y));
    }

    function EuclideanDistance(Point, Goal)
    {
        return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
    }

    function Neighbours(x, y)
    {
        var N = y - 1,
        S = y + 1,
        E = x + 1,
        W = x - 1,
        myN = N > -1 && canWalkHere(x, N),
        myS = S < worldHeight && canWalkHere(x, S),
        myE = E < worldWidth && canWalkHere(E, y),
        myW = W > -1 && canWalkHere(W, y),
        result = [];
        if(myN)
        result.push({x:x, y:N});
        if(myE)
        result.push({x:E, y:y});
        if(myS)
        result.push({x:x, y:S});
        if(myW)
        result.push({x:W, y:y});
        findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
        return result;
    }

    function DiagonalNeighbours(myN, myS, myE, myW, N, S, E, W, result)
    {
        if(myN)
        {
            if(myE && canWalkHere(E, N))
            result.push({x:E, y:N});
            if(myW && canWalkHere(W, N))
            result.push({x:W, y:N});
        }
        if(myS)
        {
            if(myE && canWalkHere(E, S))
            result.push({x:E, y:S});
            if(myW && canWalkHere(W, S))
            result.push({x:W, y:S});
        }
    }

    function DiagonalNeighboursFree(myN, myS, myE, myW, N, S, E, W, result)
    {
        myN = N > -1;
        myS = S < worldHeight;
        myE = E < worldWidth;
        myW = W > -1;
        if(myE)
        {
            if(myN && canWalkHere(E, N))
            result.push({x:E, y:N});
            if(myS && canWalkHere(E, S))
            result.push({x:E, y:S});
        }
        if(myW)
        {
            if(myN && canWalkHere(W, N))
            result.push({x:W, y:N});
            if(myS && canWalkHere(W, S))
            result.push({x:W, y:S});
        }
    }


    function canWalkHere(x, y)
    {
        return ((world[x] != null) &&
            (world[x][y] != null) &&
            (world[x][y] <= maxWalkableTileNum));
    }

    function Node(Parent, Point)
    {
        var newNode = {
            Parent:Parent,
            value:Point.x + (Point.y * worldWidth),
            x:Point.x,
            y:Point.y,
            f:0,
            g:0
        };

        return newNode;
    }

    function calculatePath()
    {
        var mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
        var mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});
        var AStar = new Array(worldSize);
        var Open = [mypathStart];
        var Closed = [];
        var result = [];
        var myNeighbours;
        var myNode;
        var myPath;
        var length, max, min, i, j;
        while(length = Open.length)
        {
            max = worldSize;
            min = -1;
            for(i = 0; i < length; i++)
            {
                if(Open[i].f < max)
                {
                    max = Open[i].f;
                    min = i;
                }
            }
            myNode = Open.splice(min, 1)[0];
            if(myNode.value === mypathEnd.value)
            {
                myPath = Closed[Closed.push(myNode) - 1];
                do
                {
                    result.push([myPath.x, myPath.y]);
                }
                while (myPath = myPath.Parent);
                AStar = Closed = Open = [];
                result.reverse();
            }
            else
            {
                myNeighbours = Neighbours(myNode.x, myNode.y);
                for(i = 0, j = myNeighbours.length; i < j; i++)
                {
                    myPath = Node(myNode, myNeighbours[i]);
                    if (!AStar[myPath.value])
                    {
                        myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
                        myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
                        Open.push(myPath);
                        AStar[myPath.value] = true;
                    }
                }
                Closed.push(myNode);
            }
        }
        return result;
    }
    return calculatePath();

}



function addRock() {
    var elem = document.getElementById("rock");
    if (elem.value=="Adicionar pedra") {
        elem.value = "Pathfinding";
        document.getElementById("imgRocha").style.display = "none";
        document.getElementById("imgPathfinding").style.display = "block";
        caminho = false;
        onload();

    } else {
        document.getElementById("imgRocha").style.display = "block";
        document.getElementById("imgPathfinding").style.display = "none";
        elem.value = "Adicionar pedra";
        caminho = true;
        onload();
    }
}



function rock(e) {
    console.log('rocks!!!!!');
    var x;
    var y;
    if (e.pageX != undefined && e.pageY != undefined)
    {
        x = e.pageX;
        y = e.pageY;
    }
    else
    {
        x = e.clientX + document.body.scrollLeft +
        document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop +
        document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    world[Math.floor(x/tileWidth)][Math.floor(y/tileHeight)] = 1;

    redraw();
}