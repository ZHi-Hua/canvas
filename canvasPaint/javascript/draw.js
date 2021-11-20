//画布
var canvas ;
var context ;
//蒙版
var canvas_bak;
var context_bak;
//画布宽度
var canvasWidth = 750;
//画布高度
var canvasHeight = 450;

var canvasTop;
var canvasLeft;

//画笔大小
var size = 1;
//画布颜色
var color  = '#000000';
//画布填充颜色
var fillColor = 'transparent';
//画图形
var draw_graph = function(graphType,obj){

    //把蒙版放于画板上面
    $("#canvas_bak").css("z-index",1);
    //先画在蒙版上 再复制到画布上

    /*chooseImg(obj);	*/
    var canDraw = false;

    var startX;
    var startY;
    var brush = new Brush();
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
            //context_bak.beginPath();
            brush.beginStroke({startX:startX,startY:startY});
        }else if(graphType == 'eraser'){
            context.clearRect(startX - size * 10 ,  startY - size * 10 , size * 20 , size * 20);
        }else if(graphType == 'fillText'){
            if(document.getElementsByTagName('textarea').length==0){
                fontSize = '14px';
                fontFamily = '宋体';
                font = fontSize + ' ' + fontFamily;
                context_bak.font = font;
                context.font = font;
                //填充颜色
                context.fillStyle = color;
                context_bak.fillStyle = color;
                //addTextArea(e);
                textarea = new Textarea({
                    x:e.clientX,
                    y:e.clientY,
                    fill:color,
                    fs:fontSize,
                    startX:startX,
                    startY:startY,
                });
                textarea.addTextArea();
            }
        }
        // 阻止点击时的cursor的变化，draw
        e=e||window.event;
        e.preventDefault();
    };

    //鼠标离开 把蒙版canvas的图片生成到canvas中
    var mouseup = function(e){
        e=e||window.event;
        canDraw = false;
        if(graphType!='eraser') {
            var image = new Image();
            image.src = canvas_bak.toDataURL();
            image.onload = function () {
                context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvasWidth, canvasHeight);
                clearContext();
                saveHistory();
            }
        }
        if(graphType=='pencil'){
            /*brush.upEvent(e);*/
        }
    };

    // 鼠标移动
    var  mousemove = function(e){
        scroolTop = $(window).scrollTop();
        scroolLeft = $(window).scrollLeft();
        canvasTop = $(canvas).offset().top - scroolTop;
        canvasLeft = $(canvas).offset().left - scroolLeft;
        e=e||window.event;
        var x = e.clientX - canvasLeft;
        var y = e.clientY - canvasTop;
        if(graphType!='fillText'){
            //填充颜色
            context.fillStyle = fillColor;
            context_bak.fillStyle = fillColor;
        }

        //方块  4条直线搞定
        if(graphType == 'square'){
            if(canDraw){
                context_bak.beginPath();
                clearContext();
                context_bak.moveTo(startX , startY);
                context_bak.rect(startX,startY,x-startX,y-startY);
                context_bak.fill();
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
                /*context_bak.lineTo(e.clientX   - canvasLeft ,e.clientY  - canvasTop);
                context_bak.stroke();*/
                brush.moveStroke({x:x,y:y});
            }
            //圆 未画得时候 出现一个小圆
        }else if(graphType == 'circle'){
            clearContext();
            if(canDraw){
                // 鼠标点击移动时产生的圆
                context_bak.beginPath();
                var radius = Math.sqrt((startX - x) *  (startX - x)  + (startY - y) * (startY - y));
                context_bak.arc(startX,startY,radius,0,Math.PI * 2,false);
                context_bak.fill();
                context_bak.stroke();
            }else{
                context_bak.beginPath();
                context_bak.arc(x,y,20,0,Math.PI * 2,false);
                context_bak.fill();
                context_bak.stroke();
            }
            //涂鸦 未画得时候 出现一个小圆
        }else if(graphType == 'handwriting'){
            if(canDraw){
                // 鼠标点击移动产生的圆圈
                context_bak.beginPath();
                context_bak.strokeStyle = color;
                context_bak.fillStyle  = fillColor;
                context_bak.arc(x,y,size*10,0,Math.PI * 2,false);
                context_bak.fill();
                context_bak.stroke();
                context_bak.restore();
            }else{
                clearContext();
                context_bak.beginPath();
                context_bak.strokeStyle = color;
                context_bak.fillStyle  = fillColor;
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
                context_bak.fill();
                context_bak.stroke();
            }else{
                context_bak.beginPath();
                context_bak.ellipse(x,y,20,10,0,0,Math.PI * 2,false);
                context_bak.fill();
                context_bak.stroke();
            }
        }else if(graphType == 'triangle'){
            //三角形
            clearContext();
            if(canDraw){
                //鼠标点击移动时产生的三角形
                context_bak.beginPath();
                context_bak.moveTo(startX,startY);
                context_bak.lineTo(startX-(x-startX),y);
                context_bak.lineTo(x,y);
                context_bak.closePath();
                context_bak.stroke();
                context_bak.fill();
            }else{
                context_bak.beginPath();
                context_bak.moveTo(x-15,y-15);
                context_bak.lineTo(x-30,y);
                context_bak.lineTo(x,y);
                context_bak.closePath();
                context_bak.stroke();
                context_bak.fill();
            }
        }
    };


    //鼠标离开区域以外 除了涂鸦 都清空
    var mouseout = function(){
        if(graphType == 'pencil'){
            canDraw = false;
        }
    }

    $(canvas_bak).unbind();
    $(canvas_bak).bind('mousedown',mousedown);
    $(canvas_bak).bind('mousemove',mousemove);
    $(canvas_bak).bind('mouseup',mouseup);
    $(canvas_bak).bind('mouseout',mouseout);
}


//清空画布
var clearContext = function(type){
    if(!type){
        context_bak.clearRect(0,0,canvasWidth,canvasHeight);
    }else{
        context.clearRect(0,0,canvasWidth,canvasHeight);
        context_bak.clearRect(0,0,canvasWidth,canvasHeight);
    }
}

