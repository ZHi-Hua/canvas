

var canvas, context, canvasWidth, canvasHeight;//下面的画布模块
var showCanvas, showCanvasContext, showCanvasWidth, showCanvasHeight;//上面的贴图模块
var isCanvasMouseDown = false;
var isShowCanvasMouseDown = false;

var canvasLastLoc = { x: 0, y: 0 };
var showCanvasFirstLoc = { x: 0, y: 0 };
var showCanvasLastLoc = { x: 0, y: 0 };
var offset = { x: 0, y: 0 }; //块内的偏移量

var timer = 0;//计时器
var btnClick;//模拟上传点击操作
var cursorBlink, hasCursor = false;//模拟光标闪烁
var textCursorBlink, hasTextCursor = false;//模拟文本框内的光标
var hasAxis = false;//用来记录下面的画布是否有坐标轴，如果有，为了美观，则原比例上传

var scolor = "black";  //字体默认颜色，可改动
var upWaitTime = 1.5;    //自动上传等待时间，可改动
var rowHeight = 50;

var edge = { xMax: 0, yMax: 0, xMin: 400, yMin: 200, hasWrite: false };

var pos = { xNowPo: 0, yNowPo: 0 };

function init() {
    canvas = document.getElementById("canvas"); //初始化下面画板
    context = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    showCanvas = document.getElementById("showCanvas");//初始化上面的显示板
    showCanvasContext = showCanvas.getContext("2d");
    showCanvasWidth = showCanvas.width;
    showCanvasHeight = showCanvas.height;


}

function windowToLocate(canvas, x, y) {
    var bbox = canvas.getBoundingClientRect();//canvas距离屏幕的距离
    return { x: Math.round(x - bbox.left), y: Math.round(y - bbox.top) };//获取距离canvas的距离
}

class imageCut {
    constructor(canvas, edge, pos, minify, lever, chosen = false, text = false, textStr = "") {
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
        tempCanvas.getContext("2d").drawImage(canvas, edge.xMin - 10, edge.yMin - 10, (edge.xMax - edge.xMin) + 20, (edge.yMax - edge.yMin) + 20, 0, 0, this.width, this.height);
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
    addTextToImage() {
        if (this.text == true && this.chosen == true) {

            var tempCanvas = document.getElementById("tempCanvas");
            var ctx = tempCanvas.getContext("2d");
            this.textPos = { x: 0, y: 0 };
            tempCanvas.width = this.width;
            tempCanvas.height = this.height;
            ctx.font = "20px Georgia";
            for (var i in this.textStr) {
                if (this.textPos.x + 20 < this.width && this.textPos.y + 20 < this.height) {
                    ctx.fillText(this.textStr.charAt(i), this.textPos.x, this.textPos.y + 20);
                    this.textPos.x += 20;
                } else if (this.textPos.x + 20 > this.width && this.textPos.y + 20 < this.height) {
                    this.textPos.x = 0;
                    this.textPos.y += 20;
                    ctx.fillText(this.textStr.charAt(i), this.textPos.x, this.textPos.y + 20);
                    this.textPos.x += 20;
                }
            }
            this.image.src = tempCanvas.toDataURL("image/png");
            var _this_ = this;
            this.image.onload = function () {
                _this_.drawSelf();
            }
            tempCanvas.width = tempCanvas.height = 0;
        }
    }
    changeText(str) {
        this.textStr = str;
        this.addTextToImage();
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
    hasChosenOne() {
        for (var i in this.imageCutArray) {
            if (this.imageCutArray[i].chosen == true) {
                return true;
            }
        }
        return false;
    }
    chose(X, Y) {
        for (var i in this.imageCutArray) {
            this.imageCutArray[i].chosen = false;
            this.imageCutArray[i].EN = false;
            this.imageCutArray[i].ES = false;
            this.imageCutArray[i].WN = false;
            this.imageCutArray[i].WS = false;
        }
        for (var i in this.imageCutArray) {
            if (this.imageCutArray[i].pos.xNowPo < X && X < this.imageCutArray[i].pos.xNowPo + this.imageCutArray[i].width && this.imageCutArray[i].pos.yNowPo < Y && Y < this.imageCutArray[i].pos.yNowPo + this.imageCutArray[i].height) {
                this.imageCutArray[i].chosen = true;
                if (this.imageCutArray[i].pos.xNowPo <= X && X <= this.imageCutArray[i].pos.xNowPo + 5
                    && this.imageCutArray[i].pos.yNowPo <= Y && Y <= this.imageCutArray[i].pos.yNowPo + 5) {
                    this.imageCutArray[i].WN = true;
                } else if (this.imageCutArray[i].pos.xNowPo + this.imageCutArray[i].width - 5 <= X && X <= this.imageCutArray[i].pos.xNowPo + this.imageCutArray[i].width
                    && this.imageCutArray[i].pos.yNowPo <= Y && Y <= this.imageCutArray[i].pos.yNowPo + 5) {
                    this.imageCutArray[i].EN = true;
                }
                else if (this.imageCutArray[i].pos.xNowPo + this.imageCutArray[i].width - 5 <= X && X <= this.imageCutArray[i].pos.xNowPo + this.imageCutArray[i].width
                    && this.imageCutArray[i].pos.yNowPo + this.imageCutArray[i].height - 5 <= Y && Y <= this.imageCutArray[i].pos.yNowPo + this.imageCutArray[i].height) {
                    this.imageCutArray[i].ES = true;
                }
                else if (this.imageCutArray[i].pos.xNowPo <= X && X <= this.imageCutArray[i].pos.xNowPo + 5
                    && this.imageCutArray[i].pos.yNowPo + this.imageCutArray[i].height - 5 <= Y && Y <= this.imageCutArray[i].pos.yNowPo + this.imageCutArray[i].height) {
                    this.imageCutArray[i].WS = true;
                }
                var a = { x: X - this.imageCutArray[i].pos.xNowPo, y: Y - this.imageCutArray[i].pos.yNowPo };
                return a;
            }
        }
    }
    changeChosen(x, y, xOffset, yOffset) {
        for (var i in this.imageCutArray) {
            if (this.imageCutArray[i].chosen == true) {
                if (this.imageCutArray[i].ES == true) {
                    var newWidth = x - this.imageCutArray[i].pos.xNowPo;
                    var newHeight = y - this.imageCutArray[i].pos.yNowPo;
                    if (newWidth >= 10 && newHeight >= 10) {
                        this.imageCutArray[i].changeSize(newWidth, newHeight);
                    }
                } else if (this.imageCutArray[i].WN == true) {

                    var newWidth = this.imageCutArray[i].width + this.imageCutArray[i].pos.xNowPo - x;
                    var newHeight = this.imageCutArray[i].height + this.imageCutArray[i].pos.yNowPo - y;
                    if (newWidth >= 10 && newHeight >= 10) {
                        this.imageCutArray[i].changeSize(newWidth, newHeight);
                        this.imageCutArray[i].pos.xNowPo = x;
                        this.imageCutArray[i].pos.yNowPo = y;
                    }
                } else if (this.imageCutArray[i].EN == true) {
                    var newWidth = x - this.imageCutArray[i].pos.xNowPo;
                    var newHeight = this.imageCutArray[i].pos.yNowPo + this.imageCutArray[i].height - y;
                    if (newWidth >= 10 && newHeight >= 10) {
                        this.imageCutArray[i].changeSize(newWidth, newHeight);
                        this.imageCutArray[i].pos.yNowPo = y;
                    }
                } else if (this.imageCutArray[i].WS == true) {
                    var newWidth = this.imageCutArray[i].pos.xNowPo + this.imageCutArray[i].width - x;
                    var newHeight = y - this.imageCutArray[i].pos.yNowPo;
                    if (newWidth >= 10 && newHeight >= 10) {
                        this.imageCutArray[i].changeSize(newWidth, newHeight);
                        this.imageCutArray[i].pos.xNowPo = x;
                    }
                }
                else {
                    this.imageCutArray[i].changePos(x - xOffset, y - yOffset);
                }
                break;

            }
        }
    }
    toJson() {
        var jsonStr = '{' + '"images":[';
        for (var i in this.imageCutArray) {
            jsonStr = jsonStr + this.imageCutArray[i].toJson() + ',';
        }
        jsonStr = jsonStr.substr(0, jsonStr.length - 1);
        jsonStr = jsonStr + ']}'
        return jsonStr;
    }
    findChosenText() {
        for (var i in this.imageCutArray) {
            if (this.imageCutArray[i].text == true && this.imageCutArray[i].chosen == true) {
                return this.imageCutArray[i];
            }
        }
    }
    addRowline() {
        showCanvasContext.globalAlpha = 0.6
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
    choseEraserOrPan(arg = 0) {
        if (arg == 0) {
            this.eraser = true;
        } else {
            this.pan = true;
        }
        for (var i in this.imageCutArray) {
            if (this.imageCutArray[i].chosen == true) {
                var tempCanvas = document.getElementById("tempCanvas");
                tempCanvas.width = this.imageCutArray[i].width;
                tempCanvas.height = this.imageCutArray[i].height;
                //先画到tempcanvas
                var tempCtx = tempCanvas.getContext("2d");
                tempCtx.drawImage(this.imageCutArray[i].image, 0, 0, this.imageCutArray[i].width, this.imageCutArray[i].height);
            }
        }
    }
    disEraserOrPan() {
        this.eraser = false;
        this.pan = false;
        var tempCanvas = document.getElementById("tempCanvas");
        tempCanvas.width = tempCanvas.height = 0;
    }
    eraserOrPanMove(x, y) {
        for (var i in this.imageCutArray) {
            if (this.imageCutArray[i].chosen == true) {
                var tempCanvas = document.getElementById("tempCanvas");
                var tempCtx = tempCanvas.getContext("2d");
                //在tempcanvas上点上一点白(x,y)
                var innerX = x - this.imageCutArray[i].pos.xNowPo;
                var innerY = y - this.imageCutArray[i].pos.yNowPo;

                if (this.eraser == true) {
                    tempCtx.lineWidth = 20;
                    tempCtx.strokeStyle = "#ffffff";
                    showCanvasContext.lineWidth = 20;
                    showCanvasContext.strokeStyle = "#ffffff";
                } else if (this.pan == true) {
                    tempCtx.lineWidth = 3;
                    tempCtx.strokeStyle = "#000000";
                    showCanvasContext.lineWidth = 3;
                    showCanvasContext.strokeStyle = "#000000";
                }

                tempCtx.beginPath();
                tempCtx.lineCap = "round";//帽子
                tempCtx.lineJoin = "round";
                tempCtx.moveTo(innerX, innerY);
                tempCtx.lineTo(innerX, innerY);
                tempCtx.stroke();

                showCanvasContext.beginPath();
                showCanvasContext.lineCap = "round";//帽子
                showCanvasContext.lineJoin = "round";
                showCanvasContext.moveTo(x, y);
                showCanvasContext.lineTo(x, y);
                showCanvasContext.stroke();

                tempCtx.strokeStyle = "#000000";
                showCanvasContext.strokeStyle = "#000000";
            }
        }
    }
    eraserOrPanUp() {
        for (var i in this.imageCutArray) {
            if (this.imageCutArray[i].chosen == true) {
                var tempCanvas = document.getElementById("tempCanvas");
                this.imageCutArray[i].image.src = tempCanvas.toDataURL("image/png");
                var __this__ = this;
                this.imageCutArray[i].image.onload = function () {
                    __this__.drawAll();
                }
            }
        }
    }
}
var imgs = new imageCuts();

function drawAxis() {
    context.beginPath();
    context.moveTo(50, canvasHeight / 2);
    context.lineTo(canvasWidth - 50, canvasHeight / 2);
    context.lineTo(canvasWidth - 50 - 10, canvasHeight / 2 - 10);
    context.moveTo(canvasWidth - 50, canvasHeight / 2);
    context.lineTo(canvasWidth - 50 - 10, canvasHeight / 2 + 10);


    context.lineJoin = 'round'; //线的连接处采用圆角
    context.lineWidth = 1;
    context.strokeStyle = '#0a0';
    context.stroke();

    //绘制Y轴
    context.beginPath();  //必须开始新路径
    context.moveTo(canvasWidth / 2, canvasHeight - 10);
    context.lineTo(canvasWidth / 2, 10);
    context.lineTo(canvasWidth / 2 - 10, 10 + 10);
    context.moveTo(canvasWidth / 2, 10);
    context.lineTo(canvasWidth / 2 + 10, 10 + 10);

    context.strokeStyle = '#00f';
    context.stroke();

    edge.xMin = 50;
    edge.xMax = canvasWidth - 50;
    edge.yMin = 10;
    edge.yMax = canvasHeight - 10;
    hasAxis = true;
    edge.hasWrite = false;
}

function upToShow() {

    if (edge.hasWrite == true) {
        minify = (rowHeight / (edge.yMax - edge.yMin)).toFixed(2);
        cursorRemove();
        if ((pos.xNowPo + (edge.xMax - edge.xMin) * minify) < showCanvasWidth && (pos.yNowPo + rowHeight) <= showCanvasHeight && minify < 1 && hasAxis == false) {
            var upImageCut = new imageCut(canvas, edge, pos, minify, 1);
            upImageCut.image.onload = function () {
                upImageCut.drawSelf();
            }
            pos.xNowPo += (edge.xMax - edge.xMin) * minify;
        }
        else if ((pos.xNowPo + (edge.xMax - edge.xMin) * minify) >= showCanvasWidth && (pos.yNowPo + rowHeight) <= showCanvasHeight && minify < 1 && hasAxis == false) {
            pos.xNowPo = 0;
            pos.yNowPo += rowHeight;
            var upImageCut = new imageCut(canvas, edge, pos, minify, 1);
            upImageCut.image.onload = function () {
                upImageCut.drawSelf();
            }
            pos.xNowPo += (edge.xMax - edge.xMin) * minify;
        }

        //当下面的涂鸦的行高小于上面的行高时 为了美观 缩放0.6，
        else if ((pos.xNowPo + (edge.xMax - edge.xMin) * 0.6) < showCanvasWidth && (pos.yNowPo + rowHeight) <= showCanvasHeight && minify >= 1 && hasAxis == false) {
            pos.yNowPo = pos.yNowPo + rowHeight * 0.5 - (edge.yMax - edge.yMin) * 0.6 * 0.5;
            var upImageCut = new imageCut(canvas, edge, pos, 0.6, 1);
            upImageCut.image.onload = function () {
                upImageCut.drawSelf();
            }
            pos.yNowPo = pos.yNowPo - rowHeight * 0.5 + (edge.yMax - edge.yMin) * 0.6 * 0.5;
            pos.xNowPo += (edge.xMax - edge.xMin) * 0.6;
        }
        else if ((pos.xNowPo + (edge.xMax - edge.xMin) * 0.6) >= showCanvasWidth && (pos.yNowPo + rowHeight) <= showCanvasHeight && minify >= 1 && hasAxis == false) {
            pos.yNowPo += rowHeight;
            pos.yNowPo = pos.yNowPo + rowHeight * 0.5 - (edge.yMax - edge.yMin) * 0.6 * 0.5;
            var upImageCut = new imageCut(canvas, edge, pos, 0.6, 1);
            upImageCut.image.onload = function () {
                upImageCut.drawSelf();
            }
            pos.yNowPo = pos.yNowPo - rowHeight * 0.5 + (edge.yMax - edge.yMin) * 0.6 * 0.5;
            pos.xNowPo += (edge.xMax - edge.xMin) * 0.6;
        }
        else if (hasAxis == true) {
            if ((pos.yNowPo + (edge.yMax - edge.yMin)) <= showCanvasHeight) {
                if (pos.xNowPo != 0) {
                    pos.yNowPo += rowHeight;
                    pos.xNowPo = 0;
                }
                var upImageCut = new imageCut(canvas, edge, pos, 1, 1);
                upImageCut.image.onload = function () {
                    upImageCut.drawSelf();
                }
                pos.yNowPo += Math.ceil((edge.yMax - edge.yMin) / rowHeight) * rowHeight;
                pos.xNowPo = 0;
                hasAxis = false;
            }
        }

        imgs.imageCutArray.push(upImageCut);
        edge.hasWrite = false;
        context.clearRect(0, 0, canvasWidth, canvasHeight);
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

function focusText() {
    var tea = document.getElementById("textArea");
    var strLen = tea.value.length;
    tea.setSelectionRange(strLen, strLen);
    tea.focus();
}

function inputWord() {
    if (textCursorBlink != null) {
        clearInterval(textCursorBlink);
    }
    var textarea = document.getElementById("textArea");
    var chosenText = imgs.findChosenText();
    if (chosenText == null) {
        return;
    }
    textCursorBlink = setInterval(function () {
        if (hasTextCursor == false) {
            showCanvasContext.beginPath();
            showCanvasContext.moveTo(chosenText.pos.xNowPo + chosenText.textPos.x + 3, chosenText.pos.yNowPo + chosenText.textPos.y + 2);
            showCanvasContext.lineTo(chosenText.pos.xNowPo + chosenText.textPos.x + 3, chosenText.pos.yNowPo + chosenText.textPos.y + 20);
            showCanvasContext.lineWidth = 1;
            showCanvasContext.stroke();
            hasTextCursor = true;
        } else if (hasTextCursor == true) {
            showCanvasContext.clearRect(chosenText.pos.xNowPo + chosenText.textPos.x + 2, chosenText.pos.yNowPo + chosenText.textPos.y + 2, 2, 18);
            hasTextCursor = false;
        }
    }, 300);

    textarea.value = chosenText.textStr;
    focusText();
    $('#textArea').on('input', function () {
        var inputWord = document.getElementById("textArea").value;
        chosenText = imgs.findChosenText();
        chosenText.changeText(inputWord);
    })
}

function creatText() {
    imgs.chose(1000, 1000);//清除选中
    edge.hasWrite = false;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    edge.xMax = 150;
    edge.yMax = 50;
    edge.xMin = 0;
    edge.yMin = 0;
    if (pos.xNowPo == 0) {
        var textImage = new imageCut(canvas, edge, pos, 1, 1, true, true, "请输入");
        imgs.imageCutArray.push(textImage);
        pos.xNowPo += 150;
    } else if (pos.xNowPo != 0) {
        pos.xNowPo = 0;
        pos.yNowPo += rowHeight;
        var textImage = new imageCut(canvas, edge, pos, 1, 1, true, true, "请输入");
        imgs.imageCutArray.push(textImage);
        pos.xNowPo += 150;
    }
    edge.xMax = 0;                    //初始化截取边界值
    edge.yMax = 0;
    edge.xMin = canvasWidth;
    edge.yMin = canvasHeight;
    imgs.drawAll();
    focusText();
}
onload = function () {
    init();
    cursorBlink = setInterval(function () { cursorBink(); }, 400);
    showCanvas.onmousedown = function (e) {
        e.preventDefault();//取消事件的默认动作
        showCanvasLastLoc = windowToLocate(showCanvas, e.clientX, e.clientY);
        offset = imgs.chose(showCanvasLastLoc.x, showCanvasLastLoc.y);
        imgs.drawAll();
        if (imgs.hasRowLines == true) {//画上行间线
            imgs.addRowline();
        }
        inputWord();
        isShowCanvasMouseDown = true;
    }

    showCanvas.onmousemove = function (e) {
        e.preventDefault();
        if (isShowCanvasMouseDown == true) {
            if (imgs.eraser == true || imgs.pan == true) {
                showCanvasLastLoc = windowToLocate(showCanvas, e.clientX, e.clientY);
                imgs.eraserOrPanMove(showCanvasLastLoc.x, showCanvasLastLoc.y);
            } else if (imgs.eraser == false && imgs.pan == false) {
                showCanvasLastLoc = windowToLocate(showCanvas, e.clientX, e.clientY);
                imgs.changeChosen(showCanvasLastLoc.x, showCanvasLastLoc.y, offset.x, offset.y);
                imgs.drawAll();
            }
            if (imgs.hasRowLines == true) {
                imgs.addRowline();
            }
        }
    }

    showCanvas.onmouseup = function (e) {
        e.preventDefault();
        isShowCanvasMouseDown = false;
        if (imgs.eraser == true || imgs.pan == true) {
            imgs.eraserOrPanUp();
        }
    }

    showCanvas.onmouseout = function (e) {//出了画布
        e.preventDefault();
        isShowCanvasMouseDown = false;
    }

    canvas.onmousedown = function (e) {//鼠标放下
        e.preventDefault();//取消事件的默认动作
        isCanvasMouseDown = true;
        canvasLastLoc = windowToLocate(canvas, e.clientX, e.clientY);
        timer = 0;  //timer清零

    }

    canvas.onmouseup = function (e) {//鼠标按起
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
    }

    canvas.onmouseout = function (e) {//出了画布
        e.preventDefault();
        isCanvasMouseDown = false;
    }

    canvas.onmousemove = function (e) {//鼠标移动
        e.preventDefault();
        if (isCanvasMouseDown) {
            var curloc = windowToLocate(canvas, e.clientX, e.clientY);

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
            context.beginPath();
            context.moveTo(canvasLastLoc.x, canvasLastLoc.y);
            context.lineTo(curloc.x, curloc.y);
            context.strokeStyle = scolor;
            context.lineWidth = 3;
            context.lineCap = "round";//帽子
            context.lineJoin = "round";
            context.stroke();
            canvasLastLoc = curloc;
            edge.hasWrite = true;
            timer = 0;  //timer清零

        }
    }

    //inputWord();
    $("#btnChangeRow").click(function () {
        changeRow();
    })
    $("#btnCleanShowPage").click(function () {
        cleanShowCanvas();
    })

    $(".dcolor").click(function () {
        $("this").addClass("sel").siblings().removeClass("sel");
        scolor = $(this).attr("data-color");
    });
    $("#btnShowLines").click(function () {
        imgs.addRowline();
    })
    $("#btnDisLines").click(function () {
        imgs.removeRowLine();
        focusText();
    })
    $("#btnDrawAxis").click(function () {
        drawAxis();
    })
    $("#btnWrite").click(function () {
        creatText();
        focusText();
        inputWord();
    })
    $("#btnEraser").click(function () {
        if (imgs.pan == true) {
            imgs.disEraserOrPan();
            document.getElementById('btnPan').innerHTML = '笔';
        }

        if (imgs.eraser == false) {
            if (imgs.hasChosenOne()) {
                imgs.choseEraserOrPan();
                showCanvas.style.cursor = 'crosshair';
                document.getElementById('btnEraser').innerHTML = '取消橡皮擦';
            } else {
                alert("请选择一个图块");
            }
        } else if (imgs.eraser == true) {
            imgs.disEraserOrPan();
            showCanvas.style.cursor = 'default';
            document.getElementById('btnEraser').innerHTML = '橡皮擦';
        }
    })
    $("#btnPan").click(function () {
        if (imgs.eraser == true) {
            imgs.disEraserOrPan();
            showCanvas.style.cursor = 'default';
            document.getElementById('btnEraser').innerHTML = '橡皮擦';
        }
        if (imgs.pan == false) {
            if (imgs.hasChosenOne()) {
                imgs.choseEraserOrPan(1);
                //showCanvas.style.cursor='crosshair';
                document.getElementById('btnPan').innerHTML = '取消笔';
            } else {
                alert("请选择一个图块");
            }
        } else if (imgs.pan == true) {
            imgs.disEraserOrPan();
            //showCanvas.style.cursor='default';
            document.getElementById('btnPan').innerHTML = '笔';
        }
    })
}


