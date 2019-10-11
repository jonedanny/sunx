import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';


/**
 * Generated class for the SubBankPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-sub-bank',
	templateUrl: 'sub-bank.html',
})
export class SubBankPage {
	subBank: any;
	data: any;
	constructor(public viewCtrl: ViewController, params: NavParams) {
		
		this.subBank = params.get('subBank');
		if(this.subBank){
			for(let i = 0, r = this.subBank.length; i < r; i++){
				this.subBank[i].display = true;
			}
		}
		
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad SubBankPage');
	}

	getItems(ev: any) {
		const val = ev.target.value;
		for(let i = 0, r = this.subBank.length; i < r; i++){
			if(this.subBank[i].bankName.indexOf(val) === -1){
				this.subBank[i].display = false;
			}
			else{
				this.subBank[i].display = true;
			}
		}
	}
	choose(item) {
		this.data = item;
		this.dismiss();
	}
	dismiss() {
		this.viewCtrl.dismiss(this.data);
	}
}
