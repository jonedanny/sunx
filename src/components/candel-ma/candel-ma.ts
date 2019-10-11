import { Component,AfterViewInit,ElementRef } from '@angular/core';


declare var Window,echarts,indexLibrary,echartsGraphic;

@Component({
	selector: 'candel-ma',
	templateUrl: 'candel-ma.html'
})
export class CandelMaComponent implements AfterViewInit {
	private candelMa;
	private candelData:Array<any> = [];
	private dates:Array<any> = [];

	private candelTime:number;

	private hasLoadHistory = false;
	public infoPosition:string = 'right';
	private hoverInfo = {
		"date":'',
		"candeldata":''
	};


	constructor(private elementRef: ElementRef) {
		this.hasLoadHistory = false;
		let self = this;
		Window.initEcharts = function(data,time){
			var dates = Window.candel_ma.getOption();
			Window.candel_ma.clear();
			Window.candel_ma.dispose();
			self.candelMa = self.elementRef.nativeElement.querySelector('#candel-ma');
			Window.candel_ma = echarts.init(self.candelMa);
			self.setChart(self.dates,self.candelData);
			echartsGraphic.start(Window.candel_ma);
			Window.candel_ma.on('dataZoom',function(param){
				if(param.batch){
					Window.zoomStartCandel = param.batch[0].start;
					Window.zoomEndCandel = param.batch[0].end;
				}
			});
		}
	}
	ngAfterViewInit() {
		this.candelMa = this.elementRef.nativeElement.querySelector('#candel-ma');
		Window.candel_ma = echarts.init(this.candelMa);
	}
	ngOnDestroy() {
		Window.candel_ma.clear();
	}
	/* 更新图 */
	private nowPrice;
	updateChart(res){
		const data = JSON.parse(JSON.stringify(res));
		if(this.hasLoadHistory){
			if(data.SignType == this.candelTime){
				console.log('[画点信号]',this.candelTime,data.SignType,data);
				this.candelData.splice(this.candelData.length-1,1,[data.SignPriceOpen,data.SignPriceClose,data.SignPriceMin,data.SignPriceMax]);
				this.dates.splice(this.dates.length-1,1,this.timestampCoverHms(data.Stamp*1000,"all"));
				Window.candelstickOption.series[0].data = this.candelData;
				Window.candelstickOption.xAxis[0].data = this.dates;
				Window.candelstickOption.xAxis[1].data = this.dates;
				Window.candelstickOption.xAxis[0].max = this.dates.length + 5;
				Window.candelstickOption.xAxis[1].max = this.dates.length + 5;
				Window.candel_ma.setOption(Window.candelstickOption);
				setTimeout(()=>{
					this.dates.push(this.timestampCoverHms((data.Stamp+this.candelTime*60)*1000,"all"));
					this.changeCorss(this.nowIsCross);
					var l1 = this.candelData[this.candelData.length-1];
					var l2 = [l1[1],l1[1],l1[1],l1[1]];
					this.candelData.push(l2);
					Window.candel_ma.setOption(Window.candelstickOption);
				},50);
			}
			else{
				// console.log('[普通信号]',this.candelTime,data);
				/* 绘图效果 */
				let tmp_candelData = this.candelData[this.candelData.length-1];
				if(this.nowPrice == data.QLastPrice){
					return;
				}
				this.nowPrice = data.QLastPrice;
				console.log(this.nowPrice, data);
				if(this.candelData.length > 0 && data.SignType === 0){
					tmp_candelData[0] = this.candelData[this.candelData.length-2][1] < tmp_candelData[2] ? this.baseCandelData[this.baseCandelData.length - 1]['SignPriceOpen'] : this.candelData[this.candelData.length-2][1];
					tmp_candelData[1] = this.nowPrice;
					tmp_candelData[2] = (this.nowPrice < tmp_candelData[2])?this.nowPrice:tmp_candelData[2];
					tmp_candelData[3] = (tmp_candelData[3] < this.nowPrice)?this.nowPrice:tmp_candelData[3];
					console.log(tmp_candelData);
					this.candelData.splice(-1,1,tmp_candelData);
					Window.candelstickOption.series[0].data = this.candelData;
					Window.candelstickOption.dataZoom[0].start = Window.zoomStartCandel;
					Window.candelstickOption.dataZoom[0].end = Window.zoomEndCandel;
					Window.candel_ma.setOption(Window.candelstickOption,false,true);
				}
			}
		}
	}
	/* 十字坐标与缩放切换 */
	private info = false;
	private nowIsCross:boolean = false;
	public changeCorss(isCross){
		this.nowIsCross = isCross;
		if(Window.candelstickOption){
			Window.candelstickOption.tooltip.show = isCross;
			Window.candel_ma.setOption(Window.candelstickOption);
			Window.candel_ma.dispatchAction({
				type: 'dataZoom',
				start: Window.zoomStartCandel,
				end: Window.zoomEndCandel
			});
			this.info = isCross;
			if(isCross && Window.echartsDownPoint){
				Window.candel_ma.dispatchAction({
					type: 'showTip',
					x: Window.echartsDownPoint.offsetX,
					y: Window.echartsDownPoint.offsetY
				})
			}
		}
	}
	private baseCandelData = null;
	public historyDraw(data,time){
		this.baseCandelData = data;
		this.candelData = [];
		this.dates = [];
		let candeltmpData;
		this.candelTime = time;
		for(let i=0,r=data.length;i<r;i++){
			candeltmpData = [];
			if(time == 1440){
				if(data[i].DayLineStamp != undefined){
					this.dates.push(this.timestampCoverHms((data[i].DayLineStamp)*1000,"ymd"));
				}
				else{
					this.dates.push(this.timestampCoverHms((data[i].Stamp)*1000,"ymd"));
				}
			}
			else{
				if(i == data.length-1){
					let s = data[i].Stamp%(time*60);
					if(s != 0){
						this.dates.push(this.timestampCoverHms((data[i].Stamp+time*60-s)*1000,"all"));
					}
					else{
						this.dates.push(this.timestampCoverHms((data[i].Stamp)*1000,"all"));
					}
				}
				else{
					this.dates.push(this.timestampCoverHms((data[i].Stamp)*1000,"all"));
				}
			}
			candeltmpData.push(data[i].SignPriceOpen,data[i].SignPriceClose,data[i].SignPriceMin,data[i].SignPriceMax);
			this.candelData.push(candeltmpData);
		}
		Window.candel_ma.on('dataZoom',function(param){
			if(param.batch){
				Window.zoomStartCandel = param.batch[0].start;
				Window.zoomEndCandel = param.batch[0].end;
			}
		});

		this.setChart(this.dates,this.candelData,true);
		this.hasLoadHistory = true;
	};
	/* 画图 */
	private setChart(Stamp,candelData,update=false){
		let self = this;

		Window.candelstickOption = {
			animation:false,
			axisPointer: {
				link: {xAxisIndex: 'all'},
				label: {
					backgroundColor: '#666'
				}
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross'
				},
				formatter : function(params) {
					for(let i=0,r=params.length;i<r;i++){
						if(params[i].seriesType == 'candlestick'){
							self.hoverInfo.date = params[i].axisValue;
							self.hoverInfo.candeldata = params[i].data;
							break;
						}
					}
					Window.showCandelMainInfo(params);
					Window.showCandelSubInfo(params);
				},
				show: this.info
			},
			legend: {
				show: false
			},
			grid: [
				{
			        top: '0%',
			        left: '0%',
			        right: '0%',
			        height: '65%'
			    },
			    {
			        top: '75%',
			        left: '0%',
			        right: '0%',
			        height: '25%'
			    }
			],
			dataZoom: [
				{
			        type: 'inside',
			        start:Window.zoomStartCandel,
					end:Window.zoomEndCandel,
					xAxisIndex: [0, 1]
			    },
			    {
			        type: 'inside',
			        start:Window.zoomStartCandel,
					end:Window.zoomEndCandel,
					xAxisIndex: [0, 1]
			    }
		    ],
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
					max:this.dates.length>300?this.dates.length+3:this.dates.length
				},
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
					max:this.dates.length>300?this.dates.length+3:this.dates.length,
					gridIndex: 1
				}
			],
			yAxis: [
				{
					type: 'value',
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
					boundaryGap: ['5%', '5%'],
					showMinLabel: false,
					splitNumber: 3,
					axisLabel: {
						inside: true,
						verticalAlign: 'top',
						textStyle:{
							color: '#eee'
						},
						formatter: '\n{value}',
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
					}
				},
				{
					type: 'value',
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
					showMinLabel: false,
					splitNumber: 1,
					axisLabel: {
						inside: true,
						verticalAlign: 'top',
						textStyle:{
							color: '#eee'
						},
						formatter: '\n{value}',
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
					gridIndex: 1,
					boundaryGap: ['5%', '5%']
				}
			],
			series: [
				{
					type: 'candlestick',
					name: 'candelMainData',
					data:candelData,
					markPoint: {
						itemStyle: {
							normal: {
								color: 'transparent'
							}
						},
						data: [
							{
								name: 'highest value',
								type: 'max',
								valueDim: 'highest',
								label: {
									normal: {
										show: true,
										offset:[-30,30],
										fontSize:10,
										fontWeight:100,
										textStyle:{
											color: '#ddd'
										},
										formatter:"{c} →"
									}
								}
							},
							{
								name: 'lowest value',
								type: 'min',
								valueDim: 'lowest',
								label: {
									normal: {
										show: true,
										offset:[-30,23],
										fontSize:10,
										textStyle:{
											color: '#ddd'
										},
										formatter:"{c} →"
									}
								}
							}
						]
					},
					itemStyle: {
						normal: {
							color: 'rgba(0,0,0, .0)',
							color0: '#15b300',
							borderColor: '#ff0000',
							borderColor0: '#15b300',
							borderWidth0:1
						}
					}
				}
			]
		};
		Window.candel_ma.setOption(Window.candelstickOption,false,true);
		if(update){
			echartsGraphic.start(Window.candel_ma);
		}
	};
	/* 绘图尺寸重加载 */
	resizeChart(){
		setTimeout(()=>{
			Window.candel_ma.resize();
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
