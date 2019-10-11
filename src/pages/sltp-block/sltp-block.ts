import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";


/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';

declare var Window,indexLibrary;

/**
 * Generated class for the SltpBlockPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-sltp-block',
	templateUrl: 'sltp-block.html',
})
export class SltpBlockPage {
	constructor(public loadingCtrl: LoadingController, private alertCtrl: AlertController, private socket:SocketServeProvider,public toastCtrl: ToastController,public viewCtrl: ViewController,public navCtrl: NavController, public params: NavParams, public http: HttpServeProvider) {
		this.baseInfo = params.get('baseInfo');
	}
	private loader:any;

	public baseInfo:any;
	public tp:number;//止盈
	public sl:number;//止损
	public step;
	private commodityType: number;//合约类型

	public setTp:boolean = true;
	public setSl:boolean = true;
	public setSameTpLt:boolean = false;
	public canSetSameTpLt:boolean = false;
	private priceConection;

	ionViewDidEnter() {
		this.socket.addSingleProList(this.baseInfo.productId);
		for(let i=0,r=Window.allProductList.length;i<r;i++){
			if(Window.allProductList[i].productId == this.baseInfo.productId){
				this.step = Window.allProductList[i].unionMinPrices;
				this.commodityType = Window.allProductList[i].commodityType;
				break;
			}
		}
		this.baseInfo.tp = Number(this.baseInfo.tp);
		this.baseInfo.sl = Number(this.baseInfo.sl);
		this.baseInfo.toNewPrice = Number(this.baseInfo.toNewPrice);

		this.tp = this.baseInfo.tp!='0'?this.baseInfo.tp:this.baseInfo.toNewPrice;
		this.sl = this.baseInfo.sl!='0'?this.baseInfo.sl:this.baseInfo.toNewPrice;

		console.log(this.baseInfo);

		if(this.baseInfo.tp != '0' || this.baseInfo.sl != '0'){
			if(this.baseInfo.tp == '0'){
				this.setTp = false;
			}
			if(this.baseInfo.sl == '0'){
				this.setSl = false;
			}
		}

		if(this.baseInfo.positionId){
			this.canSetSameTpLt = true;
		}

		/* 行情 */
		this.priceConection = this.socket.getPrice().subscribe(res => {
			const data = res.split('|');
			if(data[2].indexOf(this.baseInfo.productId) >= 0){
				// console.log('[收到止盈止损的一条行情信息]',data);
				//判断合约类型 获取价格
				if(this.commodityType === 4){
					console.log(data[16]);
					this.baseInfo.toNewPrice = (this.baseInfo.direct === '1')?data[18].split(',')[0]:data[16].split(',')[0];
				}
				else{
					this.baseInfo.toNewPrice = data[14];
				}
			}
		});

	}
	setSearch(){
		/* 设置止盈止损前查询平仓挂单 */
		const self = this;
		this.presentLoading();
		let body = {
			page: 1,
			rows: 99,
			order: 'desc',
			sort: 'createTime',
			search_IN_orderState: '[1,2,3,4,5,8,10,11,12,13,16,17]'
		}
		this.http.postForm('client/trade/order/query/as/page',body,function(res){
			console.log(self.baseInfo);
			const data = JSON.parse(res.content);
			console.log(data);
			for(let i=0,r=data.content.length;i<r;i++){
				if(data.content[i].productId == self.baseInfo.productId){
					if(data.content[i].offset == 2){
						self.presentConfirm();
						return;
					}
				}
			}
			self.set();
			self.dismissLoading();
		});
	}
	set(){
		let body = {
			"orderFormVIce": {
				"offset": 0,
				"productId": this.baseInfo.productId,
				"positionId": this.setSameTpLt?"":this.baseInfo.positionId,
				"sl": this.setSl?this.sl:0,
				"tp": this.setTp?this.tp:0,
				"orderDirect": this.baseInfo.direct?this.baseInfo.direct:this.baseInfo.orderDirect,
				"userId": Window.userInfo.userId,
				"orderVolume": this.baseInfo.positionVolume
			}
		};
		this.http.postJson('client/trade/position/sltp',body,(data) => {
			var res = JSON.parse(data.content);
			if(data.code == '000000' && res.errorId == 0){
				this.presentToast('设置成功','toast-green');
				this.setSlTpWarning()
			}
			else{
				this.presentToast(res.errorMsg,'toast-red');
			}
		});
	}
	dismiss() {
		this.priceConection.unsubscribe();
		this.socket.rejuceSingleProList(this.baseInfo.productId);
		this.viewCtrl.dismiss();
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
	setSlTpWarning() {
		let alert = this.alertCtrl.create({
			title: '提示',
			message: '已设置的止盈止损可在持仓明细中查看',
			buttons: [
				{
					text: '确定',
					handler: () => {
						this.dismiss();
					}
				}
			]
		});
		alert.present();
	}
	presentConfirm() {
		let alert = this.alertCtrl.create({
		title: '确认提示',
		message: '该合约已有平仓挂单，设置的止盈止损可能会不生效',
		buttons: [
			{
				text: '取消',
				role: 'cancel',
				handler: () => {
				  //
				}
			},
			{
				text: '确定',
				handler: () => {
					this.set();
				}
			}
		]
		});
		alert.present();
	}
	presentLoading() {
		if(!this.loader){
			this.loader = this.loadingCtrl.create({
				content: "请等待...",
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
}
