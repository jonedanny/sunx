import { Http, Response, Jsonp } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Injectable, ViewChild } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { Observable } from 'rxjs';
import { Platform } from 'ionic-angular';

/*
  Generated class for the HttpServeProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
declare var Window,window;
@Injectable()
export class HttpServeProvider {
	private http:any;
	private formHeaders = new Headers();
	private formOptions:any;

	private jsonHeaders = new Headers();
	private jsonOptions:any;

	public postForm:any;
	public get:any;
	public postJson:any;

	public check_line:any;

	/* status=0时 失败连接计数 */
	public errorContract:number = 0;

	constructor(public toastCtrl: ToastController, public __http: HTTP,public _http: Http,public plt: Platform, public jsonp:Jsonp) {
		if(this.plt.is('ios') && window.cordova){
			this.http = this.__http;
			this.postForm = this.postForm_Cordova;
			this.get = this.get_Cordova;
			this.postJson = this.postJson_Cordova;
			this.check_line = this.cordova_check_line;
		}
		else{
			this.http = this._http;
			this.postForm = this.postForm_Angular;
			this.get = this.get_Angular;
			this.postJson = this.postJson_Angular;
			this.check_line = this.angular_check_line;
		}
		this.formHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
		this.formHeaders.append('X-Requested-With', 'XMLHttpRequest');
		this.formOptions = new RequestOptions({ headers: this.formHeaders });

		this.jsonHeaders.append('Content-Type', 'application/json');
		this.jsonHeaders.append('X-Requested-With', 'XMLHttpRequest');
		this.jsonOptions = new RequestOptions({ headers: this.jsonHeaders });

		// 获取token后更新头请求授权token
		Window.addParams = () => {
			this.formHeaders.delete('Authorization');
			this.formHeaders.append('Authorization', Window.token);
			this.formOptions = new RequestOptions({ headers: this.formHeaders });

			this.jsonHeaders.delete('Authorization');
			this.jsonHeaders.append('Authorization', Window.token);
			this.jsonOptions = new RequestOptions({ headers: this.jsonHeaders });
		}
	}
	/* angular http */
	public postForm_Angular(url,body,callback,bool = true){
		let self = this;
		let baseUrl = Window.currentLine.webUrl;
		this.http.post(baseUrl+url+"?time="+new Date().getTime(),this.transformRequest(body),this.formOptions).toPromise()
		.then(function(Response){
			var data = self.doDataFormat(Response);
			if(data.code == '000000'){
				callback(data);
			}
			else{
				self.handleError(Response);
			}
		})
		.catch(error => {
			if(error.status == 0){
				setTimeout(()=>{
					if(self.errorContract < 5){
						self.errorContract++;
						self.postForm_Angular(url,body,callback,bool);
					}
					else{
						self.errorContract = 0;
						this.presentToast('网络信号差','toast-red');
					}
				},1000);
				return;
			}
			if(!bool){
				callback(JSON.parse((<any>error)._body));
			}
			else{
				self.handleError(error);
			}
		});
	}
	public get_Angular(url,callback,bool=true,config=false){
		let getUrl = '';
		let time:number;
		if(config){
			getUrl = url;
			time = 100000;
		}
		else{
			let baseUrl = Window.currentLine.webUrl;
			getUrl = baseUrl + url;
			time = 50000;
		}
		
		let self = this;
		return Observable.from(new Promise((resolve, reject) => {
			this.http.get(getUrl,this.jsonOptions)
			.timeout(time)
			.subscribe(
				Response => {
					callback(self.doDataFormat(Response));
				},
				(err) => {
					if(err.name == "TimeoutError"){
						this.get(url,callback,bool,config);
					}
					if(!bool){
						console.warn(3);
						callback(err);
					}
					else{
						this.handleError(err);
					}
				}
			);
		}));
	}
	public angular_check_line(url,callback){
		let self = this;
		return Observable.from(new Promise((resolve, reject) => {
			this.jsonp.get(url)
			.subscribe(
				Response => {
					console.log(Response);
					callback(Response.status);
				},
				(err) => {
					callback(err);
				}
			);
		}));
	}
	public postJson_Angular(url,body,callback,bool = true){
		let self = this;
		let baseUrl = Window.currentLine.webUrl;
		this.http.post(baseUrl+url,body,this.jsonOptions).toPromise()
		.then(Response=>{
			var data = self.doDataFormat(Response);
			if(data.code == '000000'){
				callback(data);
			}
			else{
				if(bool){
					self.handleError(Response);
				}
				else{
					callback(data);
				}
			}
		})
		.catch(error=>{
			if(error.status == 0){
				setTimeout(()=>{
					if(self.errorContract < 5){
						self.errorContract++;
						self.postJson_Angular(url,body,callback,bool);
					}
					else{
						if(url == 'socket.io/get/tonken'){
							self.postJson_Angular(url,body,callback,bool);
							return;
						}
						self.errorContract = 0;
						this.presentToast('网络信号差','toast-red');
					}
				},1000);
				return;
			}
			if(!bool){
				callback(error);
			}
			else{
				console.log(error,url)
				self.handleError(error);
			}
		});
	}
	/* corfova http */
	public postForm_Cordova(url,body,callback,bool = true){
		const baseUrl = Window.currentLine.webUrl;
		let header = {
			'Content-Type':'application/x-www-form-urlencoded',
			'X-Requested-With':'XMLHttpRequest',
			'Authorization': Window.token || ''
		};

		this.http.setDataSerializer('urlencoded');
		this.http.post(baseUrl+url,body,header)
		.then(res=>{
			var data = JSON.parse(res.data);
			if(data.code == '000000'){
				callback(data);
			}
			else{
				this.handleError(res);
			}
		})
		.catch(error=>{
			console.log(baseUrl+url,error);
			if(error.status == 0){
				setTimeout(()=>{
					if(this.errorContract < 5){
						this.errorContract++;
						this.postForm_Cordova(url,body,callback,bool);
					}
					else{
						this.errorContract = 0;
						this.presentToast('网络信号差','toast-red');
					}
				},1000);
				return;
			}
			if(!bool){
				callback(JSON.parse(error.error));
			}
			else{
				this.handleError(error.error);
			}
		});
	}
	public postJson_Cordova(url,body,callback,bool = true){
		const baseUrl = Window.currentLine.webUrl;
		const header = {
			'Content-Type':'application/json',
			'X-Requested-With':'XMLHttpRequest',
			'Authorization': Window.token || ''
		};
		this.http.setDataSerializer('json');
		this.http.post(baseUrl+url,body,header)
		.then(Response=>{
			var data = JSON.parse(Response.data);
			if(data.code == '000000'){
				callback(data);
			}
			else{
				if(bool){
					this.handleError(Response);
				}
				else{
					callback(data);
				}
			}
		})
		.catch(error=>{
			if(error.status == 0){
				setTimeout(()=>{
					if(this.errorContract < 5){
						this.errorContract++;
						this.postJson_Cordova(url,body,callback,bool);
					}
					else{
						if(url == 'socket.io/get/tonken'){
							this.postJson_Cordova(url,body,callback,bool);
							this.presentToast('网络信号差','toast-red');
							return;
						}
						this.errorContract = 0;
						this.presentToast('网络信号差','toast-red');
					}
				},1000);
				return;
			}
			if(!bool){
				callback(error);
			}
			else{
				this.handleError(error);
			}
		});
	}

	public get_Cordova(url,callback,bool = true,config = false){
		let getUrl = '';
		if(config){
			getUrl = url;
		}
		else{
			let baseUrl = Window.currentLine.webUrl;
			getUrl = baseUrl + url;
		}
		const header = {
			'Content-Type':'application/json',
			'X-Requested-With':'XMLHttpRequest',
			'Authorization': Window.token || ''
		};
		this.http.get(getUrl,{},header)
		.then(data=>{
			console.log('[ios get]', data);
			try{
				callback(JSON.parse(data.data));
			}
			catch(e){
				callback(data.data);
			}
		})
		.catch(error=>{
			if(error.status == 0){
				setTimeout(()=>{
					if(this.errorContract < 5){
						this.errorContract++;
						this.get_Cordova(url,callback,bool);
					}
					else{
						this.errorContract = 0;
						this.presentToast('网络信号差','toast-red');
					}
				},1000);
				return;
			}
			if(!bool){
				callback(error);
			}
			else{
				this.handleError(error);
			}
		});
	}
	public cordova_check_line(url,callback){
		const header = {
			'Content-Type':'application/json',
			'X-Requested-With':'XMLHttpRequest',
			'Authorization': Window.token || ''
		};
		this.http.get(url,{},header)
		.then(data=>{
			try{
				callback(data.status);
			}
			catch(e){
				callback(data.data);
			}
		})
		.catch(error=>{
			callback(error);
		});
	}
	doDataFormat(res){
		let data;
		if(this.plt.is('ios') && window.cordova){
			if(typeof(res.data) === 'string'){
				data = JSON.parse(res.data);
			}
			else{
				data = res.data;
			}
		}
		else{
			if(typeof((<any>res)._body) === 'string'){
				data = JSON.parse((<any>res)._body);
				
			}
			else{
				data = (<any>res)._body;
			}
		}
		
		return data;
	}
	private handleError(error: Response) {
		console.log(error);
		try{
			let msg:any;
			if(this.plt.is('ios') && window.cordova){
				msg = JSON.parse((<any>error).data);
			}
			else{
				msg = JSON.parse((<any>error)._body);
			}
			
			if(msg.code == '700003'){
				Window.socket.close();
				Window.showIonicMenu(false);
				if(Window.isSaveLoginInfo){
					Window.autoLogin();
				}
				else{
					Window.loginout();
					this.presentToast('登入过期,请重新登入','toast-red');
				}
			}
			else if(msg.code == '700002' || msg.code == '800002' || msg.code == '700000' || msg.code == '900001'){
				this.presentToast(msg.message,'toast-red');
			}
			else{
				if(msg.code == 500){
					return;
				}
				if(msg.code != undefined){
					this.presentToast('['+msg.code+']:哎呀,你的网络好像有点问题,请重试!','toast-red');
				}
				else{
					this.presentToast(JSON.stringify(msg),'toast-red');
				}
			}
		}
		catch(e){
			if(error.status == 500){
				return;
			}
			if(error.status != 200){
				this.presentToast('['+error.status+']:哎呀,你的网络好像有点问题,请重试!','toast-red');
			}
		}
	}
	public transformRequest(obj) {
		var str = [];
		for (var p in obj) {
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		}
		return str.join("&");
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
