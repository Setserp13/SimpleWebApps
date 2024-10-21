window.onload = () => { start(); update(); }

var road;
var canvas;
var mousePos;



var stroke = {
	alignment : 0.5,
	width : 50,
	vertices : []
}

//var lastMousePos = null;
//var lastMousemoveTime = 0;
//var mousemoveTime = 0;
var mouseMovementX = 0;


var time = 0;
var bestTime = 0;


function start()
{
	canvas = document.getElementById("canvas");

	stroke.vertices = createRoad(canvas);


	mousePos = { x: getX(stroke, canvas.height / 2), y: canvas.height / 2 };
	mouseMovementX = 0;

	canvas.addEventListener('mousemove', function(evt) {

		mouseMovementX = evt.movementX;
		//mousemoveTime++;
		/*var newMousePos = getMousePos(canvas, evt);
		if(lastMousePos == null) lastMousePos = newMousePos;
		mouseMovementX = Mathf.sgn(newMousePos.x - lastMousePos.x);
		lastMousePos = newMousePos;*/

    	//mousePos = getMousePos(canvas, evt);
    //console.log('Mouse position: ' + mousePos.x + ',' + mousePos.y);
  	}, false);


  	time = 0;
}

function update()
{
	time++;

	var context = canvas.getContext("2d");
	
	context.clearRect(0, 0, canvas.width, canvas.height);

	drawRoad(canvas, stroke.vertices);

	
	context.beginPath();
	context.fillStyle = '#000';
	context.arc(mousePos.x, canvas.height / 2, 3, 0, 2 * Math.PI);
	context.fill();

	
	/*if(lastMousemoveTime != mousemoveTime)
	{
		lastMousemoveTime = mousemoveTime;
	}
	else
	{
		mouseMovementX = 0;//mouse is not moving
	}*/
	mousePos.x += Mathf.sgn(mouseMovementX) * .75;

	var slice = getSlice(stroke, canvas.height / 2);
	if(slice != null)
	{
		if(mousePos.x - 1.5 < slice.min.x || mousePos.x + 1.5 > slice.max.x)
		{
			alert("You lost! Your time was " + time.toString());
			start();
			//console.log("out");
		}
		else
		{
			//console.log("in");
		}
	}


	stroke.vertices = updateRoad(stroke.vertices);

	window.requestAnimationFrame(update);
	//setInterval(update, 2000);//draw, 500);
}





const getMousePos = (canvas, evt) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y: ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
};



function getSlice(stroke, y)
{
	var alignment = stroke.alignment;
	var width = stroke.width;
	var vertices = stroke.vertices;
	var x = getX(stroke, y);
	if(x != null)
	{
		return { min : new Vector2(x - width * (1 - alignment), y), max : new Vector2(x + width * alignment, y) };
	}
	return null;
}

function getX(stroke, y)
{
	var alignment = stroke.alignment;
	var width = stroke.width;
	var vertices = stroke.vertices;
	for(var i = 0; i < vertices.length - 1; i++)
	{
		var t = inverseLerp(vertices[i][1], vertices[i + 1][1], y);
		if(contains(0, 1, t))
		{
			return Mathf.lerp(vertices[i][0], vertices[i + 1][0], t);
		}
	}
	return null;
}








function drawRoad(canvas, road)
{
	var alignment = stroke.alignment;
	var width = stroke.width;

	var vertices = [];

	var leftSide = [[0, canvas.height], [0, 0]];
	var rightSide = [[canvas.width, canvas.height], [canvas.width, 0]];

	for(var i = 0; i < road.length; i++)
	{
		vertices.splice(i, 0, 
			[road[i][0] - width * (1 - alignment), road[i][1]],
			[road[i][0] + width * alignment, road[i][1]]
			);

		leftSide.push([road[i][0] - width * (1 - alignment), road[i][1]]);
		rightSide.push([road[i][0] + width * alignment, road[i][1]]);
	}
	drawPolygon(canvas, vertices, '#fff');

	drawPolygon(canvas, leftSide, '#f00');
	drawPolygon(canvas, rightSide, '#00f');
	/*var ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.lineCap = "round";
	ctx.lineWidth = 10;
	for(var i = 0; i < road.length - 1; i++)
	{
		ctx.moveTo(road[i][0], road[i][1]);
		ctx.lineTo(road[i + 1][0], road[i + 1][1]);
		ctx.stroke();
	}*/
}

function createRoad(canvas)
{
	var count = 30;
	var result = [];
	var x = canvas.width / 2;
	var y = -10;
	for(var i = 0; i < count; i++)
	{
		result.push([x, y]);
		y += randomRange(50, 100);
		x = clamp(x + randomRange(-30, 30), 10, canvas.width - 10);
	}
	return result;
}

function updateRoad(road)
{
	var speed = 1;
	for(var i = 0; i < road.length; i++)
	{
		road[i][1] += speed;
	}

	if(road[1][1] > 0)
	{
		var y = road[0][1] -randomRange(10, 30);
		var x = clamp(road[0][0] + randomRange(-30, 30), 10, canvas.width - 10);
		road.unshift([x, y]);
	}
	if(road[road.length - 2][1] > canvas.height)
	{

		road.pop();
	}

	return road;
}


/*function drawRoad(canvas, road)
{
	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	for(var i = 0; i < road.length; i++)
	{
		ctx.moveTo(road[i], i);
		ctx.lineTo(road[i] + 10, i);
		ctx.stroke();
	}
}

function createRoad(canvas)
{
	var result = [];
	var x = canvas.width / 2;
	for(var i = 0; i < canvas.height; i++)
	{
		result.push(x);
		x = clamp(x + randomRange(-5, 5), 10, canvas.width - 10);
	}
	return result;
}

function updateRoad(road)
{
	road.pop();
	item = clamp(road[0] + randomRange(-5, 5), 10, canvas.width - 10);
	road.unshift(item);
	return road;
}*/

function drawPolygon(canvas, vertices, fillStyle)
{
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = fillStyle;
	ctx.beginPath();
	ctx.moveTo(vertices[0][0], vertices[0][1]);
	for(var i = 1; i < vertices.length; i++)
	{
		ctx.lineTo(vertices[i][0], vertices[i][1]);
	}
	ctx.closePath();
	ctx.fill();
}


function randomRange(min, max)
{
	return min + Math.random() * (max - min);
}

function clamp(value, min, max)
{
	if(value < min)
	{
		return min;
	}
	if(value > max)
	{
		return max;
	}
	return value;
}

class Vector2
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
  }

  static lerp(a, b, t)
  {
  	return new Vector2(Mathf.lerp(a.x, b.x, t), Mathf.lerp(a.y, b.y, t));
  }
}

class Mathf
{
	static lerp(a, b, t) { return a + t * (b - a); }

	static sgn(a)
	{
		if(a < 0)
		{
			return -1;
		}
		if(a > 0)
		{
			return 1;
		}
		return 0;
	}
}

function isLerp(a, b, value) { return contains(0, 1, inverseLerp(a, b, value)); }

function contains(min, max, value) { return min <= value && value <= max; }

function inverseLerp(a, b, value) { return (value - a) / (b - a); }




//shift() remove the first element from an array
//pop() remove the last element from an array
//unshift(item) add an item at the first position of the array
//push(item) add an item at the last position of the array