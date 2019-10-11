import { Component,AfterViewInit,ElementRef} from '@angular/core';

declare let Window:any,echarts,echartsGraphic;

@Component({
  selector: 'line-ma',
  templateUrl: 'line-ma.html'
})
export class LineMaComponent implements AfterViewInit {
	private SignPriceClose:Array<any> = [];
	private Stamp:Array<any> = [];
	private QAveragePrice:Array<any> = [];
	private SignChangeRate:Array<any> = [];
	private SignChangeValue:Array<any> = [];
	private buy:Array<any> = [];
	private sell:Array<any> = [];

	private lineMa;
	private hasLoadHistory = false;
	public infoPosition:string = 'right';

	public commodityType:number = +localStorage.getItem('proDetailCommodityType');

	private hoverInfo = {
		"date":'',
		"price":0,
		"priceAVG":0,
		"rate":0,
		"value":0,
		"sell":0,
		"buy":0
	};
	private dataLen:number = 0;

	constructor(private elementRef: ElementRef) {
		this.hasLoadHistory = false;
	}
	ngAfterViewInit() {
		this.lineMa = this.elementRef.nativeElement.querySelector('#line-ma');
		Window.line_ma = echarts.init(this.lineMa);
	}
	ngOnDestroy() {
		Window.line_ma.clear();
	}
	/* 初始获取历史行情 */
	public historyDraw(data){
		this.SignPriceClose = [];
		this.Stamp = [];
		this.QAveragePrice = [];
		this.SignChangeRate = [];
		this.SignChangeValue = [];
		this.buy = [];
		this.sell = [];
		this.dataLen = data.length;
		// console.log('[分时图历史行情]',data);
		for(let i=0,r=this.dataLen;i<r;i++){
			if(i == this.dataLen-1){
				this.Stamp.push(this.timestampCoverHms((data[i].Stamp+60)*1000,'hm'));
			}
			else{
				this.Stamp.push(this.timestampCoverHms((data[i].Stamp)*1000,'hm'));
			}
			if(this.commodityType != 4){
				this.SignPriceClose.push(data[i].SignPriceClose);
				this.QAveragePrice.push(data[i].QAveragePrice);
				this.SignChangeRate.push(data[i].SignChangeRate);
				this.SignChangeValue.push(data[i].SignChangeValue);
			}
			else{
				this.buy.push(data[i].BidPriceClose);
				this.sell.push(data[i].AskPriceClose);
			}
		}
		if(this.commodityType != 4){
			this.setChart(this.SignPriceClose,this.Stamp,this.QAveragePrice,this.SignChangeRate,this.SignChangeValue);
		}
		else{
			this.setChart(this.buy,this.Stamp,this.sell);
		}
		Window.line_ma.on('dataZoom',function(param){
			if(param.batch){
				Window.zoomStartLine = param.batch[0].start;
				Window.zoomEndLine = param.batch[0].end;
			}
		});
		setTimeout(()=>{
			this.changeCorss(this.nowIsCross);
		},50);
		this.hasLoadHistory = true;
	}
	/* 更新图 */
	private nowPrice;
	public updateChart(res) {
		const data = JSON.parse(JSON.stringify(res));
		if(this.hasLoadHistory){
			if(data.SignType == 1){
				this.dataLen++;
				this.Stamp.push(this.timestampCoverHms((data.Stamp+60)*1000,'hm'));
				var option = Window.line_ma.getOption();
				if(this.commodityType != 4){
					this.SignPriceClose.push(data.SignPriceClose);
					this.QAveragePrice.push(data.QAveragePrice);
					this.SignChangeRate.push(data.QChangeRate);
					this.SignChangeValue.push(data.QChangeValue);
					option.series[0].data = this.SignPriceClose;
					option.series[1].data = this.QAveragePrice;
					option.series[2].data = this.SignChangeRate;
					option.series[3].data = this.SignChangeValue;
				}
				else{
					this.buy.push(data.BidPriceClose);
					this.sell.push(data.AskPriceClose);
					option.series[0].data = this.buy;
					option.series[1].data = this.sell;
				}
				
				option.xAxis[0].data = this.Stamp;
				option.xAxis[0].max = this.Stamp.length + 20;
				option.xAxis[1].max = this.Stamp.length + 20;
				option.dataZoom[0].start = Window.zoomStartLine;
				option.dataZoom[0].end = Window.zoomEndLine;
				option.dataZoom[1].start = Window.zoomStartLine;
				option.dataZoom[1].end = Window.zoomEndLine;
				Window.line_ma.setOption(option);
			}
			else{
				if(this.nowPrice === data.QLastPrice || data.SignType !== 0){
					return;
				}
				var option = Window.line_ma.getOption();
				if(this.commodityType != 4){
					this.nowPrice = data.QLastPrice;
					this.SignPriceClose[this.SignPriceClose.length-1] = data.QLastPrice;
					this.QAveragePrice[this.QAveragePrice.length-1] = data.QAveragePrice;
					this.SignChangeRate[this.SignChangeRate.length-1] = data.QChangeRate;
					this.SignChangeValue[this.SignChangeValue.length-1] = data.QChangeValue;
					
					option.series[0].data = this.SignPriceClose;
					option.series[1].data = this.QAveragePrice;
					option.series[2].data = this.SignChangeRate;
					option.series[3].data = this.SignChangeValue;
				}
				else{
					this.buy[this.buy.length-1] = data.BidPriceClose;
					this.sell[this.sell.length-1] = data.AskPriceClose;
				}
				option.xAxis[0].data = this.Stamp;
				Window.line_ma.setOption(option,false,true);
			}
		}
	}
	/* 十字坐标与缩放切换 */
	private info = false;
	private nowIsCross:boolean = false;
	public changeCorss(isCross){
		if(!Window.linestickOption){
			return;
		}
		Window.linestickOption.tooltip.show = isCross;
		Window.line_ma.setOption(Window.linestickOption);
		Window.line_ma.dispatchAction(
			{
				type: 'dataZoom',
				start: Window.zoomStartLine,
				end: Window.zoomEndLine
			},
			{
				type: 'dataZoom',
				start: Window.zoomStartLine,
				end: Window.zoomEndLine
			}
		);
		this.info = isCross;
		if(isCross){
			Window.line_ma.dispatchAction({
				type: 'showTip',
				x: Window.echartsDownPoint.offsetX,
				y: Window.echartsDownPoint.offsetY
			})
		}
	}
	/* 画图 */
	private setChart(SignPriceClose,Stamp,QAveragePrice,SignChangeRate=[],SignChangeValue=[]) {
		let self = this;
		Window.linestickOption = {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross'
				},
				formatter : function(params) {
					for(let i=0,r=params.length;i<r;i++){
						switch (params[i].seriesIndex) {
							case 0:
								self.hoverInfo.price = params[i].data;
								self.hoverInfo.buy = params[i].data;
								break;
							case 1:
								self.hoverInfo.priceAVG = params[i].data;
								self.hoverInfo.sell = params[i].data;
								break;
							case 2:
								self.hoverInfo.rate = params[i].data;
								break;
							case 3:
								self.hoverInfo.value = params[i].data;
								break;
						}
					}
					self.hoverInfo.date = params[0].axisValue;
					Window.showLineSubInfo(params);
				},
				show:this.info
			},
			legend: {
				show: false
			},
			axisPointer: {
				link: {xAxisIndex: 'all'},
				label: {
					backgroundColor: '#666'
				}
			},
			grid: [
				{
			        top: '0%',
			        left: '0%',
			        right: '0%',
			        height: '70%'
			    },
			    {
			        top: '75%',
			        left: '0%',
			        right: '0%',
			        height: '25%'
			    }
			],
			animation:false,
			xAxis: [
				{
					axisLine: {
						onZero: false,
						show: false
					},
					axisTick: {show: false},
					splitLine: {show: false},
					axisLabel: {show: false},
					scale: true,
					type: 'category',
					data: Stamp,
					axisPointer:{
						label:{
							show:false
						}
					},
			        max:Stamp.length + 20
				},
				{
					axisLine: {
						onZero: false,
						show: false
					},
					axisTick: {show: false},
					splitLine: {show: false},
					axisLabel: {show: false},
					type: 'category',
					data: Stamp,
					axisPointer:{
						label:{
							show:false
						}
					},
			        max:Stamp.length + 20,
			        gridIndex: 1
				}
			],
			yAxis: [
				{
					type: 'value',
					position: 'right',
					scale: true,
					axisLine: {
						lineStyle: { color: '#eee' }
					},
					splitLine: {
						show: true,
						lineStyle: {
							color: '#eee',
							type: 'solid'
						}
					},
					splitNumber: 2,
					showMinLabel: false,
					axisLabel: {
						inside: true,
						verticalAlign: 'top',
						textStyle:{
							color: '#eee'
						},
						showMinLabel: false,
						showMaxLabel: true
					},
					axisTick: {
						show: false
					},
					axisPointer:{
						lineStyle: {
							type:'solid'
						},
						label: {
							backgroundColor: '#387ef5',
							fontsize: 9,
							padding: 2
						}
					},
					boundaryGap: ['5%', '5%']
				},
				{
					type: 'value',
					show: false,
					scale: true,
					position: 'right',
					axisLine: {
						lineStyle: { color: '#eee' }
					},
					splitLine: {
						show: false
					},
					splitNumber: 1,
					showMinLabel: false,
					axisLabel: {
						inside: true,
						verticalAlign: 'bottom',
						textStyle:{
							color: '#ddd'
						}
					},
					axisTick: {
						show: false
					},
					axisPointer:{
						show: false
					},
					boundaryGap: ['5%', '5%']
				},
				{
					gridIndex: 1,
					xAxisIndex: 1,
					scale: true,
					position: 'right',
					axisLine: {
						lineStyle: { color: '#eee' }
					},
					splitLine: {
						show: true,
						lineStyle: {
							color: '#eee',
							type: 'solid'
						}
					},
					splitNumber: 1,
					showMinLabel: false,
					axisLabel: {
						inside: true,
						verticalAlign: 'top',
						textStyle:{
							color: '#eee'
						},
						showMinLabel: false,
						showMaxLabel: true
					},
					axisTick: {
						show: false
					},
					axisPointer:{
						lineStyle: {
							type:'solid'
						},
						label: {
							backgroundColor: '#387ef5',
							fontsize: 9,
							padding: 2
						}
					},
					triggerTooltip: true
				},
				{
					gridIndex: 1,
					xAxisIndex: 1,
					type: 'value',
					scale: true,
					position: 'left',
					show: false,
					axisPointer:{
						show: false
					}
				}
			],
			dataZoom: [
				{
					type: 'inside',
					start: Window.zoomStartLine,
					end: Window.zoomEndLine,
					xAxisIndex: [0, 1]
				},
				{
					type: 'inside',
					start: Window.zoomStartLine,
					end: Window.zoomEndLine,
					xAxisIndex: [0, 1]
				}
			],
			series: [
				{
					type: 'line',
					name:this.commodityType!=4?'SignPriceClose':'Buy',
					data: SignPriceClose,
					showSymbol: false,
					lineStyle: {
						normal: {
							width: 1,
							color: this.commodityType!=4?'#0037c5':'#ff0033'
						}
					},
					xAxisIndex:0,
					yAxisIndex:0
				},
				{
					type: 'line',
					name:this.commodityType!=4?'QAveragePrice':'Sell',
					data: QAveragePrice,
					showSymbol: false,
					lineStyle: {
						normal: {
							width: 1,
							color: this.commodityType!=4?'#ffc600':'#04b700'
						}
					},
					z:1,
					xAxisIndex:0,
					yAxisIndex:0
				},
				{
					type: 'line',
					name:'SignChangeRate',
					data: SignChangeRate,
					showSymbol: false,
					lineStyle: {
						normal: {
							width: 1,
							color: '#0099ff',
							opacity: 0
						}
					},
					yAxisIndex:1,
					xAxisIndex:0
				},
				{
					type: 'line',
					name:'SignChangeValue',
					data: SignChangeValue,
					showSymbol: false,
					lineStyle: {
						normal: {
							width: 1,
							color: '#0099ff',
							opacity: 0
						}
					},
					yAxisIndex:1,
					xAxisIndex:0
				}
			]
		};
		Window.line_ma.setOption(Window.linestickOption,false,true);
		echartsGraphic.start(Window.line_ma);
	}
	/* 绘图尺寸重加载 */
	resizeChart(){
		setTimeout(()=>{
			Window.line_ma.resize();
		},10);
	}
	private timestampCoverHms(_date,type){
		var date = new Date(_date);
		var Y = date.getFullYear() + '-';
		var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
		var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
		var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
		var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
		var s_m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes());
		var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
		switch(type){
			case 'ymd':
				return Y+M+D;
			case 'all':
				return Y+M+D+h+m+s;
			case 'm':
				return m;
			case 'h':
				return h;
			case 'hm':
				return h+s_m;
			default:
				return h+m+s;
		}
	}
}
