/**
 * Created by baobaobao on 2016/7/28.
 */

var Game = (function () {
    //创建游戏
    var game =  Object.create(Game);
    //初始化 game 对象
    game.init('game','canvas');
    game.soundInit(); //初始化音轨
    Sprite.setVisible(true); //设置模拟碰撞形状可见

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
                    addBlurEvent();
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
        Score.drawCurrentScore(game.canvas,game.context,game.images[SPRITE_URL],Math.ceil(game.score)); //绘制当前分数

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
        if (game.score > 30){
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
        dinosaur.dead(game.canvas);
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
    //设置Logo URL
    function setLogoURL(url) {
        LOGO_URL = url;
        game.queueImage(LOGO_URL);  //将图片资源列入加载列表
    }
    //注册事件
    //当窗口失去焦点 就暂停
    function addBlurEvent() {
        window.addEventListener('blur',function () {
            var now = getTimeNow();
            game.paused = true;
            game.startedPauseAt = now;
        });
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

