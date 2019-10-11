import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the NewsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-news',
	templateUrl: 'news.html',
})
export class NewsPage {
	public changeTab:number = 1;
	private newsUrl: any = 'http://news.tradeqq.cn/Appquote/news?l=zh-cn';
	private calendarUrl: any = 'http://news.tradeqq.cn/Appquote/calendar?l=zh-cn';

	constructor(public navCtrl: NavController, public navParams: NavParams, private sanitizer: DomSanitizer) {
		this.newsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.newsUrl);
		this.calendarUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.calendarUrl);
	}
}
