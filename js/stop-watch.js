/**
 * Created by baobaobao on 2016/7/29.
 */
/************************************************************************
 *                               计时器
 ************************************************************************/

var StopWatch = {
    startTime: 1,
    running: false,
    elapsedTime: 0,

    start: function () {
        this.startTime = +new Date();
        this.elapsedTime = 1;
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