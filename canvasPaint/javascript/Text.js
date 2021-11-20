/**
 * 输入文字
 * @param x x坐标
 * @param y y坐标
 * @param fill 文字颜色
 * @param fs 文字大小
 * @param startX 文字横坐标
 * @param startY 文字纵坐标
 */
function Textarea(option) {
    this._init(option);
}

Textarea.prototype = {
    _init: function (option) {
        this.text = '';
        this.x = option.x;
        this.y = option.y;
        this.fill = option.fill;
        this.fontSize = option.fs;
        this.width = 300;
        this.height = 60;
        this.draggable = true;
        this.startX = option.startX;
        this.startY = option.startY;
    },
    addTextArea:function () {
// 在画布上创建具有绝对位置的textarea

        // 首先，我们需要为textarea找到位置

        // 首先，让我们找到文本节点相对于舞台的位置:
        //let textPosition = this.getAbsolutePosition();

        // 然后让我们在页面上找到stage容器的位置
        //let stageBox = stage.container().getBoundingClientRect();

        // 因此textarea的位置将是上面位置的和
        let areaPosition = {
            /*x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y*/
            x: this.x,
            y: this.y,
        };

        // 创建textarea并设置它的样式
        let textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        /* let T = textarea.value;
         if (T === '双击编辑文字') {
             textarea.value = '';
             textarea.setAttribute('placeholder', '')
         } else {
             textarea.value = T;
         }*/

        // textarea.placeholder = '请输入文字';
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.background = 'none';
        textarea.style.border = '1px dashed #000';
        textarea.style.outline = 'none';
        textarea.style.color = this.fill;
        textarea.style.width = this.width + 'px';
        textarea.style.fontSize = this.fontSize;
        // reset height
        textarea.style.height = this.height + 'px';
        // after browsers resized it we can set actual value
        textarea.style.height = textarea.scrollHeight + 'px';
        textarea.focus();

        this.text = '';
        //layer.draw();

        //确定输入的文字
        let confirm = (val) => {
            textarea.valueOf(val ? val : '双击编辑文字');
            //layer.draw();
            context.fillText(val, this.startX, this.startY);
            // 隐藏在输入
            if (textarea) document.body.removeChild(textarea);
        };
        // 回车键
        let keydown = (e) => {
            if (e.keyCode === 13) {
                textarea.removeEventListener('blur', blur);
                confirm(textarea.value)
            }
        };
        // 鼠标失去焦点
        let blur = () => {
            textarea.removeEventListener('keydown', keydown);
            confirm(textarea.value);
        };

        textarea.addEventListener('keydown', keydown);
        textarea.addEventListener('blur', blur);
    }
}
