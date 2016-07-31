/**
 * Created by baobaobao on 2016/7/30.
 */

/*******************************************************************************
 *                           精灵对象-翼龙
 *******************************************************************************/

var Pterosaur = {
    sprite: null,  //精灵对象
    spriteSheetPainter: null,  //绘制精灵对象

    //用于显示不同帧的翼龙的坐标
    coordinate: [
        {left:264, top:0, width:88, height:80,drawWidth:88*0.6,drawHeight:40*0.6},
        {left:356, top:0, width:88, height:80,drawWidth:88*0.6,drawHeight:40*0.6}
    ],

    //初始化
    init: function (canvas,image,top) {
        this.sprite = Object.create(Sprite);   //关联精灵对象
        this.spriteSheetPainter = Object.create(SpriteSheetPainter); //关联静态图片绘制对象

        this.sprite.name = 'pterosaur';
        this.sprite.painter = this.spriteSheetPainter;
        this.spriteSheetPainter.cells = this.coordinate;
        this.spriteSheetPainter.image = image;
        this.sprite.behaviors = [this.move, this.flyInplace];

        this.sprite.top = top;
        this.sprite.left = canvas.width;

        this.move.self = this;
        this.sprite.initShape(this.sprite.left+6,this.sprite.top+5,this.coordinate[0].drawHeight,this.coordinate[0].drawHeight);
    },
    //设置仙人掌移动速度
    setVelocity: function (rate) {
        this.move.velocityX = 400*rate;
    },
    reset: function () {
        this.move.velocityX = 400;
    },
    /*************************************************************************************
     *                           行为属性
     *************************************************************************************/
    move:{
        velocityX: 400, //速度略微比地面快一点

        execute:function (sprite,context,time,frameTime) {
            var delta = 0;
            delta = this.velocityX*frameTime;
            sprite.left -= delta;
            sprite.shape.move(-delta,0);
        }
    },

    flyInplace:{
        lastAdvance: 0,
        PAGE_FLIP_INTERVAL: 200, //200ms 播放一帧图像

        execute:function (sprite,context,time,frameTime) {
            if (time - this.lastAdvance > this.PAGE_FLIP_INTERVAL){
                sprite.painter.advance();
                this.lastAdvance = time;
            }
        }
    }
};



