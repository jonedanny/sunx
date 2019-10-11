import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Navbar, LoadingController, Platform, ToastController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from "@ngx-translate/core";

declare var Window,window,$:any;
@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
	@ViewChild(Navbar) navbar: Navbar;
	iframe: any = null;
	private loader:any;
	constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, public platform: Platform, public translate: TranslateService, public navCtrl: NavController, public navParams: NavParams, private sanitizer: DomSanitizer) {

	}
	private reback = () =>{
		this.navCtrl.pop();
	}
	ionViewDidEnter() {
		this.presentLoading('正在加载注册页面 ...');
		let info = this.navParams.get('info');
		let status = this.navParams.get('status');
		const time = Date.parse(new Date().toString());
		if(info) {
			info.status = status;
			info.time = time;
			info.supportEmail = Window.config.contactChannel.email;
			info.supportPhone = Window.config.contactChannel.phone;

			info.certificateA = Window.config.contactChannel.certificateA;
			info.certificateB = Window.config.contactChannel.certificateB;
			info.certificateC = Window.config.contactChannel.certificateC;
			info.certificateD = Window.config.contactChannel.certificateD;
			info.needUserName = Window.config.contactChannel.needUserName;
			info.token = Window.token;

			info = encodeURI(JSON.stringify(info));
			this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(`${Window.currentLine.webUrl.replace('trade/','')}${Window.config.registerUrl}?params=${info}`);
		}
		else{
			Window.token = null;
			const res = {
				time: time,
				supportEmail: Window.config.contactChannel.email,
				supportPhone: Window.config.contactChannel.phone,
				certificateA: Window.config.contactChannel.certificateA,
				certificateB: Window.config.contactChannel.certificateB,
				certificateC: Window.config.contactChannel.certificateC,
				certificateD: Window.config.contactChannel.certificateD,
				needUserName: Window.config.contactChannel.needUserName,
				token: Window.token
			};
			const _res = encodeURI(JSON.stringify(res));
			this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(`${Window.currentLine.webUrl.replace('trade/','')}${Window.config.registerUrl}?params=${_res}`);
		}
		// 判断iframe是否加载完成
		setTimeout(() => {
			const iframe: any = document.getElementById('register');
			iframe.onload  = () => {
				this.dismissLoading();
				if(this.platform.is('ios')){
					const height = $(window).height();
					$('#register').css("height",`${height}px`);
				}
			}
		},100);
		window.addEventListener("message",this.reback,false);
	}
	ionViewWillUnload() {
		this.iframe = null;
		window.removeEventListener("message",this.reback,false);
	}
	presentLoading(text) {
		this.loader = this.loadingCtrl.create({
			content: text,
			showBackdrop: true,
			duration: 5000
		});
		this.loader.present();
	}
	dismissLoading() {
		this.loader.dismiss();
	}
	presentToast(text,color = '') {
		let toast = this.toastCtrl.create({
			message: text,
			position: 'top',
			duration: 3000,
			showCloseButton: true,
			cssClass:color,
			closeButtonText: this.translateText('确定')
		});
		toast.present();
	}
	//翻译
	translateText(text){
		let result:any;
		console.log(text);
		this.translate.get(text).subscribe((res: string) => {
			result = res;
		});
		return result;
	}
}
