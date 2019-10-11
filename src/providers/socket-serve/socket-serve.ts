import 'rxjs/add/operator/map';
import { ToastController} from 'ionic-angular';
import { Injectable } from '@angular/core';
/* http request */
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
declare var Window,io;

/*
  Generated class for the SocketServeProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SocketServeProvider {
	constructor(public _http: HttpServeProvider,public toastCtrl: ToastController) {

	}
	/* 初次连接收到返回的响应 */
	public firstConnect:string = '';

	private _addProList:boolean;
	private _addSingleProList:boolean;
	private _addPersonalGold:boolean;
	private _addPosition:boolean;
	private _addPositionDetail:boolean;
	private _addPositionProList:boolean;

	public creatNewSocket = (callback)=>{
		/* 获取socket token */
		let self = this;
		Window.socket = io(Window.currentLine.socketUrl,{query:{tonken:Window.token},autoConnect: false,connect_timeout:500});
		Window.socket.open();
		Window.socket.on("reconnect", function() {
			console.log("reconnect")
		});
		Window.socket.on("connect", function() {
			console.log("connect");
			Window.isConnect = true;
		});
		Window.socket.on("disconnect", function() {
			console.log("disconnect");
			Window.isConnect = false;
			if(Window.openReconnect){
				self.reconnect();
			}
		});
		Window.socket.on("connect_error", function() {
			console.log("connect_error");
			// self.reconnect();
		});
		Window.socket.on("connect_timeout", function() {
			console.log("connect_timeout");
		});
		Window.socket.on("error", function() {
			console.log("error");
		});
		Window.socket.on("reconnecting ", function() {
			console.log("reconnecting ");
		});
		Window.socket.on("reconnect_error ", function() {
			console.log("reconnect_error ");
		});
		Window.socket.on("reconnect_failed ", function() {
			console.log("reconnect_failed ");
		});
		// Window.socket.on("ping", function() {
		// 	console.log("ping");
		// });
		Window.socket.on('public-login',(data) => {
			console.log(data);
			if(self.firstConnect === 'success'){
				setTimeout(function(){
					self.subscribeInfo();
				},3000);
			}
			else{
				self.subscribeInfo();
				self.firstConnect = 'success';
			}
		});
		Window.socket.on('ping', function() {
			self.firstConnect = 'success';
		});
		//获取开户变更报告
		Window.socket.on('publish-user-state', function() {
			console.log(Window.searchUserValidate);
			Window.searchUserValidate();
			Window.updateVerificationInfo();
			Window.updateSignInfo();
		});
		callback();
	}
	reconnect() {
		const self = this;
		this._http.postJson("socket.io/get/tonken",{},function(data){
			if(data.code == '000000'){
				if(Window.socket){
					Window.socket.io.opts.query.tonken = Window.token;
					Window.socket.open();
				}
			}
			else{
				setTimeout(()=>{
					self.reconnect();
				},3000);
			}
		});
	}
	getPrice(): Observable<any> {
		let observable = new Observable(observer => {
			Window.socket.on('publish-price',(data) => {
				observer.next(data);
			})
		})
		return observable;
	}
	getPriceMb2(): Observable<any> {
		let observable = new Observable(observer => {
			Window.socket.on('publish-price-mb2',(data) => {
				observer.next(data);
			})
		})
		return observable;
	}
	getOrderBack() {
		let observable = new Observable(observer => {
			Window.socket.on('publish-order',(data) => {
				observer.next(data);
			})
		})
		return observable;
	}
	getAccount(): Observable<any> {
		let observable = new Observable(observer => {
			Window.socket.on('publish-account',(data) => {
				observer.next(data);
			})
		})
		return observable;
	}
	getPositionTotal(): Observable<any> {
		let observable = new Observable(observer => {
			Window.socket.on('publish-position-total',(data) => {
				observer.next(data);
			})
		})
		return observable;
	}
	getPosition(): Observable<any> {
		let observable = new Observable(observer => {
			Window.socket.on('publish-position',(data) => {
				observer.next(data);
			})
		})
		return observable;
	}
	getNotice() {
		let observable = new Observable(observer => {
			Window.socket.on('publish-notice-content',(data) => {
				observer.next(data);
			})
		})
		return observable;
	}
	subscribeInfo(){
		if(this._addProList){
			this.addProListMb2Delay();
		}
		if(this._addSingleProList){
			this.addSingleProListMb2Delay(Window.nowProId);
		}
		if(this._addPersonalGold){
			this.addPersonalGold();
		}
		if(this._addPosition){
			this.addPosition();
		}
		if(this._addPositionDetail){
			this.addPositionDetail();
		}
		if(this._addPositionProList){
			this.addPositionProList();
		}
	}
	/* 订阅持仓产品 */
	addPositionProList(proList = Window.subscribePositionTotal){
		this._addPositionProList = true;
		Window.socket.emit("subscribe-price",proList);
	}
	/* 退订持仓产品 */
	rejucePositionProList(proList = Window.subscribePositionTotal){
		this._addPositionProList = false;
		Window.socket.emit("unsubscribe-price",proList);
	}
	/* 订阅产品 mb2 */
	addProListMb2(proList = Window.showProList){
		this._addProList = true;
		Window.socket.emit("subscribe-price-mb2",proList);
	}
	/* 退订产品 mb2 */
	rejuceProListMb2(proList = Window.socketAllpro){
		this._addProList = false;
		this._addSingleProList = false;
		Window.socket.emit("unsubscribe-price-mb2",proList);
	}
	/* 订阅单个商品 mb2 */
	addSingleProListMb2(id){
		this._addSingleProList = true;
		Window.socket.emit("subscribe-price-mb2",[id]);
	}
	/* 退订单个产品 mb2 */
	rejuceSingleProListMb2(id){
		this._addProList = false;
		this._addSingleProList = false;
		Window.socket.emit("unsubscribe-price-mb2",[id]);
	}

	/* 订阅产品 mb2 delay */
	addProListMb2Delay(proList = Window.showProList){
		this._addProList = true;
		Window.socket.emit("subscribe-price-mb2-delay",proList);
	}
	/* 退订产品 mb2 delay */
	rejuceProListMb2Delay(proList = Window.showProList){
		this._addProList = false;
		this._addSingleProList = false;
		Window.socket.emit("unsubscribe-price-mb2-delay",proList);
	}
	/* 订阅单个商品 mb2 delay */
	addSingleProListMb2Delay(id){
		this._addSingleProList = true;
		Window.socket.emit("subscribe-price-mb2-delay",[id]);
	}
	/* 退订单个产品 mb2 delay */
	rejuceSingleProListMb2Delay(id){
		this._addProList = false;
		this._addSingleProList = false;
		Window.socket.emit("unsubscribe-price-mb2-delay",[id]);
	}

	/* 订阅产品 */
	addProList(proList = Window.showProList){
		this._addProList = true;
		Window.socket.emit("subscribe-price",proList);
	}
	/* 订阅单个产品 */
	addSingleProList(id){
		this._addSingleProList = true;
		Window.socket.emit("subscribe-price",[id]);
	}
	/* 退订单个产品 */
	rejuceSingleProList(id){
		this._addProList = false;
		this._addSingleProList = false;
		Window.socket.emit("unsubscribe-price",[id]);
	}
	/* 退订所有产品 */
	rejuceProList(){
		this._addProList = false;
		this._addSingleProList = false;
		Window.socket.emit("unsubscribe-price",Window.socketAllpro);
	}
	/* 订阅个人资金 委托 */
	addPersonalGold(){
		this._addPersonalGold = true;
		Window.socket.emit("subscribe-pub-privacy-info",["publish-account","publish-order"]);
	}
	/* 退订个人资金 委托*/
	rejucePersonalGold(){
		this._addPersonalGold = false;
		Window.socket.emit("unsubscribe-pub-privacy-info",["publish-account","publish-order"]);
	}
	/* 订阅持仓 */
	addPosition(){
		this._addPosition = true;
		Window.socket.emit("subscribe-pub-privacy-info",["publish-position-total","publish-order"]);
	}
	/* 退订持仓 */
	rejucePosition(){
		this._addPosition = false;
		Window.socket.emit("unsubscribe-pub-privacy-info",["publish-position-total"]);
	}
	/* 订阅持仓明细 */
	addPositionDetail(){
		this._addPositionDetail = true;
		Window.socket.emit("subscribe-pub-privacy-info",["publish-position"]);
	}
	/* 退订持仓明细 */
	rejucePositionDetail(){
		this._addPositionDetail = false;
		Window.socket.emit("unsubscribe-pub-privacy-info",["publish-position"]);
	}
	/* 订阅所有信息 */
	subscribeAll(){
		this._addProList = true;
		this._addSingleProList = true;
		this._addPersonalGold = true;
		this._addPosition = true;
		this._addPositionDetail = true;
		this._addPositionProList = true;
		Window.socket.emit("subscribe-price",Window.showProList);
		Window.socket.emit("subscribe-pub-privacy-info",["publish-account"]);
		Window.socket.emit("subscribe-pub-privacy-info",["publish-position-total"]);
		Window.socket.emit("subscribe-pub-privacy-info",["publish-order"]);
		Window.socket.emit("subscribe-pub-privacy-info",["publish-position"]);
	}
	/* 退订所有信息 */
	destoryAll(){
		this._addProList = false;
		this._addSingleProList = false;
		this._addPersonalGold = false;
		this._addPosition = false;
		this._addPositionDetail = false;
		this._addPositionProList = false;
		Window.socket.emit("unsubscribe-price",Window.showProList);
		Window.socket.emit("unsubscribe-price-mb1",Window.showProList);
		Window.socket.emit("unsubscribe-price-mb1-delay",Window.showProList);
		Window.socket.emit("unsubscribe-price-mb2",Window.showProList);
		Window.socket.emit("unsubscribe-price-mb2-delay",Window.showProList);
		Window.socket.emit("unsubscribe-pub-privacy-info",["publish-account"]);
		Window.socket.emit("unsubscribe-pub-privacy-info",["publish-position-total"]);
		Window.socket.emit("unsubscribe-pub-privacy-info",["publish-order"]);
		Window.socket.emit("unsubscribe-pub-privacy-info",["publish-position"]);
	}
	presentToast(text,color) {
		let toast = this.toastCtrl.create({
			message: text,
			position: 'top',
			duration: 5000,
			showCloseButton: true,
			cssClass:color,
			closeButtonText: '确定'
		});
		toast.present();
	}
}
