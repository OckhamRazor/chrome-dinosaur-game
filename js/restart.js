/**
 * Created by baobaobao on 2016/7/30.
 */
var Restart = {
    top: 0,
    left: 0,

    //restart坐标（相对Sprite而言）
    coordinate:{
        left:3,top:3,width:69,height:61,drawWidth:69*0.8,drawHeight:61*0.8
    },
    /*******************************************************************************
     *                          Function
     *******************************************************************************/
    init: function (canvas) {
        this.left = (canvas.width-this.coordinate.drawWidth)/2;
        this.top = (canvas.height-this.coordinate.drawHeight)/2 + 30;
       },
    //绘制重新游戏图标
    drawRestart: function (context,image) {
        context.save();
        context.drawImage(image,this.coordinate.left,this.coordinate.top,this.coordinate.width,this.coordinate.height,
            this.left,this.top,this.coordinate.drawWidth,this.coordinate.drawHeight);
        context.restore();
    },
    //返回鼠标相对于画布的坐标
    windowToCanvas:function (canvas,e) {
        var x = e.x || e.clientX,
            y = e.y || e.clientY,
            box = canvas.getBoundingClientRect();

        return { x: x - box.left * (canvas.width / box.width),
            y: y - box.top  * (canvas.height / box.height)
        };
    },
    //注册重新开始事件
    addClickEvent: function (game,canvas) {
        var self = this;
        var keyDown = function keyDown(e) {
            if (e.keyCode === 32){
                game.restart();

                canvas.onclick = null;
                window.removeEventListener('keydown',keyDown);
            }
        };
        //绑定点击事件
        canvas.onclick = function click(e) {
            var location = self.windowToCanvas(canvas,e);

            if ( self.left<location.x && location.x<self.left+self.coordinate.drawWidth &&
                self.top<location.y && location.y<self.top+self.coordinate.drawHeight){
                game.restart();
                window.removeEventListener('keydown',keyDown);
                canvas.onclick = null;
            }
        };
        //绑定键盘事件
        window.addEventListener('keydown',keyDown);
    }
};