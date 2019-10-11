import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,ActionSheetController, ModalController, ToastController } from 'ionic-angular';
import { AlertComponent } from '../../components/alert/alert';
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { TraderProvider } from "../../providers/trader/trader";
import { LoadingController, AlertController } from 'ionic-angular';
import { SltpBlockPage } from '../sltp-block/sltp-block';
import { TranslateService } from "@ngx-translate/core";
/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
/****/
declare var Window;

@IonicPage()
@Component({
  selector: 'page-position-detail',
  templateUrl: 'position-detail.html',
  providers: [SocketServeProvider]
})
export class PositionDetailPage {
	@ViewChild(AlertComponent) child: AlertComponent;
	private positionDetailConnection;
	private orderConnection;

	/* 持仓列表 */
	public positionDetailList:any = [];
	private baseInfo:any;
	public loader: any;

	/* 可平手数 */
	public canClosePosition: number = 0;

	constructor(public toastCtrl: ToastController, public alertCtrl: AlertController, public translate:TranslateService, public loadingCtrl: LoadingController,public modalCtrl: ModalController,public actionSheetCtrl: ActionSheetController,public navCtrl: NavController,public viewCtrl: ViewController, public params: NavParams, private socket:SocketServeProvider,public http: HttpServeProvider,public trader: TraderProvider) {
		this.baseInfo = params.get('baseInfo');
		console.log(this.baseInfo);
	}
	ionViewDidEnter() {
		const self = this;
		this.socket.addSingleProList(this.baseInfo.productId);
		this.socket.addPositionDetail();
		this.positionDetailConnection = this.socket.getPosition().subscribe(res => {
			let data = JSON.parse(res.toString());
			if(data.productId != this.baseInfo.productId){
				return;
			}
			if(this.positionDetailList.length == 0){
				this.positionDetailList.push(this.stringChangeArray(data));
			}
			else{
				let hasPro = false;
				for(let i=0,r=this.positionDetailList.length;i<r;i++){
					if(this.positionDetailList[i].productId == data.productId){
						this.positionDetailList[i] = this.stringChangeArray(data);
						hasPro = true;
						break;
					}
				}
				if(!hasPro){
					this.positionDetailList.push(this.stringChangeArray(data));
				}
			}
			console.log(this.positionDetailList);
		});
		this.orderConnection = this.socket.getOrderBack().subscribe(res => {
			let data = JSON.parse(res.toString());
			this.child.alertMsg(this.orderStateText(data.content.orderState));
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
		this.positionDetailConnection.unsubscribe();
		this.orderConnection.unsubscribe();
		this.socket.rejucePositionDetail();
		this.socket.rejuceSingleProList(this.baseInfo.productId);
	}
	private orderState = [
				{ "value": 0, "name": "指令失败"},
				{ "value": 1, "name": "已受理"},
				{ "value": 2, "name": "已挂起"},
				{ "value": 3, "name": "已排队"},
				{ "value": 4, "name": "待撤销"},
				{ "value": 5, "name": "待修改"},
				{ "value": 6, "name": "部分撤单"},
				{ "value": 7, "name": "完全撤单"},
				{ "value": 8, "name": "部分成交"},
				{ "value": 9, "name": "全成交"},
				{ "value": 10, "name": "部分成交还在队列中"},
				{ "value": 11, "name": "部分成交不在队列中"},
				{ "value": 12, "name": "未成交还在队列中"},
				{ "value": 13, "name": "未成交不在队列中"},
				{ "value": 14, "name": "撤单"},
				{ "value": 15, "name": "未知"},
				{ "value": 16, "name": "尚未触发"},
				{ "value": 17, "name": "已触发"}
			];
	private orderStateText(num) {
		for(let i=0,r=this.orderState.length;i<r;i++){
			if(this.orderState[i].value == num){
				return this.orderState[i].name;
			}
		}
	}
	dismiss() {
		this.viewCtrl.dismiss();
	}
	public choosePostionInfo;
	getChoosePostionInfo(cn){
		this.choosePostionInfo = {
			"commodityCode" : cn[0],
			"commodityId" : cn[1],
			"commodityName" :cn[2],
			"contractCode" : cn[3],
			"floatProfit" : cn[4],
			"interest" : cn[5],
			"keepDeposit" : cn[6],
			"marketCode" : cn[7],
			"marketId" : cn[8],
			"orderDirect" : cn[9],
			"positionId" : cn[10],
			"positionPrice" : cn[11],
			"positionVolume" : cn[12],
			"productId" : cn[13],
			"sl" : cn[14],
			"toNewPrice" : cn[15],
			"tp" : cn[16],
			"userId" : cn[17],
			"userName" : cn[18],
			"minOrderVol": 0
		}
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
				name: 'number',
				placeholder: '请输入需要平仓的数量',
				type: 'number'
			}],
			buttons: [
				{
					role: 'cancel',
					text: '取消'
				},
				{
					text: '确定',
					handler: (data: any) => {
						if(Number(data.number) > Number(this.canClosePosition)) {
							this.presentToast('平仓手数不可大于可平手数', 'toast-red');
							return;
						}
						this.presentLoading();
						const body = {
							"orderFormVIce": {
								"userId": this.choosePostionInfo.userId,
								"productId": this.choosePostionInfo.productId,
								"positionId": this.choosePostionInfo.positionId,
								"orderDirect": this.choosePostionInfo.orderDirect * -1,
								"orderVolume": Number(data.number),
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
	/**
	 * 查询可平仓手数
	 */
	searchCanClose(callback) {
		console.log(this.choosePostionInfo);
		const body = {
			"orderFormVIce": {
				"userId": this.choosePostionInfo.userId,
				"productId": this.choosePostionInfo.productId,
				"positionId": this.choosePostionInfo.positionId,
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
	presentActionSheet() {
		let actionSheet = this.actionSheetCtrl.create({
			title: this.choosePostionInfo.commodityName+'('+this.choosePostionInfo.contractCode+')',
			buttons: [
				{
					text: this.translateText('设置止盈/止损'),
					handler: () => {
						console.log(this.choosePostionInfo);
						this.presentModal(SltpBlockPage,{baseInfo:this.choosePostionInfo});
					}
				},
				{
					text: this.translateText('快捷反手'),
					handler: () => {
						this.presentLoading();
						this.trader.quicklyBackOrder(
							this.choosePostionInfo.positionVolume,
							this.choosePostionInfo.orderDirect,
							this.choosePostionInfo.productId,
							this.choosePostionInfo.positionId
						);
					}
				},
				{
					text: this.translateText('快捷平仓'),
					handler: () => {
						this.presentLoading();
						this.trader.quicklyCloseContract(
							this.choosePostionInfo.positionVolume,
							this.choosePostionInfo.orderDirect,
							this.choosePostionInfo.productId,
							this.choosePostionInfo.positionId
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
	//翻译
	translateText(text){
		let result:any;
		console.log(text);
		this.translate.get(text).subscribe((res: string) => {
			result = res;
		});
		return result;
	}
	presentModal(page,json) {
		let modal = this.modalCtrl.create(page,json);
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
