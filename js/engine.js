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
        localStorage[this.gameName + this.HIGH_SCORES_SUFFIX] = JSON.stringify([]);
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
                shape.stroke(this.context);
                shape.fill(this.context);
            }
        }
    },

    /****************************************************************************************
     *                                  碰撞检测函数
     ****************************************************************************************/
    detectCollisions: function () {}

};

