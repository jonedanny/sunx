import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HTTP } from '@ionic-native/http';
import { TabsPage } from '../pages/tabs/tabs';

import { HomePage } from '../pages/home/home';
import { SelfContactPage } from '../pages/self-contact/self-contact';
import { DatareportPage } from '../pages/datareport/datareport';
import { MyaccountPage } from '../pages/myaccount/myaccount';
import { NewsPage } from '../pages/news/news';

import { DisclaimerPage } from '../pages/disclaimer/disclaimer';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { ServicePage } from '../pages/service/service';

import { SignPage } from '../pages/sign/sign';
import { ResignPage } from '../pages/resign/resign';
import { WithdrawPage } from '../pages/withdraw/withdraw';
import { RechargePage } from '../pages/recharge/recharge';

import { AlertComponent } from '../components/alert/alert';
import { CapitalComponent } from '../components/capital/capital';

import { LineMaComponent } from '../components/line-ma/line-ma';
import { CandelMaComponent } from '../components/candel-ma/candel-ma';

import { SocketServeProvider } from '../providers/socket-serve/socket-serve';
import { HttpServeProvider } from '../providers/http-serve/http-serve';

import { ProductdetailPage } from '../pages/productdetail/productdetail';
import { CapitalFlowPage } from '../pages/capital-flow/capital-flow';
import { PersionPwdPage } from '../pages/persion-pwd/persion-pwd';
import { GoldPwdPage } from '../pages/gold-pwd/gold-pwd';
import { RealnamePage } from '../pages/realname/realname';
import { OpenAccountPage } from '../pages/open-account/open-account';


import { RegisterPage } from '../pages/register/register';
import { PositionDetailPage } from '../pages/position-detail/position-detail';
import { SltpBlockPage } from '../pages/sltp-block/sltp-block';
import { CurrencyDetailPage } from '../pages/currency-detail/currency-detail';
import { TraderContractPage } from '../pages/trader-contract/trader-contract';

import { NoticePage } from '../pages/notice/notice';
import { NoticeDetailPage } from '../pages/notice-detail/notice-detail';

import { SubBankPage } from '../pages/sub-bank/sub-bank';

import { VerificationModePage } from '../pages/verification-mode/verification-mode';

import { ForgetPasswordPage } from '../pages/forget-password/forget-password';

import { HttpModule, Http, JsonpModule } from '@angular/http';

import { TraderProvider } from '../providers/trader/trader';
import { Keyboard } from '@ionic-native/keyboard';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
	declarations: [
		MyApp,
		HomePage,
		TabsPage,
		LoginPage,
		AlertComponent,
		CapitalComponent,
		CandelMaComponent,
		LineMaComponent,
		DatareportPage,
		MyaccountPage,
		NewsPage,
		SignPage,
		ResignPage,
		WithdrawPage,
		RechargePage,
		ProductdetailPage,
		CapitalFlowPage,
		PersionPwdPage,
		GoldPwdPage,
		RegisterPage,
		PositionDetailPage,
		SelfContactPage,
		ForgetPasswordPage,
		SltpBlockPage,
		CurrencyDetailPage,
		TraderContractPage,
		RealnamePage,
		OpenAccountPage,
		VerificationModePage,
		ServicePage,
		NoticePage,
		NoticeDetailPage,
		DisclaimerPage,
		SubBankPage
	],
	imports: [
		BrowserModule,
		TranslateModule.forRoot({
				loader: {
					provide: TranslateLoader,
					useFactory: HttpLoaderFactory,
					deps: [HttpClient]
				}
			}),
		IonicModule.forRoot(MyApp,{
			backButtonText: '',
			tabsHideOnSubPages: 'true',
			pageTransition: 'wp-transition'
		}),
		HttpModule,
		JsonpModule,
		HttpClientModule
	],
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp,
		HomePage,
		TabsPage,
		LoginPage,
		DatareportPage,
		MyaccountPage,
		NewsPage,
		SignPage,
		ResignPage,
		WithdrawPage,
		RechargePage,
		ProductdetailPage,
		CapitalFlowPage,
		PersionPwdPage,
		GoldPwdPage,
		RegisterPage,
		PositionDetailPage,
		SelfContactPage,
		ForgetPasswordPage,
		SltpBlockPage,
		CurrencyDetailPage,
		TraderContractPage,
		RealnamePage,
		OpenAccountPage,
		VerificationModePage,
		ServicePage,
		NoticePage,
		NoticeDetailPage,
		DisclaimerPage,
		SubBankPage
	],
	providers: [
		StatusBar,
		SplashScreen,
		{provide: ErrorHandler, useClass: IonicErrorHandler},
		SocketServeProvider,
		HTTP,
		HttpServeProvider,
		TraderProvider,
		ScreenOrientation,
		Keyboard
	]
})



export class AppModule {}
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}