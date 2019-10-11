import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, ToastController, ActionSheetController, AlertController } from 'ionic-angular';
import { AlertComponent } from '../../components/alert/alert';
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { SltpBlockPage } from '../sltp-block/sltp-block';
import { LoadingController } from 'ionic-angular';
import { TraderProvider } from "../../providers/trader/trader";
import { PositionDetailPage } from '../position-detail/position-detail';
import { TranslateService } from "@ngx-translate/core";
/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
/****/
declare var Window,indexLibrary,$;
/**
 * Generated class for the TraderContractPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-trader-contract',
	templateUrl: 'trader-contract.html',
})
export class TraderContractPage {
	@ViewChild(AlertComponent) child: AlertComponent;
	constructor(public translate:TranslateService, private alertCtrl: AlertController, public trader: TraderProvider,public loadingCtrl: LoadingController,public actionSheetCtrl: ActionSheetController, private socket:SocketServeProvider, public toastCtrl: ToastController,public http: HttpServeProvider,public viewCtrl: ViewController, public navCtrl: NavController, public params: NavParams,public modalCtrl: ModalController) {
		this.proId = params.get('id');
		this.basicContractData();
	}
	private loader:any;

	/* 买卖手数显示数量 */
	public traderBSnum:number;
	private Bond:number;
	public BondPrice:number;
	public displayBondPrice:number;
	private commodityId:string;

	/* 可平手数 */
	public canClosePosition: number = 0; 

	// 最小可交易手数
	public minOrderVol: number = 0;

	// 最小跳动价格
	private unionMinPrices:number;

	//合约类型
	public commodityType:number = -1;
	ionViewDidEnter() {
		const self = this;
		Window.nowProId = this.proId;
		for(let i=0,r=Window.allProductList.length;i<r;i++){
			if(Window.allProductList[i].productId == this.proId){
				this.commodityType = Window.allProductList[i].commodityType;
				this.commodityId = Window.allProductList[i].commodityId
				this.traderBSnum = Window.allProductList[i].priceGearsNum;
				this.minOrderVol = Window.allProductList[i].minOrderVol;
				this.marketPriceNum = Window.allProductList[i].minOrderVol;
				console.warn('[当前合约ID]', this.proId, Window.allProductList[i].minOrderVol);
			}
		}
		this.socket.rejuceProListMb2();
		this.socket.addSingleProListMb2(this.proId);
		this.socket.addPosition();
		this.socket.addPersonalGold();

		this.positionConnection = this.socket.getPositionTotal().subscribe(res => {
			let data = JSON.parse(res.toString());
			let arr = [];
			if(this.proId == data.productId){
				for(let i=0,r=data.content.length;i<r;i++){
					const tmpData = data.content[i].XXXXX.split('|');
					const tmpArr = {
						"commodityCode" : tmpData[0],
						"commodityId" : tmpData[1],
						"commodityName" : tmpData[2],
						"contractCode" : tmpData[3],
						"direct" : tmpData[4],
						"interest" : tmpData[5],
						"keepDeposit" : tmpData[6],
						"marketCode" : tmpData[7],
						"marketId" : tmpData[8],
						"positionPrice" : tmpData[9],
						"positionVolume" : tmpData[10],
						"productId" : tmpData[11],
						"toNewPrice" : tmpData[12],
						"tradeProfit" : tmpData[13],
						"userId" : tmpData[14],
						"userName" : tmpData[15]
					}
					arr.push(tmpArr);
				}
				if(JSON.stringify(this.publishPositionTotal) != JSON.stringify(arr)){
					this.publishPositionTotal = arr;
				}
			}
		});
		this.orderConnection = this.socket.getOrderBack().subscribe(res => {
			let data = JSON.parse(res.toString());
			console.warn(data.content.orderState);
			this.presentToast(this.translateText(this.orderStateText(data.content.orderState)),'toast-yellow');
			this.orderRequest();
			this.dismissLoading();
		});
		for(let i=0,r=this.productList.length;i<r;i++){
			if(this.productList[i].productId == this.proId){
				this.productName = this.productList[i].productName;
				this.productCode = this.productList[i].productCode;
				this.unionMinPrices = this.productList[i].unionMinPrices;
			}
		}
		/* 查询挂单 */
		this.orderRequest();
		/* 获取每手交易需要的保证金 */
		this.http.get("client/config/product/commodity/"+this.commodityId,function(res){
			if(res.code == '000000'){
				console.warn(JSON.parse(res.content));
				self.Bond = JSON.parse(res.content).depositNormal;
				self.BondPrice = self.Bond;
				self.displayBondPrice = self.toFixed(self.Bond*self.minOrderVol,6);
				console.warn(self.displayBondPrice,self.Bond,self.minOrderVol);
			}
		});
		/* 行情 */
		this.contractConnection = this.socket.getPriceMb2().subscribe(data => {
			if(data[0] == this.proId){
				this.contractData.QAskPrice = data[6];
				this.contractData.QAskQty = data[7];
				this.contractData.QBidPrice = data[4];
				this.contractData.QBidQty = data[5];
				this.contractData.DateTimeStamp = data[1];
				this.contractData.QLastPrice = Number(data[2]);
				this.contractData.QChangeValue = Number(data[23]);
				if(this.currentPriceCondition != 0) {
					this.limitPrice = Number(data[2]);
				}
				this.calcBS();
			}
		});
		$(document).on('blur','#partClose',() => {
			console.log('[失去焦点 - 获取参数]',$('#partClose').val(), this.minOrderVol);
			const val = this.trader.fixedTraderNum($('#partClose').val(), this.minOrderVol);
			if(!isNaN(val)) {
				$('#partClose').val(val);
				console.log('[计算后的参数]', val);
			}
		});
	}
	ionViewWillLeave() {
		this.socket.rejucePosition();
		if(this.contractConnection){
			this.contractConnection.unsubscribe();
		}
		if(this.orderConnection){
			this.orderConnection.unsubscribe();
		}
		if(this.positionConnection){
			this.positionConnection.unsubscribe();
		}
		this.socket.rejuceSingleProListMb2(this.proId);
		this.socket.rejucePersonalGold();
		Window.clearCaptial();
		$(document).off('blur','#partClose');
	}
	private proId:string;
	private positionConnection;
	private contractConnection;
	private orderConnection;
	public publishPositionTotal:any = [];
	public currentPriceCondition = 1;// 价格条件  0:限价 1:市价
	/* 所有交易合约列表 */
	public productList:Array<any> = Window.allProductList;
	public filterProductList:Array<any> = [];
	/* 交易模块代码 */
	public productName:string = '';
	public productCode:string = '';
	public id:string = '';
	/* 市价 变量 */
	private marketPriceNum:number = 1;

	/* 限价 变量 */
	private limitPrice:number;

	/* 交易提示 */
	public showTraderConfirm = false;
	public confirmPrice;
	public confirmHandel:number;
	public confirmBS:string;

	public currentOrderDirect;
	public orderType = 1;//0:自动 1:开仓 2:平仓
	public currentUserId;
	public currentTriggerPrice;
	public currentOrderPrice;
	public currentOrderVolume;
	public currentProductId;

	public viewPosition:boolean = true;
	public viewUntrader:boolean = true;

	private orderState = [
		{ "value": "0", "name": "指令失败"},
		{ "value": "1", "name": "已受理"},
		{ "value": "2", "name": "已挂起"},
		{ "value": "3", "name": "已排队"},
		{ "value": "4", "name": "待撤销"},
		{ "value": "5", "name": "待修改"},
		{ "value": "6", "name": "部分撤单"},
		{ "value": "7", "name": "完全撤单"},
		{ "value": "8", "name": "部分成交"},
		{ "value": "9", "name": "全成交"},
		{ "value": "10", "name": "部分成交还在队列中"},
		{ "value": "11", "name": "部分成交不在队列中"},
		{ "value": "12", "name": "未成交还在队列中"},
		{ "value": "13", "name": "未成交不在队列中"},
		{ "value": "14", "name": "撤单"},
		{ "value": "15", "name": "未知"},
		{ "value": "16", "name": "尚未触发"},
		{ "value": "17", "name": "已触发"}
	];
	private offsetState = [
		{ "value": "0", "name": "自动"},
		{ "value": "1", "name": "开仓"},
		{ "value": "2", "name": "平仓"},
		{ "value": "7", "name": "开平仓"}
	];
	/* 行情 */
	public contractData;
	public bP:number = 0;
	public sP:number = 0;


	/* 初始化行情 */
	basicContractData(){
		this.contractData = {
			"QAskPrice":[],
			"QAskQty":[],
			"QBidPrice":[],
			"QBidQty":[],
			"DateTimeStamp":'',
			"QLastPrice":0,
			"QChangeValue":0
		}
	}
	/* 下单 */
	traderMarket(type) {
		this.manualChangeNum();
		this.viewUntrader = false;
		this.viewPosition = false;

		this.currentOrderDirect = (type == 'b')?1:-1;//买卖方向（B为多单，S为空单，字符串类型）b 1:s -1
		this.currentUserId = Window.userInfo.userId;
		this.currentTriggerPrice = 0;//触发价格（传0）
		this.currentOrderPrice = (this.currentPriceCondition==0)?this.limitPrice:0;// 报单价格（限价单使用）
		this.currentOrderVolume = this.marketPriceNum;//委托数量，最大20手，最小1手
		this.currentProductId = this.proId;
		
		this.confirmPrice = (this.currentPriceCondition==0)?this.limitPrice:this.translateText('市价单');
		this.confirmHandel = this.marketPriceNum;
		this.confirmBS = this.translateText((this.currentOrderDirect == 1)?'买':'卖');
		/* 查询下平仓单时 该合约是否有设置了止盈止损的持仓 */
		if(this.orderType == 2){
			let body = {
				page: 1,
				rows: 25,
				order: 'desc',
				search_A_EQ_productId: this.proId
			}
			this.http.postForm('client/trade/position/query/as/page',body,(res) => {
				let data = JSON.parse(res.content).content;
				for(let i=0,r=data.length;i<r;i++){
					if(data[i].sl != 0 || data[i].tp != 0){
						this.presentConfirm();
						return;
					}
				}
				this.showTraderConfirm = true;
			});
		}
		else{
			this.showTraderConfirm = true;
		}
	}
	confirmTrader(){
		this.contractTrader(this.currentOrderDirect,this.currentOrderPrice,this.currentOrderVolume,this.currentPriceCondition,this.currentProductId,this.currentTriggerPrice,this.currentUserId);
		this.showTraderConfirm = false;
	}
	contractTrader(orderDirect,orderPrice,orderVolume,priceCondition,productId,triggerPrice,userId) {
			let body = {
				"orderFormVIce":{
					"offset":this.orderType,
					"productId":productId,
					"triggerPrice":triggerPrice,
					"priceCondition":priceCondition,
					"orderPrice":orderPrice,
					"orderDirect":orderDirect,
					"orderVolume":orderVolume,
					"userId":userId
				}
			};
			let self = this;
			/* 下单请求 */
			this.presentLoading();
			this.http.postJson("client/trade/order/create",body,function(data){
				if(data.code != '000000'){
					self.presentToast(data.message,'toast-red');
				}
				else{
					let content = JSON.parse(data.content);
					if(content.errorId == -1099){
						if(content.errorMsg == 1){
							self.presentToast(this.translateText('国际账号未开户'),'toast-red');
						}
						else if(content.errorMsg == 2){
							self.presentToast(this.translateText('国内账号未开户'),'toast-red');
						}
						return;
					}
					if(content.errorMsg){
						self.presentToast(content.errorMsg,'toast-red');
					}
				}
				self.viewUntrader = true;
				self.viewPosition = true;
			})
	}
	/* 更改交易手数 */
	private holdOnNum;
	changeMarketNum(num) {
		if(num == 0){
			if(this.marketPriceNum > this.minOrderVol){
				this.marketPriceNum = this.toFixed((this.marketPriceNum -= this.minOrderVol),6);
			}
		}
		else if(num == 1){
			this.marketPriceNum = this.toFixed((this.marketPriceNum += this.minOrderVol),6);
		}
		this.displayBondPrice = this.toFixed(this.Bond*this.marketPriceNum,6);
	}
	// 手动输入异常手数修正
	manualChangeNum() {
		this.marketPriceNum = this.trader.fixedTraderNum(this.marketPriceNum, this.minOrderVol);
		this.displayBondPrice = this.toFixed(this.Bond*this.marketPriceNum,6);
	}
	// 手动输入异常价格修正
	manualChangePrice() {
		this.limitPrice = this.trader.fixedTraderNum(this.limitPrice, this.unionMinPrices);
	}
	changeMarketNumPress(num){
		this.holdOnNum = setInterval(()=>{
			this.changeMarketNum(num);
		},50);
	}
	changeMarketNumEnd(){
		clearInterval(this.holdOnNum);
	}
	/* 更改价格 */
	private holdOnDang;
	changeDW(type){
		if(type == 0){
			if (this.limitPrice > this.unionMinPrices) {
				this.limitPrice = this.toFixed(this.limitPrice -= this.unionMinPrices, 6);
			}
		}
		else if(type == 1){
			this.limitPrice = this.toFixed(this.limitPrice += this.unionMinPrices, 6);
		}
	}
	changeDWpress(type){
		this.holdOnDang = setInterval(()=>{
			this.changeDW(type);
		},50);
	}
	changeDWtouchend(){
		clearInterval(this.holdOnDang);
	}
	private toFixed(num,s){
		var times = Math.pow(10,s);
		var des = (num*times+0.5).toString();
		let _des = parseInt(des,10)/times;
		return _des;
	}
	/* 计算买卖比例 */
	calcBS(){
		if(this.contractData.QAskQty.length > 0 && this.contractData.QBidQty.length > 0){
			let bTotal = +this.contractData.QBidQty[0];
			let sTotal = +this.contractData.QAskQty[0];
			let totle = bTotal+sTotal;
			this.bP = bTotal/(totle)*100;
			this.sP = sTotal/(totle)*100;
		}
	}
	/* 查询挂单 */
	public untraderList:Array<any> = [];
	public untraderTotalElements:number = 0;
	orderRequest():void {
		/* 委托查询数据 */
		let orderBody = {
			page:1,
			rows:99,
			order:'desc',
			sort:'createTime',
			search_IN_orderState:'[1,2,3,4,5,8,10,11,12,13,16,17]'
		};
		let self = this;
		this.http.postForm("client/trade/order/query/as/page",orderBody,function(data){
			if(data.code == '000000'){
				var res = JSON.parse(data.content);
				self.untraderList = res.content;
				self.untraderTotalElements = res.totalElements;
			}
		})
	}
	/* 撤单 */
	public removeUntraderInfo;
	removeUntraderActionSheet() {
		let actionSheet = this.actionSheetCtrl.create({
			title: this.translateText('委托单号')+': '+this.removeUntraderInfo.localOrderNo,
			buttons: [
				{
					text: this.translateText('撤单'),
					handler: () => {
						this.presentLoading();
						this.trader.removeUntrader(this.removeUntraderInfo.localOrderId);
					}
				},
				{
					text: this.translateText('关闭'),
					role: 'cancel',
					handler: () => {
						console.log('Cancel clicked');
					}
				}
			]
		});
		actionSheet.present();
	}
	dismiss() {
		this.viewCtrl.dismiss();
	}
	orderStateText(val){
		for(let i=0,r=this.orderState.length;i<r;i++){
			if(this.orderState[i].value == val){
				return this.orderState[i].name;
			}
		}
	}
	orderOffsetText(val){
		for(let i=0,r=this.offsetState.length;i<r;i++){
			if(this.offsetState[i].value == val){
				return this.offsetState[i].name;
			}
		}
	}
	presentToast(text,color = '') {
		let toast = this.toastCtrl.create({
			message: text,
			position: 'top',
			duration: 3000,
			showCloseButton: true,
			cssClass:color,
			closeButtonText: this.translateText('确定')
		});
		toast.present();
	}
	/* 持仓操作 */
	private choosePostionInfo;
	pushValue(v){
		this.choosePostionInfo = v;
		this.choosePostionInfo.orderDirect = this.choosePostionInfo.direct;
		this.choosePostionInfo.sl = 0;
		this.choosePostionInfo.tp = 0;
	}
	positionActionSheet() {
		let actionSheet = this.actionSheetCtrl.create({
			title: this.choosePostionInfo.commodityName+'('+this.choosePostionInfo.contractCode+')',
			buttons: [
				{
					text: this.translateText('设置止盈/止损'),
					handler: () => {
						this.presentModal(SltpBlockPage,{baseInfo:this.choosePostionInfo});
					}
				},
				{
					text: this.translateText('快捷反手'),
					handler: () => {
						this.presentLoading();
						this.trader.quicklyBackOrder(
							this.choosePostionInfo.positionVolume,
							this.choosePostionInfo.direct,
							this.choosePostionInfo.productId
						);
						console.log(this.choosePostionInfo);
					}
				},
				{
					text: this.translateText('快捷平仓'),
					handler: () => {
						this.presentLoading();
						this.trader.quicklyCloseContract(
							this.choosePostionInfo.positionVolume,
							this.choosePostionInfo.direct,
							this.choosePostionInfo.productId
						);
						console.log(this.choosePostionInfo);
					}
				},
				{
					text: this.translateText('部分平仓'),
					handler: () => {
						this.presentLoading();
						this.searchCanClose((e) => {
							this.dismissLoading();
							this.closeSomePosition(e);
						});
					}
				},
				{
					text: this.translateText('查看持仓明细'),
					handler: () => {
						this.presentModal(PositionDetailPage,{baseInfo:this.choosePostionInfo});
					}
				},
				{
					text: this.translateText('关闭'),
					role: 'cancel',
					handler: () => {
						console.log('Cancel clicked');
					}
				}
			]
		});
		actionSheet.present();
	}
		/**
	 * 查询可平仓手数
	 */
	searchCanClose(callback) {
		const body = {
			"orderFormVIce": {
				"userId": this.choosePostionInfo.userId,
				"productId": this.choosePostionInfo.productId,
				"positionId": "",
				"orderDirect": this.choosePostionInfo.orderDirect * -1,
				"priceCondition": 1,
				"offset": 2
			}
		}
		this.http.postJson("client/trade/order/get/canclose",body,(data) => {
			if(data.code == '000000'){
				this.canClosePosition = data.content;
				callback();
			}
		})
	}
	/**
	 * 部分平仓 弹出框  
	 */
	closeSomePosition(num) {
		const close = this.alertCtrl.create({
			title: this.choosePostionInfo.commodityName,
			message: `<p>可平仓手数:  ${this.canClosePosition}</p>
					<p>最小交易手数: ${this.minOrderVol}</p>`,
			inputs: [{
				id: 'partClose',
				placeholder: '请输入需要平仓的数量',
				type: 'text'
			}],
			buttons: [
				{
					role: 'cancel',
					text: '取消'
				},
				{
					text: '确定',
					handler: (data: any) => {
						if(Number($('#partClose').val()) > Number(this.canClosePosition)) {
							this.presentToast('平仓手数不可大于可平手数', 'toast-red');
							return;
						}
						this.presentLoading();
						const body = {
							"orderFormVIce": {
								"userId": this.choosePostionInfo.userId,
								"productId": this.choosePostionInfo.productId,
								"positionId": "",
								"orderDirect": this.choosePostionInfo.orderDirect * -1,
								"orderVolume": Number($('#partClose').val()),
								"priceCondition": 1,
								"triggerPrice": 0,
								"orderPrice": 0,
								"offset": 2
							}
						}
						console.log('[最终提交的参数]', body);
						this.http.postJson('client/trade/order/create',body,(data) => {
							this.dismissLoading();
						});
					}
				}
			]
		});
		close.present();
	}
	//翻译
	translateText(text){
		let result:any;
		this.translate.get(text).subscribe((res: string) => {
			result = res;
		});
		return result;
	}
	presentModal(page,json) {
		let modal = this.modalCtrl.create(page,json);
		modal.onDidDismiss(data => {
			this.publishPositionTotal = [];
		});
		modal.present();
	}
	presentLoading() {
		if(!this.loader){
			this.loader = this.loadingCtrl.create({
				content: this.translateText("请等待..."),
				showBackdrop: true,
				duration: 3000
			});
			this.loader.present();
		}
	}
	dismissLoading() {
		if(this.loader){
	        this.loader.dismiss();
	        this.loader = null;
	    }
	}
	presentConfirm() {
		let alert = this.alertCtrl.create({
			title: this.translateText('确认提示'),
			message: this.translateText('该合约已设止盈止损，平仓委托可能导致止盈止损失效'),
			buttons: [
				{
					text: this.translateText('取消'),
					role: 'cancel',
					handler: () => {
					//
					}
				},
				{
					text: this.translateText('确定'),
					handler: () => {
						this.showTraderConfirm = true;
					}
				}
			]
		});
		alert.present();
	}
}
