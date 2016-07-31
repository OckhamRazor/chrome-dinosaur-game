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