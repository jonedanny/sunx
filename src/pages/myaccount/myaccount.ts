import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ModalController,ToastController,AlertController } from 'ionic-angular';
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { CapitalFlowPage } from "../capital-flow/capital-flow";
import { GoldPwdPage } from '../gold-pwd/gold-pwd';
import { CurrencyDetailPage } from '../currency-detail/currency-detail';
import { VerificationModePage } from '../verification-mode/verification-mode';
import { OpenAccountPage } from '../open-account/open-account';
import { SignPage } from '../../pages/sign/sign';
import { ResignPage } from '../../pages/resign/resign';
import { WithdrawPage } from '../../pages/withdraw/withdraw';
import { RechargePage } from '../../pages/recharge/recharge';
import { PersionPwdPage } from '../../pages/persion-pwd/persion-pwd';
import { DisclaimerPage } from '../../pages/disclaimer/disclaimer';
import { NoticePage } from '../../pages/notice/notice';
import { RealnamePage } from '../../pages/realname/realname';
import { TranslateService } from "@ngx-translate/core";

/**
 * Generated class for the MyaccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var Window,window,indexLibrary;
@IonicPage()
@Component({
  selector: 'page-myaccount',
  templateUrl: 'myaccount.html'
})
export class MyaccountPage {
	/* 获取实名信息 */
	public userValidate = Window.userValidate;
	constructor(public toastCtrl: ToastController,private alertCtrl: AlertController,public _http: HttpServeProvider,public modalCtrl: ModalController,public navCtrl: NavController, public navParams: NavParams, private socket:SocketServeProvider, public translate:TranslateService) {
		Window.updateVerificationInfo = () => {
			setTimeout(()=>{
				Window.searchUserValidate(() => {
					if(!Window.userValidate){
						Window.updateVerificationInfo();
						return;
					}
					this.userValidate = Window.userValidate;
					console.log(Window.userValidate);
				});
			},200);
		}
	}
	public openAccountName:string = Window.config.openAccountAgreementName;
	private connection = null;
	public userInfo = [];
	/* 币种组列表 */
	public currencyGroupList:any;
	public currencyGroupId:string;
	public persionInfo:any = [];

	viewDetail() {
		this.presentModal(CurrencyDetailPage,{currencyGroupId:this.currencyGroupId});
	}
	viewVerification(params) {
		this.presentModal(VerificationModePage,{type:params});
	}
	openAccount() {
		this.presentModal(OpenAccountPage,{});
	}
	turnPage(page) {
		switch (page) {
			case "CapitalFlowPage":
				this.navCtrl.push(CapitalFlowPage);
				break;
			case "GoldPwdPage":
				this.navCtrl.push(GoldPwdPage);
				break;
			case "PersionPwdPage":
				this.navCtrl.push(PersionPwdPage);
				break;
			case "NoticePage":
				this.navCtrl.push(NoticePage);
				break;
			case "DisclaimerPage":
				this.navCtrl.push(DisclaimerPage);
				break;
			case "RealnamePage":
				this.navCtrl.push(RealnamePage);
				break;
			case "LoginPage":
				Window.currentClassifyA = undefined;
				Window.currentClassifyB = undefined;
				Window.changeUser = false;
				this.socket.firstConnect = '';
				Window.loginout();
				break;
		}
	}
	public signUpInfo:any;
	//银行卡 判断是否初次 跳转对应页面
	changeBankCard(type:number) {
		const self = this;
		if(Window.userInfo.userState == -2){
			this.translate.get('请先通过开户审核').subscribe((res: string) => {
				this.presentToast(res,'toast-red');
			});
			return;
		}
		if(type === 1){
			self.presentModal(SignPage,{});
		}
		else{
			self.presentModal(ResignPage,{});
		}
	}
	//充值 提现
	traderMoney(type:number) {
		const self = this;
		// if(!Window.signUpInfo){
		// 	self.presentToast('请先绑定银行卡','toast-red');
		// 	return;
		// }
		if(type === 1){
			self.presentModal(RechargePage,{url: Window.config.rechargeUrl});
		}
		else{
			self.presentModal(WithdrawPage,{url: Window.config.withdrawUrl});
			// self.presentModal(WithdrawPage,{});
		}
	}
	ionViewDidEnter() {
		let self = this;
		//获取签约信息
		Window.updateSignInfo = function(){
			Window.getSignInfo(function(){
				setTimeout(()=>{
					self.signUpInfo = Window.signUpInfo;
				},200);
			});
		}
		self.signUpInfo = Window.signUpInfo;
		Window.updateVerificationInfo();
		this.socket.addPersonalGold();
		
		this.userInfo = Window.userInfo;
		/* 获取用户账户币种组 */
		this._http.postJson("client/config/currency/group/query/by/user",{},function(res){
			self.currencyGroupList = JSON.parse(res.content);
			self.currencyGroupId = self.currencyGroupList[0].currencyGroupId;
			self.connection = self.socket.getAccount().subscribe(res => {
				let data = JSON.parse(res);
				if(data.currencyGroup == null){
					return;
				}
				if(data.currencyGroup[self.currencyGroupId]){
					const tmp = data.currencyGroup[self.currencyGroupId].XXXXX.split('|');
					self.persionInfo = {
						"balance": tmp[0],
						"canOutAcount": tmp[1],
						"credited": tmp[2],
						"currency": tmp[3],
						"currencyGroupId": tmp[4],
						"currencyGroupName": tmp[5],
						"deposit": tmp[6],
						"floatProfit": tmp[7],
						"freeze": tmp[8],
						"inOut": tmp[9],
						"ining": tmp[10],
						"netWorth": tmp[11],
						"outing": tmp[12],
						"riskCtrlState": tmp[13],
						"riskRate": tmp[14],
						"safety": tmp[15],
						"selfRiskRate": tmp[16],
						"selfremain": tmp[17],
						"threshold": tmp[18],
						"usableDeposit": tmp[19]
					}
					if(self.persionInfo.riskRate<1000000){
						self.persionInfo.riskRate = indexLibrary.formatFloat(self.persionInfo.riskRate,3) + '%';
					}
					else{
						self.persionInfo.riskRate = '安全';
					}
				}
			});
		});
	}
	/* 语言选择 */
	languageOpen = false;
	languageResult: any;
	language() {
		let alert = this.alertCtrl.create();
		const historyLanguage:string = localStorage.getItem('language')?localStorage.getItem('language'):'zh';
		alert.addInput({
			type: 'radio',
			label: '中文简体',
			value: 'zh',
			checked: historyLanguage === 'zh'?true:false
		});

		alert.addInput({
			type: 'radio',
			label: '中文繁体',
			value: 'hk',
			checked: historyLanguage === 'hk'?true:false
		});

		alert.addInput({
			type: 'radio',
			label: 'English',
			value: 'en',
			checked: historyLanguage === 'en'?true:false
		});
		this.translate.get('取消').subscribe((res: string) => {
			alert.addButton(res);
		});
		this.translate.get('确定').subscribe((res: string) => {
			alert.addButton({
				text: res,
				handler: (data: any) => {
					console.log('language data:', data);
					window.changeLanguage(data);
					this.languageOpen = false;
					this.languageResult = data;
				}
			});
		});


		alert.present();
	}
	ionViewWillLeave() {
		this.socket.rejucePersonalGold();
		if(this.connection){
			this.connection.unsubscribe();
			this.connection = null;
		}
	}
	presentModal(page,json) {
		let modal = this.modalCtrl.create(page,json);
		modal.present();
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
