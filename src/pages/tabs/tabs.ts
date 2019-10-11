import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import { DatareportPage } from '../datareport/datareport';
import { MyaccountPage } from '../myaccount/myaccount';
import { NewsPage } from '../news/news';
import { SelfContactPage } from '../self-contact/self-contact';
import 'rxjs/add/operator/map';

@Component({
	templateUrl: 'tabs.html'
})
export class TabsPage {
	tabRoots: Object[];
	constructor() {
		this.tabRoots = [
			{
				root: HomePage,
				tabTitle: '行情',
				tabIcon: 'globe'
			},
			{
				root: SelfContactPage,
				tabTitle: '自选',
				tabIcon: 'add-circle'
			},
			{
				root: DatareportPage,
				tabTitle: '交易',
				tabIcon: 'flash'
			},
			{
				root: MyaccountPage,
				tabTitle: '账户',
				tabIcon: 'contact'
			}
		];
	}
}
