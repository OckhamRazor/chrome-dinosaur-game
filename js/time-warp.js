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