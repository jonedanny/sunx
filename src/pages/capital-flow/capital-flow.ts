import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertComponent } from '../../components/alert/alert';

/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
/****/
declare var Window;
@IonicPage()
@Component({
  selector: 'page-capital-flow',
  templateUrl: 'capital-flow.html',
})
export class CapitalFlowPage {
	@ViewChild(AlertComponent) child: AlertComponent;
	public currencyJson;
	constructor(public navCtrl: NavController, public navParams: NavParams,public http: HttpServeProvider) {
		this.requestCapital();
		this.currencyJson = Window.currencyJson;
	}

	/* 资金查询分页 变量 */
	private capitalPage:number = 1;
	private capitalRows:number = 30;
	private capitalList:Array<any> = [];

	private requestCapital() {
		let body = {
			page:this.capitalPage,
			rows:this.capitalRows,
			order:'desc',
			sort:'createTime'
		};
		let _that = this;
		/* 资金流水查询 */
		this.http.postForm("client/fsr/cam/accountIo/page",body,function(res){
			if(res.code == '000000'){
				let data = JSON.parse(res.content).content;
				console.log(data);
				if(_that.capitalList.length == 0){
					_that.capitalList = data;
				}
				else{
					_that.capitalList = _that.capitalList.concat(data);
				}
				console.log(_that.capitalList);
				if(_that.capitalList.length > 0 && data.length == 0){
					_that.child.alertMsg('已加载至最后一页');
				}
			}
		})
	}

	doRefresh(refresher) {
		this.capitalList = [];
		this.capitalPage = 1;
		this.requestCapital();
		setTimeout(() => {
			console.log('Async operation has ended');
			refresher.complete();
		}, 1000);
	}
	doInfinite(infiniteScroll) {
		console.log('Begin async operation');
		this.capitalPage++;
		this.requestCapital();
		setTimeout(() => {
			console.log('Async operation has ended');
			infiniteScroll.complete();
		}, 1000);
	}
	ionViewDidLoad() {
		console.log('ionViewDidLoad CapitalFlowPage');
	}
	changeCurrencyText(num){
		for(let i=0,r=this.currencyJson.length;i<r;i++){
			if(this.currencyJson[i].currency == num){
				return this.currencyJson[i].currencyName;
			}
		}
	}
	ioTypeChange(code){
		switch(code){
			case 1:
				return '汇入';
			case -1:
				return '汇出';
		}
	}
	flowTypeChange(code){
		switch(code){
			case 0:
				return '出入金流水';
			case 2:
				return '资金内部自动转换';
			case 3:
				return '银行调账流水';
			case 4:
				return '资金冻结解冻流水';
			case 5:
				return '盈亏流水';
			case 6:
				return '仓息流水';
			case 7:
				return '手续费流水';
		}
	}
	flowStateChange(code){
		switch(code){
			case 0:
				return '待审核';
			case 8888:
				return '无效流水';
			case 9999:
				return '有效流水';
		}
	}
}
