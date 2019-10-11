import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController, LoadingController } from 'ionic-angular';
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { TranslateService } from "@ngx-translate/core";
declare var Window;

@IonicPage()
@Component({
	selector: 'page-currency-detail',
	templateUrl: 'currency-detail.html',
})
export class CurrencyDetailPage {
	private loader:any;
	public currencyGroupId;
	private connection;
	public currencyList:Array<any> = [];
	public currencyJson;
	public hasData:boolean = false;
	constructor(public translate:TranslateService, public loadingCtrl: LoadingController, public navCtrl: NavController, public params: NavParams,private socket:SocketServeProvider,public viewCtrl: ViewController) {
		this.currencyGroupId = params.get('currencyGroupId');
		this.currencyJson = Window.currencyJson;
		this.presentLoading();
	}

	ionViewDidEnter() {
		console.log(this.currencyGroupId);
		this.currencyList = [];
		this.connection = this.socket.getAccount().subscribe(res => {
			this.dismissLoading();
			let data = JSON.parse(res.toString()).currencyAccounts;
			this.currencyList = [];
			if(this.currencyList.length == 0){
				for(let i in data){
					const tmp = data[i].XXXXX.split('|');
					const tmpJson = {
						"accountId": tmp[0],
						"credited": tmp[1],
						"currency": tmp[2],
						"currencyGroupId": tmp[3],
						"deposit": tmp[4],
						"floatProfit": tmp[5],
						"freeze": tmp[6],
						"inOut": tmp[7],
						"ining": tmp[8],
						"outing": tmp[9],
						"remain": tmp[10],
						"selfremain": tmp[11],
						"threshold": tmp[12]
					};
					if(tmpJson.currencyGroupId == this.currencyGroupId){
						this.currencyList.push(tmpJson);
						this.hasData = false;
					}
				}
				console.log(this.currencyList)
			}
		});
		window.setTimeout(()=>{
			if(this.currencyList.length == 0){
				this.hasData = true;
			}
		},1500);
	}
	changeCurrencyText(num){
		for(let i=0,r=this.currencyJson.length;i<r;i++){
			if(this.currencyJson[i].currency == num){
				return this.currencyJson[i].currencyName;
			}
		}
	}
	ionViewWillLeave() {
		this.connection.unsubscribe();
	}
	dismiss() {
		this.viewCtrl.dismiss();
	}
	presentLoading() {
		if(!this.loader){
			this.translate.get('请等待...').subscribe((res: string) => {
				this.loader = this.loadingCtrl.create({
					content: res,
					showBackdrop: true,
					duration: 3000
				});
				this.loader.present();
			});
		}
	}
	dismissLoading() {
		if(this.loader){
	        this.loader.dismiss();
	        this.loader = null;
	    }
	}
}
