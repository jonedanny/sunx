Window.echartsIndex = {
	lineVol: {
		lineVolSignQty:[],
		lineVolQPositionQty:[],
		loadHistory :function(data){
			clearSubLineSeries();
			this.lineVolSignQty = [];
			this.lineVolQPositionQty = [];
			for(var i=0,r=data.length;i<r;i++){
				this.lineVolSignQty.push(data[i].SignQty);
				if(data[i].QPositionQty == 0 && i > 0){
					data[i].QPositionQty = data[i-1].QPositionQty;
				}
				this.lineVolQPositionQty.push(data[i].QPositionQty);
			}
			Window.linestickOption.series[5] = {
				type: 'bar',
				showSymbol: false,
				name:'成交量',
				data: this.lineVolSignQty,
				itemStyle: {
					normal: {
						color: '#FAA732'
					}
				},
				lineStyle: {
					normal: {
						width: 1
					}
				},
				yAxisIndex:2,
				xAxisIndex: 1
			};
			Window.linestickOption.series[4] = {
				type: 'line',
				showSymbol: false,
				name:'持仓量',
				data: this.lineVolQPositionQty,
				itemStyle: {
					normal: {
						color: '#0037c5'
					}
				},
				lineStyle: {
					normal: {
						width: 1
					}
				},
				yAxisIndex:3,
				xAxisIndex: 1
			};
			Window.line_ma.setOption(Window.linestickOption,true);
		},
		updateData: function(data){
			console.log(data);
			if(data.SignType == 1){
				this.lineVolSignQty.push(data.SignQty);
				this.lineVolQPositionQty.push(data.QPositionQty);
				Window.linestickOption.series[5].data = this.lineVolSignQty;
				Window.linestickOption.series[4].data = this.lineVolQPositionQty;
				Window.linestickOption.dataZoom[0].start = Window.zoomStartLine;
				Window.linestickOption.dataZoom[0].end = Window.zoomEndLine;
				Window.linestickOption.dataZoom[1].start = Window.zoomStartLine;
				Window.linestickOption.dataZoom[1].end = Window.zoomEndLine;
				Window.line_ma.setOption(Window.linestickOption);
			}
		}
	},
	lineMacd: {
		lineMacdPriceClose:[],
		lineMacdResult:[],
		loadHistory :function(data){
			clearSubLineSeries();
			this.lineMacdPriceClose = [];
			this.lineMacdResult = [];
			
			for(var s=0,k=data.length;s<k;s++){
				this.lineMacdPriceClose.push(data[s].SignPriceClose);
			}
			console.log(this.lineMacdPriceClose);
			this.lineMacdResult = indexLibrary.MACD(this.lineMacdPriceClose,12,26,9);
			Window.linestickOption.series[4] = {
				data:this.lineMacdResult[0],
				name: 'diff',
				type: 'line',
				showSymbol: false,
				lineStyle:{
					normal:{
						color:'#333',
						width: 1,
					}
				},
				yAxisIndex:2,
				xAxisIndex: 1
			};
			Window.linestickOption.series[5] = {
				data:this.lineMacdResult[1],
				name: 'dea',
				type: 'line',
				showSymbol: false,
				lineStyle:{
					normal:{
						color:'#FAA732',
						width: 1,
					}
				},
				yAxisIndex:2,
				xAxisIndex: 1
			};
			Window.linestickOption.series[6] = {
				data:this.lineMacdResult[2],
				name: 'macd',
				type: 'bar',
				barWidth:2,
				color:'#333',
				yAxisIndex:2,
				xAxisIndex: 1,
				itemStyle: {
                	normal: {
	                    color: function(params) {
	                        var col;
	                        if (params.data >= 0) {
	                            col = '#ff0000';
	                        } else {
	                            col = '#04b700';
	                        }
	                        return col;
	                    }
	                }
	            }
			};
			Window.linestickOption.xAxis[1].axisLine.onZero = true;
			Window.line_ma.setOption(Window.linestickOption,true);
		},
		updateData: function(data){
			if(data.SignType == 1){
				this.lineMacdPriceClose.push(data.SignPriceClose);
				this.lineMacdResult = indexLibrary.MACD(this.lineMacdPriceClose,12,26,9);
				console.log(this.lineMacdResult);
				Window.linestickOption.series[4].data = this.lineMacdResult[0];
				Window.linestickOption.series[5].data = this.lineMacdResult[1];
				Window.linestickOption.series[6].data = this.lineMacdResult[2];
				Window.linestickOption.dataZoom[0].start = Window.zoomStartLine;
				Window.linestickOption.dataZoom[0].end = Window.zoomEndLine;
				Window.linestickOption.dataZoom[1].start = Window.zoomStartLine;
				Window.linestickOption.dataZoom[1].end = Window.zoomEndLine;
				Window.line_ma.setOption(Window.linestickOption);
			}
		}
	},
	//蜡烛图主图指标
	candelMa: {
		ma5:[],
		ma10:[],
		ma20:[],
		ma30:[],
		SignPriceClose:[],
		loadHistory: function(data){
			this.ma5 = [];
			this.ma10 = [];
			this.ma20 = [];
			this.ma30 = [];
			this.SignPriceClose = [];
			for(var i=0,r=data.length;i<r;i++){
				this.SignPriceClose.push(data[i].SignPriceClose);
			}
			this.ma5 = indexLibrary.MA(5,this.SignPriceClose);
			this.ma10 = indexLibrary.MA(10,this.SignPriceClose);
			this.ma20 = indexLibrary.MA(20,this.SignPriceClose);
			this.ma30 = indexLibrary.MA(30,this.SignPriceClose);

			Window.candelstickOption.series[1] = {
				type: 'line',
				name:'ma5',
				data: this.ma5,
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#333'
					}
				}
			};
			Window.candelstickOption.series[2] = {
				type: 'line',
				name:'ma10',
				data: this.ma10,
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#FAA732'
					}
				}
			};
			Window.candelstickOption.series[3] = {
				type: 'line',
				name:'ma20',
				data: this.ma20,
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#ff00ff'
					}
				}
			};
			Window.candelstickOption.series[4] = {
				type: 'line',
				name:'ma30',
				data: this.ma30,
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#00ff00'
					}
				}
			};
			Window.candel_ma.setOption(Window.candelstickOption);
		},
		updateData: function(data){
			this.SignPriceClose.push(data.SignPriceClose);
			this.ma5 = indexLibrary.MA(5,this.SignPriceClose);
			this.ma10 = indexLibrary.MA(10,this.SignPriceClose);
			this.ma20 = indexLibrary.MA(20,this.SignPriceClose);
			this.ma30 = indexLibrary.MA(30,this.SignPriceClose);
			Window.candelstickOption.series[1].data = this.ma5;
			Window.candelstickOption.series[2].data = this.ma10;
			Window.candelstickOption.series[3].data = this.ma20;
			Window.candelstickOption.series[4].data = this.ma30;
			Window.candel_ma.setOption(Window.candelstickOption);
		}
	},
	candelCfd: {
		buy:[],
		sell:[],
		loadHistory: function(data){
			this.buy = [];
			this.sell = [];
			console.log(data);
			for(var i=0,r=data.length;i<r;i++){
				this.buy.push(data[i].BidPriceClose);
				this.sell.push(data[i].AskPriceClose);
			}
			Window.candelstickOption.series[1] = {
				type: 'line',
				name:'buy',
				data: this.buy,
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#387ef5'
					}
				}
			};
			Window.candelstickOption.series[2] = {
				type: 'line',
				name:'sell',
				data: this.sell,
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#ff0033'
					}
				}
			};
			Window.candelstickOption.series[3] = {
				type: 'line',
				showSymbol: false,
				name:'',
				data: []
			};
			Window.candelstickOption.series[4] = {
				type: 'line',
				showSymbol: false,
				name:'',
				data: []
			};
			Window.candel_ma.setOption(Window.candelstickOption);
		},
		updateData: function(data){
			console.log(data);
			this.buy.push(data.BidPriceClose);
			this.sell.push(data.AskPriceClose);
			Window.candelstickOption.series[1].data = this.buy;
			Window.candelstickOption.series[2].data = this.sell;
			Window.candel_ma.setOption(Window.candelstickOption);
		}
	},
	candelBoll: {
		boll:[],
		SignPriceClose:[],
		loadHistory: function(data){
			this.boll = [];
			this.SignPriceClose = [];
			for(var i=0,r=data.length;i<r;i++){
				this.SignPriceClose.push(data[i].SignPriceClose);
			}
			this.boll = indexLibrary.BOLL(this.SignPriceClose,26,2);
			Window.candelstickOption.series[1] = {
				type: 'line',
				showSymbol: false,
				name:'mid',
				data: this.boll[0],
				lineStyle: {
					normal: {
						color: '#ff21d8',
						width: 1
					}
				}
			};
			Window.candelstickOption.series[2] = {
				type: 'line',
				showSymbol: false,
				name:'upper',
				data: this.boll[1],
				lineStyle: {
					normal: {
						color: '#ff9900',
						width: 1
					}
				}
			};
			Window.candelstickOption.series[3] = {
				type: 'line',
				showSymbol: false,
				name:'lower',
				data: this.boll[2],
				lineStyle: {
					normal: {
						color: '#387ef5',
						width: 1
					}
				}
			};
			Window.candelstickOption.series[4] = {
				type: 'line',
				showSymbol: false,
				name:'',
				data: []
			};
			Window.candel_ma.setOption(Window.candelstickOption);
		},
		updateData: function(data){
			this.SignPriceClose.push(data.SignPriceClose);
			this.boll = indexLibrary.BOLL(this.SignPriceClose,26,2);
			Window.candelstickOption.series[1].data = this.boll[0];
			Window.candelstickOption.series[2].data = this.boll[1];
			Window.candelstickOption.series[3].data = this.boll[2];
			Window.candel_ma.setOption(Window.candelstickOption);
		}
	},
	candelEma: {
		ema:[],
		SignPriceClose:[],
		loadHistory: function(data){
			this.ema = [];
			this.SignPriceClose = [];
			for(var i=0,r=data.length;i<r;i++){
				this.SignPriceClose.push(data[i].SignPriceClose);
			}
			this.ema = indexLibrary.EMA(this.SignPriceClose,5,10,20,60,120,260);
			Window.candelstickOption.series[1] = {
				type: 'line',
				showSymbol: false,
				name:'EMA5',
				data: this.ema[0],
				lineStyle: {
					normal: {
						color: '#FAA732',
						width: 1
					}
				}
			};
			Window.candelstickOption.series[2] = {
				type: 'line',
				name:'EMA10',
				data: this.ema[1],
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#387ef5'
					}
				}
			};
			Window.candelstickOption.series[3] = {
				type: 'line',
				showSymbol: false,
				name:'EMA20',
				data: this.ema[2],
				lineStyle: {
					normal: {
						color: '#ff21d8',
						width: 1
					}
				}
			};
			Window.candelstickOption.series[4] = {
				type: 'line',
				name:'EMA60',
				data: this.ema[3],
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#ff0033'
					}
				}
			};
			Window.candel_ma.setOption(Window.candelstickOption);
		},
		updateData: function(data){
			this.SignPriceClose.push(data.SignPriceClose);
			this.ema = indexLibrary.EMA(this.SignPriceClose,5,10,20,60,120,260);
			Window.candelstickOption.series[1].data = this.ema[0];
			Window.candelstickOption.series[2].data = this.ema[1];
			Window.candelstickOption.series[3].data = this.ema[2];
			Window.candelstickOption.series[4].data = this.ema[3];
			Window.candel_ma.setOption(Window.candelstickOption);
		}
	},
	candelBbi: {
		bbi:[],
		SignPriceClose:[],
		loadHistory: function(data){
			this.bbi = [];
			this.SignPriceClose = [];
			for(var i=0,r=data.length;i<r;i++){
				this.SignPriceClose.push(data[i].SignPriceClose);
			}
			this.bbi = indexLibrary.BBI(this.SignPriceClose,3,6,12,24);
			Window.candelstickOption.series[1] = {
				type: 'line',
				name:'BBI',
				data: this.bbi,
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#ff9900'
					}
				}
			};
			Window.candelstickOption.series[2] = {
				type: 'line',
				showSymbol: false,
				name:'',
				data: []
			};
			Window.candelstickOption.series[3] = {
				type: 'line',
				showSymbol: false,
				name:'',
				data: []
			};
			Window.candelstickOption.series[4] = {
				type: 'line',
				showSymbol: false,
				name:'',
				data: []
			};
			Window.candel_ma.setOption(Window.candelstickOption);
		},
		updateData: function(data){
			this.SignPriceClose.push(data.SignPriceClose);
			this.bbi = indexLibrary.BBI(this.SignPriceClose,3,6,12,24);
			Window.candelstickOption.series[1].data = this.bbi;
		}
	},
	//蜡烛图副图指标
	candelVol: {
		SignQty:[],
		volumeColor:[],
		VOL1:[],
		VOL2:[],
		candelData:[],
		loadHistory: function(data){
			clearSubCandelSeries();
			this.SignQty = [];
			this.volumeColor = [];
			this.VOL1 = [];
			this.VOL2 = [];
			this.candelData = [];
			var candeltmpData = [];
			for(i=0,r=data.length;i<r;i++){
				candeltmpData = [];
				candeltmpData.push(data[i].SignPriceOpen,data[i].SignPriceClose,data[i].SignPriceMin,data[i].SignPriceMax);
				this.SignQty.push(data[i].SignQty);
				this.candelData.push(candeltmpData);
			}
			this.VOL1 = indexLibrary.MA(5,this.SignQty);
			this.VOL2 = indexLibrary.MA(10,this.SignQty);
			this.volumeColor = colorVolList(this.candelData);
			var self = this;
			Window.candelstickOption.series[5] = {
				type: 'bar',
				showSymbol: false,
				name:'VOLUME',
				data: this.SignQty,
				barWidth:4,
				itemStyle: {
					normal: {
						color: function(params) {
							return self.volumeColor[params.dataIndex];
						}
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[6] = {
				type: 'line',
				name:'vol1',
				data: this.VOL1,
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#333'
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[7] = {
				type: 'line',
				name:'vol2',
				data: this.VOL2,
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#FAA732'
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candel_ma.setOption(Window.candelstickOption);
		},
		updateData: function(data){
			this.SignQty.push(data.SignQty);
			this.candelData.push([data.SignPriceOpen,data.SignPriceClose,data.SignPriceMin,data.SignPriceMax]);
			this.VOL1 = indexLibrary.MA(5,this.SignQty);
			this.VOL2 = indexLibrary.MA(10,this.SignQty);
			this.volumeColor = colorVolList(this.candelData);
			Window.candelstickOption.series[5].data = this.SignQty;
			Window.candelstickOption.series[6].data = this.VOL1;
			Window.candelstickOption.series[7].data = this.VOL2;
			Window.candel_ma.setOption(Window.candelstickOption);
		}
	},
	candelMacd: {
		SignPriceClose:[],
		macdResult :[],
		loadHistory: function(data){
			clearSubCandelSeries();
			this.SignPriceClose = [];
			this.macdResult = [];
			for(i=0,r=data.length;i<r;i++){
				this.SignPriceClose.push(data[i].SignPriceClose);
			}
			this.macdResult = indexLibrary.MACD(this.SignPriceClose,12,26,9);
			Window.candelstickOption.series[5] = {
				data:this.macdResult[0],
				name: 'diff',
				type: 'line',
				showSymbol: false,
				lineStyle:{
					normal:{
						color:'#333',
						width: 1,
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[6] = {
				data:this.macdResult[1],
				name: 'dea',
				type: 'line',
				showSymbol: false,
				lineStyle:{
					normal:{
						color:'#FAA732',
						width: 1,
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[7] = {
				data:this.macdResult[2],
				name: 'macd',
				type: 'bar',
				barWidth:3,
				color:'#333',
				itemStyle: {
                	normal: {
	                    color: function(params) {
	                        var col;
	                        if (params.data >= 0) {
	                            col = '#ff0000';
	                        } else {
	                            col = '#04b700';
	                        }
	                        return col;
	                    }
	                }
	            },
	            yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.xAxis[1].axisLine.onZero = true;
			Window.candel_ma.setOption(Window.candelstickOption);
		},
		updateData : function(data){
			this.SignPriceClose.push(data.SignPriceClose);
			this.macdResult = indexLibrary.MACD(this.SignPriceClose,12,26,9);
			Window.candelstickOption.series[5].data = this.macdResult[0];
			Window.candelstickOption.series[6].data = this.macdResult[1];
			Window.candelstickOption.series[7].data = this.macdResult[2];
			Window.candel_ma.setOption(Window.candelstickOption);
		}
	},
	candelKdj: {
		candelData:[],
		kdj:[],
		loadHistory:function(data){
			clearSubCandelSeries();
			this.candelData = [];
			this.kdj = [];
			for(i=0,r=data.length;i<r;i++){
				this.candelData.push([data[i].SignPriceOpen,data[i].SignPriceClose,data[i].SignPriceMin,data[i].SignPriceMax]);
			}
			this.kdj = indexLibrary.KDJ(this.candelData,9,3,3);
			Window.candelstickOption.series[5] = {
				type: 'line',
				showSymbol: false,
				name:'k',
				data: this.kdj[0],
				lineStyle: {
					normal: {
						color: '#333',
						width: 1
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[6] = {
				type: 'line',
				name:'d',
				data: this.kdj[1],
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#FAA732'
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[7] = {
				type: 'line',
				name:'j',
				data: this.kdj[2],
				showSymbol: false,
				hoverAnimation: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#ff00ff'
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candel_ma.setOption(Window.candelstickOption);
		},
		updateData:function(data){
			this.candelData.push([data.SignPriceOpen,data.SignPriceClose,data.SignPriceMin,data.SignPriceMax]);
			this.kdj = indexLibrary.KDJ(this.candelData,9,3,3);
			Window.candelstickOption.series[5].data = this.kdj[0];
			Window.candelstickOption.series[6].data = this.kdj[1];
			Window.candelstickOption.series[7].data = this.kdj[2];
			Window.candel_ma.setOption(Window.candelstickOption);
		}
	},
	candelDma: {
		SignPriceClose:[],
		dmaResult :[],
		loadHistory:function(data){
			clearSubCandelSeries();
			this.SignPriceClose = [];
			this.dmaResult = [];
			for(i=0,r=data.length;i<r;i++){
				this.SignPriceClose.push(data[i].SignPriceClose);
			}
			this.dmaResult = indexLibrary.DMA(this.SignPriceClose,10,50,10);
			Window.candelstickOption.series[5] = {
				type: 'line',
				showSymbol: false,
				name:'ddd',
				data: this.dmaResult[0],
				lineStyle: {
					normal: {
						color: '#FAA732',
						width: 1
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[6] = {
				type: 'line',
				name:'dddma',
				data: this.dmaResult[1],
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#333'
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candel_ma.setOption(Window.candelstickOption);
		},
		updateData:function(data){
			this.SignPriceClose.push(data.SignPriceClose);
			this.dmaResult = indexLibrary.DMA(this.SignPriceClose,10,50,10);
			Window.candelstickOption.series[5].data = this.dmaResult[0];
			Window.candelstickOption.series[6].data = this.dmaResult[1];
			Window.candel_ma.setOption(Window.candelstickOption);
		}
	},
	candelDmi: {
		candelData:[],
		dmi:[],
		loadHistory:function(data){
			clearSubCandelSeries();
			this.candelData = [];
			this.dmi = [];
			for(i=0,r=data.length;i<r;i++){
				this.candelData.push([data[i].SignPriceOpen,data[i].SignPriceClose,data[i].SignPriceMin,data[i].SignPriceMax]);
			}
			this.dmi = indexLibrary.DMI(this.candelData,14,6);
			Window.candelstickOption.series[5] = {
				type: 'line',
				showSymbol: false,
				name:'PDI',
				data: this.dmi[0],
				lineStyle: {
					normal: {
						color: '#ff9900',
						width: 1
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[6] = {
				type: 'line',
				name:'MDI',
				data: this.dmi[1],
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#ff21d8'
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[7] = {
				type: 'line',
				name:'ADX',
				data: this.dmi[2],
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#ff0000'
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[8] = {
				type: 'line',
				name:'ADXR',
				data: this.dmi[3],
				showSymbol: false,
				hoverAnimation: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#387ef5'
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candel_ma.setOption(Window.candelstickOption);
		},
		updateData:function(data){
			this.candelData.push([data.SignPriceOpen,data.SignPriceClose,data.SignPriceMin,data.SignPriceMax]);
			this.dmi = indexLibrary.DMI(this.candelData,14,6);
			Window.candelstickOption.series[5].data = this.dmi[0];
			Window.candelstickOption.series[6].data = this.dmi[1];
			Window.candelstickOption.series[7].data = this.dmi[2];
			Window.candelstickOption.series[8].data = this.dmi[3];
			Window.candel_ma.setOption(Window.candelstickOption);
		}
	},
	candelDmiQl: {
		candelData:[],
		dmi:[],
		loadHistory:function(data){
			clearSubCandelSeries();
			this.candelData = [];
			this.dmi = [];
			for(i=0,r=data.length;i<r;i++){
				this.candelData.push([data[i].SignPriceOpen,data[i].SignPriceClose,data[i].SignPriceMin,data[i].SignPriceMax]);
			}
			this.dmi = indexLibrary.DMIQL(this.candelData,14,6);
			Window.candelstickOption.series[5] = {
				type: 'line',
				showSymbol: false,
				name:'PDI',
				data: this.dmi[0],
				lineStyle: {
					normal: {
						color: '#ff9900',
						width: 1
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[6] = {
				type: 'line',
				name:'MDI',
				data: this.dmi[1],
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#ff21d8'
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[7] = {
				type: 'line',
				name:'ADX',
				data: this.dmi[2],
				showSymbol: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#ff0000'
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candelstickOption.series[8] = {
				type: 'line',
				name:'ADXR',
				data: this.dmi[3],
				showSymbol: false,
				hoverAnimation: false,
				lineStyle: {
					normal: {
						width: 1,
						color:'#387ef5'
					}
				},
				yAxisIndex:1,
				xAxisIndex: 1
			};
			Window.candel_ma.setOption(Window.candelstickOption);
		},
		updateData:function(data){
			this.candelData.push([data.SignPriceOpen,data.SignPriceClose,data.SignPriceMin,data.SignPriceMax]);
			this.dmi = indexLibrary.DMIQL(this.candelData,14,6);
			Window.candelstickOption.series[5].data = this.dmi[0];
			Window.candelstickOption.series[6].data = this.dmi[1];
			Window.candelstickOption.series[7].data = this.dmi[2];
			Window.candelstickOption.series[8].data = this.dmi[3];
			Window.candel_ma.setOption(Window.candelstickOption);
		}
	}
};
var lineSub = '';
var lineSubHtml = '';
Window.lineSubFun = function(value){
	lineSub = value;
	setTimeout(function(){
		switch(lineSub){
			case 'vol':
				$('#sub-line-text').html(
					'<span class="c_yellow">VOL: </span>'+
					'<span>POSITION: </span>'
				);
				break;
			case 'macd':
				$('#sub-line-text').html(
					'<span class="c_grey">MACD(12,26,9)</span>'+
					'<span>DIFF:</span>'+
					'<span class="c_yellow">DEA:</span>'+
					'<span class="c_grey">MACD:</span>'
				);
				break;
		}
	},30);
};
Window.showLineSubInfo = function(params){
	var i,r;
	switch(lineSub) {
		case 'vol':
			var VOL,POSITION;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesIndex == 4){
					POSITION = params[i].data;
				}
				if(params[i].seriesIndex == 5){
					VOL = params[i].data;
				}
			}
			lineSubHtml = '<span class="c_yellow">VOL: '+VOL+'</span>'+
						'<span>POSITION: '+POSITION+'</span>';
			$('#sub-line-text').html(lineSubHtml);
			break;
		case 'macd':
			var diff,dea,macd;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'diff'){
					diff = params[i].data;
				}
				if(params[i].seriesName == 'dea'){
					dea = params[i].data;
				}
				if(params[i].seriesName == 'macd'){
					macd = params[i].data;
				}
			}
			lineSubHtml = '<span class="c_grey">MACD(12,26,9)</span>'+
						'<span>DIFF:'+parseFloat(diff).toFixed(4)+'</span>'+
						'<span class="c_yellow">DEA:'+parseFloat(dea).toFixed(4)+'</span>'+
						'<span class="c_grey">MACD:'+parseFloat(macd).toFixed(4)+'</span>';
			$('#sub-line-text').html(lineSubHtml);
			break;
	}
};
var candelMain = '';
var candelSub = '';
Window.candelMainFun = function(value){
	$('#main-candel-text').html('');
	candelMain = value;
	setTimeout(function(){
		switch(candelMain){
			case 'ma':
				$('#main-candel-text').html(
					'<span>MA5:</span>'+
					'<span class="c_yellow">MA10:</span>'+
					'<span class="c_violet">MA20:</span>'+
					'<span class="c_green">MA30:</span>'
				);
				break;
			case 'cfd':
				$('#main-candel-text').html(
					'<span class="c_blue">BUY:</span>'+
					'<span class="c_red">SELL:</span>'
				);
				break;
			case 'boll':
				$('#main-candel-text').html(
					'<span class="c_999">BOLL(26,2)</span>'+
					'<span class="c_pink">MID:</span>'+
					'<span class="c_orange">UPPER:</span>'+
					'<span class="c_blue">LOWER:</span>'
				);
				break;
			case 'ema':
				$('#main-candel-text').html(
					'<span class="c_yellow">EMA5:</span>'+
					'<span class="c_blue">EMA10:</span>'+
					'<span class="c_pink">EMA20:</span>'+
					'<span class="c_red">EMA60:</span>'
				);
				break;
			case 'bbi':
				$('#main-candel-text').html(
					'<span class="c_999">BBI(3,6,12,24)</span>'+
					'<span class="c_orange">BBI:</span>'
				);
				break;
		}
	},300);
};
Window.candelSubFun = function(value){
	$('#sub-candel-text').html('');
	candelSub = value;
	setTimeout(function(){
		switch(candelSub){
			case 'vol':
				$('#sub-candel-text').html(
					'<span class="c_grey">VOL(5,10)</span>'+
					'<span>VOLUME:</span>'+
					'<span>V1:</span>'+
					'<span class="c_yellow">V2:</span>'
				);
				break;
			case 'macd':
				$('#sub-candel-text').html(
					'<span class="c_grey">MACD(12,6,9)</span>'+
					'<span>DIFF:</span>'+
					'<span class="c_yellow">DEA:</span>'+
					'<span class="c_grey">MACD:</span>'
				);
				break;
			case 'kdj':
				$('#sub-candel-text').html(
					'<span class="c_grey">KDJ(9,3,3)</span>'+
					'<span>K:</span>'+
					'<span class="c_yellow">D:</span>'+
					'<span class="c_violet">J:</span>'
				);
				break;
			case 'dma':
				$('#sub-candel-text').html(
					'<span class="c_999">DMA(10,50,10)</span>'+
					'<span class="c_yellow">DDD:</span>'+
					'<span>AMA:</span>'
				);
				break;
			case 'dmi':
				$('#sub-candel-text').html(
					'<span class="c_999">DMI(14,6)</span>'+
					'<span class="c_orange">PDI:</span>'+
					'<span class="c_pink">MDI:</span>'+
					'<span class="c_red">ADX:</span>'+
					'<span class="c_blue">ADXR:</span>'
				);
				break;
			case 'dmiql':
				$('#sub-candel-text').html(
					'<span class="c_999">DMI-QL(14,6)</span>'+
					'<span class="c_orange">PDI:</span>'+
					'<span class="c_pink">MDI:</span>'+
					'<span class="c_red">ADX:</span>'+
					'<span class="c_blue">ADXR:</span>'
				);
				break;
		}
	},200);
};
Window.showCandelMainInfo = function(params){
	var i,r;
	switch(candelMain){
		case 'ma':
			var ma5,ma10,ma20,ma30;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'ma5'){
					ma5 = params[i].data;
				}
				if(params[i].seriesName == 'ma10'){
					ma10 = params[i].data;
				}
				if(params[i].seriesName == 'ma20'){
					ma20 = params[i].data;
				}
				if(params[i].seriesName == 'ma30'){
					ma30 = params[i].data;
				}
			}
			$('#main-candel-text').html(
				'<span>MA5:'+parseFloat(ma5).toFixed(4)+'</span>'+
				'<span class="c_yellow">MA10:'+parseFloat(ma10).toFixed(4)+'</span>'+
				'<span class="c_violet">MA20:'+parseFloat(ma20).toFixed(4)+'</span>'+
				'<span class="c_green">MA30:'+parseFloat(ma30).toFixed(4)+'</span>'
			);
			break;
		case 'cfd':
			var buy,sell;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'buy'){
					buy = params[i].data;
				}
				if(params[i].seriesName == 'sell'){
					sell = params[i].data;
				}
			}
			$('#main-candel-text').html(
				'<span class="c_blue">BUY:'+parseFloat(buy).toFixed(4)+'</span>'+
				'<span class="c_red">SELL:'+parseFloat(sell).toFixed(4)+'</span>'
			);
			break;
		case 'boll':
			var mid,upper,lower;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'mid'){
					mid = params[i].data;
				}
				if(params[i].seriesName == 'upper'){
					upper = params[i].data;
				}
				if(params[i].seriesName == 'lower'){
					lower = params[i].data;
				}
			}
			$('#main-candel-text').html(
				'<span class="c_999">BOLL(26,2)</span>'+
				'<span class="c_pink">MID:'+parseFloat(mid).toFixed(4)+'</span>'+
				'<span class="c_orange">UPPER:'+parseFloat(upper).toFixed(4)+'</span>'+
				'<span class="c_blue">LOWER:'+parseFloat(lower).toFixed(4)+'</span>'
			);
			break;
		case 'ema':
			var EMA5,EMA10,EMA20,EMA60;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'EMA5'){
					EMA5 = params[i].data;
				}
				if(params[i].seriesName == 'EMA10'){
					EMA10 = params[i].data;
				}
				if(params[i].seriesName == 'EMA20'){
					EMA20 = params[i].data;
				}
				if(params[i].seriesName == 'EMA60'){
					EMA60 = params[i].data;
				}
			}
			$('#main-candel-text').html(
				'<span class="c_yellow">EMA5:'+parseFloat(EMA5).toFixed(4)+'</span>'+
				'<span class="c_blue">EMA10:'+parseFloat(EMA10).toFixed(4)+'</span>'+
				'<span class="c_pink">EMA20:'+parseFloat(EMA20).toFixed(4)+'</span>'+
				'<span class="c_red">EMA60:'+parseFloat(EMA60).toFixed(4)+'</span>'
			);
			break;
		case 'bbi':
			var bbi;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'BBI'){
					bbi = params[i].data;
				}
			}
			$('#main-candel-text').html(
					'<span class="c_999">BBI(3,6,12,24)</span>'+
					'<span class="c_orange">BBI:'+parseFloat(bbi).toFixed(4)+'</span>'
				);
			break;
	}
};
Window.showCandelSubInfo = function(params){
	var i,r;
	switch(candelSub){
		case 'vol':
			var VOLUME,vol1,vol2;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'VOLUME'){
					VOLUME = params[i].data;
				}
				if(params[i].seriesName == 'vol1'){
					vol1 = params[i].data;
				}
				if(params[i].seriesName == 'vol2'){
					vol2 = params[i].data;
				}
			}
			$('#sub-candel-text').html(
				'<span class="c_grey">VOL(5,10)</span>'+
				'<span>VOLUME:'+VOLUME+'</span>'+
				'<span>V1:'+parseFloat(vol1).toFixed(4)+'</span>'+
				'<span class="c_yellow">V2:'+parseFloat(vol2).toFixed(4)+'</span>'
			);
			break;
		case 'macd':
			var diff,dea,macd;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'diff'){
					diff = params[i].data;
				}
				if(params[i].seriesName == 'dea'){
					dea = params[i].data;
				}
				if(params[i].seriesName == 'macd'){
					macd = params[i].data;
				}
			}
			$('#sub-candel-text').html(
				'<span class="c_grey">MACD(12,6,9)</span>'+
				'<span>DIFF:'+parseFloat(diff).toFixed(4)+'</span>'+
				'<span class="c_yellow">DEA:'+parseFloat(dea).toFixed(4)+'</span>'+
				'<span class="c_grey">MACD:'+parseFloat(macd).toFixed(4)+'</span>'
			);
			break;
		case 'kdj':
			var k,d,j;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'k'){
					k = params[i].data;
				}
				if(params[i].seriesName == 'd'){
					d = params[i].data;
				}
				if(params[i].seriesName == 'j'){
					j = params[i].data;
				}
			}
			$('#sub-candel-text').html(
					'<span class="c_grey">KDJ(9,3,3)</span>'+
					'<span>K:'+parseFloat(k).toFixed(4)+'</span>'+
					'<span class="c_yellow">D:'+parseFloat(d).toFixed(4)+'</span>'+
					'<span class="c_violet">J:'+parseFloat(j).toFixed(4)+'</span>'
			);
			break;
		case 'dma':
			var DDD,AMA;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'ddd'){
					DDD = params[i].data;
				}
				if(params[i].seriesName == 'dddma'){
					AMA = params[i].data;
				}
			}
			$('#sub-candel-text').html(
				'<span class="c_999">DMA(10,50,10)</span>'+
				'<span class="c_yellow">DDD:'+parseFloat(DDD).toFixed(4)+'</span>'+
				'<span>AMA:'+parseFloat(AMA).toFixed(4)+'</span>'
			);
			break;
		case 'dmi':
			var PDI,MDI,ADX,ADXR;
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'PDI'){
					PDI = params[i].data;
				}
				if(params[i].seriesName == 'MDI'){
					MDI = params[i].data;
				}
				if(params[i].seriesName == 'ADX'){
					ADX = params[i].data;
				}
				if(params[i].seriesName == 'ADXR'){
					ADXR = params[i].data;
				}
			}
			$('#sub-candel-text').html(
				'<span class="c_999">DMI(14,6)</span>'+
				'<span class="c_orange">PDI:'+parseFloat(PDI).toFixed(4)+'</span>'+
				'<span class="c_pink">MDI:'+parseFloat(MDI).toFixed(4)+'</span>'+
				'<span class="c_red">ADX:'+parseFloat(ADX).toFixed(4)+'</span>'+
				'<span class="c_blue">ADXR:'+parseFloat(ADXR).toFixed(4)+'</span>'
			);
			break;
		case 'dmiql':
			for(i=0,r=params.length;i<r;i++){
				if(params[i].seriesName == 'PDI'){
					PDI = params[i].data;
				}
				if(params[i].seriesName == 'MDI'){
					MDI = params[i].data;
				}
				if(params[i].seriesName == 'ADX'){
					ADX = params[i].data;
				}
				if(params[i].seriesName == 'ADXR'){
					ADXR = params[i].data;
				}
			}
			$('#sub-candel-text').html(
				'<span class="c_999">DMI-QL(14,6)</span>'+
				'<span class="c_orange">PDI:'+parseFloat(PDI).toFixed(4)+'</span>'+
				'<span class="c_pink">MDI:'+parseFloat(MDI).toFixed(4)+'</span>'+
				'<span class="c_red">ADX:'+parseFloat(ADX).toFixed(4)+'</span>'+
				'<span class="c_blue">ADXR:'+parseFloat(ADXR).toFixed(4)+'</span>'
			);
			break;
	}
};
clearSubCandelSeries = function(){
	for(var i=5,r=Window.candelstickOption.series.length;i<r;i++){
		delete Window.candelstickOption.series[i];
	}
	Window.candelstickOption.xAxis[1].axisLine.onZero = false;
};
clearSubLineSeries = function(){
	for(var i=4,r=Window.linestickOption.series.length;i<r;i++){
		delete Window.linestickOption.series[i];
	}
	Window.linestickOption.xAxis[1].axisLine.onZero = false;
};
timestampCoverHms = function(_date,type){
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
};
colorVolList = function (dataArr){
	var list = [];
	for(var i=0,r=dataArr.length;i<r;i++){
		if (dataArr[i][1] >= dataArr[i][0]) {
			list.push('#ff0000');
		} else {
			list.push('#04b700');
		}
	}
	return list;
};
