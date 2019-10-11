import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { NoticeDetailPage } from '../notice-detail/notice-detail';
/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
/****/
/**
 * Generated class for the NoticePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-notice',
	templateUrl: 'notice.html',
})
export class NoticePage {

	constructor(public modalCtrl: ModalController,public _http: HttpServeProvider,public navCtrl: NavController, public navParams: NavParams) {

	}
	/* 公告列表 */
	public noticeList = [];
	ionViewDidLoad() {
		this.getNoticeList();
	}
	getNoticeList(){
		const self = this;
		this._http.postForm("notice/query/by/user",{page:1,rows:99},function(res){
			const data = JSON.parse(res.content);
			console.log(data);
			self.noticeList = data.content;
		});
	}
	isRead(id){
		const self = this;
		this._http.postJson("notice/read",{key:id},function(res){
			self.getNoticeList();
		});
	}
	doRefresh(refresher){
		this.getNoticeList();
		setTimeout(() => {
			refresher.complete();
		},1000);
	}
	presentProfileModal(title,content,resource,time,read,noticeId) {
		if(read == 0){
			this.isRead(noticeId);
		}
		let profileModal = this.modalCtrl.create(
				NoticeDetailPage,
				{
					title: title,
					content: content,
					createUserLoginName: resource,
					createTime: time
				}
			);
		profileModal.present();
	}
}
