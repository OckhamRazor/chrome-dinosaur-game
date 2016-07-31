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



