import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";

/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
/****/
declare var Window;
@IonicPage()
@Component({
	selector: 'page-persion-pwd',
	templateUrl: 'persion-pwd.html'
})
export class PersionPwdPage {

	/* 修改密码 变量 */
	private newPwd:string;
	private repeatPwd:string;
	public oldPwd:string = '';

	public postCodeText:string = '获取验证码';
	private isPostCode:boolean = false;
	private countDownTime:number = 60;

	public checkCode:string = '';
	public ways:Array<any> = [];
	public checkWays:any;
	public value:string = '';

	private regPassword = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
	
	public userValidate;

	constructor(public alertCtrl: AlertController,public toastCtrl: ToastController,public http: HttpServeProvider,public navCtrl: NavController, public navParams: NavParams, public translate:TranslateService) {
	}

	ionViewDidLoad() {
		let self = this;
		this.userValidate = Window.userValidate;
		/* 获取可用验证方式 */
		this.http.postJson("client/user/get/ways",{},function(res){
			console.log(res);
			if(res.code == '000000'){
				self.ways = res.ways;
				self.checkWays = self.ways[0].type;
				self.value = self.ways[0].content;
			}
			else{
				self.presentToast(res.message,'toast-red');
			}
		});
	}
	changeCheckWays(){
		this.ways.forEach(x=>{
			if(x.type == this.checkWays){
				this.value = x.content;
			}
		});
	}
	countDown(){
		let self = this;
		if(this.countDownTime > 0){
			setTimeout(()=>{
				self.countDownTime --;
				self.translate.get('秒后可重新获取').subscribe((res: string) => {
					self.postCodeText = self.countDownTime+res;
				});
				self.countDown();
			},1000);
		}
		else{
			this.isPostCode = false;
			this.postCodeText = '重新获取验证码';
		}
	}
	checkedWays(){
		if(this.checkWays == 0){
			let reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); 
			if(this.value == ''){
				this.translate.get('请填写验证邮箱').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
				return false;
			}
			else if(!reg.test(this.value)){
				this.translate.get('验证邮箱格式不正确').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
				return false;
			}
		}
		else if(this.checkWays == 1){
			let reg = new RegExp("^1[3|4|5|7|8][0-9]{9}$"); 
			if(this.value == ''){
				this.translate.get('请填写验证手机').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
				return false;
			}
			else if(!reg.test(this.value)){
				this.translate.get('验证手机格式不正确').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
				return false;
			}
		}
		return true;
	}
	getCheckCode(){
		// if(!this.checkedWays()){
		// 	return;
		// }
		let self = this;
		const body = {
				"validInfo": this.value,
				"validType": this.checkWays,
				"validCodeType": 1
			}
		if(this.isPostCode == false){
			this.isPostCode = true;
			this.http.postJson("client/user/get/validcode",body,function(res){
				console.log(res);
				if(res.code == '000000' && res.success){
					self.translate.get('验证码已发送,请注意查收').subscribe((res: string) => {
						self.presentToast(res,'toast-green');
					});
					self.countDown();
				}
				else{
					self.translate.get('发送失败,请重新尝试').subscribe((res: string) => {
						self.presentToast(res,'toast-red');
					});
					self.isPostCode = false;
				}
			});
		}
	}
	changePwd():void {
		let self = this;
		if(this.checkWays == 'old'){
			if(this.oldPwd == ''){
				this.translate.get('密码不能为空').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
			}
			else if(!this.newPwd){
				this.translate.get('新密码不能为空').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
			}
			else if(this.newPwd.length < 8){
				this.translate.get('登录密码不能小于8位').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
			}
			else if(!this.regPassword.test(this.newPwd)){
				this.translate.get('登录密码格式不正确').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
			}
			else if(this.newPwd != this.repeatPwd){
				this.translate.get('新密码与确认密码不一致').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
			}
			else{
				let body = {
					"type":1,
					"value":this.newPwd,
					"password":this.oldPwd
				};
				this.http.postJson("client/user/edit/key/info",body,function(res){
					if(res.code == '000000'){
						self.showPrompt();
					}
					else{
						self.presentToast(res.message,'toast-red');
					}
				},false);
			}
		}
		else{
			if(!this.newPwd){
				this.translate.get('新密码不能为空').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
			}
			else if(this.newPwd.length < 8){
				this.translate.get('登录密码不能小于8位').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
			}
			else if(!this.regPassword.test(this.newPwd)){
				this.translate.get('登录密码格式不正确').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
			}
			else if(this.newPwd != this.repeatPwd){
				this.translate.get('新密码与确认密码不一致').subscribe((res: string) => {
					this.presentToast(res,'toast-red');
				});
			}
			else{
				let body = {
					"validInfo": this.newPwd,
					"code": this.checkCode,
					"validType": this.checkWays,
					"validCodeType": 1
				};
				/* 个人密码修改 */
				this.http.postJson("client/user/update/key2",body,function(data){
					if(data.code == '000000'){
						self.translate.get('密码修改成功,请重新登录').subscribe((res: string) => {
							self.presentToast(res,'toast-green');
						});
						Window.loginout();
					}
					else{
						self.presentToast(data.message,'toast-red');
					}
					self.newPwd = '';
					self.repeatPwd = '';
				})
			}
		}
	}
	//文字翻译转换
	translateText(text:string){
		let str:string;
		this.translate.get(text).subscribe((res: string) => {
			str = res;
		});
		return str;
	}
	presentToast(text,color) {
		let toast = this.toastCtrl.create({
			message: text,
			closeButtonText: this.translateText('确定'),
			position: 'top',
			duration: 3000,
			showCloseButton: true,
			cssClass:color
			
		});
		toast.present();
	}
	showPrompt() {
		const prompt = this.alertCtrl.create({
			title: this.translateText('提示'),
			message: this.translateText("密码修改成功,请重新登录"),
			buttons: [
				{
					text: this.translateText('确定'),
					handler: data => {
						Window.currentClassifyA = undefined;
						Window.currentClassifyB = undefined;
						Window.loginout();
					}
				}
			]
		});
		prompt.present();
	}
}
