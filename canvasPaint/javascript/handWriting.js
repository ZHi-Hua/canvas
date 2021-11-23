//手写板，带有行间线。
function handWriting(){

}
var canvasHand, contextHand, canvasWidth, canvasHeight;//下面的画布模块
var showCanvas, showCanvasContext, showCanvasWidth, showCanvasHeight;//上面的贴图模块
var isCanvasMouseDown = false;

var canvasLastLoc = { x: 0, y: 0 };

var timer = 0;//计时器
var btnClick;//模拟上传点击操作
var cursorBlink, hasCursor = false;//模拟光标闪烁
var textCursorBlink, hasTextCursor = false;//模拟文本框内的光标
var hasAxis = false;//用来记录下面的画布是否有坐标轴，如果有，为了美观，则原比例上传

color = color;  //字体默认颜色，可改动
var upWaitTime = 1.5;    //自动上传等待时间，可改动
var rowHeight = 50;

var edge = { xMax: 0, yMax: 0, xMin: 400, yMin: 200, hasWrite: false };

var pos = { xNowPo: 0, yNowPo: 0 };

function init() {
    canvasHand = document.getElementById("canvasHand"); //初始化下面画板
    contextHand = canvasHand.getContext("2d");
    canvasWidth = canvasHand.width;
    canvasHeight = canvasHand.height;

    showCanvas = document.getElementById("showCanvas");//初始化上面的显示板
    showCanvasContext = showCanvas.getContext("2d");
    showCanvasWidth = showCanvas.width;
    showCanvasHeight = showCanvas.height;
}

function windowToLocate(canvasHand, x, y) {
    var bbox = canvasHand.getBoundingClientRect();//canvas距离屏幕的距离
    return { x: Math.round(x - bbox.left), y: Math.round(y - bbox.top) };//获取距离canvas的距离
}

class imageCut {
    constructor(canvasHand, edge, pos, minify, lever, chosen = false, text = false, textStr = "") {
        this.width = Math.round((edge.xMax - edge.xMin) * minify);
        this.height = Math.round((edge.yMax - edge.yMin) * minify);
        this.minify = minify;
        this.lever = lever;
        this.chosen = chosen;
        this.text = text;
        this.textStr = textStr;
        this.pos = JSON.parse(JSON.stringify(pos));
        this.image = new Image();
        this.EN = false;
        this.ES = false;
        this.WN = false;
        this.WS = false;
        var tempCanvas = document.getElementById("tempCanvas");
        tempCanvas.width = this.width;
        tempCanvas.height = this.height;
        tempCanvas.getContext("2d").drawImage(canvasHand, edge.xMin - 10, edge.yMin - 10, (edge.xMax - edge.xMin) + 20, (edge.yMax - edge.yMin) + 20, 0, 0, this.width, this.height);
        this.image.src = tempCanvas.toDataURL("image/png");
        tempCanvas.width = tempCanvas.height = 0;
        this.textPos = { x: 0, y: 0 };
    }
    drawFrame() {
        showCanvasContext.strokeStyle = "#000000";
        showCanvasContext.globalAlpha = 1;
        showCanvasContext.beginPath();
        showCanvasContext.lineWidth = 1;
        showCanvasContext.moveTo(this.pos.xNowPo, this.pos.yNowPo);
        showCanvasContext.lineTo(this.pos.xNowPo + this.width, this.pos.yNowPo);
        showCanvasContext.lineTo(this.pos.xNowPo + this.width, this.pos.yNowPo + this.height);
        showCanvasContext.lineTo(this.pos.xNowPo, this.pos.yNowPo + this.height);
        showCanvasContext.lineTo(this.pos.xNowPo, this.pos.yNowPo);
        showCanvasContext.stroke();

        showCanvasContext.beginPath();
        showCanvasContext.fillStyle = "black";
        showCanvasContext.fillRect(this.pos.xNowPo, this.pos.yNowPo, 5, 5);
        showCanvasContext.fillRect(this.pos.xNowPo + this.width - 5, this.pos.yNowPo, 5, 5);
        showCanvasContext.fillRect(this.pos.xNowPo + this.width - 5, this.pos.yNowPo + this.height - 5, 5, 5);
        showCanvasContext.fillRect(this.pos.xNowPo, this.pos.yNowPo + this.height - 5, 5, 5);
        showCanvasContext.stroke();

        showCanvasContext.globalAlpha = 1;
    }
    drawSelf() {
        if (this.text == true && this.chosen == true) {
            showCanvasContext.clearRect(this.pos.xNowPo, this.pos.yNowPo, this.width, this.height);
        }
        showCanvasContext.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.pos.xNowPo, this.pos.yNowPo, this.width, this.height);
        if (this.chosen == true) {
            this.drawFrame();
        }
    }
    changePos(x, y) {
        this.pos.xNowPo = x;
        this.pos.yNowPo = y;
    }
    changeSize(width, height) {
        this.width = width;
        this.height = height;
    }
    toJson() {
        var json = "{";
        json = json + '"width":' + this.width + ',';
        json = json + '"height":' + this.height + ',';
        json = json + '"minify":' + this.minify + ',';
        json = json + '"lever":' + this.lever + ',';
        json = json + '"chosen":' + this.chosen + ',';
        json = json + '"text":' + this.text + ',';
        json = json + '"textStr":' + '"' + this.text + '"' + ',';
        json = json + '"pos":' + '{' + '"xNowPo":' + this.pos.xNowPo + ',' + '"yNowPo":' + this.pos.xNowPo + '}' + ',';
        json = json + '"textPos":' + '{' + '"x":' + this.textPos.x + ',' + '"y":' + this.textPos.y + '}' + ',';
        json = json + '"image":' + '"' + this.image.src + '"' + ',';
        json = json + '"EN":' + this.EN + ',';
        json = json + '"ES":' + this.ES + ',';
        json = json + '"WN":' + this.WN + ',';
        json = json + '"WS":' + this.WS;
        json += "}";
        return json;
    }
}

class imageCuts {
    constructor() {
        this.imageCutArray = new Array();
        this.hasRowLines = false;
        this.eraser = false;
        this.pan = false;
    }
    drawAll() {
        showCanvasContext.clearRect(0, 0, showCanvasWidth, showCanvasHeight);
        for (var i in this.imageCutArray) {
            this.imageCutArray[i].drawSelf();
            if (this.imageCutArray[i].text == true && this.imageCutArray[i].chosen == true) {

                this.imageCutArray[i].addTextToImage();
            }
        }
        //console.log(this.toJson());
    }
    cleanSelf() {
        this.imageCutArray.splice(0, this.imageCutArray.length);
    }

    toJson() {
        var jsonStr = '{' + '"images":[';
        for (var i in this.imageCutArray) {
            jsonStr = jsonStr + this.imageCutArray[i].toJson() + ',';
        }
        jsonStr = jsonStr.substr(0, jsonStr.length - 1);
        jsonStr = jsonStr + ']}';
        return jsonStr;
    }

    addRowline() {
        showCanvasContext.globalAlpha = 0.6;
        var lineCount = showCanvasHeight / rowHeight;
        showCanvasContext.beginPath();
        showCanvasContext.lineWidth = 1;
        for (var i = 1; i < lineCount; i++) {
            showCanvasContext.moveTo(10, rowHeight * i);
            showCanvasContext.lineTo(showCanvasWidth - 10, rowHeight * i);
        }
        showCanvasContext.stroke();
        this.hasRowLines = true;
        showCanvasContext.globalAlpha = 1;
    }
    removeRowLine() {
        showCanvasContext.clearRect(0, 0, showCanvasWidth, showCanvasHeight);
        imgs.drawAll();
        this.hasRowLines = false;
    }
}
var imgs = new imageCuts();

function upToShow() {

    if (edge.hasWrite == true) {
        minify = (rowHeight / (edge.yMax - edge.yMin)).toFixed(2);
        cursorRemove();
        if ((pos.xNowPo + (edge.xMax - edge.xMin) * minify) < showCanvasWidth && (pos.yNowPo + rowHeight) <= showCanvasHeight && minify < 1 && hasAxis == false) {
            var upImageCut = new imageCut(canvasHand, edge, pos, minify, 1);
            upImageCut.image.onload = function () {
                upImageCut.drawSelf();
            };
            pos.xNowPo += (edge.xMax - edge.xMin) * minify;
        }
        else if ((pos.xNowPo + (edge.xMax - edge.xMin) * minify) >= showCanvasWidth && (pos.yNowPo + rowHeight) <= showCanvasHeight && minify < 1 && hasAxis == false) {
            pos.xNowPo = 0;
            pos.yNowPo += rowHeight;
            var upImageCut = new imageCut(canvasHand, edge, pos, minify, 1);
            upImageCut.image.onload = function () {
                upImageCut.drawSelf();
            };
            pos.xNowPo += (edge.xMax - edge.xMin) * minify;
        }

        //当下面的涂鸦的行高小于上面的行高时 为了美观 缩放0.6，
        else if ((pos.xNowPo + (edge.xMax - edge.xMin) * 0.6) < showCanvasWidth && (pos.yNowPo + rowHeight) <= showCanvasHeight && minify >= 1 && hasAxis == false) {
            pos.yNowPo = pos.yNowPo + rowHeight * 0.5 - (edge.yMax - edge.yMin) * 0.6 * 0.5;
            var upImageCut = new imageCut(canvasHand, edge, pos, 0.6, 1);
            upImageCut.image.onload = function () {
                upImageCut.drawSelf();
            };
            pos.yNowPo = pos.yNowPo - rowHeight * 0.5 + (edge.yMax - edge.yMin) * 0.6 * 0.5;
            pos.xNowPo += (edge.xMax - edge.xMin) * 0.6;
        }
        else if ((pos.xNowPo + (edge.xMax - edge.xMin) * 0.6) >= showCanvasWidth && (pos.yNowPo + rowHeight) <= showCanvasHeight && minify >= 1 && hasAxis == false) {
            pos.yNowPo += rowHeight;
            pos.yNowPo = pos.yNowPo + rowHeight * 0.5 - (edge.yMax - edge.yMin) * 0.6 * 0.5;
            var upImageCut = new imageCut(canvasHand, edge, pos, 0.6, 1);
            upImageCut.image.onload = function () {
                upImageCut.drawSelf();
            };
            pos.yNowPo = pos.yNowPo - rowHeight * 0.5 + (edge.yMax - edge.yMin) * 0.6 * 0.5;
            pos.xNowPo += (edge.xMax - edge.xMin) * 0.6;
        }
        else if (hasAxis == true) {
            if ((pos.yNowPo + (edge.yMax - edge.yMin)) <= showCanvasHeight) {
                if (pos.xNowPo != 0) {
                    pos.yNowPo += rowHeight;
                    pos.xNowPo = 0;
                }
                var upImageCut = new imageCut(canvasHand, edge, pos, 1, 1);
                upImageCut.image.onload = function () {
                    upImageCut.drawSelf();
                };
                pos.yNowPo += Math.ceil((edge.yMax - edge.yMin) / rowHeight) * rowHeight;
                pos.xNowPo = 0;
                hasAxis = false;
            }
        }

        imgs.imageCutArray.push(upImageCut);
        edge.hasWrite = false;
        contextHand.clearRect(0, 0, canvasWidth, canvasHeight);
        edge.xMax = 0;                    //初始化截取边界值
        edge.yMax = 0;
        edge.xMin = canvasWidth;
        edge.yMin = canvasHeight;
    }
}

function cursorRemove() {
    showCanvasContext.clearRect(pos.xNowPo + 5, pos.yNowPo, 2, rowHeight);
    hasCursor = false;
}

function cursorBink() {//模拟光标闪烁
    if (hasCursor == false) {
        showCanvasContext.strokeStyle = "#000000";
        showCanvasContext.beginPath();
        showCanvasContext.moveTo(pos.xNowPo + 6, pos.yNowPo);
        showCanvasContext.lineTo(pos.xNowPo + 6, pos.yNowPo + rowHeight);
        showCanvasContext.lineWidth = 1;
        showCanvasContext.stroke();
        hasCursor = true;
    }
    else if ((hasCursor == true)) {
        cursorRemove();
    }
}

function changeRow() {
    cursorRemove();
    pos.xNowPo = 0;
    pos.yNowPo += rowHeight;

}

function cleanShowCanvas() {
    showCanvasContext.clearRect(0, 0, showCanvasWidth, showCanvasHeight);
    pos.xNowPo = 0;    //初始化上部的pos
    pos.yNowPo = 0;
    clearInterval(btnClick);
    imgs.cleanSelf();
    imgs.hasRowLines = false;
    chosenImage = null;
    if (textCursorBlink != null) {
        clearInterval(textCursorBlink);
    }
}

onload = function () {
    init();
    //添加行间线
    imgs.addRowline();
    //游标闪烁
    cursorBlink = setInterval(function () { cursorBink(); }, 400);

    canvasHand.onmousedown = function (e) {//鼠标放下
        e.preventDefault();//取消事件的默认动作
        isCanvasMouseDown = true;
        canvasLastLoc = windowToLocate(canvasHand, e.clientX, e.clientY);
        timer = 0;  //timer清零
    };

    canvasHand.onmouseup = function (e) {//鼠标按起
        e.preventDefault();
        isCanvasMouseDown = false;

        clearInterval(btnClick);//先清除原来的setInterval()，防止线程中存在多个setInterval()
        btnClick = setInterval(function () {
            timer++;
            if (timer == upWaitTime * 10) {
                if (!(edge.xMax == 0 && edge.yMax == 0 && edge.xMin == canvasWidth && edge.yMin == canvasHeight)) {
                    upToShow();
                    //console.log("上传成功!");
                    edge.hasWrite = false;
                    timer = 0;
                }

            }
        }, 100);
    };

    canvasHand.onmouseout = function (e) {//出了画布
        e.preventDefault();
        isCanvasMouseDown = false;
    };

    canvasHand.onmousemove = function (e) {//鼠标移动
        e.preventDefault();
        if (isCanvasMouseDown) {
            var curloc = windowToLocate(canvasHand, e.clientX, e.clientY);

            if (curloc.x > edge.xMax) {
                edge.xMax = curloc.x;
            }
            if (curloc.x < edge.xMin) {
                edge.xMin = curloc.x;
            }
            if (curloc.y > edge.yMax) {
                edge.yMax = curloc.y;
            }
            if (curloc.y < edge.yMin) {
                edge.yMin = curloc.y;
            }
            contextHand.beginPath();
            contextHand.moveTo(canvasLastLoc.x, canvasLastLoc.y);
            contextHand.lineTo(curloc.x, curloc.y);
            contextHand.strokeStyle = color;
            contextHand.lineWidth = size;
            contextHand.lineCap = "round";//帽子
            contextHand.lineJoin = "round";
            contextHand.stroke();
            canvasLastLoc = curloc;
            edge.hasWrite = true;
            timer = 0;  //timer清零

        }
    };

    $("#btnChangeRow").click(function () {
        changeRow();
    });
    $("#btnCleanShowPage").click(function () {
        cleanShowCanvas();
    });

    $(".dcolor").click(function () {
        $("this").addClass("sel").siblings().removeClass("sel");
        scolor = $(this).attr("data-color");
    });
    $("#btnShowLines").click(function () {
        imgs.addRowline();
    });
    $("#btnDisLines").click(function () {
        imgs.removeRowLine();
    })
};