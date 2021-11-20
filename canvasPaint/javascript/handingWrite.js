'use strict';
var lastLoc;
var lastTime;
var lastLineWidth;


var Brush = function () {
    lastLoc = {x:0, y:0};//起笔坐标
    lastTime = 0;//用于计算时间
    lastLineWidth = -1;
}

Brush.prototype.beginStroke = function(point){
    lastLoc = {x:point.startX,y:point.startY};
    lastTime = new Date().getTime();
}

Brush.prototype.moveStroke = function(point){
    var curLoc = {x:point.x,  y:point.y};
    var curTime = new Date().getTime();
    var s = calcDistance(curLoc,lastLoc);//获取笔锋经过的距离
    var t = curTime-lastTime;//获取笔锋经过的时间 ，用于计算行笔速度，赋值不同的宽度
    var lineWidth = calcLineWidth(t,s);

    context_bak.beginPath();
    context_bak.moveTo(lastLoc.x,lastLoc.y);
    context_bak.lineTo(curLoc.x,curLoc.y);
    context_bak.lineWidth = lineWidth;
    context_bak.lineCap = "round";
    context_bak.lineJoin = "round";
    context_bak.stroke();
    context_bak.closePath();

    lastLoc = curLoc;
    lastTime = curTime;
    lastLineWidth = lineWidth;
}



function calcLineWidth(t,s){
    // 计算运笔速度和时间，获取不同得到宽度
    var maxLineWidth = size;//size为笔的宽度大小
    var minLineWidth = 1;
    var maxStrokeV =10;
    var minStrokeV =0.1;
    var resultLineWidth = 0;
    var v = s/t;
    if(v<=minStrokeV){
        resultLineWidth = maxLineWidth;
    }else if(v>=maxStrokeV){
        resultLineWidth = minLineWidth;
    }else{
        resultLineWidth = maxLineWidth-((v-minStrokeV)/(maxStrokeV-minStrokeV))*(maxLineWidth -minLineWidth);
    }
    if(lastLineWidth = -1){
        return resultLineWidth;
    }
    return lastLineWidth*2/3 + resultLineWidth*1/3;
};

function calcDistance(loc1,loc2){
    return Math.sqrt((loc1.x - loc2.x)*(loc1.x - loc2.x)+(loc1.y - loc2.y)*(loc1.y - loc2.y))
};


