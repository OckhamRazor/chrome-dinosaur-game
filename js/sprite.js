/**
 * Created by baobaobao on 2016/7/27.
 */


/*******************************************************************************
 *                          绘制精灵表对象（带帧数的图像）
 *******************************************************************************/
var SpriteSheetPainter = {
    image: null,   //Sprite图片
    cells: [],     //Sprite不同帧对应坐标形成的数组
    cellIndex: 0,  //当前显示帧数

    //初始化精灵表对象，包括图片和坐标
    init: function (image,cells) {
        this.image = image;
        this.cells = cells;
    },
    //每调用一次改变一帧
    advance:function () {
        if (this.cellIndex === this.cells.length-1){
            this.cellIndex = 0;
        }else{
            this.cellIndex++;
        }
    },
    //绘制当前帧 图像
    paint:function (sprite, context) {
        var cell = this.cells[this.cellIndex];
        context.save();
        context.drawImage(this.image,cell.left,cell.top,cell.width,cell.height,
                            sprite.left,sprite.top,cell.drawWidth,cell.drawHeight);
        context.restore();
    }
};


/****************************************************************************
 *                  绘制静态图像对象（只有一帧）
 ***************************************************************************/
var ImagePainter = {
    cell: null,  //图片对象坐标对象
    image: null,  //Sprite图片

    //初始化Sprite图片属性
    init: function (image) {
        this.image = image;
    },
    //绘制静态图像
    //当前默认图片资源为Sprite图
    paint: function (sprite,context) {

        context.save();
        context.drawImage(this.image,this.cell.left,this.cell.top,this.cell.width,this.cell.height,
            sprite.left,sprite.top,this.cell.drawWidth,this.cell.drawHeight);
        context.restore();
    }
};


/****************************************************************************
 *                  精灵对象（两个基础属性： 1.绘制对象 2.行为对象）
 ***************************************************************************/
var Sprite = {
    name: '',
    painter: undefined,
    shape: null,

    top: 0,
    left: 0,
    width: 0,
    height: 0,
    velocityX: 0,
    velocityY: 0,

    visible: true,
    shapeVisible: false,
    animating: false,
    behaviors: [],

    //绘制当前精灵图像
    //具体图像可以为 多帧的动图 或者 静态图
    paint: function (context) {
         if (this.painter !== undefined && this.visible){
             this.painter.paint(this,context);
         }
    },
    //更新精灵对象拥有的行为
    //行为可以为 水平移动/帧数变化/...
    update:function (context, time, frameTime) {
        for(var i=0;i<this.behaviors.length;i++){
            this.behaviors[i].execute(this,context,time,frameTime);
        }
    },

    /*************************************************************************************
     *                            形状属性
     *************************************************************************************/
    initShape: function (left,top,width,height) {
        var polygonPoints = [
            new Point(left, top),
            new Point(left, top + height),
            new Point(left + width, top + height),
            new Point(left + width, top),
            new Point(left, top)
        ];


        var polygon = new Polygon(this.shapeVisible);
        for (var i = 0, len = polygonPoints.length; i < len; i++) {
            polygon.addPoint(polygonPoints[i].x, polygonPoints[i].y);
        }
        this.shape = polygon;
        this.shape.fillStyle = 'orange';
    },
    //设置模拟碰撞形状的 可见性
    setVisible: function (visible) {
        this.shapeVisible = visible;
    }
};
