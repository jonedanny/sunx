import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { MyaccountPage } from '../myaccount/myaccount';
/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
/****/

@IonicPage()
@Component({
  selector: 'page-gold-pwd',
  templateUrl: 'gold-pwd.html',
})
export class GoldPwdPage {
	/* 验证正则 */
	private regPhone = /^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/;
	private regPassword = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
	/* 修改密码 变量 */
	private oldPwd:string = '';
	private newPwd:string = '';
	private repeatPwd:string = '';
	public type:number = 1;

	/* 通过验证方式找回 变量 */
	public postCodeText:string = '获取验证码';
	private isPostCode:boolean = false;
	private countDownTime:number = 60;

	public checkCode:string = '';
	public ways:Array<any> = [];
	public checkWays:any;
	constructor(public toastCtrl: ToastController, public _http: HttpServeProvider,public navCtrl: NavController, public navParams: NavParams) {
	}

	ionViewDidLoad() {
		let self = this;
		/* 获取可用验证方式 */
		this._http.postJson("client/user/get/ways",{},function(res){
			if(res.code == '000000'){
				self.ways = res.ways;
				self.checkWays = self.ways[0].type;
			}
			else{
				self.presentToast(res.message,'toast-red');
			}
		});
	}

	changePwd() {
		if(!this.regPassword.test(this.newPwd)){
			this.presentToast('资金密码格式不正确','toast-red');
		}
		else if(this.newPwd != this.repeatPwd){
			this.presentToast('2次密码输入不一致','toast-red');
		}
		else{
			let body = {
				"newAccountPassword":this.newPwd,
				"nowaccountPassword":this.oldPwd
			};
			let self = this;
			/* 资金密码修改 */
			this._http.postJson("client/account/update/account/password",body,function(data){
				if(data.code == '000000'){
					self.presentToast('修改成功','toast-green');
					self.navCtrl.pop();
				}
				else{
					self.presentToast(data.message,'toast-red');
				}
				self.oldPwd = '';
				self.newPwd = '';
				self.repeatPwd = '';
			})
		}
	}
	countDown(){
		let self = this;
		if(this.countDownTime > 0){
			setTimeout(()=>{
				self.countDownTime --;
				self.postCodeText = self.countDownTime+'秒后重新获取';
				self.countDown();
			},1000);
		}
		else{
			this.isPostCode = false;
			this.postCodeText = '重新获取验证码';
		}
	}
	getCheckCode(){
		let self = this;
		const body = {
				"validType": this.checkWays
			}
		if(this.isPostCode == false){
			this.isPostCode = true;
			this._http.postJson("client/account/get/validcode",body,function(res){
				console.log(res);
				if(res.code == '000000' && res.success){
					self.presentToast('验证码已发送,请注意查收','toast-green');
					self.countDown();
				}
				else{
					self.presentToast('发送失败,请重新尝试','toast-red');
					self.isPostCode = false;
				}
			});
		}
	}
	changePwdOtherWays() {
		if(!this.regPassword.test(this.newPwd)){
			this.presentToast('资金密码格式不正确','toast-red');
		}
		else if(this.newPwd != this.repeatPwd){
			this.presentToast('2次密码输入不一致','toast-red');
		}
		else{
			let body = {
				"validInfo": this.newPwd,
				"code": this.checkCode,
				"validType": this.checkWays
			};
			let self = this;
			/* 资金密码修改 */
			this._http.postJson("client/account/update/password/code",body,function(data){
				if(data.code == '000000'){
					self.presentToast('修改成功','toast-green');
					self.navCtrl.pop();
				}
				else{
					self.presentToast(data.message,'toast-red');
				}
			})
		}
	}
	changeType(type){
		this.type = type;
		this.oldPwd = '';
		this.newPwd = '';
		this.repeatPwd = '';
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
