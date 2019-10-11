import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ModalController, ToastController  } from 'ionic-angular';
import { AlertComponent } from '../../components/alert/alert';
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { TraderProvider } from "../../providers/trader/trader";
import { PositionDetailPage } from '../position-detail/position-detail';
import { SltpBlockPage } from '../sltp-block/sltp-block';
import { LoadingController, AlertController } from 'ionic-angular';
import { TraderContractPage } from '../trader-contract/trader-contract';
import { OpenAccountPage } from '../../pages/open-account/open-account';
import { TranslateService } from "@ngx-translate/core";

/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
/****/
declare var store,Window,$;

@IonicPage()
@Component({
  selector: 'page-datareport',
  templateUrl: 'datareport.html'
})
export class DatareportPage {
	@ViewChild(AlertComponent) child: AlertComponent;
	constructor(public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController,public modalCtrl: ModalController,public actionSheetCtrl: ActionSheetController,public navCtrl: NavController, public navParams: NavParams, private socket:SocketServeProvider,public http: HttpServeProvider,public trader: TraderProvider,public translate:TranslateService) {
		
	}
	/* 获取是否完成 实名/开户 验证 */
	public userInfo:any = Window.userInfo;

	private selectTabs = 1;
	private publishPositionTotal:Array<any> = [];
	private currencyJson = Window.currencyJson;
	private positionConnection;
	private orderConnection;

	/* 委托页数 显示条数 */
	private orderPage = 1;
	private orderRows = 10;
	private orderTotal:number = 0;
	private orderList = [];

	/* 成交页数 显示条数 */
	private traderPage = 1;
	private traderRows = 10;
	private traderTotal:number = 0;
	private traderList = [];

	/* 持仓合计 委托挂单 */
	public positionOrputUp:string = 'position';
	/* 查询挂单 */
	public untraderList:Array<any> = [];

	/* 所有交易合约列表 */
	public productList:Array<any> = Window.allProductList;
	public filterProductList:Array<any> = [];
	/* 交易模块代码 */
	public productName:string = '';
	public id:string = '';

	/* 合约定位 */
	public filterText:string = '';

	public loader: any;
	private nowProId:string = '';


	/* 可平手数 */
	public canClosePosition: number = 0; 
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
	
	router(routername){
		if(routername == 'openAccount'){
			this.presentModal(OpenAccountPage,{});
		}
	}
	/* 订阅 所持仓的合约 */
	private subscribePositionTotal:Array<any> = [];
	ionViewDidEnter() {
		let self = this;
		Window.currentSocket = '报表页';
		this.socket.addPosition();
		this.socket.addPersonalGold();
		/* 持仓合计数据 */
		this.positionConnection = this.socket.getPositionTotal().subscribe(res => {
			let data = JSON.parse(res.toString());
			if(this.publishPositionTotal.length == 0){
				this.publishPositionTotal.push(this.stringChangeArray(data));
			}
			else{
				let hasPro = false;
				for(let i=0,r=this.publishPositionTotal.length;i<r;i++){
					if(this.publishPositionTotal[i].productId == data.productId){
						this.publishPositionTotal[i] = this.stringChangeArray(data);
						hasPro = true;
						break;
					}
				}
				if(!hasPro){
					this.publishPositionTotal.push(this.stringChangeArray(data));
				}
			}
		});
		/* 委托推送 */
		this.orderConnection = this.socket.getOrderBack().subscribe(res => {
			let data = JSON.parse(res.toString());
			this.child.alertMsg(this.orderStateText(data.content.orderState));
			this.untraderorderRequest();
		});
		this.untraderorderRequest();
		$(document).on('blur','#partClose',() => {
			const val = this.trader.fixedTraderNum($('#partClose').val(), this.choosePostionInfo.minOrderVol);
			$('#partClose').val(val);
		});
	}
	/* 格式化字符串转数组 */
	stringChangeArray(arr){
		let _arr = arr.content;
		for(let i=0,r=_arr.length;i<r;i++){
			_arr[i] = _arr[i].XXXXX.split('|');
		}
		return arr;
	}
	ionViewWillLeave() {
		if(this.positionConnection){
			this.positionConnection.unsubscribe();
		}
		if(this.orderConnection){
			this.orderConnection.unsubscribe();
		}
		this.publishPositionTotal = [];
		this.socket.rejucePosition();
		this.socket.rejucePositionProList();
		this.socket.rejucePersonalGold();
		$(document).off('blur','#partClose');
	}
	tabMenu(num) {
		if(this.selectTabs == num) return;
		this.selectTabs = num;
		if(this.infiniteScroll){
			this.infiniteScroll.enable(true);
		}
		if(num == 4){
			if(this.orderTotal == 0){
				this.orderRequest();
			}
		}
		else if(num == 5){
			if(this.traderTotal == 0){
				this.traderRequest();
			}
		}
	}
	doRefresh(refresher) {
		if(this.selectTabs == 4){
			this.orderPage = 1;
			this.orderList = [];
			this.orderRequest();
		}
		else if(this.selectTabs == 5){
			this.traderPage = 1;
			this.traderList = [];
			this.traderRequest();
		}
		setTimeout(() => {
			refresher.complete();
		}, 1000);
	}
	orderCurrencyText(val){
		for(let i=0,r=this.currencyJson.length;i<r;i++){
			if(this.currencyJson[i].currency == val){
				return this.currencyJson[i].currencyName;
			}
		}
	}
	untraderorderRequest():void {
		if(this.userInfo.userState === -2){
			return;
		}
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
	/* 委托 */
	orderRequest(callback=function(){},pager=false):void {
		if(pager) this.orderPage++;
		/* 委托查询数据 */
		let orderBody = {
			page:this.orderPage,
			rows:this.orderRows,
			order:'desc',
			sort:'createTime'
		};
		let _that = this;
		let url = "client/fsr/trade/order/page";
		this.http.postForm(url,orderBody,function(data){
			if(data.code == '000000'){
				var res = JSON.parse(data.content);
				if(_that.orderList.length == 0){
					_that.orderList = res.content;
					_that.orderTotal = res.totalElements;
				}
				else{
					if(_that.orderList.length === res.totalElements){
						_that.orderPage --;
						_that.child.alertMsg(_that.translateText('已加载至最后一页'));
						_that.infiniteScroll.enable(false);
					}
					else{
						_that.orderList = _that.orderList.concat(res.content);
					}
				}
				callback();
			}
		})
	}
	/* 成交 */
	traderRequest(callback=function(){},pager=false):void {
		if(pager) this.traderPage++;
		/* 成交查询数据 */
		let traderBody = {
			page:this.traderPage,
			rows:this.traderRows,
			order:'desc',
			sort:'createTime'
		};
		let _that = this;
		let url = "client/fsr/trade/match/page";
		this.http.postForm(url,traderBody,function(data){
			if(data.code == '000000'){
				var res = JSON.parse(data.content);
				if(_that.traderList.length == 0){
					_that.traderList = res.content;
					_that.traderTotal = res.totalElements;
				}
				else{
					if(_that.traderList.length === res.totalElements){
						_that.traderPage --;
						_that.child.alertMsg(_that.translateText('已加载至最后一页'));
						_that.infiniteScroll.enable(false);
					}
					else{
						_that.traderList = _that.traderList.concat(res.content);
					}
				}
				callback();
			}
		});
	}
	/* 上拉加载数据 */
	private infiniteScroll:any = null;
	appendData(infiniteScroll) {
		this.infiniteScroll = infiniteScroll;
		if(this.selectTabs === 4){
			//委托
			this.orderRequest(function(){
				infiniteScroll.complete();
			},true);
		}
		else if(this.selectTabs === 5){
			//成交
			this.traderRequest(function(){
				infiniteScroll.complete();
			},true);
		}
	}
	goPositionDetail(productId){
		store.set('position_detail_proId',productId);
		console.log(productId)
		this.navCtrl.push(PositionDetailPage);
	}
	orderOffsetText(val){
		for(let i=0,r=this.offsetState.length;i<r;i++){
			if(this.offsetState[i].value == val){
				return this.offsetState[i].name;
			}
		}
	}
	orderStateText(val){
		for(let i=0,r=this.orderState.length;i<r;i++){
			if(this.orderState[i].value == val){
				return this.orderState[i].name;
			}
		}
	}
	/* 合约过滤 */
	filterItems() {
		this.socket.rejuceSingleProList(this.nowProId);
		this.nowProId = '';
		this.socket.rejuceProList();
		let val = this.filterText;
		this.filterProductList = [];
		if (val && val.trim() !== '') {
			for(let i in this.productList){
				if(this.productList[i].productName.indexOf(val)>=0 || this.productList[i].productCode.indexOf(val)>=0 || this.productList[i].productCode.indexOf(val.toUpperCase())>=0){
					this.filterProductList.push(this.productList[i]);
				}
			}
		}
	}
	
	positionContract(id,name,code){
		this.nowProId = id;
		this.filterText = name;
		this.presentModal(TraderContractPage,{id:this.nowProId});
		this.filterItems();
	}
	clearSearch(){
		this.filterText = '';
		this.nowProId = '';
		this.socket.rejuceSingleProList(this.nowProId);
		this.filterItems();
	}
	public choosePostionInfo:any = {};
	pushValue(v){
		this.choosePostionInfo = {
			"commodityCode" : v[0],
			"commodityId" : v[1],
			"commodityName" : v[2],
			"contractCode" : v[3],
			"direct" : v[4],
			"orderDirect" : v[4],
			"interest" : v[5],
			"keepDeposit" : v[6],
			"marketCode" : v[7],
			"marketId" : v[8],
			"positionPrice" : v[9],
			"positionVolume" : v[10],
			"productId" : v[11],
			"toNewPrice" : v[12],
			"tradeProfit" :v[13],
			"userId" : v[14],
			"userName" : v[15],
			"sl": 0,
			"tp": 0,
			"minOrderVol": 0
		}
	}
	//文字翻译
	private translateText(text:string){
		let str:string;
		this.translate.get(text).subscribe((res: string) => {
			str = res;
		});
		return str;
	}
	presentActionSheet() {
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
					text: this.translateText('全部平仓'),
					handler: () => {
						this.closeAllPositionWarning();
					}
				},
				{
					text: this.translateText('查看持仓明细'),
					handler: () => {
						this.presentModal(PositionDetailPage,{baseInfo:this.choosePostionInfo});
						this.publishPositionTotal = [];
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
	 * 全部品种合约平仓提示
	 */
	closeAllPositionWarning() {
		const confirm = this.alertCtrl.create({
			title: '提示',
			message: '该操作会清空所有持仓合约, 是否继续?',
			buttons: [
				{
					role: 'cancel',
					text: '取消'
				},
				{
					text: '确定',
					handler: () => {
						console.log(this.publishPositionTotal);
						this.publishPositionTotal.forEach(x => {
							x.content.forEach(v => {
								const choosePostionInfo = {
									"direct" : v[4],
									"positionVolume" : v[10],
									"productId" : v[11]
								}
								this.trader.quicklyCloseContract(
									choosePostionInfo.positionVolume,
									choosePostionInfo.direct,
									choosePostionInfo.productId,
									'',
									false
								);
							});
						});
					}
				}
			]
		});
		confirm.present();
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
		// 查询最小可交易手数
		for (let i = 0, r = Window.allProductList.length; i < r; i++) {
			if (Window.allProductList[i].productId === this.choosePostionInfo.productId) {
				this.choosePostionInfo.minOrderVol = Window.allProductList[i].minOrderVol;
				break;
			}
		}
		const close = this.alertCtrl.create({
			title: this.choosePostionInfo.commodityName,
			message: `<p>可平仓手数:  ${this.canClosePosition}</p>
					<p>最小交易手数: ${this.choosePostionInfo.minOrderVol}</p>`,
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
						console.log(data);
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
						this.http.postJson('client/trade/order/create',body,(data) => {
							this.dismissLoading();
						});
					}
				}
			]
		});
		close.present();
	}

	presentModal(page,json) {
		let modal = this.modalCtrl.create(page,json);
		modal.onDidDismiss(data => {
			this.socket.addPosition();
			this.socket.addPersonalGold();
		});
		modal.present();
	}
	presentLoading() {
		this.loader = this.loadingCtrl.create({
			content: this.translateText("请等待..."),
			duration: 2000
		});
		this.loader.present();
	}
	dismissLoading() {
		this.loader.dismiss();
	}
	presentToast(text,color) {
		this.translate.get('确定').subscribe((res: string) => {
			let toast = this.toastCtrl.create({
				message: text,
				position: 'top',
				duration: 3000,
				showCloseButton: true,
				cssClass:color,
				closeButtonText: res
			});
			toast.present();
		});
	}
}
