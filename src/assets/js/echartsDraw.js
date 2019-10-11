var image = new Image();
image.src = './assets/imgs/symbol.png';
image.onload = function(){
	echartsGraphic.symbolImg = 'image://./assets/imgs/symbol.png';
};
var echartsGraphic = {
	i:0,
	Echarts:null,
	color:'#488aff',
	lineWidth:2,
	data:[],
	symbolSize:25,
	symbolImg:'',
	zr:null,
	isChoosePoint:false,
	point:{},
	start:function(charts){
		this.Echarts = charts;
		this.zr = this.Echarts.getZr();
		var that = this;
		this.zr.on('mousedown', function (e){
			console.log(e);
			Window.echartsDownPoint = e;
			switch(Window.echartsDrawLinestype){
				case 'segmentLine':
					that.segmentLineStart(e);
					break;
				case 'curveLine':
					that.curveLineStart(e);
					break;
				case 'parallelLine':
					that.parallelLineStart(e);
					break;
			}
		});
		this.zr.on('mousemove', function (e){
			switch(Window.echartsDrawLinestype){
				case 'segmentLine':
					that.segmentLineMove(e);
					break;
				case 'curveLine':
					that.curveLineMove(e);
					break;
				case 'parallelLine':
					that.parallelLineMove(e);
					break;
			}
			if(that.isChoosePoint){
				var xIndex = that.Echarts.convertFromPixel({seriesIndex:0},[e.offsetX, e.offsetY]);
				var option = that.Echarts.getOption();
				option.series[that.point.seriesIndex].data[that.point.dataIndex] = xIndex;
				Window.canSwipe(false);
				that.Echarts.setOption(option);
			}
		});
		this.zr.on('mouseup', function (e){
			switch(Window.echartsDrawLinestype){
				case 'segmentLine':
					that.segmentLineEnd(e);
					break;
				case 'curveLine':
					that.curveLineEnd(e);
					break;
				case 'parallelLine':
					that.parallelLineEnd(e);
					break;
			}
			if(that.isChoosePoint){
				Window.canSwipe(false);
				that.isChoosePoint = false;
			}
		});
		this.Echarts.on('mousedown',function(event){
			that.point = event;
			if(event.seriesIndex > 0 && event.seriesType == 'line'){
				Window.canSwipe(true);
				that.isChoosePoint = true;
			}
			else{
				that.isChoosePoint = false;
			}
		});
	},
	del:function(){
		this.clearLine();
		if(Window.echartsDrawLinestype != ''){
			return;
		}
		var option = this.Echarts.getOption();
		var series = option.series;
		for(var i=0,r=series.length;i<r;i++){
			if(series[series.length-(i+1)].hasOwnProperty('id')){
				series[series.length-(i+1)].data = [];
				this.Echarts.setOption({
					series:series
				},false,true);
				break;
			}
		}
	},
	delAll:function(){
		this.clearLine();
		if(Window.echartsDrawLinestype != ''){
			return;
		}
		var option = this.Echarts.getOption();
		var series = option.series;
		for(var i=0,r=series.length;i<r;i++){
			if(!series[series.length-(i+1)].hasOwnProperty('id')){
				break;
			}
			series[series.length-(i+1)].data = [];
			this.Echarts.setOption({
				series:series
			},false,true);
		}
	},
	//初始化划线
	clearLine:function(){
		this.data = [];
		Window.endEchartsDraw();
	},
	//线段
	segmentLineStart:function(e){
		if(this.data.length == 0){
			this.i++;
		}
		var option = this.Echarts.getOption();
		this.startPoint = [e.offsetX, e.offsetY];
		var pointInGrid = this.Echarts.convertFromPixel('grid', this.startPoint);
		console.log(this.symbolImg);
		if (this.Echarts.containPixel('grid', this.startPoint)) {
			this.data.push(pointInGrid);
			this.Echarts.setOption({
				series: [{
					id: this.i,
					data: this.data,
					type: 'line',
					symbolSize: this.symbolSize,
					lineStyle:{
						color:this.color,
						width:this.lineWidth
					},
					clipOverflow:false,
					symbol:this.symbolImg,
					showSymbol:true,
					showAllSymbol:true,
					zlevel:2
				}]
			});
		}
	},
	segmentLineMove:function(e){},
	segmentLineEnd:function(e){},
	//曲线
	curveLineStart:function(e){
		if(this.data.length == 0){
			this.i++;
		}
		var option = this.Echarts.getOption();
		this.startPoint = [e.offsetX, e.offsetY];
		var pointInGrid = this.Echarts.convertFromPixel('grid', this.startPoint);
		
		if (this.Echarts.containPixel('grid', this.startPoint)) {
			this.data.push(pointInGrid);
			this.Echarts.setOption({
				series: [{
					id: this.i,
					data: this.data,
					type: 'line',
					smooth:true,
					smoothMonotone:'x',
					symbolSize: this.symbolSize,
					lineStyle:{
						color:this.color,
						width:this.lineWidth
					},
					clipOverflow:false,
					symbol:this.symbolImg,
					showSymbol:true,
					showAllSymbol:true,
					zlevel:2
				}]
			});
		}
	},
	curveLineMove:function(e){},
	curveLineEnd:function(e){},
	//平行线
	parallelLineStart:function(e){
		console.log(this.i);
		if(this.data.length == 0){
			this.i ++;
		}
		var option = this.Echarts.getOption();
		this.startPoint = [e.offsetX, e.offsetY];
		var pointInGrid = this.Echarts.convertFromPixel('grid', this.startPoint);
		
		if (this.Echarts.containPixel('grid', this.startPoint)) {
			this.data.push(pointInGrid);
			this.Echarts.setOption({
				series: [{
					id: this.i,
					data: this.data,
					type: 'line',
					symbolSize: this.symbolSize,
					lineStyle:{
						color:this.color,
						width:this.lineWidth
					},
					clipOverflow:false,
					symbol:this.symbolImg,
					showSymbol:true,
					showAllSymbol:true,
					zlevel:2
				}]
			});
		}
	},
	parallelLineMove:function(e){

	},
	parallelLineEnd:function(e){
		if(this.data.length > 2){
			var arr = calcParallelLine(this.data[0][0],this.data[0][1],this.data[1][0],this.data[1][1],this.data[2][0],this.data[2][1]);
			this.data.pop();
			this.Echarts.setOption({
				series: [{
					id: this.i,
					data: this.data,
					type: 'line',
					symbolSize: this.symbolSize,
					lineStyle:{
						color:this.color,
						width:this.lineWidth
					},
					clipOverflow:false,
					symbol:this.symbolImg,
					showSymbol:true,
					showAllSymbol:true,
					zlevel:2
				}]
			});
			this.data = [];
			this.data[0] = [arr[0],arr[1]];
			this.data[1] = [arr[2],arr[3]];
			var option = this.Echarts.getOption();
			this.i++;
			var newSeries = {
					id: this.i,
					data: this.data,
					type: 'line',
					symbolSize: this.symbolSize,
					lineStyle:{
						color:this.color,
						width:this.lineWidth
					},
					clipOverflow:false,
					symbol:this.symbolImg,
					showSymbol:true,
					showAllSymbol:true,
					zlevel:2
				};
			option.series.push(newSeries);
			this.Echarts.setOption({
				series:option.series
			});
			this.clearLine();
		}
	}
};

//平行线计算公式
function calcParallelLine(x1,y1,x2,y2,x3,y3){
	var k1,k2,b1,b2,y,x4,y4,h,e1,e2,f1,f2;
	if(x1 == x2){
		e1 = x3;
		e2 = y1;
		f1 = x3;
		f2 = y2;
	}
	else if(y1 == y2){
		e1 = x1;
		e2 = y3;
		f1 = x2;
		f2 = y3;
	}
	else{
		k1 = (y2-y1)/(x2-x1);
		b1 = y1-(k1*x1);
		k2 = -1/k1;
		b2 = y3-(k2*x3);
		x4 = (b2-b1)/(k1-k2);
		y4 = k1*x4+b1;
		e1 = x1+(x3-x4);
		e2 = y1+(y3-y4);
		f1 = x2+(x3-x4);
		f2 = y2+(y3-y4);
	}
	return [parseInt(e1),e2,parseInt(f1),f2];
}