import { Component , ViewChild} from '@angular/core';
import { Nav } from 'ionic-angular';
import { Platform, App, ToastController, LoadingController, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';

import { Http } from '@angular/http';

import { SocketServeProvider } from "../providers/socket-serve/socket-serve";
import { Keyboard } from '@ionic-native/keyboard';
import { ProductdetailPage } from '../pages/productdetail/productdetail';

import { HomePage } from '../pages/home/home';
import { SelfContactPage } from '../pages/self-contact/self-contact';
import { DatareportPage } from '../pages/datareport/datareport';
import { MyaccountPage } from '../pages/myaccount/myaccount';
import { NewsPage } from '../pages/news/news';
import { HttpServeProvider } from '../providers/http-serve/http-serve';
import { TranslateService } from "@ngx-translate/core";

declare var Window,window,$;
/* apk新增 */
declare var store,screen:any,indexLibrary,baseConfig;
@Component({
  templateUrl: 'app.html'
})
/* cordova plugin add cordova-plugin-app-version */
export class MyApp {
	@ViewChild(Nav) nav: Nav;
	rootPage:any;
	private loader:any;
	pages: Array<{title: string, component: string, class: string}>;
	private disconnect:boolean = false;
	public showIonicMenu:boolean = false;
	private registerBackButton;
	public checkPage;
	private registerBackEvent: Function;
	//测试面板
	private textBoard:string;
	constructor(public loadingCtrl: LoadingController,public toastCtrl: ToastController, private app: App,private keyboard: Keyboard,public platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private socket:SocketServeProvider,public _http: HttpServeProvider, public translateService: TranslateService, public http: Http) {
		/* apk新增 */
		platform.ready().then((readySource) => {
			this.presentLoading();
			window.removeSysLoading();
			Window.changeUser = true;
			splashScreen.hide();
			const afterGetVersion = () => {
				if(localStorage.getItem('config') == null || localStorage.getItem('config') == undefined){
					Window.config = baseConfig[Window.appVersion];
					localStorage.setItem('config',JSON.stringify(Window.config));
					this.dismissLoading();
					this.getConfigResult = Window.config;
					this.rootPage = LoginPage;
					this.getOnlineConfig();
				}
				else {
					Window.config = JSON.parse(localStorage.getItem('config'));
					console.warn('[历史的json配置]',Window.config,Window.appVersion);
					this.dismissLoading();
					this.rootPage = LoginPage;
					this.getOnlineConfig();
				}
				if(window.StatusBar) {
					window.StatusBar.styleDefault();
				}
			}
			if(window.cordova) {
				screen.orientation.lock('portrait');
				this.keyboard.hideKeyboardAccessoryBar(false);
				window.cordova.getAppVersion.getVersionNumber((version) => {
					Window.appVersion = version;
					afterGetVersion();
				});
			}
			else{
				//测试指定环境
				Window.appVersion = "sunx_app_test";
				//监听浏览器返回
				window.history.pushState(null, null, "#");
				window.addEventListener("popstate", (e) => {
					try{
						let activeNav: NavController = this.app.getActiveNav();
						activeNav.pop();
						window.history.pushState(null, null, "#");
					}
					catch(e){}
				});
				afterGetVersion();
			}
			this.registerBackEvent = this.platform.registerBackButtonAction(() => {
				if(this.goBackLogic()){
					if (this.checkPage) {
						//如果是根目则按照需求1处理
						this.exitApp();
					}
					else {
						//非根目录返回上一级页面
						this.app.goBack();
					}
				}
			}, 10);
			//加载多语言包
			// --- set i18n begin ---
			this.translateService.addLangs(["zh", "en", "hk"]);
			const historyLanguage = localStorage.getItem('language');
			console.log('[当前语言]',historyLanguage)
			if(historyLanguage){
				this.translateService.use(historyLanguage);
			}
			else{
				this.translateService.use("zh");
			}
			// --- set i18n end ---
			const height = $(window).height();
	
			if(this.platform.is('ios')){
				window.isShowKeyBoard = false;
				this.keyboard.disableScroll(true);
				window.addEventListener('native.keyboardshow',(e:any) =>{
					$('html,body').css("height",`${height - e.keyboardHeight}px`);
					window.isShowKeyBoard = true;
					document.body.scrollIntoView(true);
				});
				window.addEventListener('native.keyboardhide',(e:any) =>{
					$('html,body').css("height",`${height}px`);
					window.isShowKeyBoard = false;
					document.body.scrollIntoView(true);
				});
			}
		});
		Window.showIonicMenu = (bool)=>{
			this.showIonicMenu = bool;
		}
		Window.reload = ()=>{
			this.disconnect = true;
		}
		/* 退出登录 */
		Window.loginout = ()=>{
			if(!Window.socket){
				return;
			}
			this.socket.destoryAll();
			Window.socket.close();
			delete Window.socket;
			Window.showIonicMenu(false);
			this.nav.setRoot(LoginPage);
		}
		window.removeSysLoading = function(){
			$('#enter-loading').remove();
		};
		//切换语言
		window.changeLanguage = (language:string)=>{
			this.translateService.use(language);
			localStorage.setItem('language',language);
		}
	}
	//读取在线配置文件
	//实盘
	private onlineConfigUrl = [
		"http://47.111.146.166:65501/staticResources/config.json",
		"http://47.111.146.166:65500/staticResources/config.json",
		"http://47.111.146.166:65503/staticResources/config.json",
		"http://47.107.114.218:65500/staticResources/config.json",
		"http://47.107.120.122/staticResources/config.json",
		"http://39.105.87.215/staticResources/config.json",
		"http://config.wftp-aux.com/staticResources/config.json"
	];
	//测试
	private testConfigUrl = [
		"http://47.99.210.59:33205/staticResources/config.json"
	];



	private onlineConfigUrlGetNumber:number = 0;
	/* 设置当前配置文件线路 */
	private currentOnlineConfigUrl = this.testConfigUrl;
	/* 热更新提示显示 */
	public hotCodePushLoading:boolean = false;
	/* 获取到的配置文件 */
	getConfigResult = null;
	/* 可用线路 */
	canUseConfigUrl = [];
	getOnlineConfig() {
		let self = this;
		//可用线路数组
		for(let i=0,r=this.currentOnlineConfigUrl.length;i<r;i++){
			this._http.get(this.currentOnlineConfigUrl[i]+"?time="+new Date().getTime(),(res: any) => {
				console.log('[获取线上配置文件]',res);
				if(typeof(res) === 'string'){
					res = JSON.parse(res);
				}
				if(res.hasOwnProperty('status') === false){
					this.getConfigResult = res[Window.appVersion];
					if(!this.getConfigResult) {
						this.presentToast('未在配置列表中找到对应的客户ID','toast-red');
						return;
					}
					this.canUseConfigUrl.push(self.currentOnlineConfigUrl[i]);
					checkRes();
				}
			},false,true);
		}
		setTimeout(() => {
			if(this.canUseConfigUrl.length === 0){
				this.getOnlineConfig();
			}
		},5000);
		function getResult(){
			/* 比较版本号 */
			if(localStorage.getItem('config') && localStorage.getItem('config') != 'undefined'){
				Window.config = self.getConfigResult;
				const historyConfig = JSON.parse(localStorage.getItem('config'));
				self.whiteBaseConfig(self.getConfigResult,self.canUseConfigUrl);
				if(Window.config.version != historyConfig.version){
					self.translateService.get('检测到配置文件有更新,正在加载配置文件 ...').subscribe((res: string) => {
						self.presentToast(res,'toast-green');
					});
					Window.loginout();
				}
				/* 检测是否有热更新 */
				if(historyConfig.hotCodePush && Window.config.hotCodePush > historyConfig.hotCodePush){
					self.hotCodePushLoading = true;
				}
				self.rootPage = LoginPage;
			}
			else{
				self.whiteBaseConfig(Window.config,self.canUseConfigUrl);
				self.rootPage = LoginPage;
			}
			self.dismissLoading();
		}
		function checkRes() {
			if(Window.config == undefined || self.canUseConfigUrl.length === 0){
				setTimeout(function(){
					self.presentToast('网络环境不佳,正在尝试重连 ...','toast-red');
					checkRes();
				},10000);
			}
			else{
				getResult();
			}
		}
	}
	/* 写入替换全局本地配置变量 */
	whiteBaseConfig(res,canUseConfigUrl){
		Window.configurl = canUseConfigUrl[0].replace('config.json','');
		localStorage.setItem('config',JSON.stringify(Window.config));
		localStorage.setItem('configurl',Window.configurl);
		/* 单独处理首页面配置文件更新 */
		if(typeof(Window.loginPageFreshConfig) == 'function'){
			Window.loginPageFreshConfig();
		}
	}

	/* 环境为浏览器时 新增全屏浏览器*/
	private fullScreen:boolean = false;
	fullScreenBroswer() {
		if(!window.cordova){
			const dom = document.querySelector(".product-detail-page");
			if(dom == null){
				this.fullScreen = !this.fullScreen;
				if(this.fullScreen){
					indexLibrary.fullScreen();
				}
				else{
					indexLibrary.exitFullscreen();
				}
			}
		}
	}
	exitApp () {
		if (this.registerBackButton) {
			this.platform.exitApp();
		}
		else {
			this.registerBackButton = true;
			this.translateService.get('再按一次退出应用').subscribe((res: string) => {
				this.toastCtrl.create({
					message: res,
					duration: 2000,
					position: 'top',
					cssClass: 'toast-yellow'
				}).present();
			});
			setTimeout(() => this.registerBackButton = false, 2000);//2秒内没有再次点击返回则将触发标志标记为false
		}
	}
	goBackLogic() {
		var currentCmp = this.app.getActiveNav().getActive().component;
		var isPage1 = currentCmp === HomePage;
		var isPage2 = currentCmp === SelfContactPage;
		var isPage3 = currentCmp === DatareportPage;
		var isPage4 = currentCmp === MyaccountPage;
		var isPage5 = currentCmp === NewsPage;

		var isPage6 = currentCmp === ProductdetailPage;
		if(isPage6){
			if(Window.isFullEcharts){
				return false;
			}
			else{
				this.checkPage = false;
			}
		}
		else{
			if (isPage1 || isPage2 || isPage3 || isPage4 || isPage5) {
				this.checkPage = true
			}
			else {
				this.checkPage = false
			}
		}
		return true;
	}
	presentLoading() {
		this.translateService.get('初次加载配置文件，请耐心等候 ...').subscribe((res: string) => {
			this.loader = this.loadingCtrl.create({
				content: res,
				showBackdrop: true
			});
			this.loader.present();
		});
	}
	dismissLoading() {
		if(this.loader){
			this.loader.dismiss();
		}
		this.loader = null;
	}
	presentToast(text,color = '') {
		this.translateService.get('确定').subscribe((res: string) => {
			let toast = this.toastCtrl.create({
				message: text,
				position: 'top',
				duration: 3000,
				showCloseButton: true,
				cssClass:color,
				closeButtonText: res
			});
			toast.present();
		});
	}
}
