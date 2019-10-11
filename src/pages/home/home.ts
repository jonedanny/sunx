import { Component , ViewChild,ElementRef,ChangeDetectorRef} from '@angular/core';
import { NavController,IonicPage, ToastController } from 'ionic-angular';
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { AlertComponent } from '../../components/alert/alert';
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { ProductdetailPage } from '../../pages/productdetail/productdetail';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
declare var $:any,Window,indexLibrary,window;
@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
@IonicPage()
export class HomePage {
	@ViewChild(AlertComponent) child: AlertComponent;
	private connection;
	private baseProductList = [];
	/* 目录分类 */
	public classifyA:Array<any> = [];
	public classifyB:Array<any> = [];
	public currentClassifyA;
	public currentClassifyB;
	constructor(public toastCtrl: ToastController, private screenOrientation: ScreenOrientation, public _http: HttpServeProvider,public navCtrl: NavController,private socket:SocketServeProvider,private ref: ElementRef,public cd: ChangeDetectorRef) {
		/* 获取默认一级分类 */
		for(let i=0,r=Window.allContractNav.length;i<r;i++){
			if(Window.allContractNav[i].categoryLevel == 1){
				this.classifyA.push(Window.allContractNav[i]);
			}
		}
		if(Window.allContractNav.length === 0){
			this.presentToast('未获取到有效的一级分类','toast-red');
			return;
		}
		Window.currentClassifyA = Window.currentClassifyA?Window.currentClassifyA:this.classifyA[0].categoryId;
		/* 获取默认二级分类 */
		for(let i=0,r=Window.allContractNav.length;i<r;i++){
			if(Window.allContractNav[i].categoryLevel == 2 && Window.allContractNav[i].parentCategoryId == Window.currentClassifyA){
				this.classifyB.push(Window.allContractNav[i]);
			}
		}
		this.classifyB.sort(function(a,b){
			return indexLibrary.SortByProps(a,b,{ "categorySort":"descending"});
		});
		this.classifyB.reverse();
		console.log('[二级分类]',this.classifyB);
		if(this.classifyB.length == 0){
			Window.currentClassifyB = {
				categoryId: '',
				commodityType: 0
			}
			this.presentToast('未获取到有效的二级分类','toast-red');
		}
		else{
			Window.currentClassifyB = {
				categoryId: Window.currentClassifyB?Window.currentClassifyB.categoryId:this.classifyB[0].categoryId,
				commodityType: Window.currentClassifyB?Window.currentClassifyB.commodityType:this.classifyB[0].commodityType
			};
		}

		this.currentClassifyA = Window.currentClassifyA;
		this.currentClassifyB = Window.currentClassifyB;

		//储存数据源
		Window.productList = [];

		/* 获取合约列表 */
		Window.getContractList = (categoryId = Window.currentClassifyB.categoryId)=>{
			Window.socketAllpro = [];
			this.baseProductList = [];
			Window.productList = [];
			let self = this;
			for(let i=0,r=Window.allProductList.length;i<r;i++){
				if(Window.allProductList[i].categoryIds.indexOf(categoryId) !== -1 && Window.allProductList[i].commodityType == this.currentClassifyB.commodityType){
					Window.productList.push({
						productId:Window.allProductList[i].productId,
						productName:Window.allProductList[i].productName,
						productCode:Window.allProductList[i].productCode,
						color:'',//涨跌颜色标识
						QLastPrice:0,//最新价
						QChangeRate:0,//涨幅
						QChangeValue:0,//涨跌值
						QAskQty:0,//卖一
						QBidQty:0,//买一
						oldPrice:0,
						oldPriceChange:1,
						QTotalQty:0,
						Apercent:0,
						unionMinPrices:Window.allProductList[i].unionMinPrices,
						Stamp:0,
						QHighPrice:0,
						QPreClosingPrice:0,
						QLowPrice:0,
						QPositionQty:0,
						QOpeningPrice:0,
						QAveragePrice:0,//均价
						QLimitUpPrice:0,//涨停
						QLimitDownPrice:0,//跌停
						QPreSettlePrice:0,//昨结算价
						_QAskPrice:[0,0,0,0,0,0,0,0,0,0,0],
						_QAskQty:[0,0,0,0,0,0,0,0,0,0,0],
						_QBidPrice:[0,0,0,0,0,0,0,0,0,0,0],
						_QBidQty:[0,0,0,0,0,0,0,0,0,0,0],
						marketSort:Window.allProductList[i].marketSort,
						commoditySort:Window.allProductList[i].commoditySort,
						contractSort:Window.allProductList[i].contractSort,
						commodityType:Window.allProductList[i].commodityType,
						cfd:0
					});
				}
			}
			console.log('[当前合约列表]',Window.productList);
			self.baseProductList = Window.productList;
			self.changeSort();
			for(let i=0,r=Window.productList.length;i<r;i++){
				Window.socketAllpro.push(Window.productList[i].productId);
			}
			setTimeout(()=>{
				self.resetAddPro();
			},100)
		}
		/* 查询用户信息 */
		Window.searchUserValidate = (callback = function(){})=>{
			this._http.postJson("client/user/get",{},function(res){
				if(res.code == '000000'){
					let data = JSON.parse(res.content);
					console.log('刷新用户状态',data);
					Window.userValidate = data;
					if(Window.userValidate.email){
						Window.userValidate.email = indexLibrary.entryptionInfo(Window.userValidate.email);
					}
					if(Window.userValidate.phone){
						Window.userValidate.phone = indexLibrary.entryptionInfo(Window.userValidate.phone);
					}
					Window.userInfo.userState = Window.userValidate.state;
					callback();
				}
			});
		}
		Window.searchUserValidate();
	}

	/* !基准商品高度 -> 滚动计算基础值 */
	private signProHeight:number = 50;
	/* 动态计算每页显示的商品数量 */
	private CurrentProNum:number;
	/* 滚动加载数据 */
	private scrollMove;
	dataScroll(){
		clearTimeout(this.scrollMove);
		let element = this.ref.nativeElement.querySelector('.out-con');
		let nowScroll = element.scrollTop;
		this.scrollMove = setTimeout(()=>{
			this.isScrollEnd(nowScroll);
		},100);
		this.scrollMove = nowScroll;
	}
	isScrollEnd(num){
		if(num == this.scrollMove){
			this.socket.rejuceProListMb2Delay();
			/* 当前滚动到的商品 */
			let nowColumn = Math.floor(this.scrollMove/50);
			Window.showProList = Window.socketAllpro.concat().slice(nowColumn,nowColumn+this.CurrentProNum+1);
			console.log(Window.showProList)
			this.socket.addProListMb2Delay();
		}
	}
	/* 初始化添加产品 */
	resetAddPro(){
		let inCon = this.ref.nativeElement.querySelector('.out-con').clientHeight;//内高
		/* 当前添加的产品数 */
		this.CurrentProNum = Math.floor(inCon/this.signProHeight)+1;
		Window.showProList = Window.socketAllpro.concat().slice(0,this.CurrentProNum);
		this.socket.addProListMb2Delay();
	}
	ionViewDidEnter() {
		Window.getContractList();
		const self = this;
		if(window.cordova){
			this.screenOrientation.lock('portrait');
		}
		Window.currentSocket = '合约列表页';
		this.connection = this.socket.getPriceMb2().subscribe(data => {
			if(Window.productList.length > 0){
				for(let i=0,r=Window.productList.length;i<r;i++){
					if(Window.productList[i].productId === data[0]){
						if(Window.currentClassifyB.commodityType === 4){
							Window.productList[i].QBidPrice = data[4][0] || 0;
							Window.productList[i].QAskPrice = data[6][0] || 0;
							// const tmp_dc = indexLibrary.Subtr(Window.productList[i].QAskPrice,Window.productList[i].QBidPrice)/Window.productList[i].unionMinPrices*indexLibrary.floatChangeInt(Window.productList[i].unionMinPrices);
							// Window.productList[i].cfd = indexLibrary.formatFloat(window.Math.abs(tmp_dc),0);
							Window.productList[i].QHighPrice = data[12];
							Window.productList[i].QLowPrice = data[13];
							Window.productList[i].QLastPrice = data[2];
						}
						else{
							if(Window.productList[i].oldPrice !== data[2]){
								Window.productList[i].oldPriceChange = (Window.productList[i].oldPriceChange === 1)?2:1;
								Window.productList[i].oldPrice = data[2];
							}
							if(data[22] > 0){
								Window.productList[i].color = 'red';
							}
							else if(data[22] < 0){
								Window.productList[i].color = 'green';
							}
							else{
								Window.productList[i].color = '';
							}
							Window.productList[i].QLastPrice = data[2];
							Window.productList[i].QChangeRate = indexLibrary.formatFloat(data[22],3);
						}
						break;
					}
				}
			}
		});
		this.swiperNav();
		//500毫秒同步一次数据
		Window.synchronization = setInterval(function(){
			self.baseProductList = Window.productList;
		},500);
	}
	/* 滑动菜单 二级分类 */
	swiperNav(){
		setTimeout(()=>{
			let width = 0;
			$('.scroll-x a').each(function(){
				width += $(this).outerWidth();
			});
			$('.scroll-x .common-title').css('width',width+'px');
		},10);
	}
	ionViewWillLeave() {
		this.socket.rejuceProListMb2Delay();
		this.connection.unsubscribe();
		clearInterval(Window.synchronization);
	}
	toProDetail(data) {
		Window.nowProId = data.productId;
		Window.productdetailRecourse = 'HomePage';
		localStorage.setItem('proDetailCommodityType',this.currentClassifyB.commodityType.toString());
		this.navCtrl.push(ProductdetailPage);
	}
	/* 更改一级分类 */
	changeClassifyA(id){
		if(this.currentClassifyA == id){
			return;
		}
		this.currentClassifyA = id;
		Window.currentClassifyA = id;
		this.classifyB = [];
		for(let i=0,r=Window.allContractNav.length;i<r;i++){
			if(Window.allContractNav[i].categoryLevel == 2 && Window.allContractNav[i].parentCategoryId == id){
				this.classifyB.push(Window.allContractNav[i]);
			}
		}
		this.classifyB.sort(function(a,b){
			return indexLibrary.SortByProps(a,b,{ "categorySort":"descending"});
		});
		this.classifyB.reverse();
		this.swiperNav();
		try{
			this.changeClassifyB(this.classifyB[0].categoryId,this.classifyB[0].commodityType);
		}
		catch(e){

		}
	}

	/* 更改二级分类 */
	changeClassifyB(categoryId,commodityType){
		this.currentClassifyB.categoryId = categoryId;
		this.currentClassifyB.commodityType = commodityType;
		Window.currentClassifyB.categoryId = categoryId;
		Window.currentClassifyB.commodityType = commodityType;
		this.socket.rejuceProListMb2Delay();
		Window.getContractList(categoryId);
	}
	/* 根据后台设置排序 */
	private changeSort(){
		this.baseProductList.sort(function(a,b){
			return indexLibrary.SortByProps(a,b,{ "marketSort":"descending","commoditySort":"descending","contractSort":"descending"});
		});
		this.baseProductList.reverse();
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
