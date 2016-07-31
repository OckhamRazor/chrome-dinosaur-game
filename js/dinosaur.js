/**
 * Created by baobaobao on 2016/7/29.
 */

/************************************************************************************
 *                                  精灵对象-小恐龙
 ************************************************************************************/
var Dinosaur = {
    sprite: null,  //精灵对象
    spriteSheetPainter: null, //绘制精灵对象

    //不同帧形成的坐标数组
    runCoordinate: [ 
        // {left:1681, top: 0, width:80, height:96},
        // {left:1769, top: 0, width:81, height:96},
        {left:1858, top: 0, width:80, height:96, drawWidth:80*0.6,drawHeight:96*0.6},
        {left:1945, top: 0, width:80, height:96, drawWidth:80*0.6,drawHeight:96*0.6}
        // {left:2033, top: 0, width:80, height:96},
        // {left:2121, top: 0, width:80, height:96}
    ],
    deadCoordinate: [{left:2033, top: 0, width:80, height:96,drawWidth:80*0.6,drawHeight:96*0.6}],
    gbCoordinate: [
        {left:2206, top:38, width:110, height:54, drawWidth:110*0.6, drawHeight:54*0.6},
        {left:2325, top:38, width:110, height:54, drawWidth:110*0.6, drawHeight:54*0.6},
    ],

    RISE_DURATION: 350,  //起跳至顶点的时间
    FALL_DURATION: 250,  //从顶点落下的时间
    HEIGHT: 100,
    riseTimer: null,
    fallTimer: null,
    height: 1,

    //初始化小恐龙
    init: function (canvas,image) {
        this.sprite = Object.create(Sprite);  //关联精灵对象
        this.spriteSheetPainter = Object.create(SpriteSheetPainter);  //关联精灵图绘制对象

        //初始化精灵图绘制对象
        this.spriteSheetPainter.init(image,this.runCoordinate);
        //初始化精灵对象
        this.sprite.name = 'dinosaur';
        this.sprite.top = canvas.height - this.runCoordinate[0].drawHeight - 8;
        this.sprite.left = 20;
        this.sprite.painter = this.spriteSheetPainter;
        this.sprite.behaviors = [this.runInplace,this.jump];

        this.sprite.initShape(this.sprite.left+6,this.sprite.top+8,this.runCoordinate[0].drawWidth-15,this.runCoordinate[0].drawHeight-8);
        this.initTimeWarp();

        this.jump.self = this; //设置jump对this作用域的正确引用
        this.runInplace.self = this; //设置jump对this作用域的正确引用
        this.jump.orignTop = this.sprite.top; //设置初始的小恐龙高度
    },

    /************************************************************************************
     *                      初始化扭曲时间对象（模拟非线性运动)
     ************************************************************************************/
    //初始化时间扭曲
    initTimeWarp: function () {
        this.riseTimer = Object.create(TimeWarper);
        this.fallTimer = Object.create(TimeWarper);

        this.riseTimer.init(this.RISE_DURATION, TimeWarper.makeEaseOut(0.9));
        this.fallTimer.init(this.FALL_DURATION, TimeWarper.makeEaseIn(0.9));
    },
    //更新小恐龙的高度
    updateDinosaur: function () {
        if (this.riseTimer.isRunning()){  //如果上升时间计时器正在计时
            if (this.riseTimer.isOver()){  //如果上升计时结束
                this.riseTimer.stop();  //停止上升计时器
                this.height = this.HEIGHT;  //此时的高度为跳跃最高点
                this.fallTimer.start();  //下落计时器启动
            }else{
                //小恐龙的跳跃高度为 最高高度 * （扭曲后的时间 / 执行总时间）
                this.height = this.HEIGHT - this.HEIGHT / this.RISE_DURATION * this.riseTimer.getElapsedTime()+1;
            }
        }else if (this.fallTimer.isRunning()){
            if (this.fallTimer.isOver()){
                this.fallTimer.stop();
                this.height = 0;
            }else{
                this.height = this.HEIGHT- this.HEIGHT / this.FALL_DURATION * this.fallTimer.getElapsedTime();
            }
        }
    },
    //死亡就瞪 24K恐龙眼
    dead: function () {
        this.sprite.top = canvas.height - this.runCoordinate[0].drawHeight - 8;
        this.jump.orignTop = this.sprite.top;
       this.spriteSheetPainter.cells = this.deadCoordinate;
       this.spriteSheetPainter.cellIndex = 0;
    },
    //暴走状态
    goBallistic: function (canvas) {
        this.spriteSheetPainter.cells = this.gbCoordinate;
        this.sprite.top = canvas.height - this.runCoordinate[0].drawHeight+15;
        this.jump.orignTop = this.sprite.top;
    },
    //重置使其恢复到原始状态
    reset: function (canvas) {
        this.height = 1;
        this.riseTimer.stop();
        this.fallTimer.stop();
        this.runInplace.lastAdvance = 0;
        this.jump.status = false;
        this.dead.status = false;
        this.spriteSheetPainter.cells = this.runCoordinate;
        this.sprite.top = canvas.height - this.runCoordinate[0].drawHeight - 8;
        this.jump.orignTop = this.sprite.top;
    },
    /*************************************************************************************
     *                           行为属性
     *************************************************************************************/
    runInplace: {   //原地跑
        self: null,
        lastAdvance: 0,
        PAGE_FLIP_INTERVAL: 100,  //每100ms执行一帧

        execute: function (sprite,context,time,frameTime) {
            if (this.self.jump.status){
                return;
            }

            if (time - this.lastAdvance > this.PAGE_FLIP_INTERVAL){ //当超过100ms，播放下一帧
                sprite.painter.advance();  //执行绘画指令
                this.lastAdvance = time;
            }
        }
    },
    jump:{  //跳跃
        self: null,
        status: false, //false 表示现在没有按键跳跃指令，不执行跳跃动作
        orignTop: 0,
        execute: function (sprite,context,time,frameTime) {
            if (this.status){
                if (this.self.height <= 0){  //当高度变为零时，则说明下落至地面（因为设置了上升时的起初高度总是大于1）
                    this.status = false;
                }

                var delta = 0,
                    spriteTop = sprite.top;  //记录上一次的精灵高度
                sprite.top = this.orignTop - this.self.height;
                delta = sprite.top - spriteTop;   //计算两次变化的移动距离

                sprite.shape.move(0, delta);  //调整形状对象跟随精灵移动
            }
        }
    }
};
