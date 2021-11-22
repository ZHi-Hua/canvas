/**
 * 铅笔
 * @param points 点数组
 * @param stroke 颜色
 * @param strokeWidth 线粗细
 */
function drawPencil(points, stroke, strokeWidth) {
    const line = new Konva.Line({
        name: 'line',
        points: points,
        stroke: stroke,
        strokeWidth: strokeWidth,
        lineCap: 'round',
        lineJoin: 'round',
        tension: 0.5,
        //draggable: true
    });
    graphNow=line;
    layer.add(line);
    layer.draw();

    line.on('mouseenter', function() {
        stage.container().style.cursor = 'move';
    });

    line.on('mouseleave', function() {
        stage.container().style.cursor = 'default';
    });

    line.on('dblclick', function() {
        // 双击删除自己
        this.remove();
        stage.find('Transformer').destroy();
        layer.draw();
    });
}

/**
 * 椭圆
 * @param x x坐标
 * @param y y坐标
 * @param rx x半径
 * @param ry y半径
 * @param stroke 描边颜色
 * @param strokeWidth 描边大小
 */
function drawEllipse(x, y, rx, ry, stroke, strokeWidth) {
    const ellipse=new Konva.Ellipse({
        name: 'ellipse',
        x: x,
        y: y,
        radiusX: rx,
        radiusY: ry,
        stroke: stroke,
        strokeWidth: strokeWidth,
        draggable: true
    });
    graphNow=ellipse;
    layer.add(ellipse);
    layer.draw();

    ellipse.on('mouseenter', function() {
        stage.container().style.cursor = 'move';
    });

    ellipse.on('mouseleave', function() {
        stage.container().style.cursor = 'default';
    });

    ellipse.on('dblclick', function() {
        // 双击删除自己
        this.remove();
        stage.find('Transformer').destroy();
        layer.draw();
    });
}

/**
 * 矩形
 * @param x x坐标
 * @param y y坐标
 * @param w 宽
 * @param h 高
 * @param c 颜色
 * @param sw 该值大于0-表示空心矩形（描边宽），等于0-表示实心矩形
 */
function drawRect(x, y, w, h, c, sw) {
    const rect = new Konva.Rect({
        name: 'rect',
        x: x,
        y: y,
        width: w,
        height: h,
        fill: sw===0?c:null,
        stroke: sw>0?c:null,
        strokeWidth: sw,
        opacity: sw===0?0.5:1,
        //draggable: true
    });
    graphNow=rect;
    layer.add(rect);
    layer.draw();

    rect.on('mouseenter', function() {
        stage.container().style.cursor = 'move';
    });

    rect.on('mouseleave', function() {
        stage.container().style.cursor = 'default';
    });

    rect.on('dblclick', function() {
        // 双击删除自己
        this.remove();
        stage.find('Transformer').destroy();
        layer.draw();
    });
}



/**
 * 输入文字
 * @param x x坐标
 * @param y y坐标
 * @param fill 文字颜色
 * @param fs 文字大小
 */
function drawText(x, y, fill, fs) {
    var text = new Konva.Text({
        text: '双击编辑文字',
        x: x,
        y: y,
        fill: fill,
        fontSize: fs,
        width: 300,
        draggable: true
    });
    graphNow=text;
    layer.add(text);
    layer.draw();

    text.on('mouseenter', function() {
        stage.container().style.cursor = 'move';
    });

    text.on('mouseleave', function() {
        stage.container().style.cursor = 'default';
    });

    text.on('dblclick', function() {
        // 在画布上创建具有绝对位置的textarea

        // 首先，我们需要为textarea找到位置

        // 首先，让我们找到文本节点相对于舞台的位置:
        let textPosition = this.getAbsolutePosition();

        // 然后让我们在页面上找到stage容器的位置
        let stageBox = stage.container().getBoundingClientRect();

        // 因此textarea的位置将是上面位置的和
        let areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y
        };

        // 创建textarea并设置它的样式
        let textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        let T=this.text();
        if (T === '双击编辑文字') {
            textarea.value = '';
            textarea.setAttribute('placeholder','请输入文字')
        } else {
            textarea.value = T;
        }

        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.background = 'none';
        textarea.style.border = '1px dashed #000';
        textarea.style.outline = 'none';
        textarea.style.color = this.fill();
        textarea.style.width = this.width();

        // reset height
        textarea.style.height = 'auto';
        // after browsers resized it we can set actual value
        textarea.style.height = textarea.scrollHeight + 3 + 'px';
        textarea.focus();

        this.setAttr('text', '');
        layer.draw();

        // 确定输入的文字
        let confirm=(val) => {
            this.text(val?val:'双击编辑文字');
            layer.draw();
            // 隐藏在输入
            if (textarea) document.body.removeChild(textarea);
        };
        // 回车键
        let keydown=(e) => {
            if (e.keyCode === 13) {
                textarea.removeEventListener('blur', blur);
                confirm(textarea.value)
            }
        };
        // 鼠标失去焦点
        let blur=() => {
            textarea.removeEventListener('keydown', keydown);
            confirm(textarea.value);
        };

        textarea.addEventListener('keydown', keydown);
        textarea.addEventListener('blur', blur);
    });
}

/**
 * 画线
 * @param option Line所需数据对象
* */

function drawLine(option){
    const line=new Konva.Line({
        name: 'straightLine',
        points: option.points,
        stroke: option.stroke,
        strokeWidth: option.strokeWidth,
        tension:0,
        lineCap: 'round',
        lineJoin: 'round',
        bezier:false,
        draggable: true
    });
    graphNow = line;
    layer.add(line);
    //layer.draw();

    line.on('mouseenter', function() {
        stage.container().style.cursor = 'move';
    });

    line.on('mouseleave', function() {
        stage.container().style.cursor = 'default';
    });

    line.on('dblclick', function() {
        // 双击删除自己
        this.remove();
        stage.find('Transformer').destroy();
        layer.draw();
    });
}

/**
 * 圆形
 * @param x x坐标
 * @param y y坐标
 * @param fill 文字颜色
 * @param fs 文字大小
 * */

function drawCircle(option){
    const circle=new Konva.Circle({
        name: 'circle',
        x: option.x,
        y: option.y,
        radius: option.radius,
        fill: option.fill,
        stroke: option.stroke,
        strokeWidth: option.strokeWidth,
        draggable: true
    });
    graphNow = circle;
    layer.add(circle);
    layer.draw();

    circle.on('mouseenter', function() {
        stage.container().style.cursor = 'move';
    });

    circle.on('mouseleave', function() {
        stage.container().style.cursor = 'default';
    });

    circle.on('dblclick', function() {
        // 双击删除自己
        this.remove();
        stage.find('Transformer').destroy();
        layer.draw();
    });
}

/**
 * 圆形
 * @param x x坐标
 * @param y y坐标
 * @param fill 文字颜色
 * @param fs 文字大小
 * */

function drawEraser(option){
    const eraser = new Konva.Line({
        name: 'eraser',
        points: option.points,
        stroke: option.stroke,
        strokeWidth: option.strokeWidth * 5,
        lineCap: 'round',
        lineJoin: 'round',
        tension: 0.5,
        globalCompositeOperation:'destination-out',
        //draggable: true
        /*name: 'eraser',
        x: option.x,
        y: option.y,
        width: option.width,
        height: option.height,
        fill: '#FFF',
        stroke:'#000',
        strokeWidth: option.sw,
        opacity: option.sw===0?0.5:1,
        globalCompositeOperation:'destination-out',*/
     /*   sceneFunc: function (context) {
            var canvas = document.createElement("canvas");
            var context_bak = canvas.getContext('2d');
            context_bak.clearRect(0,0,width,height);
            context_bak.lineWidth = 1;
            context_bak.beginPath();
            context_bak.strokeStyle =  '#000000';
            context_bak.moveTo(option.x - size * 10, option.y - size * 10 );
            context_bak.lineTo(option.x + size * 10, option.y - size * 10 );
            context_bak.lineTo(option.x + size * 10, option.y + size * 10 );
            context_bak.lineTo(option.x - size * 10, option.y + size * 10 );
            context_bak.lineTo(option.x - size * 10, option.y - size * 10 );
            context_bak.stroke();
            if(drawing){
                context.clip();
                context.clearRect(option.x - size * 10 ,  option.y - size * 10 , size * 20 , size * 20);
            }
        },*/
    });

    graphNow = eraser;
    layer.add(eraser);
    layer.draw();
   /* eraser.on('mousemove', function() {
        stage.layer.target = 'default';
    });*/
}
/**
 * stage鼠标按下
 * @param flag 是否可绘制
 * @param ev 传入的event对象
 */
function stageMousedown(flag, ev) {
    if (flag) {
        let x=ev.evt.offsetX, y=ev.evt.offsetY;
        pointStart=[x, y];

        switch (flag) {
            case 'pencil':
                drawPencil(pointStart, graphColor, size);
                break;
            case 'ellipse':
                // 椭圆
                drawEllipse(x, y, 0, 0, graphColor, size);
                break;
            case 'rect':
                drawRect(x, y, 0, 0, graphColor, size);
                break;
            case 'rectH':
                drawRect(x, y, 0, 0, graphColor, size);
                break;
            case 'text':
                drawText(x, y, graphColor, 16);
                break;
            case 'circle'://画圆
                drawCircle({
                    x: x,
                    y: y,
                    radius: 0,
                   /* fill: 'white',*/
                    stroke: graphColor,
                    strokeWidth: size,
                });
                break;
            case 'line'://画线
                drawLine({
                    points:pointStart,
                    stroke:graphColor,
                    strokeWidth:size,
                });
                break;
            case 'eraser'://橡皮擦
                drawEraser({
                    x:x,
                    y:y,
                    points:pointStart,
                    stroke:graphColor,
                    strokeWidth:size});
                break;
                //layer.getCanvas().getContext().clearRect(x - size * 10 ,  y - size * 10 , size * 20 , size * 20);
                //stage.setLayers(layer)
                /*drawEraser({
                    x:x,
                    y:y,
                    width: size * 10,
                    height: size * 10,
                });*/
                /*drawEraser({
                    points:[pointStart[0], pointStart[1], pointStart[0], pointStart[1]],
                    sw:size * 10,
                });*/
                break;
            default:
                break;
        }
        drawing=true;
    }
}

/**
 * stage鼠标移动
 * @param flag 是否可绘制
 * @param ev 传入的event对象
 */
function stageMousemove(flag, ev) {
    switch (flag) {
        case 'pencil':
            // 铅笔
            pointStart.push(ev.evt.offsetX, ev.evt.offsetY);
            graphNow.setAttrs({
                points: pointStart
            });
            break;
        case 'ellipse':
            // 椭圆
            graphNow.setAttrs({
                radiusX: Math.abs(ev.evt.offsetX-pointStart[0]),
                radiusY: Math.abs(ev.evt.offsetY-pointStart[1])
            });
            break;
        case 'rect':
        case 'rectH':
            graphNow.setAttrs({
                width: ev.evt.offsetX-pointStart[0],
                height: ev.evt.offsetY-pointStart[1]
            });
            break;
        case 'circle':
            graphNow.setAttrs({
                radius:Math.abs(ev.evt.offsetX-pointStart[0])
            });
            break;
        case 'line':
            pointStart[2] = ev.evt.offsetX;
            pointStart[3] = ev.evt.offsetY;
            graphNow.setAttrs({
                points:pointStart
            });
            break;
        case 'eraser':
            pointStart.push(ev.evt.offsetX, ev.evt.offsetY);
            graphNow.setAttrs({
                points: pointStart
            });
            //layer.getCanvas().getContext().clearRect(ev.evt.offsetX - size * 10,  ev.evt.offsetY - size * 10, size * 20, size * 20);
            /*graphNow.setAttrs({
                x: ev.evt.offsetX,
                y: ev.evt.offsetY,
                size:size,
            });*/
           /* drawEraser({
                x:ev.evt.offsetX,
                y:ev.evt.offsetY,
            });*/
            ;
            /*pointStart.push(ev.evt.offsetX, ev.evt.offsetY);
            graphNow.setAttrs({
                points: pointStart
            });
            const pos = stage.getPointerPosition();
            var newPoints = pointStart.concat([pos.x, pos.y]);
            graphNow.setAttrs({
                points: newPoints
            });*/
            break;
        default:
            break;
    }
    if(flag!='eraser'){
        layer.draw();
    }
}


/**
 * stage鼠标抬起
 * @param flag 是否可绘制
 * @param ev 传入的event对象
 */
function stageMouseup(flag, ev) {
    switch (flag) {
        case 'line':
            pointStart.push(ev.evt.offsetX, ev.evt.offsetY);
            graphNow.setAttrs({
                points:pointStart
            });
            break;
        default:
            break;
    }
    if(flag!='eraser'){
        layer.draw();
    }
}
