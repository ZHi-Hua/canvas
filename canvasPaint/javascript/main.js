"use strict";

//保存历史数组
var imgList = [];
//撤销的次数
var step = -1;

$(function(){
    initCanvas();
    initDrag();

    $(".triangle").live("click",function(){//三角形
        select(this);
        draw_graph('triangle',this);
    });

    // 绑定绘画板工具
    //画笔
    $(".pencil").live("click",function(){
        select(this);
        draw_graph('pencil',this);
    });
/*    $(".handwriting").live("click",function(){
        select(this);
        draw_graph('handwriting',this);
    });*/
    $(".showLine").live("click",function(){
        select(this);
        showLineSize(this);
    });
    //橡皮擦
    $(".eraser").live("click",function(){
        select(this);
        draw_graph('eraser',this);
    });
    //画线
    $(".drawLine").live("click",function(){
        select(this);
        draw_graph('line',this);
    });
    //矩形
    $(".square").live("click",function(){
        select(this);
        draw_graph('square',this);
    });
    //圆形
    $(".circle").live("click",function(){
        select(this);
        draw_graph('circle',this);
    });
    //椭圆
    $(".ellipse").live("click",function(){
        select(this);
        draw_graph('ellipse',this);
    });
    //文字
    $(".fillText").live("click",function(){//文字
        select(this);
        fillColor = '#000';
        draw_graph('fillText',this);
    });
    //编辑颜色图片触发input框点击事件
    $(".changeColor-img").live("click",function () {
        $(".changeColor").trigger('click');
    });
    //编辑颜色input框change事件，改变color
    $(".changeColor").live("change",function(){
        color = this.value;
    });
    //颜色版
    $(".x-color-board-item").mouseup(function(){
        selectColorBoard(this);
        color = this.style.backgroundColor;
    });
    //上一步
    $(".x-preStep").live("click",function(){
        pre(this);
    });
    //下一步
    $(".x-nextStep").live("click",function(){
        next(this);
    });
    //清除画布
    $(".x-clear").live("click",function(){
        clearContext('1');
    });
   /* $(".save").live("click",function(){
        save();
        $("body,html").animate({scrollTop:550},200);
        $(".item:first img").css({"box-shadow":"0 0 10px rgba(248,154,52,0.8)"});
    });*/
    $(".downloadImage").live("click",function(){
        downloadImage();
    });

    // 初始化铅笔工具
    $(".pencil").click();
    //初始化填充颜色选择器
    $("#fillColor").wColorPicker({
        /*hideButton: true,
        transparentColor: true*/
        mode: "click",
        initColor: fillColor,
       /* showSpeed: 300,
        hideSpeed: 300,*/
        onSelect: function(color){
            fillColor = color;
            /*canvas.settings.fillStyle = color;
            canvas.textInput.css({color: color});*/
        }
    });

    // 选择线条大小
    $(".line_size button").click(function(){
        size=$(this).data("value");
        $("#line_size").hide();
    });

    // 隐藏线条宽度板
    $(".line").hover(function(){
        showLineSize($(this)[0]);
    },function(){
        var ss=setTimeout(function(){
            $(".line_size").fadeOut(200);
        },100);
        $(".line_size").hover(function(){
            $(".line_size").show();
            clearTimeout(ss);
        },function(){
            $(".line_size").fadeOut(200);
        });
    });

    /*上传图片*/
    $('#changeImg').live("change",function() {
        //src = window.URL.createObjectURL(this.files[0]); //转成可以在本地预览的格式
        var files = this.files;
        if(files){
            imgFileToCanvas(files);
            saveHistory();
        }
    });
});
function imgFileToCanvas(files) {
    for (var i = 0, f; f = files[i]; i++) {
        var t = f.type ? f.type : 'n/a';
        var reader = new FileReader();
        var isImg = isImage(t);

        // 处理得到的图片
        if (isImg) {
            reader.onload = (function (theFile) {
                return function (e) {
                    var  image = new Image();
                    image.src =  e.target.result ;

                    var hRatio;
                    var wRatio;
                    var l = 0;
                    var t = 0;
                    var maxWidth = canvasWidth;
                    var maxHeight = canvasHeight;
                    var Ratio = 1;
                    image.onload = function(){
                        var w = image.width;
                        var h = image.height;
                        wRatio = maxWidth / w;
                        hRatio = maxHeight / h;
                        // 图像大小超出绘画板大小，计算出缩放比例
                        if (wRatio<1 || hRatio<1){
                            Ratio = (wRatio<=hRatio?wRatio:hRatio);
                        }
                        // 根据比例重新设置图像大小
                        if (Ratio<1){
                            w = w * Ratio;
                            h = h * Ratio;

                        }
                        // 图片居中摆放
                        l = (maxWidth - w)/2;
                        t = (maxHeight - h)/2;
                        // 居中缩放
                        context.drawImage(image , 0 ,0 , image.width , image.height , l , t , w , h);
                    }

                };
            })(f)
            reader.readAsDataURL(f);
        }
    }
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext("2d");
    context.drawImage(img, 0, 0, img.width, img.height);
    var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
    var dataURL = canvas.toDataURL("image/" + ext);
    return dataURL;
}

//初始化
var initCanvas = function(){
    canvas = document.getElementById("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context = canvas.getContext('2d');

    canvasTop = $(canvas).offset().top;
    canvasLeft = $(canvas).offset().left;

    canvas_bak = document.getElementById("canvas_bak");
    canvas_bak.width = canvasWidth;
    canvas_bak.height = canvasHeight;
    context_bak = canvas_bak.getContext('2d');
}

//初始化拖入效果
var initDrag= function(){
    var dragDiv  = document.getElementById("canvas_bak");
    dragDiv.addEventListener('dragover', handleDragOver, false);
    dragDiv.addEventListener('drop', handleFileSelect, false);
}

//下载图片
var downloadImage = function(){
    $("#downloadImage_a")[0].href=canvas.toDataURL();
}

//展开线条大小选择器
var showLineSize = function(obj){
    if($("#line_size").is(":hidden")){
        var top = $(obj).offset().top+40;
        var left = $(obj).offset().left-10;
        $("#line_size")[0].style.left = left + "px";
        $("#line_size")[0].style.top = top   + "px";
        $("#line_size").show();
    }else{
        $("#line_size").hide();
    }
}


// 填充前景
var fill=function(){
    context.fillStyle= fillColor;
    context_bak.fillStyle= fillColor;
    var $canvas = $("#canvas"),
        w = $canvas.width(),
        h = $canvas.height();
    context.fillRect(0, 0, w, h);

    var image = new Image();
    image.src = canvas_bak.toDataURL();
    context.drawImage(image , 0 ,0 , image.width , image.height , 0 ,0 , canvasWidth , canvasHeight);
    clearContext();
    saveHistory();
}

//上一步
function pre() {
    if (step >= 0) {
        step--;
        context.clearRect(0,0,canvasWidth,canvasHeight);
        var img = new Image();
        img.src = imgList[step];
        img.onload = function () {
            context.drawImage(img , 0 ,0 , img.width , img.height , 0 ,0 , canvasWidth , canvasHeight);
        };//从数组中调取历史记录，进行重绘
    } else {
        alert('没有上一步了');
    }
}

// 下一步
function next() {
    if (step < imgList.length - 1) {
        step++;
        context.clearRect(0,0,canvasWidth,canvasHeight);
        var img = new Image();
        img.src = imgList[step];
        img.onload = function () {
            context.drawImage(img , 0 ,0 , img.width , img.height , 0 ,0 , canvasWidth , canvasHeight);
        };//重绘
    } else {
        alert('没有下一步了');
    }
}
//保存canvas历史数据
function saveHistory() {
    step++;//控制撤销操作的索引，上一步下一步
    imgList.push(canvas.toDataURL());
}
// 处理文件拖入事件，防止浏览器默认事件带来的重定向
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}


// 判断是否图片
function isImage(type) {
    switch (type) {
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
        case 'image/bmp':
        case 'image/jpg':
            return true;
        default:
            return false;
    }
}


// 处理拖放文件列表
function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files;

    for (var i = 0, f; f = files[i]; i++) {
        var t = f.type ? f.type : 'n/a';
        var reader = new FileReader();
        var isImg = isImage(t);

        // 处理得到的图片
        if (isImg) {
            reader.onload = (function (theFile) {
                return function (e) {
                    var  image = new Image();
                    image.src =  e.target.result ;

                    var hRatio;
                    var wRatio;
                    var l = 0;
                    var t = 0;
                    var maxWidth = canvasWidth;
                    var maxHeight = canvasHeight;
                    var Ratio = 1;
                    var w = image.width;
                    var h = image.height;
                    wRatio = maxWidth / w;
                    hRatio = maxHeight / h;
                    // 图像大小超出绘画板大小，计算出缩放比例
                    if (wRatio<1 || hRatio<1){
                        Ratio = (wRatio<=hRatio?wRatio:hRatio);
                    }
                    // 根据比例重新设置图像大小
                    if (Ratio<1){
                        w = w * Ratio;
                        h = h * Ratio;

                    }
                    // 图片居中摆放
                    l = (maxWidth - w)/2;
                    t = (maxHeight - h)/2;

                    image.onload = function(){
                        // 居中缩放
                        context.drawImage(image , 0 ,0 , image.width , image.height , l , t , w , h);
                    }

                };
            })(f)
            reader.readAsDataURL(f);
        }
    }
}

//初始化拖入效果
var initDrag= function(){
    var dragDiv  = document.getElementById("canvas_bak");
    dragDiv.addEventListener('dragover', handleDragOver, false);
    dragDiv.addEventListener('drop', handleFileSelect, false);
}

//选择形状，目的：选择形状后，改变字体颜色。
function select(obj) {
    //设置选中属性，被选中的代码变蓝色
    /*var siblings = obj.parentNode.children;
    for (var i = 0; i < siblings.length; i++) {
        if (siblings[i] !== obj) {
            siblings[i].classList.remove("x-active");
        }
        //siblings.classList.remove('x-active');
    }*/
    $(".x-active").removeClass("x-active");
    obj.classList.add('x-active');
}
//选择颜色版，改变颜色版的class，实现点击颜色版后，颜色版边框变色。
function selectColorBoard(obj) {
    //设置选中属性，被选中的代码变蓝色
    var siblings = obj.parentNode.children;
    for (var i = 0; i < siblings.length; i++) {
        if (siblings[i] !== obj) {
            siblings[i].classList.remove("x-color-board-active");
        }
        //siblings.classList.remove('x-active');
    }
    obj.classList.add('x-color-board-active');
}



