import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ToastController } from 'ionic-angular';
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { LoginPage } from '../login/login';
import { TranslateService } from "@ngx-translate/core";

/**
 * Generated class for the ForgetPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-forget-password',
	templateUrl: 'forget-password.html',
})
export class ForgetPasswordPage {
	constructor(public toastCtrl: ToastController,public loadingCtrl: LoadingController,public _http: HttpServeProvider,public navCtrl: NavController, public navParams: NavParams, public translate:TranslateService) {
	}
	public step:number = 1;
	public orgCode:string = '';
	public loginInfo:string = '';

	public postCodeText:string = '获取验证码';
	private isPostCode:boolean = false;
	private countDownTime:number = 60;

	public checkCode:string = '';
	public newPWD:string = '';
	public repeatNewPWD:string = '';
	public ways:Array<any> = [];
	public checkWays:any;

	/* 验证正则 */
	private regPassword = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;

	ionViewDidLoad() {
		console.log('ionViewDidLoad ForgetPasswordPage');
	}
	countDown(){
		if(this.countDownTime > 0){
			setTimeout(()=>{
				this.countDownTime --;
				this.translate.get('秒后重新获取').subscribe((res: string) => {
					this.postCodeText = this.countDownTime+res;
					this.countDown();
				});
			},1000);
		}
		else{
			this.isPostCode = false;
			this.translate.get('重新获取验证码').subscribe((res: string) => {
				this.postCodeText = res;
			});
		}
	}
	getCheckCode(){
		let self = this;
		const body = {
				"orgNum": this.orgCode,
				"loginName": this.loginInfo,
				"validType": this.checkWays
			}
		if(this.isPostCode == false){
			this.isPostCode = true;
			this._http.postJson("client/user/forget/resetpwd/validcode",body,(res:any)=>{
				console.log(res);
				if(res.code == '000000' && res.success){
					this.translate.get('验证码已发送,请注意查收').subscribe((res: string) => {
						this.presentToast(res,'toast-green');
						this.countDown();
					});
					
				}
				else{
					this.translate.get('发送失败,请重新尝试').subscribe((res: string) => {
						this.presentToast(res,'toast-red');
						this.isPostCode = false;
					});
				}
			});
		}
	}
	step1(){
		if(this.orgCode == ''){
			this.translate.get('机构代码不能为空').subscribe((res: string) => {
				this.presentToast(res,'toast-red');
			});
		}
		else if(this.loginInfo == ''){
			this.translate.get('登录信息不能为空').subscribe((res: string) => {
				this.presentToast(res,'toast-red');
			});
		}
		else{
			let self = this;
			let body = {
				"orgNum": this.orgCode,
				"loginName": this.loginInfo
			}
			this.presentLoading();
			this._http.postJson("client/user/forget/resetpwd/ways",body,function(res){
				console.log(res);
				if(res.code == '000000'){
					self.ways = res.ways;
					self.checkWays = self.ways[0].type;
					self.step = 2;
				}
				else{
					self.presentToast(res.message,'toast-red');
				}
			});
		}
	}
	step2(){
		if(this.checkCode == ''){
			this.translate.get('验证码不能为空').subscribe((res: string) => {
				this.presentToast(res,'toast-red');
			});
		}
		else if(this.newPWD.length < 8){
			this.translate.get('新密码不能小于8位').subscribe((res: string) => {
				this.presentToast(res,'toast-red');
			});
		}
		else if(!this.regPassword.test(this.newPWD)){
			this.translate.get('新密码格式不正确').subscribe((res: string) => {
				this.presentToast(res,'toast-red');
			});
		}
		else if(this.newPWD !== this.repeatNewPWD){
			this.translate.get('2次密码输入不一致').subscribe((res: string) => {
				this.presentToast(res,'toast-red');
			});
		}
		else{
			let body = {
				"orgNum": this.orgCode,
				"loginName": this.loginInfo,
				"validType": this.checkWays,
				"code": this.checkCode,
  				"password": this.newPWD
			}
			this.presentLoading();
			this._http.postJson("client/user/forget/resetpwd",body,(res:any)=>{
				if(res.code == '000000'){
					this.translate.get('密码修改成功,请重新登录').subscribe((res: string) => {
						this.presentToast(res,'toast-green');
					});
					this.navCtrl.setRoot(LoginPage);
				}
				else{
					this.presentToast(res.message,'toast-red');
				}
			});
		}
	}
	presentLoading() {
		this.translate.get('请等待...').subscribe((res: string) => {
			let loader = this.loadingCtrl.create({
				content: res,
				duration: 1000
			});
			loader.present();
		});
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
