import { Component } from '@angular/core';
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
declare var Window,indexLibrary;
/**
 * Generated class for the CapitalComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
	selector: 'capital',
	templateUrl: 'capital.html'
})
export class CapitalComponent {
	private connection;

	/* 币种组列表 */
	public currencyGroupList:any;
	public currencyGroupId:string;
	public persionInfo:any = [];
	constructor(private socket:SocketServeProvider,public _http: HttpServeProvider) {
		const self = this;
		Window.clearCaptial = function(){
			self.socket.rejucePersonalGold();
			if(self.connection){
				self.connection.unsubscribe();
			}
		}
	}
	ngOnInit() {
		const self = this;
		/* 获取用户账户币种组 */
		this._http.postJson("client/config/currency/group/query/by/user",{},function(res){
			self.currencyGroupList = JSON.parse(res.content);
			self.currencyGroupId = self.currencyGroupList[0].currencyGroupId;
			self.connection = self.socket.getAccount().subscribe(res => {
				let data = JSON.parse(res);
				if(data.currencyGroup == null){
					return;
				}
				if(data.currencyGroup[self.currencyGroupId]){
					const tmp = data.currencyGroup[self.currencyGroupId].XXXXX.split('|');
					self.persionInfo = {
						"balance": tmp[0],
						"canOutAcount": tmp[1],
						"credited": tmp[2],
						"currency": tmp[3],
						"currencyGroupId": tmp[4],
						"currencyGroupName": tmp[5],
						"deposit": tmp[6],
						"floatProfit": tmp[7],
						"freeze": tmp[8],
						"inOut": tmp[9],
						"ining": tmp[10],
						"netWorth": tmp[11],
						"outing": tmp[12],
						"riskCtrlState": tmp[13],
						"riskRate": tmp[14],
						"safety": tmp[15],
						"selfRiskRate": tmp[16],
						"selfremain": tmp[17],
						"threshold": tmp[18],
						"usableDeposit": tmp[19]
					}
					if(self.persionInfo.riskRate<1000000){
						self.persionInfo.riskRate = indexLibrary.formatFloat(self.persionInfo.riskRate,3) + '%';
					}
					else{
						self.persionInfo.riskRate = '安全';
					}
				}
			});
		});
	}
}
