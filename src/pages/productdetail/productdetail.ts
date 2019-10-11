import { Component , ViewChild} from '@angular/core';
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { IonicPage, NavController, NavParams, ModalController, LoadingController, ToastController } from 'ionic-angular';
import { AlertComponent } from '../../components/alert/alert';
import { TraderContractPage } from '../trader-contract/trader-contract';
import { HomePage } from '../home/home';
import { SelfContactPage } from '../self-contact/self-contact';
import { CandelMaComponent } from '../../components/candel-ma/candel-ma';
import { LineMaComponent } from '../../components/line-ma/line-ma';

import { RealnamePage } from '../../pages/realname/realname';
import { OpenAccountPage } from '../../pages/open-account/open-account';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { Platform } from 'ionic-angular';
import { Slides,Navbar } from 'ionic-angular';
declare var $:any,Window,store,echarts,indexLibrary,echartsGraphic,window;

@Component({
	selector: 'page-productdetail',
	templateUrl: 'productdetail.html'
})
@IonicPage()
export class ProductdetailPage {
	@ViewChild(CandelMaComponent) candelMa:CandelMaComponent;

	@ViewChild(LineMaComponent) lineMa:LineMaComponent;

	@ViewChild(AlertComponent) child: AlertComponent;
	@ViewChild(Slides) slides: Slides;
	@ViewChild(Navbar) navBar: Navbar;

	private marginTop:any;
	private marginBottom:number;

	private registerBackEvent: Function;
	private loader:any;

	//判断平台是否支持native
	private supportNative:boolean = window.cordova?true:false;

	/* 监听屏幕变化 */
	private screenChange:any;
	private deviceOrientation:string;

	constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, public plt: Platform, private screenOrientation: ScreenOrientation, public http: HttpServeProvider, public modalCtrl: ModalController, public navCtrl: NavController, public navParams: NavParams, private socket:SocketServeProvider) {
		const self = this;
		Window.echartsDrawLinestype = '';
		Window.endEchartsDraw = function(){
			self.echartsDrawLinestype = '';
			Window.echartsDrawLinestype = '';
		}
		Window.canSwipe = function(bool){
			self.canSwipe(bool);
			self.closeCrossMode();
		}

		/* 获取zoom平移数据 */
		Window.zoomStartCandel = 90;
		Window.zoomEndCandel = 100;

		Window.zoomStartLine = 0;
		Window.zoomEndLine = 100;
	}
	public id:string = Window.nowProId;
	private unionMinPrices:number;
	//合约类型
	public commodityType:number = -1;

	private productList = [];
	/**
	 * tabStatus 状态
	 * 1:盘口 2:交易明细 3:分时 4:K线 
	 */
	public tabStatus:number = 3;

	/* 图表 */
	public chartsTime:number = 0;
	public isLoding:boolean = false;
	private connection;
	/* 买卖手数显示数量 */
	public traderBSnum:number;
	/* 获取是否完成 实名/开户 验证 */
	public userValidate:any = Window.userValidate;
	/* 保存进入前的列表 */
	public baseProductlist:any;

	private contractSubscribeList:Array<any> = [];


	backButtonClick = (e: UIEvent) => {
		if(Window.productdetailRecourse == 'HomePage'){
			this.navCtrl.setRoot(HomePage,{},{animate: true});
		}
		else if(Window.productdetailRecourse == 'SelfContactPage'){
			this.navCtrl.setRoot(SelfContactPage,{},{animate: true});
		}
	}
	ionViewWillEnter() {
		this.productList = Window.productList;
		// 时间监听指针
		window.self = this;
		console.log('[当前显示的自选合约列表]',this.productList)
		this.chartsTime = 0;
		this.id = Window.nowProId;
		for(let i=0,r=this.productList.length;i<r;i++){
			if(this.productList[i].productId == this.id){
				this.unionMinPrices = this.productList[i].unionMinPrices;
				this.commodityType = this.productList[i].commodityType;
				break;
			}
		}
		for(let i=0,r=Window.allProductList.length;i<r;i++){
			if(Window.allProductList[i].productId == this.id){
				this.traderBSnum = Window.allProductList[i].priceGearsNum;
			}
		}
		this.checkedSelfContract();
	}
	private tmpProductList:any;
	private tmpProductListClone:any;
	private tmpProductListCloning:boolean = false;
	private refreshDataTimeCaculate = false;
	private scrollContentH:number;
	getFirstData(isFirst = false) {
		let self = this;
		let body = {"symbol":this.id};
		this.http.postJson("trade/price/cur/quote/qry",body,function(data){
			let index:number;
			for(let i=0,r=Window.productList.length;i<r;i++){
				if(Window.productList[i].productId == self.id){
					index = i;
					self.currentIndex = i;
					Window.productList[i].QLastPrice = indexLibrary.formatFloat(data.quote.QLastPrice,6);
					Window.productList[i].QChangeRate = indexLibrary.formatFloat(data.quote.QChangeRate,3);
					Window.productList[i].QChangeValue = indexLibrary.formatFloat(data.quote.QChangeValue,3);
					Window.productList[i].QHighPrice = indexLibrary.formatFloat(data.quote.QHighPrice,6);
					Window.productList[i].QPreClosingPrice = indexLibrary.formatFloat(data.quote.QPreClosingPrice,6);
					Window.productList[i].QLowPrice = indexLibrary.formatFloat(data.quote.QLowPrice,6);
					Window.productList[i].QPositionQty = data.quote.QPositionQty;
					Window.productList[i].QOpeningPrice = indexLibrary.formatFloat(data.quote.QOpeningPrice,6);
					Window.productList[i].QAskQty = data.quote.QAskQty[0];
					Window.productList[i].QBidQty = data.quote.QBidQty[0];
					Window.productList[i].Stamp = data.quote.DateTimeStamp;

					Window.productList[i]._QAskPrice = [data.quote.QAskPrice[4].toFixed(2),+data.quote.QAskPrice[3].toFixed(2),+data.quote.QAskPrice[2].toFixed(2),+data.quote.QAskPrice[1].toFixed(2),+data.quote.QAskPrice[0].toFixed(2)];
					Window.productList[i]._QAskQty = [data.quote.QAskQty[4],data.quote.QAskQty[3],data.quote.QAskQty[2],data.quote.QAskQty[1],data.quote.QAskQty[0]];
					Window.productList[i]._QBidPrice = [+data.quote.QBidPrice[0].toFixed(2),+data.quote.QBidPrice[1].toFixed(2),+data.quote.QBidPrice[2].toFixed(2),+data.quote.QBidPrice[3].toFixed(2),+data.quote.QBidPrice[4].toFixed(2)];
					Window.productList[i]._QBidQty = [data.quote.QBidQty[0],data.quote.QBidQty[1],data.quote.QBidQty[2],data.quote.QBidQty[3],data.quote.QBidQty[4]];

					Window.productList[i].QAveragePrice = indexLibrary.formatFloat(data.quote.QAveragePrice,6);
					Window.productList[i].QPreSettlePrice = indexLibrary.formatFloat(data.quote.QPreSettlePrice,6);
					Window.productList[i].QLimitUpPrice = indexLibrary.formatFloat(data.quote.QLimitUpPrice,6);
					Window.productList[i].QLimitDownPrice = indexLibrary.formatFloat(data.quote.QLimitDownPrice,6);

					Window.productList[i].BidPriceClose = indexLibrary.formatFloat(data.quote.BidPriceClose,6);
					Window.productList[i].AskPriceClose = indexLibrary.formatFloat(data.quote.AskPriceClose,6);

					self.productName = Window.productList[i].productName;
					self.productCode = Window.productList[i].productCode;

					break;
				}
			}
			if(isFirst){
				setTimeout(()=>{
					self.slides.slideTo(index, 0);
					if(self.slides.getActiveIndex() == 0){
						self.slideChanged();
					}
				},30);
			}
			self.productList = Window.productList;
		});
	}
	ionViewDidEnter() {
		this.navBar.backButtonClick = this.backButtonClick;
		Window.currentSocket = '合约详情页';
		let self = this;
		this.socket.addSingleProListMb2Delay(this.id);
		/* 初始拉取产品数据 */
		this.getFirstData(true);
		this.scrollContentH = $('.product-detail-page > .scroll-content').height();
		this.getRealtimeData();
		//500毫秒同步一次数据
		Window.synchronization = setInterval(function(){
			self.productList = Window.productList;
		},500);
		if(this.supportNative){
			this.screenOrientation.lock('any');
		}
		
		this.marginTop = $('.product-detail-page > .scroll-content').css('margin-top');
		this.marginBottom = $('.product-detail-page > .scroll-content').css('margin-bottom');

		if(this.supportNative) {
			this.screenChange = this.screenOrientation.onChange().subscribe(()=>{
				if(this.tabStatus === 3 || this.tabStatus === 4){
					this.presentLoading();

					if(this.screenOrientation.type.indexOf('landscape') !== -1){
						this.isFullEcharts = true;
					}
					else{
						this.isFullEcharts = false;
					}
					this.slides.lockSwipes(this.isFullEcharts);
					Window.isFullEcharts = this.isFullEcharts;
					if(Window.isFullEcharts){
						console.log('[现在全屏]',self.screenOrientation);
						/* 全屏 */
						setTimeout(function(){
							$('.product-detail-page > .scroll-content').css({'height':'100%','margin-top':'0px','margin-bottom':'0px'});
							$('.product-detail-page > .scroll-content').removeClass('un-full');
							self.canSwipe(false);
							self.echartsSizeFresh();
							self.delayRefreshCharts();
							self.dismissLoading();
						},200);
					}
					else if(!Window.isFullEcharts){
						console.log('[现在竖屏]',self.screenOrientation);
						setTimeout(function(){
							$('.product-detail-page > .scroll-content').css({'height':'auto','margin-top':self.marginTop,'margin-bottom':self.marginBottom});
							$('.product-detail-page > .scroll-content').addClass('un-full');
							Window.zoomStartCandel = 90;
							Window.zoomEndCandel = 100;
							Window.zoomStartLine = 0;
							Window.zoomEndLine = 100;
							self.canSwipe(true);
							self.clearEchartsDraw('all');
							self.echartsSizeFresh();
							self.delayRefreshCharts();
							self.dismissLoading();
						},200);
					}
				}
			});
		}
		else {
			window.addEventListener("orientationchange", this.browser ,false);
		}
	}
	ionViewWillLeave(){
		this.socket.destoryAll();
		this.connection.unsubscribe();
		this.historyTraderList = [];
		if(this.supportNative){
			this.screenOrientation.lock('portrait');
		}
		if(this.screenChange){
			this.screenChange.unsubscribe();
		}
		else {
			window.removeEventListener('orientationchange', this.browser ,false);
		}
		delete window.self;
		clearInterval(Window.synchronization);
	}
	// 浏览器旋转屏幕处理
	browser = function() {
		const self = window.self;
		if(self.tabStatus === 3 || self.tabStatus === 4){
			self.presentLoading();
			if(window.orientation === -90 || window.orientation === 90){
				self.isFullEcharts = true;
			}
			else{
				self.isFullEcharts = false;
			}
			self.slides.lockSwipes(self.isFullEcharts);
			Window.isFullEcharts = self.isFullEcharts;
			if(Window.isFullEcharts){
				/* 全屏 */
				setTimeout(() => {
					$('.product-detail-page > .scroll-content').css({'height':'100%','margin-top':'0px','margin-bottom':'0px'});
					$('.product-detail-page > .scroll-content').removeClass('un-full');
					self.canSwipe(false);
					self.echartsSizeFresh();
					self.delayRefreshCharts();
					self.dismissLoading();
				},200);
			}
			else if(!Window.isFullEcharts){
				setTimeout(() => {
					$('.product-detail-page > .scroll-content').css({'height':'auto','margin-top':self.marginTop,'margin-bottom':self.marginBottom});
					$('.product-detail-page > .scroll-content').addClass('un-full');
					Window.zoomStartCandel = 90;
					Window.zoomEndCandel = 100;
					Window.zoomStartLine = 0;
					Window.zoomEndLine = 100;
					self.canSwipe(true);
					self.clearEchartsDraw('all');
					self.echartsSizeFresh();
					self.delayRefreshCharts();
					self.dismissLoading();
				},200);
			}
		}
	}
	//获取实时行情
	getRealtimeData() {
		this.connection = this.socket.getPriceMb2().subscribe(res => {
			const data = JSON.parse(JSON.stringify(res));
			// console.warn(data);
			if(this.tmpProductListCloning){
				return;
			}
			if(data[0] === this.id){
				if(!Window.productList[this.currentIndex]){
					return;
				}
				let tmpProduct = Window.productList[this.currentIndex];
				tmpProduct.QLastPrice = Number(data[2]);
				tmpProduct.QChangeRate = Number(data[22]);
				tmpProduct.QChangeValue =  Number(data[23]);
				tmpProduct.QAveragePrice =  Number(data[21]);
				tmpProduct.QHighPrice = Number(data[12]);
				tmpProduct.QPreClosingPrice = Number(data[8]);
				tmpProduct.QLowPrice = Number(data[13]);
				tmpProduct.QPositionQty = Number(data[20]);
				tmpProduct.QOpeningPrice = Number(data[11]);
				tmpProduct.QAskQty = Number(data[7][0]);
				tmpProduct.QBidQty = Number(data[5][0]);
				tmpProduct.QTotalQty = Number(data[18]);
				tmpProduct.Stamp = Number(data[48]);
				tmpProduct.DateTimeStamp = data[1];
				tmpProduct.DayLineStamp = Number(data[49]);
				tmpProduct.QLastQty = Number(data[3]);

				tmpProduct._QAskPrice = [+data[6][4],+data[6][3],+data[6][2],+data[6][1],+data[6][0]];
				tmpProduct._QAskQty = [+data[7][4],+data[7][3],+data[7][2],+data[7][1],+data[7][0]];
				tmpProduct._QBidPrice = [+data[4][0],+data[4][1],+data[4][2],+data[4][3],+data[4][4]];
				tmpProduct._QBidQty = [+data[5][0],+data[5][1],+data[5][2],+data[5][3],+data[5][4]];
				tmpProduct.SignType = Number(data[29]);
				tmpProduct.SignPriceOpen = Number(data[31]);
				tmpProduct.SignPriceClose = Number(data[34]);
				tmpProduct.SignPriceMin = Number(data[33]);
				tmpProduct.SignPriceMax = Number(data[32]);
				tmpProduct.SignQty = Number(data[39]);

				tmpProduct.BidPriceClose = Number(data[4][0]);
				tmpProduct.AskPriceClose = Number(data[6][0]);

				if(this.tabStatus === 3 || this.tabStatus === 4){
					this.regreshEcharts();
				}
				if(this.historyTraderList.length > 16 && this.tabStatus === 2){
					if(tmpProduct.QLastQty > 0 && tmpProduct.SignType == 0){
						this.historyTraderList.pop();
						this.historyTraderList.unshift({"DataTimeStamp":tmpProduct.DateTimeStamp.substr(11,12),"QLastPrice":tmpProduct.QLastPrice,"QLastQty":tmpProduct.QLastQty});
					}
				}
				Window.productList[this.currentIndex] = tmpProduct;
			}
		});
	}
	//切换行情订阅延迟
	changeSubscribe(type:number){
		// console.log(type,this.tabStatus);
		if(type === this.tabStatus){
			return;
		}
		this.tabStatus = type;
		if(this.tabStatus === 3 || this.tabStatus === 4) {
			if(this.supportNative){
				this.screenOrientation.lock('any');
			}
		}
		else {
			if(this.supportNative){
				this.screenOrientation.lock('portrait');
			}
		}
		if(this.tabStatus === 2){
			this.socket.rejuceSingleProListMb2Delay(this.id);
			this.socket.addSingleProListMb2(this.id);
			this.getHistoryTrader();
			return;
		}
		else if(this.tabStatus === 3){
			this.changeChartTime(0,0);
			
		}
		else if(this.tabStatus === 4){
			this.changeChartTime(1,1);
		}
		this.socket.rejuceSingleProListMb2(this.id);
		this.socket.addSingleProListMb2Delay(this.id);

	}
	//刷新图表
	regreshEcharts() {
		/* 图表共享数据 */
		if(this.chartsTime == 0 && this.lineMa){
			/* 分时 */
			this.lineMa.updateChart(Window.productList[this.currentIndex]);
		}
		if(this.chartsTime > 0 && this.candelMa){
			/* 蜡烛 */
			this.candelMa.updateChart(Window.productList[this.currentIndex]);
		}
		/* 源历史数据更新 */
		if(this.candelTime == undefined || this.candelTime == 0){
			this.candelTime = 1;
		}
		if(this.productList[this.currentIndex].SignType == this.candelTime){
			this.tmpProductListCloning = true;
			this.tmpProductList = JSON.stringify(this.productList[this.currentIndex]);
			this.tmpProductListClone = JSON.parse(this.tmpProductList);
			if(this.chartsTime != 0){
				if(JSON.stringify(this.candelHistoryData) != '[]' && this.candelHistoryData != undefined){
					this.candelHistoryData.push(this.tmpProductListClone);
					this.candelUpdateHistory(this.tmpProductListClone);
				}
			}
			else{
				if(JSON.stringify(this.lineHistoryData) != '[]' && this.lineHistoryData != undefined){
					this.lineHistoryData.push(this.tmpProductListClone);
					this.lineUpdateHistory(this.tmpProductListClone);
				}
			}
			setTimeout(()=>{
				this.tmpProductListCloning = false;
			},30);
		}
	}
	/* 当前画线类型 */
	public echartsDrawLinestype:string = '';
	public DrawLinesCanNotMove:boolean = false;
	echartsDrawLinestypeChange(type) {
		echartsGraphic.data = [];
		let bool;
		if(this.echartsDrawLinestype != type){
			this.echartsDrawLinestype = type;
			bool = true;
		}
		else{
			this.echartsDrawLinestype = '';
			echartsGraphic.clearLine();
			bool = false;
		}
		this.canSwipe(bool);
		Window.echartsDrawLinestype = this.echartsDrawLinestype;
	}
	clearEchartsDraw (type){
		if(type == 'back'){
			echartsGraphic.del();
		}
		else{
			echartsGraphic.delAll();
		}
	}
	changeDrawLinesCanMove(){
		this.DrawLinesCanNotMove = !this.DrawLinesCanNotMove;
		this.canSwipe(this.DrawLinesCanNotMove);
	}
	/* 交易明细 */
	public historyTraderList:Array<any> = [];
	getHistoryTrader() {
		let self = this;
		this.historyTraderList = [];
		this.http.postJson('trade/price/cur/quote/detail/qry',{symbol:this.id,count:18},function(data){
			for(let i=0,r=data.list.length;i<r;i++){
				let result = JSON.parse(data.list[i]);
				result.DataTimeStamp = result.DataTimeStamp.substr(11,12);
				self.historyTraderList.push(result);
			}
		});
	}
	/* 产品更换 */
	public productName:string = '';
	public productCode:string = '';
	public currentIndex:number = 0;

	slideChanged(){
		let nowIndex = this.slides.getActiveIndex();
		if(!this.productList[nowIndex]){
			return;
		}
		this.currentIndex = nowIndex;
		this.id = this.productList[this.currentIndex].productId;
		for(let i=0,r=Window.allProductList.length;i<r;i++){
			if(Window.allProductList[i].productId == this.id){
				this.traderBSnum = Window.allProductList[i].priceGearsNum;
			}
		}
		Window.nowProId = this.id;
		this.socket.destoryAll();
		this.socket.addSingleProListMb2Delay(this.id);
		this.productName = this.productList[this.currentIndex].productName;
		this.productCode = this.productList[this.currentIndex].productCode;
		this.isJoinSelfContract = false;
		//判断当前显示的图表
		if(this.chartsTime == 0){
			this.changeChartTime(0,1);
		}
		else{
			this.selectTimeChooseFun(false);
		}
		this.checkedSelfContract();
		if(this.tabStatus === 2){
			this.getHistoryTrader();
		}
		this.getFirstData();
		setTimeout(()=>{
			this.echartsSizeFresh();
			Window.lineSubFun(this.subLine);
		},1500);
	}
	/* 图表设置 */
	operationType:number = 0;
	/* 当前生效指标 */
	//蜡烛
	private subCandel = 'vol';
	private mainCandel = 'ma';
	//分时
	private subLine = 'vol';
	/* 解决离开屏幕时无法触发结束CROSS事件的BUG */
	private fixedCancelCrossBug(){
		this.isCross = false;
		this.changeCrossMode(this.isCross);
		this.closeEchartsHandels(false);
	}
	/* 指标切换 */
	changeIndex(value,type):void {
		this.fixedCancelCrossBug();
		let self = this;
		if(type == 1){
			this.mainCandel = value;
			/* 主指标输出 */
			Window.showCandelMainInfo(this.mainCandel);
			Window.candelMainFun(this.mainCandel);
		}
		else if(type == 2){
			if(this.subCandel == value){
				return;
			}
			this.subCandel = value;
			Window.candelSubFun(this.subCandel);
		}
		else if(type == 3){
			if(this.subLine == value){
				return;
			}
			this.subLine = value;
			Window.linestickOption.dataZoom[0].start = Window.zoomStartLine;
			Window.linestickOption.dataZoom[0].end = Window.zoomEndLine;
			Window.linestickOption.dataZoom[1].start = Window.zoomStartLine;
			Window.linestickOption.dataZoom[1].end = Window.zoomEndLine;
			this.lineOutPutHistory();
			Window.lineSubFun(value);
		}
		if(type == 1 || type == 2){
			Window.initEcharts(self.candelHistoryData,self.candelTime);
			this.candelOutPutHistory();
			this.candelOutPutHistory();
		}
	}
	/* K线历史数据 */
	private candelHistoryData:any;
	private candelTime:number;
	/* 分时历史数据 */
	private lineHistoryData;
	lineOutPutHistory(){
		switch (this.subLine) {
			case "vol":
				Window.echartsIndex.lineVol.loadHistory(this.lineHistoryData);
				break;
			case 'macd':
				Window.echartsIndex.lineMacd.loadHistory(this.lineHistoryData);
				break;
		}
	}
	lineUpdateHistory(data){
		switch (this.subLine) {
			case "vol":
				Window.echartsIndex.lineVol.updateData(data);
				break;
			case "macd":
				Window.echartsIndex.lineMacd.updateData(data);
				break;
		}
	}
	/* K线时间选择 */
	public selectTimeChoose:number = 1;
	selectTimeChooseFun(option = true){
		console.log(this.selectTimeChoose);
		switch (Number(this.selectTimeChoose)) {
			case 1:
				this.changeChartTime(1,1,option);
				break;
			case 2:
				this.changeChartTime(2,5,option);
				break;
			case 3:
				this.changeChartTime(3,30,option);
				break;
			case 4:
				this.changeChartTime(4,60,option);
				break;
			case 5:
				this.changeChartTime(5,1440,option);
				break;
		}
	}

	/*图表时间切换 */
	changeChartTime(num,time,isclick=false) {
		let self = this;
		if(this.tabStatus == 3 || this.tabStatus == 4){
			this.fixedCancelCrossBug();
			/* 获取zoom平移数据 */
			Window.zoomStartCandel = 90;
			Window.zoomEndCandel = 100;
			Window.echartsDrawLinestype = this.echartsDrawLinestype = '';
			if(this.chartsTime == num && isclick){
				return;
			}
			this.isLoding = true;
			this.chartsTime = num;
			
			let symbol = this.id;

			/* 蜡烛图 */
			if(num != 0){
				Window.candelMainFun(this.mainCandel);
				Window.candelSubFun(this.subCandel);
				self.candelTime = time;
				let body = {symbol:symbol,unit:time,count:500,endStamp:0};
				/* 获取历史行情 */
				this.http.postJson("client/price/candle",body,function(res){
					if(res.code === 0){
						const tmp_arr = res.content.list.reverse();
						self.candelHistoryData = tmp_arr;
						
						if(self.candelMa){
							/* 主指标输出 */
							self.candelMa.historyDraw(self.candelHistoryData,time);
							/* 副指标输出 */
							self.candelOutPutHistory();
							setTimeout(()=>{
								self.changeCrossMode(self.isCross);
								self.unlockEchartsHandels(self.isLockedSwipe);
								changeFullCurrent();
							},100);
						}
						self.isLoding = false;
					}
				});
			}
			/* 分时图 */
			else{
				Window.lineSubFun(this.subLine);
				let body = {symbol:symbol,unit:1,startStamp:0,endStamp:0};
				/* 获取历史行情 */
				this.http.postJson("client/price/time",body,function(res){
					if(res.code === 0){
						const tmp_arr = res.content.list;
						self.lineHistoryData = tmp_arr;
						
						if(self.lineMa){
							/* 主指标输出 */
							self.lineMa.historyDraw(self.lineHistoryData);
							/* 副指标输出 */
							self.lineOutPutHistory();
							// if(window.orientation === 90 || window.orientation === -90){
							// 	Window.orientationchangeHandel();
							// }
							setTimeout(()=>{
								self.changeCrossMode(self.isCross);
								self.unlockEchartsHandels(self.isLockedSwipe);
								changeFullCurrent();
							},100);
						}
						self.isLoding = false;
					}
				});
			}
		}
		function changeFullCurrent(){
			if(self.isFullEcharts){
				self.DrawLinesCanNotMove = true;
				self.changeDrawLinesCanMove();
			}
		}
	}

	/* 检测是否已自选 */
	public isJoinSelfContract:boolean = false;
	checkedSelfContract(){
		let selfContractList = store.get(Window.userInfo.userId);
		if(selfContractList){
			let data = JSON.parse(selfContractList);
			for(let i=0,r=data.length;i<r;i++){
				if(data[i] == this.id){
					this.isJoinSelfContract = true;
					break;
				}
			}
		}
	}
	/* 加入自选 */
	joinSelfContract(){
		let selfContractList = store.get(Window.userInfo.userId);
		if(!selfContractList){
			store.set(Window.userInfo.userId,'["'+this.id+'"]');
			this.isJoinSelfContract = true;
		}
		else{
			let data = JSON.parse(selfContractList);
			if(this.isJoinSelfContract){
				for(let i=0,r=data.length;i<r;i++){
					if(data[i] == this.id){
						data.splice(i,1);
					}
				}
				this.isJoinSelfContract = false;
			}
			else{
				data.push(this.id);
				this.isJoinSelfContract = true;
			}
			store.set(Window.userInfo.userId,JSON.stringify(data));
		}
	}
	presentModal() {
		let modal;
		if(Window.userInfo.userState != -2){
			if(this.supportNative){
				this.screenOrientation.lock('portrait');
			}
			this.connection.unsubscribe();
			console.log('[当前交易合约类型]',this.commodityType);
			/**
			 * commodityType 
			 * 0:期货 1:连续 2:股配 3:股权期货 4:差价 5:股票
			 */
			// if(this.commodityType === 2){
				// 股配交易模板
				
			// }
			// else {
				// 普通交易模板
				modal = this.modalCtrl.create(TraderContractPage,{'id':this.id});
				modal.onDidDismiss(data => {
					if(this.tabStatus === 3 || this.tabStatus === 4){
						if(this.supportNative){
							this.screenOrientation.lock('any');
						}
					} else {
						if(this.supportNative){
							this.screenOrientation.lock('portrait');
						}
					}
					this.socket.addSingleProListMb2Delay(this.id);
					Window.nowProId = this.id;
					this.getRealtimeData();
				});
			// }
		}
		else{
			this.presentToast('请先开户','toast-red');
			modal = this.modalCtrl.create(OpenAccountPage,{});
			modal.onDidDismiss();
		}
		modal.present();
	}
	public bP:number = 0;
	public sP:number = 0;
	/* 计算买卖比例 */
	calcBS(){
		if(this.productList[this.currentIndex]._QAskQty.length > 0 && this.productList[this.currentIndex]._QBidQty.length > 0){
			let bTotal = indexLibrary.sum(this.productList[this.currentIndex]._QAskQty);
			let sTotal = indexLibrary.sum(this.productList[this.currentIndex]._QBidQty);
			let totle = bTotal+sTotal;
			this.bP = bTotal/(totle)*100;
			this.sP = sTotal/(totle)*100;
		}
	}
	/* 图表全屏 */
	public isFullEcharts:boolean = false;
	public changeLoading:boolean = false;
	public currentContract:number;

	/* 图表延迟刷新 */
	private delayRefreshChartsTime:number = 10;
	delayRefreshCharts(during:boolean = false) {
		if(this.delayRefreshChartsTime === 10 || during === true){
			setTimeout(()=>{
				if(this.delayRefreshChartsTime > 0){
					console.log(this.delayRefreshChartsTime);
					this.echartsSizeFresh();
					this.delayRefreshChartsTime --;
					this.delayRefreshCharts(true);
				}
				else{
					this.delayRefreshChartsTime = 10;
				}
			},100);
		}
		else{
			this.delayRefreshChartsTime = 10;
		}
	}
	/* 计算信息框位置 */
	calcInfoPosition(event){
		let chartsColumnWidth = $('#charts-column .chart_con').width()/2;
		if(event.center.x > chartsColumnWidth){
			if(this.chartsTime == 0){
				this.lineMa.infoPosition = 'left';
			}
			else{
				this.candelMa.infoPosition = 'left';
			}
		}
		else{
			if(this.chartsTime == 0){
				this.lineMa.infoPosition = 'right';
			}
			else{
				this.candelMa.infoPosition = 'right';
			}
		}
	}
	/* 开启/关闭 移动缩放 */
	public isLockedSwipe:boolean = true;
	canSwipe(bool){
		this.isLockedSwipe = bool;
		this.unlockEchartsHandels(this.isLockedSwipe);
		this.closeCrossMode();
	}
	/* 关闭手势 */
	public closeEchartsHandels(bool){
		if(echartsGraphic.isChoosePoint){
			return;
		}
		if(this.DrawLinesCanNotMove){
			bool = true;
		}
		if(this.isFullEcharts){
			this.isLockedSwipe = bool;
			this.unlockEchartsHandels(this.isLockedSwipe);
		}
	}
	/* 解锁图表手势 */
	unlockEchartsHandels(boolean){
		if(this.chartsTime == 0){
			/* 分时 */
			Window.line_ma.setOption({
				dataZoom:[
					{
						disabled:boolean
					},
					{
						disabled:boolean
					}
				]
			});
		}
		else{
			/* 蜡烛 */
			Window.candel_ma.setOption({
				dataZoom:[
					{
						disabled:boolean
					},
					{
						disabled:boolean
					}
				]
			});
		}
	}
	/* 切换图表十字坐标和缩放模式 */
	private isCross = false;
	/* 关闭十字坐标和缩放 */
	public closeCrossMode(){
		this.isCross = false;
		this.changeCrossMode(false);
	}
	changeCrossMode(boolean) {
		if(echartsGraphic.isChoosePoint){
			this.isCross = false;
			return;
		}
		/* 开启画线模式时，不支持辅助坐标 */
		if(this.echartsDrawLinestype != ''){
			return;
		}
		if(!this.isFullEcharts){
			this.slides.lockSwipes(boolean);
		}
		this.isCross = boolean;

		if(this.chartsTime == 0 && this.lineMa){
			/* 分时 */
			this.lineMa.changeCorss(this.isCross);
		}
		else if(this.chartsTime > 0 && this.candelMa){
			/* 蜡烛 */
			this.candelMa.changeCorss(this.isCross);
		}
		let self = this;
		setTimeout(()=>{
			self.echartsSizeFresh();
		},50);
	}
	/* 图表刷新 */
	echartsSizeFresh(){
		if(this.chartsTime == 0){
			if(this.lineMa)
			this.lineMa.resizeChart();
		}
		else{
			if(this.candelMa)
			this.candelMa.resizeChart();
		}
	}
	/* 根据当前指标 输出历史行情 */
	candelOutPutHistory(){
		switch (this.mainCandel) {
			case "ma":
				Window.echartsIndex.candelMa.loadHistory(this.candelHistoryData);
				break;
			case "cfd":
				Window.echartsIndex.candelCfd.loadHistory(this.candelHistoryData);
				break;
			case 'boll':
				Window.echartsIndex.candelBoll.loadHistory(this.candelHistoryData);
				break;
			case 'ema':
				Window.echartsIndex.candelEma.loadHistory(this.candelHistoryData);
				break;
			case 'bbi':
				Window.echartsIndex.candelBbi.loadHistory(this.candelHistoryData);
				break;
		}
		switch (this.subCandel) {
			case "vol":
				Window.echartsIndex.candelVol.loadHistory(this.candelHistoryData);
				break;
			case "macd":
				Window.echartsIndex.candelMacd.loadHistory(this.candelHistoryData);
				break;
			case "kdj":
				Window.echartsIndex.candelKdj.loadHistory(this.candelHistoryData);
				break;
			case "dma":
				Window.echartsIndex.candelDma.loadHistory(this.candelHistoryData);
				break;
			case "dmi":
				Window.echartsIndex.candelDmi.loadHistory(this.candelHistoryData);
				break;
			case "dmiql":
				Window.echartsIndex.candelDmiQl.loadHistory(this.candelHistoryData);
				break;
		}
	}
	/* 根据当前指标 更新指标 */
	candelUpdateHistory(data){
		switch (this.mainCandel) {
			case "ma":
				Window.echartsIndex.candelMa.updateData(this.productList[this.currentIndex]);
				break;
			case "cfd":
				Window.echartsIndex.candelCfd.updateData(this.productList[this.currentIndex]);
				break;
			case "boll":
				Window.echartsIndex.candelBoll.updateData(this.productList[this.currentIndex]);
				break;
			case "ema":
				Window.echartsIndex.candelEma.updateData(this.productList[this.currentIndex]);
				break;
			case 'bbi':
				Window.echartsIndex.candelBbi.updateData(this.productList[this.currentIndex]);
				break;
		}
		switch (this.subCandel) {
			case "vol":
				Window.echartsIndex.candelVol.updateData(this.productList[this.currentIndex]);
				break;
			case "macd":
				Window.echartsIndex.candelMacd.updateData(this.productList[this.currentIndex]);
				break;
			case "kdj":
				Window.echartsIndex.candelKdj.updateData(this.productList[this.currentIndex]);
				break;
			case "dma":
				Window.echartsIndex.candelDma.updateData(this.productList[this.currentIndex]);
				break;
			case "dmi":
				Window.echartsIndex.candelDmi.updateData(this.productList[this.currentIndex]);
				break;
			case "dmiql":
				Window.echartsIndex.candelDmiQl.updateData(this.productList[this.currentIndex]);
				break;
		}
	}
	presentLoading() {
		this.loader = this.loadingCtrl.create({
			content: "正在缩放图表...",
			showBackdrop: true,
			duration: 2000,
			cssClass: "op85Loading"
		});
		this.loader.present();
	}
	dismissLoading() {
		this.loader.dismiss();
	}
	presentToast(text,color) {
		let toast = this.toastCtrl.create({
			message: text,
			position: 'top',
			duration: 3000,
			showCloseButton: true,
			cssClass:color,
			closeButtonText: '确定'
		});
		toast.present();
	}
}
