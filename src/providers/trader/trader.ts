import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { ToastController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";

/* http request */
import 'rxjs/add/operator/toPromise';
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
declare var Window, indexLibrary;
/*
  Generated class for the TraderProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TraderProvider {
	constructor(public http: HttpServeProvider,public toastCtrl: ToastController, private alertCtrl: AlertController, public translate:TranslateService) { }
	/* 快捷反手 */
	public quicklyBackOrder(volume,orderDirect,productId,positionId=''){
		let self = this;
		this.presentConfirm(this.translateText('是否要执行快捷反手操作?'),function(){
			let body:any = {
				"orderFormVIce": {
					"productId": productId,
					"orderDirect": orderDirect*-1,
					"offset": 2,
					"priceCondition": 1,
					"userId": Window.userInfo.userId,
					"positionId":positionId
				}
			}
			self.http.postJson('client/trade/order/get/canclose',body,function(data){
				if(data.code == '000000'){
					let canClose = data.content;
					if(canClose == 0){
						self.presentToast(self.translateText('无可反手持仓'),'toast-red');
						return;
					}
					if(volume != canClose){
						self.presentConfirm(self.translateText('可反手手数与可平手数不一致<br/>是否继续?'),function(){
							closePosition(canClose,function(){
								post();
							});
						});
					}
					else{
						closePosition(canClose,function(){
							post();
						});
					}
				}
				else{
					self.presentToast(data.message,'toast-red');
				}
			});
			//平仓
			function closePosition(canClose,callback = function(){}){
				let postBody = {
					"orderFormVIce": {
						"offset":2,
						"productId": productId,
						"triggerPrice": 0,
						"priceCondition": 1,
						"orderPrice": 0,
						"orderDirect": body.orderFormVIce.orderDirect,
						"orderVolume": canClose,
						"userId": Window.userInfo.userId,
						"positionId":positionId
					}
				}
				self.http.postJson('client/trade/order/create',postBody,function(data){
					if(data.code == '000000'){
						const _data = JSON.parse(data.content);
						if(_data.errorId == 0){
							self.presentToast(self.translateText('请求已发送'),'toast-green');
							callback();
						}
						else{
							self.presentToast(_data.errorMsg,'toast-green');
						}
					}
					else{
						self.presentToast(data.message,'toast-red');
					}
				});
			}
			//开仓
			function post(){
				let postBody = {
					"orderFormVIce": {
						"offset":1,
						"productId": productId,
						"triggerPrice": 0,
						"priceCondition": 1,
						"orderPrice": 0,
						"orderDirect": body.orderFormVIce.orderDirect,
						"orderVolume": volume,
						"userId": Window.userInfo.userId,
						"positionId":positionId
					}
				}
				self.http.postJson('client/trade/order/create',postBody,function(data){
					if(data.code == '000000'){
						const _data = JSON.parse(data.content);
						if(_data.errorId == 0){
							self.presentToast(self.translateText('请求已发送'),'toast-green');
						}
						else{
							self.presentToast(_data.errorMsg,'toast-green');
						}
					}
					else{
						self.presentToast(data.message,'toast-red');
					}
				});
			}
		});
	}
	/* 快捷平仓 */
	public quicklyCloseContract(volume,orderDirect,productId,positionId='',hasWarning = true){
		let self = this;
		let body:any = {
			"orderFormVIce": {
				"productId": productId,
				"orderDirect": orderDirect*-1,
				"offset": 2,
				"priceCondition": 1,
				"userId": Window.userInfo.userId,
				"positionId":positionId
			}
		}
		if(hasWarning) {
			this.presentConfirm(self.translateText('是否要执行快捷平仓操作?'),function(){
				self.http.postJson('client/trade/order/get/canclose',body,function(data){
					if(data.code == '000000'){
						let canClose = data.content;
						if(canClose == 0){
							self.presentToast(self.translateText('无可平持仓'),'toast-red');
							return;
						}
						if(volume != canClose){
							self.presentConfirm(self.translateText('可平持仓为')+canClose+self.translateText('手,确定要平仓?'),function(){
								post(canClose);
							});
						}
						else{
							post(canClose);
						}
					}
					else{
						self.presentToast(data.message,'toast-red');
					}
				});
			});
		} else {
			post();
		}

		function post(canClose = volume){
			let postBody = {
				"orderFormVIce": {
					"offset":2,
					"productId": productId,
					"triggerPrice": 0,
					"priceCondition": 1,
					"orderPrice": 0,
					"orderDirect": body.orderFormVIce.orderDirect,
					"orderVolume": canClose,
					"userId": Window.userInfo.userId,
					"positionId":positionId
				}
			}
			self.http.postJson('client/trade/order/create',postBody,function(data){
				if(data.code == '000000'){
					self.presentToast(self.translateText('请求已发送'),'toast-green');
				}
				else{
					self.presentToast(data.message,'toast-red');
				}
			});
		}
	}
	/* 撤单 */
	public removeUntrader(id){
		let body = {
			"orderFormVIce":{
				"localOrderId":id
			}
		};
		let self = this;
		this.presentConfirm(this.translateText('是否要执行撤单操作?'),function(){
			self.http.postJson("client/trade/order/remove",body,function(data){
				if(data.code == '000000'){
					const res = JSON.parse(data.content);
					if(res.errorId == 0){
						self.presentToast(self.translateText('请求已发送'),'toast-green');
					}
					else{
						self.presentToast(res.errorMsg,'toast-red');
					}
				}
				else{
					self.presentToast(data.message,'toast-red');
				}
			})
		});
	}
	// 修正用户手输的交易数量
	fixedTraderNum(_traderNum, _minOrderVol) {
		console.log('[获取的参数]' ,_traderNum, _minOrderVol);
		if (_traderNum !== null) {
			_traderNum = parseFloat(_traderNum);
			const str1 = String(_minOrderVol);
			const str2 = String(_traderNum);
			console.log('[转换后的参数]' ,_traderNum, _minOrderVol);
			if (str1.indexOf('.') > -1) {
				if(parseFloat(str2) === 0) {
					return _traderNum;
				}
				// 获取最小交易手数位数
				const tradeFloat = str1.split('.')[1].length;
				let tmp0 = '';
				for (let i = 0; i < tradeFloat; i++) {
					tmp0 += '0';
				}
				const multiple = Number(`1${tmp0}`);
				const traderNum = indexLibrary.formatFloat(_traderNum * multiple, 0);
				const minOrderVol = indexLibrary.formatFloat(_minOrderVol * multiple, 0);
				const result = (traderNum - (traderNum % minOrderVol)) / multiple;
				_traderNum = result;

			} else if (str2.indexOf('.') > -1) {
				const traderNum = parseInt(str2, 0);
				if (traderNum % _minOrderVol !== 0) {
					_traderNum -= (traderNum % _minOrderVol);
				} else {
					_traderNum = traderNum;
				}
			} else {
				if (_traderNum % _minOrderVol !== 0) {
					_traderNum -= (_traderNum % _minOrderVol);
				}
			}
		}
		if (_traderNum < 0) {
			_traderNum = _minOrderVol;
		}
		console.log('[返回的参数]' ,_traderNum, _minOrderVol);
		return _traderNum;
	}
	//文字翻译
	private translateText(text:string){
		let str:string;
		this.translate.get(text).subscribe((res: string) => {
			str = res;
		});
		return str;
	}
	presentToast(text,color) {
		let toast = this.toastCtrl.create({
			message: text,
			position: 'top',
			showCloseButton: true,
			duration: 3000,
			cssClass:color,
			closeButtonText: this.translateText('确定')
		});
		toast.present();
	}
	presentConfirm(text,callback) {
		let alert = this.alertCtrl.create({
			title: this.translateText('提示'),
			message: text,
			buttons: [
				{
					text: this.translateText('取消'),
					role: 'cancel',
				},
				{
					text: this.translateText('确定'),
					handler: () => {
						callback();
					}
				}
			]
		});
		alert.present();
	}
}
