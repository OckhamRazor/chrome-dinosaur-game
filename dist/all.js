/**
 * Created by baobaobao on 2016/7/29.
 */
/**
 * Created by baobaobao on 2016/7/27.
 */

/********************************************************************
 *              背景的绘制-云、地板、最高分
 ********************************************************************/

var Background = (function () {
    //云
    var cloud =  {
        offset:0,
        velocity:20,
        coordinate:{x:163, y:0, width:100, height:32}
    };
    //地面
    var ground =  {
        offset:0,
        velocity:300,
        coordinate:{x: 12, y:100, width:2400, height:24}
    };

    /**
     * 画背景图
     */
    function draw(context,image,fps) {
        //计算相对于画布的偏移
        ground.offset = ground.offset < ground.coordinate.width ? ground.offset + ground.velocity / fps : 0;
        cloud.offset = cloud.offset < ground.coordinate.width ? cloud.offset + cloud.velocity / fps : 0;
        //执行画背景 - 土地
        context.save();
        context.translate(-ground.offset, 0);
        context.drawImage(image, ground.coordinate.x, ground.coordinate.y, 2400, ground.coordinate.height, 0, canvas.height - ground.coordinate.height,2400, ground.coordinate.height);
        context.drawImage(image, ground.coordinate.x, ground.coordinate.y, 2400, ground.coordinate.height, 2400-12, canvas.height - ground.coordinate.height,2400, ground.coordinate.height);
        context.restore();
        //执行画背景 - 云
        context.save();
        context.translate(-cloud.offset, 0);
        context.drawImage(image, cloud.coordinate.x, cloud.coordinate.y, cloud.coordinate.width, cloud.coordinate.height, 100, 30,cloud.coordinate.width, cloud.coordinate.height);
        context.drawImage(image, cloud.coordinate.x, cloud.coordinate.y, cloud.coordinate.width, cloud.coordinate.height, 800, 30,cloud.coordinate.width, cloud.coordinate.height);
        context.drawImage(image, cloud.coordinate.x, cloud.coordinate.y, cloud.coordinate.width, cloud.coordinate.height, 1100, 30,cloud.coordinate.width, cloud.coordinate.height);
        context.drawImage(image, cloud.coordinate.x, cloud.coordinate.y, cloud.coordinate.width, cloud.coordinate.height, 1800, 30,cloud.coordinate.width, cloud.coordinate.height);
        context.restore();
    }
    //恢复初始设置
    function reset() {
        cloud.offset = 0;
        ground.offset = 0;
        cloud.velocity = 20;
        ground.velocity = 300;
    }
    //设置背景移动速率
    function setVelocity(rate) {
        cloud.velocity = 20*rate;
        ground.velocity = 300*rate;
    }
    return {
        drawBackground: draw,
        setVelocity: setVelocity,
        reset: reset
    };
})();




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

/**
 * Created by baobaobao on 2016/7/28.
 */

function getTimeNow() {
    return +new Date();
}

var Game = {
    gameName: '',   //游戏名称
    canvasId: '',  //画布Id

    canvas: null,
    context: null,

    sprites: [],  //精灵对象数组
    shapes: [], //模拟精灵的形状 用于实现碰撞机制

    startTime: 0,   //游戏开始时间
    lastTime: 0,  //上一帧的时间节点
    gameTime: 0,  //游戏持续时间
    frameTime: 0, //一帧画面运行的时间

    fps:0,  //游戏实际帧数
    START_FPS: 60, //游戏开始默认帧数
    startedPauseAt: 0, //游戏暂停时间点
    PAUSE_TIMEOUT: 100,  //暂停时游戏刷新频率 1000/100 = 10 fps/s

    paused: false,
    loading: true,  //游戏加载状态标志位
    gameOver: false,  //游戏结束标志位
    passGame: false, //游戏通关标志位

    //初始化 Game 对象
    init: function (name,canvasId) {
        this.gameName = name;
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');

        this.soundInit();
        this.keyEventInit();
    },

    start: function () {
        var self = this;
        this.startTime = getTimeNow();  //记录游戏开始时间
        requestAnimationFrame(function (time) {
            self.animate(time);
        });
    },

    //更新 fps/gameTime/lastTime
    tick: function (time) {
        this.updateFrameRate(time);
        this.lastTime = time;
    },
    //计算当前 fps
    updateFrameRate: function (time) {
        if (this.lastTime === 0){
            this.fps = this.START_FPS;
        }else{

            //这里做一下处理，因为暂停事件会引起
            // time来不及变化而小于lastTime
            var frameTime = (time - this.lastTime)/1000;
            this.frameTime = frameTime>0 && frameTime < 0.5?frameTime:0;
            this.fps = 1/this.frameTime;
        }
    },
    //切换 运行/暂停 状态
    togglePaused: function () {
        var now = getTimeNow();

        this.paused = !this.paused;
        if (!this.paused){
            //调整上一帧的时间
            this.lastTime = this.lastTime + now- this.startedPauseAt;
        }else{
            this.startedPauseAt = now;
        }
    },

    animate: function (time) {
        var self = this;
        if (this.gameOver){  //如果游戏结束，则停止动画
            return;
        }
        if (this.paused){
            //暂停状态
            //设置 PAUSE_TIMEOUT 刷新一次，减轻CPU的压力
            setTimeout(function () {
                self.animate(time);
            },this.PAUSE_TIMEOUT);
        }else{
            //游戏状态
            this.tick(time);  //更新fps，gameTime
            this.clearScreen();  //清屏，准备下一帧画面

            this.startAnimate(time);
            this.paintUnderSprites();
            this.paintOverSprites();
            this.paintShapes();

            this.updateSprites(time);   //调用精灵对象的行为
            this.paintSprites(time);    //画精灵对象

            this.endAnimaet();

            requestAnimationFrame(function (time) {
                self.animate(time);
            });
        }
    },

    clearScreen:function () {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    },

    //计算每一帧变化的像素单位大小
    pixelsPerFrame: function (velocity) {
        return velocity/this.fps;
    },

    //按照需求重写以下函数
    startAnimate: function () {},
    paintUnderSprites: function () {},
    paintOverSprites: function () {},
    endAnimate: function () {},
    over: function () {},
    restart: function () {},
    pass: function () {},
    destroy: function () {},

    /****************************************************************************************
     *                          图片加载属性和方法
     ****************************************************************************************/
    imageLoadingProgressCallback: null,
    images: [],  //键-URL / 值-image对象
    imageUrls: [],  //需要加载的图片URL
    imagesLoaded: 0,  //加载成功计数器
    imagesFailedToLoad: 0, //加载失败计数器
    imagesIndex: 0,
    //返回URL相对应的图片
    getImage: function (imageUrl) {
        return this.images[imageUrl];
    },
    //图片加载成功回调函数
    imageLoadedCallback: function () {
        this.imagesLoaded++;
    },
    //图片加载失败回调函数
    imageLoadErrorCallback: function (e) {
        this.imagesFailedToLoad++;
    },
    //加载图片方法
    loadImage: function (imageUrl) {
        var image = new Image(),
            self = this;

        image.src = imageUrl;
        image.addEventListener('load', function (e) {
            self.imageLoadedCallback(e);
        });
        image.addEventListener('error', function (e) {
            self.imageLoadErrorCallback(e);
        });

        this.images[imageUrl] = image;
    },
    //加载下一副图片
    //返回完成图片数组的加载进度
    loadImages: function () {
        if (this.imagesIndex < this.imageUrls.length){
            this.loadImage(this.imageUrls[this.imagesIndex]);
            this.imagesIndex++;
        }
        //返回完成百分比
        //完成百分比 = （（失败数+成功数）/ 图片总数 ）* 100%
        return (this.imagesLoaded+this.imagesFailedToLoad)/this.imageUrls.length*100;
    },
    //添加图片 URL 入队列
    //图片将在 loadImages 中逐个加载
    queueImage: function (imageUrl) {
        this.imageUrls.push(imageUrl);
    },

    /****************************************************************************************
     *                          声音加载属性和方法
     ****************************************************************************************/
    soundOn: true,  //音频开启状态
    soundChannels: [], //音频通道
    audio: null,
    NUM_SOUND_CHANNELS: 10, //音频通道数

    //初始化音频
    soundInit: function () {
        this.audio = new Audio();

        for (var i=0;i<this.NUM_SOUND_CHANNELS;i++){
            var audio = new Audio();
            this.soundChannels.push(audio);
        }
    },
    //查询浏览器的支持情况
    canPlayOggVorbis: function () {
        return '' !== this.audio.canPlayType('audio/ogg; codecs="vorbis"');
    },
    
    canPlayMp4: function () {
        return '' !== this.audio.canPlayType('audio/mp4');
    },
    //获取一个未被占用的声音通道
    getAvailableSoundChannel: function () {
        var audio;

        for(var i=0;i<this.NUM_SOUND_CHANNELS;i++){
            audio = this.soundChannels[i];
            if (audio.played && audio.played.length>0){
                if (audio.ended){
                    return audio;
                }
            }else{
                if (!audio.ended){
                    return audio;
                }
            }
        }
        return undefined; //所有通道都在使用
    },
    //选择一个未被占用的通道播放声音
    playSound:function (id) {
        var track = this.getAvailableSoundChannel(),
            element = document.getElementById(id);
            //src = element.getElementsByTagName('source')[0].src;

        if (track && element){
            track.src = element.src;
            track.load();
            track.play();
        }
    },


    /****************************************************************************************
     *                              键盘事件
     ****************************************************************************************/
    keysListeners: [], //压入数组的对象需要的格式{key:..., listener:....}
    //初始化键盘监听事件
    keyEventInit: function() {
        var self = this;
        // window.addEventListener('keypress',function (e) {
        //     self.keyPressed(e);
        // });
        window.addEventListener('keydown',function (e) {
            self.keyPressed(e);
        });
    },
    //将监听事件压入keyListeners集合
    addKeyListener: function (keyAndListener) {
        this.keysListeners.push(keyAndListener);
    },
    //根据键来查找对应的监听事件
    findKeyListener: function (key) {
        var listener;

        this.keysListeners.forEach(function (keyAndListener) {
            var currentKey = keyAndListener.key;
            if (currentKey === key){
                listener = keyAndListener.listener;
            }
        });
        return listener;
    },
    //查找键位相对应的监听事件，并调用其方法
    keyPressed: function (e) {
        var listener,key;

        switch (e.keyCode){
            //在这里加入你希望的键位
            case 32: key='space'; break;
            case 83: key='s'; break;
            case 80: key='p'; break;
            case 82: key='restart'; break;
            case 37: key='left arrow'; break;
            case 39: key='right arrow'; break;
            case 38: key='up arrow'; break;
            case 40: key='down arrow'; break;
        }
        listener = this.findKeyListener(key);
        if (listener){
            listener();
        }
    },

    /****************************************************************************************
     *                  最高分（注：如需要修改代码设置成高分榜）
     ****************************************************************************************/
    HIGH_SCORES_SUFFIX: '_highscores',
    score: 0,  //当前游戏分数
    highestScore: 0, //游戏历史最高分
    //获取高分榜数据
    getHighScores: function () {
        var key = this.gameName+this.HIGH_SCORES_SUFFIX,
            highScoresString = sessionStorage[key];  //这里也可以选择sessionStorage,这样当页面关闭数据也随之消除
            //如果最高分不存在，则初始化为0
            if(highScoresString === undefined){
                sessionStorage[key] = 0;
            }
            return sessionStorage[key];
    },
    //设置最高分
    setHighScore: function (highScore) {
        var key = this.gameName + this.HIGH_SCORES_SUFFIX;
        var highestScore = this.getHighScores(); //获取历史最高分
        if( highScore > highestScore){  //判断是否为当前最高分，是则将其替换
            sessionStorage[key] = highScore;
            this.highestScore = highScore;
        }
    },
    //清空高分榜
    clearHighScores: function () {
        localStorage[this.gameName + game.HIGH_SCORES_SUFFIX] = JSON.stringify([]);
    },

    /****************************************************************************************
     *                                  Sprites
     ****************************************************************************************/
    //添加一个精灵对象
    //游戏引擎会在 animate() 方法中 调用 update和paint方法
    addSprite: function (sprite) {
        this.sprites.push(sprite);
    },
    //根据精灵名字获取精灵对象
    getSprite: function (name) {
        for(var i=0,len=this.sprites.length;i<len;i++){
            if (this.sprites[i].name === name){
                return this.sprites[i];
            }
        }
        return null;
    },
    //更新所有精灵对象
    updateSprites: function (time) {
        for(var i=0,len=this.sprites.length;i<len;i++){
            var sprite = this.sprites[i];
            sprite.update(this.context, time, this.frameTime);  //update() 将执行精灵对象的行为
        }
    },
    //绘制所有可见的精灵对象
    paintSprites: function () {
        var len,sprite;
        for(var i=1;i<this.sprites.length;i++){

            sprite = this.sprites[i];
            //当精灵对象移出窗口-100px时，移除此精灵和其模拟形状
            //这里的100，我大致取了个值
            if (sprite.left < -100 ){
                this.sprites.splice(i,1);
                this.shapes.splice(i,1);
            }
        }

        for(i=0,len=this.sprites.length;i<len;i++){
            sprite = this.sprites[i];
            if (sprite.visible){
                sprite.paint(this.context);
            }
        }
    },
    /****************************************************************************************
     *                                  Shape
     ****************************************************************************************/
    //添加模拟精灵的形状对象
    addShape: function (shape) {
        this.shapes.push(shape);
    },
    //绘制模拟形状
    paintShapes: function () {
        for(var i=0,len=this.shapes.length;i<len;i++){
            var shape = this.shapes[i];
            if (shape.visible){
                shape.stroke(game.context);
                shape.fill(game.context);
            }
        }
    },

    /****************************************************************************************
     *                                  碰撞检测函数
     ****************************************************************************************/
    detectCollisions: function () {}

};


/**
 * Created by baobaobao on 2016/7/28.
 */

var Game = (function () {
    //创建游戏
    var game =  Object.create(Game);
    //初始化 game 对象
    game.init('game','canvas');
    game.soundInit(); //初始化音轨
    //Sprite.setVisible(true); //设置模拟碰撞形状可见

    //实现动画回调函数
    game.paintUnderSprites = function () {
        //画一些将要绘制于精灵对象之下的物体
        if(!game.loading){
            Background.drawBackground(game.context,game.images[SPRITE_URL],game.fps);
            dinosaur.updateDinosaur();
        }
    };

    game.paintOverSprites = function () {
        //画一些将要绘制于精灵对象之上的物体
    };

    game.startAnimate = function () {
        //如果未加载完毕，则继续加载资源文件
        if (game.loading){ //true 表示正在加载
            if (game.loadImages() === 100){
                //这里执行加载完成后需要做的事情
                game.loading = false;  //设置当前加载标志位
                addDinosaurSprite();  //添加主角-小恐龙
                //开局跳跃一次
                if (!game.loading && !game.paused && !game.gameOver){  //当 暂停/加载/游戏结束 的时候不触发跳跃
                    //如果已经处于跳跃状态，则跳过此次触发事件
                    if(dinosaur.riseTimer.isRunning() || dinosaur.fallTimer.isRunning()){
                        return;
                    }
                    dinosaur.jump.status = true;
                    dinosaur.riseTimer.start();
                    game.playSound('jump');
                }
            }
        }

        //如果处于 加载状态/游戏暂停/游戏结束,则跳过这个方法（即不执行碰撞检测）
        if(game.loading || game.paused || game.gameOver){
            return;
        }
        if (game.highestScore>0){
            Score.drawHIScore(game.canvas,game.context,game.images[SPRITE_URL],game.highestScore);
        }
        Score.drawCurrentScore(game.canvas,game.context,game.images[SPRITE_URL],parseInt(game.score)); //绘制当前分数

        if (game.passGame){  //如果游戏结束则，则显示背景和分数，不再添加障碍物
            return;
        }

        game.detectCollisions(); //对于小恐龙对象的碰撞检测
        game.score += 0.1; //分数随时间增加

        addObstacle(game.canvas,game.score);  //加入障碍物
        setDifficulty(game.score);  //游戏难度随时间增加
        goBallistic(game.score);
    };

    game.endAnimaet = function () {
        //这里可以执行一些一帧动画完成后的回调函数
        if (game.score > 2000){
            game.passGame = true;
            game.pass();
        }
    };
    //碰撞检测函数
    game.detectCollisions = function () {
        var mtv,
            dinosaurShape = dinosaur.sprite.shape;
        if (dinosaurShape){ //如果小恐龙模拟碰撞shape存在
            game.shapes.forEach(function (shape) {
                if (shape !== dinosaurShape){
                    mtv = dinosaurShape.collidesWith(shape);
                    if (mtv.axis !== undefined || mtv.overlap !== 0){ //如果检测到碰撞事件
                        game.over();    //游戏结束
                    }
                }
            });
        }
    };

    //游戏结束
    //显示重新开始 / 播放音乐 / 绘制分数 .....
    game.over = function () {
        game.playSound('hit');
        game.setHighScore(parseInt(game.score));
        Score.drawHIScore(game.canvas,game.context,game.images[SPRITE_URL],game.getHighScores());
        drawGameOver(game.canvas,game.context,game.images[SPRITE_URL]);
        dinosaur.dead();
        var restart = Object.create(Restart);
        restart.init(game.canvas);
        restart.addClickEvent(game,game.canvas);
        restart.drawRestart(game.context,game.images[SPRITE_URL]);
        game.gameOver = true;
    };

    //游戏重新开始
    //将一些标志位和数据重置
    game.restart = function () {
        game.shapes = [];
        game.sprites = [];
        game.lastTime = 0;
        game.startTime = 0;
        game.frameTime = 0;
        game.fps = 0;
        game.startedPauseAt = 0;
        game.paused = false;
        game.gameOver = false;
        game.score = 0;
        game.passGame = false;
        game.highestScore = game.getHighScores();
        dinosaur.height = 1;
        Background.reset();
        Cacti.reset();
        Pterosaur.reset();
        dinosaur.reset(game.canvas);
        difficulty = 0.6;
        addPtersaurCount = 0;
        addPtersaurFlag = 0;
        ballisticStatus = false;

        addDinosaurSprite();  //添加主角-小恐龙
        game.start();  //游戏开始
    };
    //游戏通过则显示 YOU WIN
    game.pass = function () {
        game.playSound('pass');
        game.setHighScore(parseInt(game.score));
        Score.drawHIScore(game.canvas,game.context,game.images[SPRITE_URL],game.getHighScores());

        //ASA彩蛋版本 真的很捉急
        if (LOGO_URL !== ''){
            game.context.save();
            game.context.font="30px Verdana";
            game.context.fillStyle = '535353';
            game.context.fillText("YOU     WIN",(game.canvas.width-180)/2,70);
            game.context.drawImage(game.images[LOGO_URL],(game.canvas.width-461)/2,100,461,67);
            game.context.restore();
        }else{
            //普通版本
            game.context.save();
            game.context.font="30px Verdana";
            game.context.fillStyle = '535353';
            game.context.fillText("YOU     WIN",(game.canvas.width-180)/2,90);
            game.context.restore();
        }

        var restart = Object.create(Restart);
        restart.init(game.canvas);
        restart.addClickEvent(game,game.canvas);

        game.gameOver = true;
    };
    //销毁游戏对象
    //一般先销毁，再移除canvas
    game.destroy = function () {
        game = null;
    };

    /************************************************************************************
     *                               按键注册
     ************************************************************************************/
    //p键暂停
    game.addKeyListener({
        key: 'p',
        listener: function () {
            game.togglePaused();
        }
    });
    //空格跳跃
    game.addKeyListener({
        key: 'space',
        listener: function () {
            if (!game.loading && !game.paused && !game.gameOver){  //当 暂停/加载/游戏结束 的时候不触发跳跃
                //如果已经处于跳跃状态，则跳过此次触发事件
                if(dinosaur.riseTimer.isRunning() || dinosaur.fallTimer.isRunning()){
                    return;
                }
                dinosaur.jump.status = true;
                dinosaur.riseTimer.start();
                game.playSound('jump');
            }
        }
    });

    //r键直接开始新游戏
    game.addKeyListener({
        key: 'restart',
        listener: function () {
            game.restart();
        }
    });

    /*************************************************************************************
     *                          添加主角-小恐龙
     *************************************************************************************/
    var dinosaur = Object.create(Dinosaur);

    function addDinosaurSprite() {
        dinosaur.init(game.canvas, game.images[SPRITE_URL]);
        game.addSprite(dinosaur.sprite);
        game.addShape(dinosaur.sprite.shape);
    }


    /*************************************************************************************
     *                          绘制函数
     *************************************************************************************/


    //绘制gameOver图标
    function drawGameOver(canvas,context,image) {
        var coordinate = {
            left:1292, top: 28, width: 383, height:22, drawWidth:383*0.8, drawHeight:22*0.8
        };
        context.save();
        context.drawImage(image,coordinate.left,coordinate.top,coordinate.width,coordinate.height,
            (canvas.width-coordinate.drawWidth)/2,(canvas.height - coordinate.drawHeight)/2-20,coordinate.drawWidth,coordinate.drawHeight);
        context.restore();
    }

    /******************************************************************************
     *                  根据游戏难度来设置障碍
     ******************************************************************************/
    var difficulty = 0.6;     //障碍物出现几率
    var min_duration = 0.75;  //设置最小时间间隔为750ms
    var realDuration = 0;  //实际经过的时间间隔

    var addPtersaurCount = 0; //添加翼龙计数器
    var addPtersaurFlag = false; //添加翼龙标志位 （设计当分数为500倍数时来几只翼龙）

    //添加仙人掌
    function addCacti() {
        if (Math.random()>difficulty){
            var cacti = Object.create(Cacti);
            var type = Math.floor(Math.random()*5);
            cacti.init(game.canvas,game.images[SPRITE_URL],type);
            game.addSprite(cacti.sprite);
            game.addShape(cacti.sprite.shape);
        }
    }
    //添加小翼龙
    function addPterosaur(canvas) {
        if (Math.random()>difficulty+0.1){
            var pterosaur = Object.create(Pterosaur);
            var top = Math.random() > 0.5 ? canvas.height-140: canvas.height-60;
            pterosaur.init(game.canvas,game.images[SPRITE_URL],top);
            game.addSprite(pterosaur.sprite);
            game.addShape(pterosaur.sprite.shape);
            addPtersaurCount++;  //默认每次分数为500的倍数时添加两只翼龙
        }
    }
    //添加障碍
    function addObstacle(canvas,reference) {
        realDuration += game.frameTime;
        if (parseInt(reference+1)%300 === 0){ //如果当前分数为300的倍数，则开始添加翼龙
            addPtersaurFlag = true;  //允许添加翼龙
        }
        if (realDuration > min_duration) {
            realDuration = 0;
            if(addPtersaurCount === 2){
                addPtersaurFlag = false;
                addPtersaurCount = 0;
            }
            if (addPtersaurFlag){  //添加翼龙的时候取消添加仙人掌的操作
                addPterosaur(canvas);
            }else{
                addCacti();
            }
        }
    }
    //根据参考值reference设置游戏难度
    //这里的参考值是游戏分数
    function setDifficulty(reference) {
        var rate = 1+reference/1000;
        difficulty = 0.6-reference/5000;
        min_duration = 0.7 -reference/5000;

        rate = rate<=2.5?rate:2.5; //允许游戏速率最大允许值为初始值的两倍
        difficulty = difficulty>0.5?difficulty:0.5; //障碍物出现几率最大允许值为 0.5

        Pterosaur.setVelocity(rate);
        Cacti.setVelocity(rate);
        Background.setVelocity(rate);
    }

    /************************************************************************************
     *                          其他函数
     ************************************************************************************/
    var ballisticStatus = false; //暴走标志位
    //暴走吧 小恐龙
    //当分数大于1700分时（满分2000）,开启暴走模式
    function goBallistic(score) {
        if (score > 1700 && ballisticStatus===false){
            ballisticStatus = true;
            dinosaur.goBallistic(game.canvas);
        }
    }
    //设置精灵图URL
    var SPRITE_URL ='',
        LOGO_URL ='';
    function setSpriteURL(url) {
        SPRITE_URL = url;
        game.queueImage(SPRITE_URL);  //将图片资源列入加载列表
    }

    function setLogoURL(url) {
        LOGO_URL = url;
        game.queueImage(LOGO_URL);  //将图片资源列入加载列表
    }
    /*************************************************************************************
     *                          开始游戏
     *************************************************************************************/
    //开始游戏
    window.addEventListener('keydown', function start(e) {
        if (e.keyCode === 32){
            var img = document.getElementsByClassName('dinosaur-img')[0];
            img.style.display = 'none';
            game.start();
            window.removeEventListener('keydown',start);
        }
    });

    return {
        setSpriteURL: setSpriteURL,
        setLogoURL: setLogoURL
    };
})();


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
/**
 * Created by baobaobao on 2016/7/30.
 */

/***************************************************************************
 *                       用于显示当前分数和最高分
 ****************************************************************************/


var Score = {
    letter: [
        {x:1293, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6},  //0
        {x:1315, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6},  //1
        {x:1334, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6},  //2
        {x:1354, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6},  //3
        {x:1374, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6},  //4
        {x:1393, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6},  //5
        {x:1415, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6},  //6
        {x:1434, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6},  //7
        {x:1454, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6},  //8
        {x:1474, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6},  //9
        {x:1494, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6},  //H
        {x:1515, y:0, width:18,height:24,drawWidth:18*0.6,drawHeight:24*0.6}   //I
    ],

    //绘制一个数字
    drawNumber: function (context,image,number,x,y) {
        context.drawImage(image, this.letter[number].x, this.letter[number].y, this.letter[number].width, this.letter[number].height, x, y,this.letter[number].drawWidth,this.letter[number].drawHeight);
    },

    //绘制当前分数
    drawCurrentScore: function (canvas,context,image,score) {
        score = score+'';
        var len = score.length;
        for(var i=0;i<5-len;i++){  //对数据进行格式化处理，例100 处理成五位数 00100
            score = '0'+score;
        }

        context.save();
        for(i=0;i<5;i++){
            this.drawNumber(context,image,score[i],canvas.width-120+i*20,10);
        }
        context.restore();
    },

    //绘制历史最高分
    drawHIScore: function (canvas,context,image,HIScore) {
        context.save();
        this.drawNumber(context,image,10,canvas.width-300,10);
        this.drawNumber(context,image,11,canvas.width-280,10);
        HIScore = HIScore+'';
        var len = HIScore.length;
        for(var i=0;i<5-len;i++){  //对数据进行格式化处理，例100 处理成五位数 00100
            HIScore = '0'+HIScore;
        }
        for(i=0;i<5;i++){
            this.drawNumber(context,image,HIScore[i],canvas.width-240+i*20,10);
        }
        context.restore();
    }
};
/*
 * Copyright (C) 2012 David Geary. This code is from the book
 * Core HTML5 Canvas, published by Prentice-Hall in 2012.
 *
 * License:
 *
 * Permission is hereby granted, free of charge, to any person 
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * The Software may not be used to create training material of any sort,
 * including courses, books, instructional videos, presentations, etc.
 * without the express written consent of David Geary.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
*/

// Functions.....................................................

// ..............................................................
// Check to see if a polygon collides with another polygon
// ..............................................................

function polygonCollidesWithPolygon (p1, p2, displacement) { // displacement for p1
   var mtv1 = p1.minimumTranslationVector(p1.getAxes(), p2, displacement),
       mtv2 = p1.minimumTranslationVector(p2.getAxes(), p2, displacement);

   if (mtv1.overlap === 0 || mtv2.overlap === 0)
      return { axis: undefined, overlap: 0 };
   else
      return mtv1.overlap < mtv2.overlap ? mtv1 : mtv2;
}

// ..............................................................
// Check to see if a circle collides with another circle
// ..............................................................

function circleCollidesWithCircle (c1, c2) {
   var distance = Math.sqrt( Math.pow(c2.x - c1.x, 2) +
                             Math.pow(c2.y - c1.y, 2)),
       overlap = Math.abs(c1.radius + c2.radius) - distance;

   return overlap < 0 ?
      new MinimumTranslationVector(undefined, 0) :
      new MinimumTranslationVector(undefined, overlap);
}

// ..............................................................
// Get the polygon's point that's closest to the circle
// ..............................................................

function getPolygonPointClosestToCircle(polygon, circle) {
   var min = BIG_NUMBER,
       length,
       testPoint,
       closestPoint;
   
   for (var i=0; i < polygon.points.length; ++i) {
      testPoint = polygon.points[i];
      length = Math.sqrt(Math.pow(testPoint.x - circle.x, 2), 
                         Math.pow(testPoint.y - circle.y, 2));
      if (length < min) {
         min = length;
         closestPoint = testPoint;
      }
   }

   return closestPoint;
}

// ..............................................................
// Get the circle's axis (circle's don't have an axis, so this
// method manufactures one)
// ..............................................................

function getCircleAxis(circle, polygon, closestPoint) {
   var v1 = new Vector(new Point(circle.x, circle.y)),
       v2 = new Vector(new Point(closestPoint.x, closestPoint.y)),
       surfaceVector = v1.subtract(v2);

   return surfaceVector.normalize();
}

// ..............................................................
// Tests to see if a polygon collides with a circle
// ..............................................................

function polygonCollidesWithCircle (polygon, circle, displacement) {
   var axes = polygon.getAxes(),
       closestPoint = getPolygonPointClosestToCircle(polygon, circle);

   axes.push(getCircleAxis(circle, polygon, closestPoint));

   return polygon.minimumTranslationVector(axes, circle, displacement);
}

// ..............................................................
// Given two shapes, and a set of axes, returns the minimum
// translation vector.
// ..............................................................


function getMTV(shape1, shape2, displacement, axes) {
   var minimumOverlap = BIG_NUMBER,
       overlap,
       axisWithSmallestOverlap,
       mtv;

   for (var i=0; i < axes.length; ++i) {
      axis = axes[i];
      projection1 = shape1.project(axis);
      projection2 = shape2.project(axis);
      overlap = projection1.getOverlap(projection2);

      if (overlap === 0) {
         return new MinimumTranslationVector(undefined, 0);
      }
      else {
         if (overlap < minimumOverlap) {
            minimumOverlap = overlap;
            axisWithSmallestOverlap = axis;    
         }
      }
   }
   mtv = new MinimumTranslationVector(axisWithSmallestOverlap,
                                     minimumOverlap);
   return mtv;
}


// Constants.....................................................

var BIG_NUMBER = 1000000;


// Points........................................................

var Point = function (x, y) {
   this.x = x;
   this.y = y;
};

Point.prototype = {
   rotate: function (rotationPoint, angle) {
      var tx, ty, rx, ry;
   
      tx = this.x - rotationPoint.x; // tx = translated X
      ty = this.y - rotationPoint.y; // ty = translated Y

      rx = tx * Math.cos(-angle) - // rx = rotated X
           ty * Math.sin(-angle);

      ry = tx * Math.sin(-angle) + // ry = rotated Y
           ty * Math.cos(-angle);

      return new Point(rx + rotationPoint.x, ry + rotationPoint.y); 
   }
};

// Lines.........................................................

var Line = function(p1, p2) {
   this.p1 = p1;  // point 1
   this.p2 = p2;  // point 2
};

Line.prototype.intersectionPoint = function (line) {
   var m1, m2, b1, b2, ip = new Point();

   if (this.p1.x === this.p2.x) {
      m2 = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
      b2 = line.p1.y - m2 * line.p1.x;
      ip.x = this.p1.x;
      ip.y = m2 * ip.x + b2;
   }
   else if(line.p1.x === line.p2.x) {
      m1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
      b1 = this.p1.y - m1 * this.p1.x;
      ip.x = line.p1.x;
      ip.y = m1 * ip.x + b1;
   }
   else {
     m1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
      m2 = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
      b1 = this.p1.y - m1 * this.p1.x;
      b2 = line.p1.y - m2 * line.p1.x;
      ip.x = (b2 - b1) / (m1 - m2);
      ip.y = m1 * ip.x + b1;
   }
   return ip;
};
   
// Bounding boxes................................................

var BoundingBox = function(left, top, width, height) {
   this.left = left;
   this.top = top;
   this.width = width;
   this.height = height;
};


// Vectors.......................................................

var Vector = function(point) {
   if (point === undefined) {
      this.x = 0;
      this.y = 0;
   }
   else {
      this.x = point.x;
      this.y = point.y;
   }
};

Vector.prototype = {
   getMagnitude: function () {
      return Math.sqrt(Math.pow(this.x, 2) +
                       Math.pow(this.y, 2));
   },

   setMagnitude: function (m) {
      var uv = this.normalize();
      this.x = uv.x * m;
      this.y = uv.y * m;
   },
   
   dotProduct: function (vector) {
      return this.x * vector.x +
             this.y * vector.y;
   },

   add: function (vector) {
      var v = new Vector();
      v.x = this.x + vector.x;
      v.y = this.y + vector.y;
      return v;
   },

   subtract: function (vector) {
      var v = new Vector();
      v.x = this.x - vector.x;
      v.y = this.y - vector.y;
      return v;
   },

   normalize: function () {
      var v = new Vector(),
          m = this.getMagnitude();
      v.x = this.x / m;
      v.y = this.y / m;
      return v;
   },

   perpendicular: function () {
      var v = new Vector();
      v.x = this.y;
      v.y = 0-this.x;
      return v;
   },

   reflect: function (axis) {
      var  v = new Vector(),
           vdotl = this.dotProduct(axis),
           ldotl = axis.dotProduct(axis),
           dotProductRatio = vdotl / ldotl;

      v.x = 2 * dotProductRatio * axis.x - this.x;
      v.y = 2 * dotProductRatio * axis.y - this.y;

      return v;
   }
};


// Shapes........................................................

var Shape = function () {
   this.fillStyle = 'rgba(255, 255, 0, 0.8)';
   this.strokeStyle = 'white';
};

Shape.prototype = {
   move: function (dx, dy) {
      throw 'move(dx, dy) not implemented';
   },

   createPath: function (context) {
      throw 'createPath(context) not implemented';
   },

   boundingBox: function () {
      throw 'boundingBox() not implemented';
   },

   fill: function (context) {
      context.save();
      context.fillStyle = this.fillStyle;
      this.createPath(context);
      context.fill();
      context.restore();
   },

   stroke: function (context) {
      context.save();
      context.strokeStyle = this.strokeStyle;
      this.createPath(context);
      context.stroke();
      context.restore();
   },

   collidesWith: function (shape, displacement) {
      throw 'collidesWith(shape, displacement) not implemented';
   },
   
   isPointInPath: function (context, x, y) {
      this.createPath(context);
      return context.isPointInPath(x, y);
   },

   project: function (axis) {
      throw 'project(axis) not implemented';
   },

   minimumTranslationVector: function (axes, shape, displacement) {
      return getMTV(this, shape, displacement, axes);
   }
};


// Circles.......................................................

var Circle = function (x, y, radius) {
   this.x = x;
   this.y = y;
   this.radius = radius;
   this.strokeStyle = 'blue';
   this.fillStyle = 'yellow';
};

Circle.prototype = new Shape();

Circle.prototype.centroid = function () {
   return new Point(this.x,this.y);
};

Circle.prototype.move = function (dx, dy) {
   this.x += dx;
   this.y += dy;
};

Circle.prototype.boundingBox = function (dx, dy) {
   return new BoundingBox(this.x - this.radius,
                          this.y - this.radius,
                          2*this.radius,
                          2*this.radius);
};

Circle.prototype.createPath = function (context) {
   context.beginPath();
   context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
};
   
Circle.prototype.project = function (axis) {
   var scalars = [],
       point = new Point(this.x, this.y);
       dotProduct = new Vector(point).dotProduct(axis);

   scalars.push(dotProduct);
   scalars.push(dotProduct + this.radius);
   scalars.push(dotProduct - this.radius);

   return new Projection(Math.min.apply(Math, scalars),
                         Math.max.apply(Math, scalars));
};

Circle.prototype.collidesWith = function (shape, displacement) {
   if (shape.radius === undefined) {
      return polygonCollidesWithCircle(shape, this, displacement);
   }
   else {
      return circleCollidesWithCircle(this, shape, displacement);
   }
};
   

// Polygons......................................................

var Polygon = function (visible) {
   this.visible = visible;
   this.points = [];
   this.strokeStyle = 'blue';
   this.fillStyle = 'white';
};

Polygon.prototype = new Shape();

Polygon.prototype.getAxes = function () {
   var v1, v2, surfaceVector, axes = [], pushAxis = true;
      
   for (var i=0; i < this.points.length-1; i++) {
      v1 = new Vector(this.points[i]);
      v2 = new Vector(this.points[i+1]);

      surfaceVector = v2.subtract(v1);
      axes.push(surfaceVector.perpendicular().normalize());
   }

   return axes;
};

Polygon.prototype.project = function (axis) {
   var scalars = [];

   this.points.forEach( function (point) {
      scalars.push(new Vector(point).dotProduct(axis));
   });

   return new Projection(Math.min.apply(Math, scalars),
                         Math.max.apply(Math, scalars));
};

Polygon.prototype.addPoint = function (x, y) {
   this.points.push(new Point(x,y));
};

Polygon.prototype.createPath = function (context) {
   if (this.points.length === 0)
      return;
      
   context.beginPath();
   context.moveTo(this.points[0].x,
                  this.points[0].y);
         
   for (var i=0; i < this.points.length; ++i) {
      context.lineTo(this.points[i].x,
                     this.points[i].y);
   }
};
   
Polygon.prototype.move = function (dx, dy) {
   var point;
   for(var i=0,len=this.points.length; i < len; ++i) {
      point = this.points[i];
      point.x += dx;
      point.y += dy;
   }
};

Polygon.prototype.collidesWith = function (shape, displacement) {
   if (shape.radius !== undefined) {
      return polygonCollidesWithCircle(this, shape, displacement);
   }
   else {
      return polygonCollidesWithPolygon(this, shape, displacement);
   }
};

Polygon.prototype.move = function (dx, dy) {
   for (var i=0, point; i < this.points.length; ++i) {
      point = this.points[i];
      point.x += dx;
      point.y += dy;
   }
};

Polygon.prototype.boundingBox = function (dx, dy) {
   var minx = BIG_NUMBER,
       miny = BIG_NUMBER,
       maxx = -BIG_NUMBER,
       maxy = -BIG_NUMBER,
       point;

   for (var i=0; i < this.points.length; ++i) {
      point = this.points[i];
      minx = Math.min(minx,point.x);
      miny = Math.min(miny,point.y);
      maxx = Math.max(maxx,point.x);
      maxy = Math.max(maxy,point.y);
   }

   return new BoundingBox(minx, miny,
                          parseFloat(maxx - minx),
                          parseFloat(maxy - miny));
};

Polygon.prototype.centroid = function () {
   var pointSum = new Point(0,0);
   
   for (var i=0, point; i < this.points.length; ++i) {
      point = this.points[i];
      pointSum.x += point.x;
      pointSum.y += point.y;
   }
   return new Point(pointSum.x/this.points.length, pointSum.y/this.points.length);
};

// Projections...................................................

var Projection = function (min, max) {
   this.min = min;
   this.max = max;
};

Projection.prototype = {
   overlaps: function (projection) {
      return this.max > projection.min && projection.max > this.min;
   },

   getOverlap: function (projection) {
      var overlap;

      if (!this.overlaps(projection))
         return 0;
      
      if (this.max > projection.max) {
         overlap = projection.max - this.min;
      }
      else {
        overlap = this.max - projection.min;
      }
      return overlap;
   }
};


// MinimumTranslationVector.........................................

var MinimumTranslationVector = function (axis, overlap) {
   this.axis = axis;
   this.overlap = overlap;
};




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

/**
 * Created by baobaobao on 2016/7/29.
 */
/************************************************************************
 *                               计时器
 ************************************************************************/

var StopWatch = {
    startTime: 0,
    running: false,
    elapsedTime: 0,

    start: function () {
        this.startTime = +new Date();
        this.elapsedTime = 0;
        this.running = true;
    },

    stop: function () {
        if (this.running){
            this.elapsedTime = +new Date()-this.startTime;
            this.running = false;
        }
    },
    //返回执行的时间
    getElapsedTime: function () {
        if (this.running){
            return +new Date() - this.startTime;
        }else{
            return this.elapsedTime;
        }
    },

    reset: function () {
        this.elapsedTime = 0;
        this.startTime = 0;
        this.running = false;
    }
};
/**
 * Created by baobaobao on 2016/7/29.
 */
/*********************************************************************************
 *                      时间处理（扭曲）对象
 *********************************************************************************/

var TimeWarper = {
    timeWarp: undefined,
    duration: undefined,
    stopWatch: null,

    /**
     * 初始化时间扭曲函数
     * @param duration 需要执行的时间
     * @param timeWarp 时间扭曲函数
     */
    init: function (duration, timeWarp) {
        this.duration = duration;
        this.timeWarp = timeWarp;
        this.stopWatch = Object.create(StopWatch);  //关联计时器对象
    },
    //启动计时器
    start: function () {
        this.stopWatch.start();
    },
    //停止计时器
    stop: function () {
        this.stopWatch.stop();
    },
    //返回经过处理的时间
    //返回值 = 实际时间 * （扭曲后的播放百分比 / 实际播放百分比）
    getElapsedTime: function () {
        var elapsedTime = this.stopWatch.getElapsedTime(),  //获取从计时时间
            percentComplete = elapsedTime/this.duration;    //计算时间经过的百分比

        if (!this.stopWatch.running){
            return undefined;
        }
        if (this.timeWarp === undefined){
            return elapsedTime;
        }
        return elapsedTime*(this.timeWarp(percentComplete)/percentComplete);
    },
    //获取执行时间的状态
    isRunning: function () {
        return this.stopWatch.running;
    },
    //获取时间是否到了
    isOver: function () {
        return this.stopWatch.getElapsedTime() > this.duration;
    },

    /****************************************************************************
     *                  内置时间扭曲函数
     ****************************************************************************/
    //先快后慢
    //strength 决定其程度
    makeEaseIn: function (strength) {
        return function (percentComplete) {
            return Math.pow(percentComplete, strength*2);
        };
    },
    //先慢后快
    makeEaseOut: function (strength) {
        return function (percentComplete) {
            return Math.pow(1-percentComplete, strength*2);
        };
    },
    makeEaseInOut: function () {
        return function (percentComplete) {
            return percentComplete - Math.sin(percentComplete*2*Math.PI)/(Math.PI*2);
        };
    },
    makeElastic :function (passes) {
        passes = passes || 3;
        return function (percentComplete) {
            return ((1 - Math.cos(percentComplete * Math.PI * passes)) *
                (1 - percentComplete)) + percentComplete;
        };
    },
    makeBounce: function (bounces) {
        var fn = this.makeElastic(bounces);
        return function (percentComplete) {
            percentComplete = fn(percentComplete);
            return percentComplete <= 1 ? percentComplete : 2-percentComplete;
        };
    },
    makeLinear: function () {
        return function (percentComplete) {
            return percentComplete;
        };
    }
};