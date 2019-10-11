import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { ProductdetailPage } from '../../pages/productdetail/productdetail';
declare var Window,window,store,indexLibrary;
/**
 * Generated class for the SelfContactPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-self-contact',
	templateUrl: 'self-contact.html'
})
export class SelfContactPage {

	constructor(public _http: HttpServeProvider,private socket:SocketServeProvider,public navCtrl: NavController, public navParams: NavParams) {

	}
	/* 自选合约列表 */
	public selfContractList:Array<any> = [];
	/* 行情订阅列表 */
	private contractSubscribeList:Array<any> = [];
	private connection;
	configFavoritesNav = Window.config.favoritesNav;
	ionViewDidEnter() {
		this.getLocalSelfContractData();
		this.connection = this.socket.getPriceMb2().subscribe(data => {
			if(this.selfContractList.length > 0){
				for(let i=0,r=this.selfContractList.length;i<r;i++){
					if(this.selfContractList[i].productId == data[0]){
						if(this.currentCommodityType === 4){
							this.selfContractList[i].QBidPrice = data[4][0] || 0;
							this.selfContractList[i].QAskPrice = data[6][0] || 0;
							// const tmp_dc = indexLibrary.Subtr(this.selfContractList[i].QAskPrice,this.selfContractList[i].QBidPrice)/this.selfContractList[i].unionMinPrices;
							// this.selfContractList[i].cfd = indexLibrary.formatFloat(window.Math.abs(tmp_dc),0);
							this.selfContractList[i].QHighPrice = data[12];
							this.selfContractList[i].QLowPrice = data[13];
							this.selfContractList[i].QLastPrice = data[2];
						}
						else{
							this.selfContractList[i].QLastPrice = data[2];
							this.selfContractList[i].QChangeRate = indexLibrary.formatFloat(data[22],3);
							this.selfContractList[i].QAskQty = data[6][0] || 0;
							this.selfContractList[i].QBidQty = data[4][0] || 0;

							if(this.selfContractList[i].oldPrice !== data[2]){
								this.selfContractList[i].oldPriceChange = (this.selfContractList[i].oldPriceChange == 1)?2:1;
								this.selfContractList[i].oldPrice = data[2];
							}
							if(data[22] > 0){
								this.selfContractList[i].color = 'red';
							}
							else if(data[22] < 0){
								this.selfContractList[i].color = 'green';
							}
							else{
								this.selfContractList[i].color = '';
							}
						}
						break;
					}
				}
			}
		});
	}
	/* 初始化获取本地记录的自选数据 */
	public currentCommodityType:number = Window.selfContactNav==undefined?0:Window.selfContactNav;
	getLocalSelfContractData() {
		/* 初始化数组 */
		Window.selfContactNav = this.currentCommodityType;
		this.socket.rejuceProListMb2Delay(Window.showProList);
		this.selfContractList = [];
		this.contractSubscribeList = [];

		this.contractSubscribeList = JSON.parse(store.get(Window.userInfo.userId));
		if(this.contractSubscribeList == null){
			return;
		}
		let classContract = [];
		for(let i=0,r=Window.allProductList.length;i<r;i++){
			if(this.contractSubscribeList.indexOf(Window.allProductList[i].productId) >=0 && Window.allProductList[i].commodityType == this.currentCommodityType){
				this.selfContractList.push(Window.allProductList[i]);
				classContract.push(Window.allProductList[i].productId);
			}
		}
		console.log('[当前显示的自选合约列表]',this.selfContractList);
		Window.showProList = classContract;
		Window.productList = this.selfContractList;

		this.socket.addProListMb2Delay(classContract);
	}
	ionViewWillLeave() {
		this.socket.rejuceProListMb2Delay(Window.showProList);
		if(this.connection){
			this.connection.unsubscribe();
		}
	}
	toProDetail(data) {
		console.log(data.productId);
		Window.nowProId = data.productId;
		Window.productdetailRecourse = 'SelfContactPage';
		localStorage.setItem('proDetailCommodityType',this.currentCommodityType.toString());
		this.navCtrl.push(ProductdetailPage);
	}
}
