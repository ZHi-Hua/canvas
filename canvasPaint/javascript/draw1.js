//画布
var canvas ;
var context ;
//蒙版
var canvas_bak;
var context_bak;

var canvasWidth = 1800;
var canvasHeight = 600;

var canvasTop;
var canvasLeft;

//画笔大小
var size = 1;
var color  = '#000000';

//画图形
var draw_graph = function(graphType,obj){	

	//把蒙版放于画板上面
	$("#canvas_bak").css("z-index",1);
	//先画在蒙版上 再复制到画布上
		
	/*chooseImg(obj);	*/
	var canDraw = false;

	var startX;
	var startY;

	//鼠标按下获取 开始xy开始画图
	var mousedown = function(e){
		scroolTop = $(window).scrollTop();
		scroolLeft = $(window).scrollLeft();
		canvasTop = $(canvas).offset().top - scroolTop;
		canvasLeft = $(canvas).offset().left - scroolLeft;

		context.strokeStyle= color;
		context_bak.strokeStyle= color;
		context_bak.lineWidth = size;

		startX = e.clientX - canvasLeft;
		startY = e.clientY - canvasTop;
		context_bak.moveTo(startX ,startY );
		canDraw = true;

		if(graphType == 'pencil'){
			context_bak.beginPath();
		}else if(graphType == 'eraser'){
			context.clearRect(startX - size * 10 ,  startY - size * 10 , size * 20 , size * 20);				
		}else if(graphType == 'fillText'){
			if(document.getElementsByTagName('textarea').length==0){
				addTextArea(e.clientX, e.clientY,e);
			}

			/*var textArea = "<textarea id='text' placeholder='填写文本' style='position:absolute;" +
				""+
				"'></textarea>";
			e.container.style.cursor = "pointer";
			document.getElementById("textarea").innerHTML=textArea;*/
			//e.focus(e.clientX-canvasLeft,e.clientY-canvasTop);
		}
		// 阻止点击时的cursor的变化，draw
		e=e||window.event;
		e.preventDefault();
	};	

	//鼠标离开 把蒙版canvas的图片生成到canvas中
	var mouseup = function(e){
		e=e||window.event;
		canDraw = false;
		var image = new Image();
	/*	if(graphType=='fillText'){
			handleEnter(e)
		}*/
		if(graphType!='eraser'){
			image.src = canvas_bak.toDataURL();
			image.onload = function(){
				context.drawImage(image , 0 ,0 , image.width , image.height , 0 ,0 , canvasWidth , canvasHeight);
				clearContext();
				saveImageToAry();
			}
			// 遗留的小尾巴
			// var x = e.clientX   - canvasLeft;
			// var y = e.clientY  - canvasTop;	
			// context.beginPath();
			// context.moveTo(x ,y );
			// context.lineTo(x +2 ,y+2);
			// context.stroke();	
		}
	};

	// 鼠标移动
	var  mousemove = function(e){
		scroolTop = $(window).scrollTop();
		scroolLeft = $(window).scrollLeft();
		canvasTop = $(canvas).offset().top - scroolTop;
		canvasLeft = $(canvas).offset().left - scroolLeft;
		e=e||window.event;
		var x = e.clientX   - canvasLeft;
		var y = e.clientY  - canvasTop;	
		//方块  4条直线搞定
		if(graphType == 'square'){
			if(canDraw){
				context_bak.beginPath();
				clearContext();
				context_bak.moveTo(startX , startY);
				/*context_bak.lineTo(x  ,startY );
				context_bak.lineTo(x  ,y );
				context_bak.lineTo(startX  ,y );
				context_bak.lineTo(startX  ,startY );*/
				context_bak.rect(startX,startY,x-startX,y-startY);
				context_bak.stroke();
			}
		//直线
		}else if(graphType =='line'){						
			if(canDraw){
				context_bak.beginPath();
				clearContext();
				context_bak.moveTo(startX , startY);
				context_bak.lineTo(x  ,y );
				context_bak.stroke();
			}
		//画笔
		}else if(graphType == 'pencil'){
			if(canDraw){
				context_bak.lineTo(e.clientX   - canvasLeft ,e.clientY  - canvasTop);
				context_bak.stroke();						
			}
		//圆 未画得时候 出现一个小圆
		}else if(graphType == 'circle'){						
			clearContext();
			if(canDraw){
				// 鼠标点击移动时产生的圆
				context_bak.beginPath();
				var radius = Math.sqrt((startX - x) *  (startX - x)  + (startY - y) * (startY - y));
				context_bak.arc(startX,startY,radius,0,Math.PI * 2,false);
				context_bak.stroke();
			}else{
				context_bak.beginPath();
				context_bak.arc(x,y,20,0,Math.PI * 2,false);
				context_bak.stroke();
			}
		//涂鸦 未画得时候 出现一个小圆
		}else if(graphType == 'handwriting'){											
			if(canDraw){
				// 鼠标点击移动产生的圆圈
				context_bak.beginPath();	
				context_bak.strokeStyle = color;
				context_bak.fillStyle  = color;
				context_bak.arc(x,y,size*10,0,Math.PI * 2,false);		
				context_bak.fill();
				context_bak.stroke();
				context_bak.restore();
			}else{	
				clearContext();
				context_bak.beginPath();		
				context_bak.strokeStyle = color;			
				context_bak.fillStyle  = color;
				context_bak.arc(x,y,size*10,0,Math.PI * 2,false);
				context_bak.fill();
				context_bak.stroke();
			}
		//橡皮擦 不管有没有在画都出现小方块 按下鼠标 开始清空区域
		}else if(graphType == 'eraser'){
			context_bak.lineWidth = 1;
			clearContext();
			context_bak.beginPath();			
			context_bak.strokeStyle =  '#000000';						
			context_bak.moveTo(x - size * 10 ,  y - size * 10 );						
			context_bak.lineTo(x + size * 10  , y - size * 10 );
			context_bak.lineTo(x + size * 10  , y + size * 10 );
			context_bak.lineTo(x - size * 10  , y + size * 10 );
			context_bak.lineTo(x - size * 10  , y - size * 10 );	
			context_bak.stroke();		
			if(canDraw){
				context.clearRect(x - size * 10 ,  y - size * 10 , size * 20 , size * 20);
			}			
		}else if(graphType == 'ellipse'){
			//椭圆
			clearContext();
			if(canDraw){
				// 鼠标点击移动时产生的椭圆
				context_bak.beginPath();
				context_bak.ellipse(startX,startY,x-startX,y-startY,0,0,Math.PI * 2,false);
				context_bak.stroke();
			}else{
				context_bak.beginPath();
				context_bak.ellipse(x,y,20,10,0,0,Math.PI * 2,false);
				context_bak.stroke();
			}
		}
	};


	//鼠标离开区域以外 除了涂鸦 都清空
	var mouseout = function(){
		if(graphType != 'handwriting'){
			clearContext();
		}
	}

	$(canvas_bak).unbind();
	$(canvas_bak).bind('mousedown',mousedown);
	$(canvas_bak).bind('mousemove',mousemove);
	$(canvas_bak).bind('mouseup',mouseup);
	$(canvas_bak).bind('mouseout',mouseout);
}


//清空层
var clearContext = function(type){
	if(!type){
		context_bak.clearRect(0,0,canvasWidth,canvasHeight);
	}else{
		context.clearRect(0,0,canvasWidth,canvasHeight);
		context_bak.clearRect(0,0,canvasWidth,canvasHeight);
	}
}


var fillText = function (text,x,y) {
	//绘制文本
	context_bak.beginPath();
	context_bak.fillText(text,x,y);
	context_bak.stroke();
}

function addTextArea(x, y,e) {
	var input = document.createElement('textarea');
	input.type = 'text';
	input.style.position = 'fixed';
	input.style.left = x + 'px';
	input.style.top = y + 'px';
	input.onmouseup = handleEnter;
	document.body.appendChild(input);
	input.focus();
}

function handleEnter(e) {
	var keyCode = e.keyCode;
	if (keyCode === 13) {
		fillText(this.value, e.clientX - canvasLeft,e.clientY - canvasTop);
		document.body.removeChild(this);
		hasInput = false;
	}
}
