import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Platform} from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
/****/
declare var Window,window;
@IonicPage()
@Component({
	selector: 'page-realname',
	templateUrl: 'realname.html',
})
export class RealnamePage {
	constructor(
			public loadingCtrl: LoadingController,
			public toastCtrl: ToastController,
			public navCtrl: NavController,
			public navParams: NavParams,
			public platform: Platform,
			public http: HttpServeProvider
		) {

	}

	public config = null;
	public data = null;
	private loader:any;
	public groupImg = {
		certificateA: `${Window.currentLine.webUrl}api/v1/crm/tmpdownload/${window.openAccountId}/1?time=${new Date().getTime()}`,
		certificateB: `${Window.currentLine.webUrl}api/v1/crm/tmpdownload/${window.openAccountId}/2?time=${new Date().getTime()}`,
		certificateC: `${Window.currentLine.webUrl}api/v1/crm/tmpdownload/${window.openAccountId}/3?time=${new Date().getTime()}`,
		certificateD: `${Window.currentLine.webUrl}api/v1/crm/tmpdownload/${window.openAccountId}/5?time=${new Date().getTime()}`
	}
	ionViewDidLoad() {
		this.presentLoading('正在加载注册页面 ...');
		this.config = {
			certificateA: Window.config.contactChannel.certificateA,
			certificateB: Window.config.contactChannel.certificateB,
			certificateC: Window.config.contactChannel.certificateC,
			certificateD: Window.config.contactChannel.certificateD
		};
		// 获取实名数据
		this.http.get('api/v1/crm/personalInfo',(res) => {
			this.data = res.content;
			console.log(this.data);
			this.dismissLoading();
		});
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
}
