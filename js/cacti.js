/**
 * Created by baobaobao on 2016/7/28.
 */

/*******************************************************************************
 *                          精灵对象-仙人掌
 *******************************************************************************/

var Cacti = {
    sprite: null, //精灵对象
    imagePainter: null, //绘制静态精灵图对象

    //用于显示不同组合的仙人掌的坐标
    coordinate: [
        {left:654, top:0, width:46, height:95,drawWidth:46*0.6,drawHeight:95*0.6}, //one-1
        {left:754, top:0, width:46, height:95,drawWidth:46*0.6,drawHeight:95*0.6}, //one-2
        {left:754, top:0, width:94, height:95,drawWidth:94*0.6,drawHeight:95*0.6}, //two-1
        {left:654, top:0, width:93, height:95,drawWidth:93*0.6,drawHeight:95*0.6}, //two-2
        {left:851, top:0, width:98, height:95,drawWidth:98*0.6,drawHeight:95*0.6}  //three
    ],

    //初始化仙人掌
    init: function (canvas,image,type) {
        this.sprite = Object.create(Sprite);  //关联精灵对象
        this.imagePainter = Object.create(ImagePainter);  //关联静态图片绘制对象

        this.sprite.name = 'cacti';
        this.sprite.painter = this.imagePainter;
        this.imagePainter.cell = this.coordinate[type];
        this.imagePainter.image = image;
        this.sprite.behaviors = [this.move];


        //默认初始位置为画布最右侧，不在画布内
        this.sprite.top = canvas.height-this.coordinate[type].drawHeight-5;
        this.sprite.left = canvas.width;

        this.sprite.initShape(this.sprite.left,this.sprite.top+10,this.coordinate[type].drawWidth-10,this.coordinate[type].drawHeight);
    },
    //设置仙人掌移动速度
    setVelocity: function (rate) {
        this.move.velocityX = 300*rate;
    },
    reset: function () {
        this.move.velocityX = 300;
    },
    /*******************************************************************************
     *                          行为属性
     *******************************************************************************/
    move: {
        velocityX: 300, //设置与地面一样的水平移动速度

        execute:function (sprite,context,time,frameTime) {
            var delta =  this.velocityX*frameTime;
            sprite.shape.move(-delta,0);
            sprite.left -= delta;
        }
    }
};



