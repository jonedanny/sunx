import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, ViewController } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";

/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
/****/
declare var Window;
@IonicPage()
@Component({
	selector: 'page-verification-mode',
	templateUrl: 'verification-mode.html',
})
export class VerificationModePage {
	private regEmail = /^([a-zA-Z0-9_-|.])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
	private regPhone = /^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/;

	public postCodeText:string = '获取验证码';
	private isPostCode:boolean = false;
	private countDownTime:number = 60;
	private loader: any;
	public checkCode:string = '';
	public ways:Array<any> = [];
	public checkWays:any;
	public value:string = '';
	public action:string;


	constructor(public viewCtrl: ViewController, public loadingCtrl: LoadingController, public toastCtrl: ToastController,public navCtrl: NavController, public navParams: NavParams, public http: HttpServeProvider,public translate:TranslateService) {
		this.action = navParams.get('type');
	}

	ionViewDidLoad() {
		this.checkCode = '';
		this.value = '';
		this.getCheckWays();
	}
	getCheckWays(){
		const self = this;
		/* 获取可用验证方式 */
		this.http.postJson("client/user/get/ways",{},function(res){
			if(res.code == '000000'){
				self.ways = res.ways;
				if(self.action == '4'){
					let hasChild:number = -1;
					for(let i=0,r=self.ways.length;i<r;i++){
						if(self.ways[i].type == 0){
							hasChild = i;
						}
					}
					if(hasChild != -1){
						self.checkWays = self.ways[hasChild].type;
					}
					else{
						self.action = '2';
					}
				}
				if(self.action == '5'){
					let hasChild:number = -1;
					for(let i=0,r=self.ways.length;i<r;i++){
						if(self.ways[i].type == 1){
							hasChild = i;
						}
					}
					if(hasChild != -1){
						self.checkWays = self.ways[hasChild].type;
					}
					else{
						self.action = '3';
					}
				}
			}
			else{
				self.presentToast(res.message,'toast-red');
			}
		});
	}
	getCheckCode(){
		console.log(this.action,this.value);
		if(this.action == '2' || this.action == '3'){
			if(this.action == '2' && !this.regEmail.test(this.value)){
				this.translate.get('邮箱格式不正确').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
				return;
			}
			else if(this.action == '3' && !this.regPhone.test(this.value)){
				this.translate.get('手机号格式不正确').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
				return;
			}
		}
		let self = this;
		let newWays;
		switch (this.action) {
			case "2":
				newWays = 0;
				break;
			case "3":
				newWays = 1;
				break;
			default:
				newWays = this.checkWays;
				break;
		}
		const body = {
				"validInfo": this.value,
				"validType": newWays,
				"validCodeType": this.action
			};
		if(this.isPostCode == false){
			this.isPostCode = true;
			this.presentLoading();
			this.http.postJson("client/user/get/validcode",body,function(res){
				if(res.code == '000000' && res.success){
					self.translate.get('验证码已发送').subscribe((res: string) => {
						self.presentToast(res,'toast-green');
					});
					self.countDown();
				}
				else if(res.code == '000000' && !res.success){
					self.translate.get('验证码发送失败,请重新尝试').subscribe((res: string) => {
						self.presentToast(res,'toast-red');
					});
					self.isPostCode = false;
				}
				else{
					self.presentToast(res.message,'toast-red');
					self.isPostCode = false;
				}
				self.dismissLoading();
			});
		}
	}
	changeverification(){
		const self = this;
		this.presentLoading();
		if(this.action == '4' || this.action == '5'){
			if(this.checkCode == ''){
				this.translate.get('请填写验证码').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
				this.dismissLoading();
				return;
			}
			const body = {
				"code": this.checkCode,
				"validType": this.checkWays,
				"validCodeType": this.action
			};
			this.http.postJson("client/user/update/key1",body,function(res){
				if(res.code == '000000'){
					if(self.action == '4'){
						self.translate.get('操作成功,请继续绑定新的邮箱').subscribe((res: string) => {
							self.presentToast(res,'toast-green');
						});
					}
					else if(self.action == '5'){
						self.translate.get('操作成功,请继续绑定新的手机').subscribe((res: string) => {
							self.presentToast(res,'toast-green');
						});
					}
					self.checkCode = '';
					if(self.countDownTime > 1){
						self.countDownTime = 0;
					}

					if(self.action == '4'){
						self.action = '2';
					}
					else if(self.action == '5'){
						self.action = '3';
					}
				}
				else{
					self.presentToast(res.message,'toast-red');
				}
				self.dismissLoading();
			},false);
		}
		else if(this.action == '2' || this.action == '3'){
			if(this.value == ''){
				if(this.action == '2'){
					this.translate.get('请填写新绑定的邮箱').subscribe((res: string) => {
						this.presentToast(res,'toast-red');
					});
				}
				else if(this.action == '3'){
					this.translate.get('请填写新绑定的手机号').subscribe((res: string) => {
						this.presentToast(res,'toast-red');
					});
				}
				this.dismissLoading();
				return;
			}
			const body = {
				"validInfo":this.value,
				"code": this.checkCode,
				"validType": (this.action == '2')?0:1,
				"validCodeType": (this.action == '2')?2:3
			};
			this.http.postJson("client/user/update/key2",body,function(res){
				if(res.code == '000000'){
					self.translate.get('绑定成功').subscribe((res: string) => {
						self.presentToast(res,'toast-green');
					});
					self.checkCode = '';
					if(self.countDownTime > 1){
						self.countDownTime = 0;
					}
					self.dismissLoading();
					self.dismiss();
				}
				else{
					self.presentToast(res.message,'toast-red');
					self.dismissLoading();
				}
			},false);
		}
	}
	countDown(){
		let self = this;
		if(this.countDownTime > 0){
			setTimeout(()=>{
				self.countDownTime --;
				self.translate.get('秒后重新获取').subscribe((res: string) => {
					self.postCodeText = self.countDownTime+' '+res;
				});
				
				self.countDown();
			},1000);
		}
		else{
			this.countDownTime = 60;
			this.isPostCode = false;
			this.postCodeText = '获取验证码';
		}
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
	presentLoading() {
		this.translate.get('请等待...').subscribe((res: string) => {
			this.loader = this.loadingCtrl.create({
				content: res,
				showBackdrop: true,
				dismissOnPageChange: true
			});
			this.loader.present();
		});

	}
	dismissLoading() {
		this.loader.dismiss();
	}
	dismiss() {
		Window.updateVerificationInfo();
		this.viewCtrl.dismiss();
	}
}
