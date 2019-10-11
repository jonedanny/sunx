import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, ToastController } from 'ionic-angular';
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { DomSanitizer } from '@angular/platform-browser';
import * as math from "mathjs"
declare var Window,indexLibrary;


@IonicPage()
@Component({
	selector: 'page-withdraw',
	templateUrl: 'withdraw.html',
})
export class WithdrawPage {
	private loader:any;

	public CreditRuleUrl:any = null;
	public isWeb:boolean = false;
	public config =  Window.config;
	constructor(private sanitizer: DomSanitizer, public toastCtrl: ToastController,public loadingCtrl: LoadingController, public _http: HttpServeProvider, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
		const url = navParams.get('url');
		if(typeof(url) === 'string'){
			this.isWeb = true;
			this.CreditRuleUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
		}
	}

	public name:any;
	public certificateNo:any;
	public phone:any;
	public cardNo:any;
	public payways = [];
	public paywaysChoose:any = '';
	public extract:number = 0;
	public originCash:number = 0;
	public targetCash:number = 0;
	public extractDescription:string = '';
	public goldPWD:string = '';

		/* 查询充值源币种 */
	//ioType: 出金 0，入金 1
	public sourceCurrency:number;
	public sourceCurrencyName:string = '-';
	public exchange:number;
	public targetCurrency:number = 0;
	public targetCurrencyName:string = '-';


	private buyRate:number;
	private sellRate:number;
	

	ionViewDidLoad() {
		this.name = Window.userValidate.realInfo.name;
		this.certificateNo = Window.userValidate.realInfo.certificateNo;
		this.phone = Window.signUpInfo.cusMobile;
		this.cardNo = Window.signUpInfo.cardNo;
		/* 查询提现通道 */
		this._http.postForm("client/3.1/attaccount/query/merchant",{ioType:1,reqChannel:1},(res) => {
			if(res.code == '000000'){
				this.payways = JSON.parse(res.content);
			}
		});
	}
	getCurrency(callback = function(){}){
		if(this.paywaysChoose == ''){
			return;
		}
		this.presentLoading();
		this._http.postForm("client/3.1/attaccount/get/moneyin/rate/merchant",{ioType:-1,bankMerchantId:this.paywaysChoose},(res) => {
			const data = JSON.parse(res.content);
			console.log(data);
			this.sourceCurrency = data.sourceCur;
			this.sourceCurrencyName = data.sourceCurName;
			this.exchange = data.sourceRateM.buyRate;
			this.buyRate = data.sourceRateM.buyRate;
			this.sellRate = data.targetRateM.sellRate;
			this.targetCurrency = data.targetCur;
			this.targetCurrencyName = data.targetCurName;
			callback();
			this.dismissLoading();
		});
	}
	searchExtract() {
		if(this.paywaysChoose == ''){
			this.extract = 0;
			return;
		}
		this.originCash = 0;
		this.targetCash = 0;
		this.targetCurrencyName = '-';

		this.getCurrency(() => {
			/* 查询提现余额 */
			this._http.postJson("client/3.1/account/get/extract/bycurrency",{currency:this.sourceCurrency},(res) => {
				if(res.code == '000000'){
					this.extract = Math.floor(Number(JSON.parse(res.content).extract) * 100) / 100;
				}
			});
		});
	}
	/* 计算汇率 - 源币种 -> 目标币种 */
	calcExchangeOriginToTarget(){
		if(!this.originCash){
			this.originCash = 0;
			this.targetCash = 0;
			return;
		}
		setTimeout(()=>{
			if(this.buyRate != undefined){
				this.originCash = indexLibrary.clearNoNum(this.originCash);
				this.targetCash = math.divide(math.multiply(math.bignumber(this.buyRate),math.bignumber(this.originCash)),math.bignumber(this.sellRate));
				if(isNaN(this.targetCash)){
					this.targetCash = 0;
				}
				else {
					this.targetCash = Math.floor(this.targetCash * 100) / 100;
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
		setTimeout(()=>{
			if(this.buyRate != undefined){
				this.targetCash = indexLibrary.clearNoNum(this.targetCash);
				this.originCash = math.divide(math.multiply(math.bignumber(this.sellRate),math.bignumber(this.targetCash)),math.bignumber(this.buyRate));
				if(isNaN(this.originCash)){
					this.originCash = 0;
				}
				else {
					this.originCash = Math.ceil(this.originCash * 100) / 100;
				}
			}
		});
	}
	toWithdraw() {
		if(this.paywaysChoose == ''){
			this.presentToast('请选择提现通道','toast-red');
			return;
		}
		else if(this.originCash > this.extract){
			this.presentToast('提现金额不能大于可提金额','toast-red');
			return;
		}
		else if(this.originCash == 0){
			this.presentToast('提现金额不能为 0','toast-red');
			return;
		}
		else if(this.goldPWD == ''){
			this.presentToast('请输入资金密码','toast-red');
			return;
		}
		const body = {
			"accountPassword": this.goldPWD,
			"bankMerchantId": this.paywaysChoose,
			"ioNumber": this.config.withdrawInner === 'origin' ? this.originCash : this.targetCash,
			"comment": this.extractDescription,
			"currency": this.config.withdrawInner === 'origin' ? this.sourceCurrency : this.targetCurrency
		}
		console.log('[提交提现的数据]', body);
		this._http.postJson("client/3.1/attaccount/withdrawals",body,(res) => {
			if(res.code == '000000'){
				this.presentToast('提现申请成功，实际到账时间根据不同银行可能会有延误！','toast-green');
				this.dismiss();
			}
			else{
				this.presentToast(res.message,'toast-red');
			}
		},false);
	}
	dismiss() {
		this.viewCtrl.dismiss();
	}
	presentLoading() {
		this.loader = this.loadingCtrl.create({
			content: "请稍等 ...",
			showBackdrop: true,
			dismissOnPageChange: true
		});
		this.loader.present();
	}
	dismissLoading() {
		this.loader.dismiss();
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
}
