import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { DomSanitizer } from '@angular/platform-browser';
import * as math from "mathjs"
declare var Window,window,indexLibrary;

@IonicPage()
@Component({
	selector: 'page-recharge',
	templateUrl: 'recharge.html',
})
export class RechargePage {
	public CreditRuleUrl:any = null;
	public isWeb:boolean = false;
	public config =  Window.config;
	constructor(private sanitizer: DomSanitizer, private alertCtrl: AlertController, public loadingCtrl: LoadingController, public toastCtrl: ToastController, public _http: HttpServeProvider, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
		const url = navParams.get('url');
		if(typeof(url) === 'string'){
			this.isWeb = true;
			this.CreditRuleUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
		}
	}
	
	private loader:any;
	public rechargeWays = [];
	public rechargeChoose = '';
	public bankList = [];
	public bankChoose = '';
	public originCash:number = 0;

	/* 支付方式 */
	public payWays:string = '-1';
	public outputWays = [];
	public hasWays:boolean = false;
	private bankCode:number;
	public hasBank:boolean = false;

	/* 查询充值源币种 */
	//ioType: 出金 -1，入金 1
	public sourceCurrency:number;
	public sourceCurrencyName:string = '-';

	public targetCurrency:number;
	public targetCurrencyName:string = '-';

	public exchange:number;
	public targetCash:number = 0;
	private buyRate:number;
	private sellRate:number;


	/* 支付链接 */
	public rechargeUrlOutput:string = '';
	/* 确认框提示 */
	public rechargeInfo:boolean = false;
	ionViewDidLoad() {
		const self = this;
		this.presentLoading();
		/* 获取充值通道 */
		this._http.postForm("client/3.1/attaccount/query/merchant",{ioType:0,reqChannel:1},function(res){
			self.rechargeWays = JSON.parse(res.content);
			console.log(self.rechargeWays);
			self.dismissLoading();
		});
	}

	getCurrency(){
		const self = this;
		if(this.rechargeChoose == ''){
			return;
		}
		this.presentLoading();
		this._http.postForm("client/3.1/attaccount/get/moneyin/rate/merchant",{ioType:1,bankMerchantId:this.rechargeChoose},function(res){
			const data = JSON.parse(res.content);
			self.sourceCurrency = data.sourceCur;
			self.sourceCurrencyName = data.sourceCurName;
			self.exchange = data.sourceRateM.buyRate;
			self.sellRate = data.sourceRateM.sellRate;
			self.buyRate = data.targetRateM.buyRate;
			self.targetCurrency = data.targetCur;
			self.targetCurrencyName = data.targetCurName;
			self.dismissLoading();
		});
	}
	/* 获取支付方式 */
	getOutPutWays(){
		this.outputWays = [];
		this.payWays = '-1';
		this.originCash = 0;
		this.targetCash = 0;
		this.hasBank = false;
		for(let i=0,r=this.rechargeWays.length;i<r;i++){
			if(this.rechargeWays[i].bankMerchantId == this.rechargeChoose){
				let tmpOutputWays = this.rechargeWays[i].ways;
				console.log(this.rechargeWays[i].needWay)
				this.hasWays = this.rechargeWays[i].needWay;
				this.bankCode = this.rechargeWays[i].bankCode;
				for(var s in tmpOutputWays){
					this.outputWays.push({'id':s,'name':tmpOutputWays[s]});
				}
				break;
			}
		}
		if(this.rechargeChoose == ''){
			this.targetCurrencyName = '-';
			this.sourceCurrencyName = '-';
		}
		this.getCurrency();
	}
	/* 计算汇率 - 源币种 -> 目标币种 */
	calcExchangeOriginToTarget(){
		if(!this.originCash){
			this.originCash = 0;
			this.targetCash = 0;
			return;
		}
		// 计算资产币种金额 = 源币种卖出汇率 * 源币种金额 / 目标币种买入汇率
		setTimeout(()=>{
			if(this.buyRate != undefined){
				this.originCash = indexLibrary.clearNoNum(this.originCash);
				this.targetCash = math.divide(math.multiply(math.bignumber(this.sellRate),math.bignumber(this.originCash)),math.bignumber(this.buyRate));
				if(isNaN(this.targetCash)){
					this.targetCash = 0;
				}
				else {
					this.targetCash = Math.ceil(this.targetCash * 100) / 100;
				}
			}
		});
	}
	/* 计算汇率 - 目标币种 -> 源币种 */
	calcExchangeTargetToOrigin(){
		if(!this.targetCash){
			this.originCash = 0;
			this.targetCash = 0;
			return;
		}
		// 源币种金额 = 计算资产币种金额 * 目标币种买入汇率 / 源币种卖出汇率
		setTimeout(()=>{
			if(this.sellRate != undefined){
				this.targetCash = indexLibrary.clearNoNum(this.targetCash);
				this.originCash = math.divide(math.multiply(math.bignumber(this.buyRate),math.bignumber(this.targetCash)),math.bignumber(this.sellRate));
				if(isNaN(this.originCash)){
					this.originCash = 0;
				}
				else {
					this.originCash = Math.floor(this.originCash * 100) / 100;
				}
			}
		});
	}
	/* 获取银行列表 */
	getBankList(){
		const self = this;
		this.presentLoading();
		this.bankChoose = '';
		this._http.postForm("client/3.1/attaccount/query/merchant/banks",{ioType:0,bank:this.bankCode,way:this.payWays},function(res){
			const data = JSON.parse(res.content);
			self.bankList = data.merchantBankMList;
			self.hasBank = data.needBankList;
			self.dismissLoading();
		});
	}
	toRecharge(){
		if(this.rechargeChoose == ''){
			this.presentToast('请选择充值通道','toast-red');
		}
		else if(this.bankChoose == '' && this.hasBank){
			this.presentToast('请选择银行','toast-red');
		}
		else if(this.originCash == 0 || !this.originCash){
			this.presentToast('请输入充值金额','toast-red');
		}
		else if(this.payWays == '-1' && this.hasWays){
			this.presentToast('请选择支付方式','toast-red');
		}
		else{
			//reqChannel 0:网关支付1:快捷支付2:扫码支付
			const body = {
				"userId": Window.userInfo.userId,
				"bankMerchantId": this.rechargeChoose,
				"bankCode": this.bankChoose,
				"payAmt": this.config.rechargeInner === 'origin' ? this.originCash : this.targetCash,
				"reqChannel": 1,
				"bankCostWay": this.payWays,
				"currency": this.config.rechargeInner === 'origin' ? this.sourceCurrency : this.targetCurrency
			}
			console.log('[提交充值的数据]', body);
			const baseUrl = Window.currentLine.webUrl;
			const parameter = this._http.transformRequest(body);
			this.rechargeInfo = true;
			this.rechargeUrlOutput = baseUrl+'client/3.1/attaccount/topup?'+parameter;
		}
	}
	openUrl(){
		if(window.cordova){
			window.cordova.InAppBrowser.open(this.rechargeUrlOutput, '_system', 'location=yes');
		}
		else {
			window.open(this.rechargeUrlOutput);
		}
	}
	/* 根据通道ID转换通道名 */
	getWanysName(id){
		for(let i=0,r=this.rechargeWays.length;i<r;i++){
			if(this.rechargeWays[i].bankMerchantId == id){
				return this.rechargeWays[i].channelName;
			}
		}
	}
	/* 根据银行ID获取银行名 */
	getBankName(bankCode){
		for(let i=0,r=this.bankList.length;i<r;i++){
			if(this.bankList[i].bankCode == bankCode){
				return this.bankList[i].bankName;
			}
		}
	}
	/* 支付方式名字转换 */
	getWaysName(id){
		for(let i=0,r=this.outputWays.length;i<r;i++){
			if(this.outputWays[i].id == id){
				return this.outputWays[i].name;
			}
		}
	}
	dismiss() {
		this.viewCtrl.dismiss();
	}
	presentToast(text,color) {
		let toast = this.toastCtrl.create({
			message: text,
			position: 'top',
			duration: 3000,
			showCloseButton: true,
			cssClass:color,
			closeButtonText: '确定'
		});
		toast.present();
	}
	presentAlert(text,message) {
		let alert = this.alertCtrl.create({
			title: text,
			message: message,
			buttons: [
				{
					text: '取消',
					role: 'cancel'
				},
				{
					text: '确定',
					role: 'cancel'
				}
			]
		});
		alert.present();
	}
	presentLoading() {
		this.loader = this.loadingCtrl.create({
			content: "请等待...",
			showBackdrop: true,
			duration: 3000
		});
		this.loader.present();
	}
	dismissLoading() {
		this.loader.dismiss();
	}
}
