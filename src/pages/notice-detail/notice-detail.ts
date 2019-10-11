import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the NoticeDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-notice-detail',
	templateUrl: 'notice-detail.html',
})
export class NoticeDetailPage {

	constructor(public viewCtrl: ViewController,public navCtrl: NavController, public navParams: NavParams) {}

	public title:string;
	public content:string;
	public createUserLoginName:string;
	public createTime:string;
	ionViewDidLoad() {
		this.title = this.navParams.get('title');
		this.content = this.navParams.get('content');
		this.createUserLoginName = this.navParams.get('createUserLoginName');
		this.createTime = this.navParams.get('createTime');
	}
	dismiss() {
		this.viewCtrl.dismiss();
	}
}
