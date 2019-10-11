import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, ToastController } from 'ionic-angular';
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
declare var Window,$:any;
@IonicPage()
@Component({
  selector: 'page-sign',
  templateUrl: 'sign.html',
})
export class SignPage {
	private loader: any;
	/* 验证正则 */
	private regPhone = /^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/;
	private regPassword = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
	constructor(public toastCtrl: ToastController,public loadingCtrl: LoadingController, public _http: HttpServeProvider, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
	}

	public name:string;
	public certificateNo:string;
	public phone:string;
	public cardNo:any;
	public accountPassword:string = '';
	public repeatAccountPassword:string = '';
	public Province:any;
	public ProvinceChoose:any = '';
	public City:any;
	public CityChoose:any = '';
	public Bank:any;
	public BankChoose:any = '';
	public subBank:any;
	public subBankChoose:any = '';

	ionViewWillEnter() {
		this.getProvince();
		this.getBank();
	}
	/* 获取省份 */
	getProvince() {
		const self = this;
		this._http.postJson("mss/query/all/province",{},function(res){
			if(res.code == '000000'){
				const data = JSON.parse(res.content);
				self.Province = data;
			}
		},false);
	}
	/* 获取城市 */
	getCity() {
		this.subBankChoose = '';
		this.subBank = [];
		this.CityChoose = '';
		const self = this;
		this._http.postForm("mss/query/city/by/provinceId",{search_EQ_fatherCityId:this.ProvinceChoose},function(res){
			if(res.code == '000000'){
				const data = JSON.parse(res.content);
				self.City = data;
			}
		},false);
	}
	/* 获取银行 */
	getBank() {
		this.subBankChoose = '';
		const self = this;
		this._http.postForm("bank/area/mainbank",{},function(res){
			if(res.code == '000000'){
				const data = JSON.parse(res.content);
				self.Bank = data;
			}
		},false);
	}
	/* 获取支行 */
	getSubBank() {
		if(this.CityChoose == ''){
			return;
		}
		this.subBankChoose = '';
		const self = this;
		this._http.postForm("bank/area/bankname",{search_LLIKE_bankNo:this.BankChoose+this.CityChoose},function(res){
			if(res.code == '000000'){
				const data = JSON.parse(res.content);
				self.subBank = data;
			}
		},false);
	}
	toSign() {
		if(!this.regPhone.test(this.phone)){
			this.presentToast('手机格式错误','toast-red');
			return;
		}
		else if(this.name == ''){
			this.presentToast('请输入开户姓名','toast-red');
			return;
		}
		else if(this.certificateNo == ''){
			this.presentToast('请输入证件号码','toast-red');
			return;
		}
		else if(this.cardNo == ''){
			this.presentToast('请输入银行卡号','toast-red');
			return;
		}
		else if(this.ProvinceChoose == ''){
			this.presentToast('请选择所属省份','toast-red');
			return;
		}
		else if(this.CityChoose == ''){
			this.presentToast('请选择所属城市','toast-red');
			return;
		}
		else if(this.BankChoose == ''){
			this.presentToast('请选择银行名称','toast-red');
			return;
		}
		else if(this.subBankChoose == ''){
			this.presentToast('请选择支行名称','toast-red');
			return;
		}
		else if(!this.regPassword.test(this.accountPassword)){
			this.presentToast('资金密码格式不正确','toast-red');
			return;
		}
		else if(this.accountPassword !== this.repeatAccountPassword){
			this.presentToast('2次密码输入不一致','toast-red');
			return;
		}
		let custBank;
		for(let i=0,r=this.Bank.length;i<r;i++){
			if(this.Bank[i].bankCode == this.BankChoose){
				custBank = this.Bank[i].id;
				break;
			}
		}
		const self = this;
		const body = {
			"signUpV": {
				"userId": Window.userInfo.userId,
				"custName": this.name,
				"cardNo": this.cardNo,
				"cardName": this.name,
				"identityCard": this.certificateNo,
				"mobile": this.phone,
				"custBank": custBank,
				"recvTgfi": this.subBankChoose,
				"recvBankNm": $('.subBank .select-text').text(),
				"accountPassword": this.accountPassword,
				"repeatAccountPassword": this.repeatAccountPassword
			}
		}
		this.presentLoading();
		this._http.postJson("client/3.1/attaccount/sign/on",body,function(res){
			if(res.code == '000000'){
				self.presentToast('绑定成功','toast-green');
				Window.updateSignInfo();
				self.dismiss();
			}
			else{
				self.presentToast(res.message,'toast-red');
			}
			self.dismissLoading();
		},false)
	}
	dismiss() {
		Window.searchUserValidate();
		this.viewCtrl.dismiss();
	}
	presentLoading() {
		this.loader = this.loadingCtrl.create({
			content: "请稍等 ...",
			showBackdrop: true,
			dismissOnPageChange: true,
			duration: 3000
		});
		this.loader.present();
	}
	dismissLoading() {
		this.loader.dismiss();
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
