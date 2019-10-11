import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { SignPage } from '../../pages/sign/sign';
import { ResignPage } from '../../pages/resign/resign';
import { RealnamePage } from '../../pages/realname/realname';
import { OpenAccountPage } from '../../pages/open-account/open-account';
import { WithdrawPage } from '../../pages/withdraw/withdraw';
import { RechargePage } from '../../pages/recharge/recharge';
import { LoadingController } from 'ionic-angular';
declare var Window;

@IonicPage()
@Component({
	selector: 'page-service',
	templateUrl: 'service.html',
})
export class ServicePage {
	private serviceOption = Window.config.service;
	constructor(public loadingCtrl: LoadingController, public _http: HttpServeProvider, public toastCtrl: ToastController,public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController) {
		this.SignPage = SignPage;
		this.ResignPage = ResignPage;
		this.RealnamePage = RealnamePage;
		this.OpenAccountPage = OpenAccountPage;
		this.WithdrawPage = WithdrawPage;
		this.RechargePage = RechargePage;
		const self = this;
	}


	private loader: any;
	private SignPage:any;
	private ResignPage:any;
	private RealnamePage:any;
	private OpenAccountPage:any;
	private WithdrawPage:any;
	private RechargePage:any;

	public openAccountName:string = Window.config.openAccountAgreementName;

	private userValidate:any = {};
	public isSingUp:number = 0;
	ionViewWillEnter() {
		const self = this;
		this.presentLoading("正在获取签约信息...");
		Window.searchUserValidate();
		Window.getSignInfo(function(){
			self.isSingUp = Window.signUpInfo!=undefined?1:2;
			self.dismissLoading();
		});
		this.userValidate = Window.userValidate;

	}
	presentModal(page,other = null) {
		this.presentLoading("正在获取认证信息...");
		const self = this;
		Window.searchUserValidate(function(){
			self.userValidate = Window.userValidate;
			self.dismissLoading();
			if(other == 'sign'){
				if(self.userValidate.realInfo == null){
					self.presentToast('请先上传实名认证资料','toast-red');
					return;
				}
			}
			let modal = self.modalCtrl.create(page);
			modal.onDidDismiss(data => {
				Window.getSignInfo(function(){
					self.isSingUp = Window.signUpInfo?1:2;
				});
			});
			modal.present();
		});
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
	presentLoading(text) {
		this.loader = this.loadingCtrl.create({
			content: text,
			showBackdrop: true,
			duration: 3000
		});
		this.loader.present();
	}
	dismissLoading() {
		this.loader.dismiss();
	}
}
