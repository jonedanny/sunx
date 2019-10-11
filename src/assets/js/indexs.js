var indexLibrary = {};
/* 指标公式 */
indexLibrary.MACD = function(dataArr,_short,_long,_mid){
	/* dataArr：收盘价数组 */
	if(!dataArr){
		return;
	}
	var short = parseInt(_short),
		long = parseInt(_long),
		mid = parseInt(_mid);
	var baseEMA12 = 0,baseEMA26 = 0,baseDEA = 0,DIFF=[],DEA=[],MACD=[],t1,t2,shortArr = [],longArr = [],diArr = [],result,i,r;
	for(i=0,r=dataArr.length;i<r;i++){
		if(i==0){
			t1 = dataArr[0];
			t2 = dataArr[0];
		}else {
			t1 = (2*dataArr[i]+(short-1)*shortArr[i-1])/(short+1);
			t2 = (2*dataArr[i]+(long-1)*longArr[i-1])/(long+1);
		}
		shortArr.push(t1);
		longArr.push(t2);
	}
	for (i=0;i<shortArr.length;i++){
		DIFF.push(shortArr[i]-longArr[i]);
	}
	for (i=0;i<DIFF.length;i++){
		if(i==0){
			t1 = DIFF[0];
		}else {
			t1 = (2*DIFF[i]+(mid-1)*DEA[i-1])/(mid+1);
		}
		DEA.push(t1);
		MACD.push((DIFF[i]-DEA[i])*2);
	}
	result = [DIFF,DEA,MACD];
	return result;
};

indexLibrary.MA = function(dayCount,close){
	var result = [];
	for (var i = 0, len = close.length; i < len; i++) {
		if (i < dayCount) {
			result.push('-');
			continue;
		}
		var sum = 0;
		for (var j = 0; j < dayCount; j++) {
			sum += close[i - j];
		}
		if((sum / dayCount) != '-'){
			result.push((sum / dayCount).toFixed(6));
		}
		else{
			result.push((sum / dayCount).toFixed(6));
		}
	}
	return result;
};
indexLibrary.low = null;
indexLibrary.high = null;
indexLibrary.KDJ = function(cancelData,_N,_M1,_M2){
	//默认参数
	var N = parseInt(_N),
		M1 = parseInt(_M1),
		M2 = parseInt(_M2);
	//Cn为第n日收盘价；Ln为n日内的最低价；Hn为n日内的最高价
	var lowArr=[],highArr=[],Cn,Ln,Hn,k=50,d=50,j,kArr=[],_k,dArr=[],_d,jArr=[],RSVArr = [],t,result;
	for(var i=0,r=cancelData.length;i<r;i++){
		Cn = cancelData[i][1];
		lowArr=[];
		highArr=[];
		if(i<cancelData.length-N){
			for(var x=i,z=N+i;x<z;x++){
				if(cancelData[x] != undefined){
					lowArr.push(cancelData[x][2]);
					highArr.push(cancelData[x][3]);
				}
			}
		}else {
			for (var x=i;x<cancelData.length;x++){
				lowArr.push(cancelData[x][2]);
				highArr.push(cancelData[x][3]);
			}
		}
		var min = lowArr[0],max = highArr[0];
		for (var j=1;j<lowArr.length;j++){
			if(min>lowArr[j]){
				min = lowArr[j];
			}
			if(max<highArr[j]){
				max = highArr[j];
			}
		}
		Ln = min;
		Hn = max;
		if((Hn-Ln)!=0){
			t = (Cn-Ln)/(Hn-Ln)*100;
		}else {
			t = RSVArr[i-1];
		}
		RSVArr.push(t);
	}
	for (var i=0;i<RSVArr.length;i++){
		if(i == 0){
			_k = RSVArr[0];
		}else {
			_k = (1*RSVArr[i]+(M1-1)*kArr[i-1])/M1;
		}
		kArr.push(_k);
	}
	for (var i=0;i<kArr.length;i++){
		if(i == 0){
			_d = kArr[0];
		}else {
			_d = (1*kArr[i]+(M2-1)*dArr[i-1])/M2;
		}
		dArr.push(_d);
	}
	for (var i=0;i<kArr.length;i++){
		t = 3*kArr[i]-2*dArr[i];
		jArr.push(t);
	}
	result = [kArr,dArr,jArr];
	return result;
};
//BOLL计算
indexLibrary.BOLL = function(dataArr,N,P){
	/* dataArr：收盘价数组 */
	if(!dataArr){
		return;
	}
	var i,j,MID = [],UPPER = [],LOWER = [],t,result,sum,avg,am;
	for(i=0;i<dataArr.length;i++){
		var sum = 0;
		if(i>=N){
			for (j=i;j>i-N;j--){
				sum += dataArr[j];
			}
			sum = sum/N;
		}else {
			for (j=i;j>=0;j--){
				sum += dataArr[j];
			}
			sum = sum/(i+1);
		}
		MID.push(sum);
	}

	for (i=0;i<MID.length;i++){
		sum = 0,am = 0;
		if(i>=N){
			for(j=i;j>i-N;j--){
				sum += dataArr[j];
			}
			avg = sum/N;
			for(j=i;j>i-N;j--){
				am += (dataArr[j]-avg)*(dataArr[j]-avg);
			}
			am = am/N;
			t = Math.sqrt(am);
		}
		else {
			for (j=i;j>=0;j--){
				sum += dataArr[j];
			}
			avg = sum/(i+1);
			for(j=i;j>=0;j--){
				am += (dataArr[j]-avg)*(dataArr[j]-avg);
			}
			am = am/(i+1);
			t = Math.sqrt(am);
		}
		t = t*P;
		UPPER.push(MID[i]+t);
		LOWER.push(MID[i]-t);
	}
	result = [MID,UPPER,LOWER];
	return result;
};
//EMA计算
indexLibrary.EMA = function(dataArr,P1,P2,P3,P4,P5,P6){
	if(!dataArr){
		return;
	}
	var i,j,result,t1,t2,t3,t4,t5,t6,EMA1 = [],EMA2 = [],EMA3 = [],EMA4 = [],EMA5 = [],EMA6 = [];
	for (i=0;i<dataArr.length;i++){
		if(i==0){
			t1 = dataArr[i];
			t2 = dataArr[i];
			t3 = dataArr[i];
			t4 = dataArr[i];
			t5 = dataArr[i];
			t6 = dataArr[i];
		}else {
			t1 = (2*dataArr[i]+(P1-1)*EMA1[i-1])/(P1+1);
			t2 = (2*dataArr[i]+(P2-1)*EMA2[i-1])/(P2+1);
			t3 = (2*dataArr[i]+(P3-1)*EMA3[i-1])/(P3+1);
			t4 = (2*dataArr[i]+(P4-1)*EMA4[i-1])/(P4+1);
			t5 = (2*dataArr[i]+(P5-1)*EMA5[i-1])/(P5+1);
			t6 = (2*dataArr[i]+(P6-1)*EMA6[i-1])/(P6+1);
		}
		EMA1.push(t1);
		EMA2.push(t2);
		EMA3.push(t3);
		EMA4.push(t4);
		EMA5.push(t5);
		EMA6.push(t6);
	}

	result = [EMA1,EMA2,EMA3,EMA4,EMA5,EMA6];
	return result;
};
//DMA计算
indexLibrary.DMA = function(dataArr,SHORT,LONG,M){
	/* dataArr：收盘价数组 */
	if(!dataArr){
		return;
	}
	var sumS,sumL,sumD,DDD = [],AMA = [],i,j,result;
	for (i = 0;i<dataArr.length;i++){
		sumS = 0;
		sumL = 0;
		if(i>SHORT){
			for (j = i;j>i-SHORT;j--){
				sumS += dataArr[j];
			}
			sumS = sumS/SHORT;
		}else {
			for (j = i;j>=0;j--){
				sumS += dataArr[j];
			}
			sumS = sumS/(i+1);
		}
		if(i<LONG){
			for(j=0;j<i+1;j++){
				sumL += dataArr[j];
			}
			sumL = sumL/(i+1);
		}else{
			for (j=i;j>i-LONG;j--){
				sumL += dataArr[j];
			}
			sumL = sumL/LONG;
		}
		DDD.push(sumS-sumL);
	}
	for (i = 0;i<DDD.length;i++){
		sumD = 0;
		if(i>=M){
			for (j=i;j>i-M;j--){
				sumD += DDD[j];
			}
			sumD = sumD/M;
		}else {
			for (j=i;j>0;j--){
				sumD += DDD[j];
			}
			sumD = sumD/i;
		}
		if(isNaN(sumD)){
			sumD = 0;
		}
		AMA.push(sumD);
	}
	result = [DDD,AMA];
	return result;
};
//DDI计算
indexLibrary.DDI = function(cancelData,N,N1,M,M1){
	/* dataArr：收盘价数组 */
	if(!cancelData){
		return;
	}
	var H,H1,L,L1,ABSH,ABSL,TR = [],DMZ = [],DMF = [],DIZ = [],DIF = [],DDI = [],ADDI = [],AD = [],i,j,Y,_Y,result = [];
	for (i=0;i<cancelData.length;i++){
		var t,t1,t2;
		if(i>0){
			H = cancelData[i][3];
			H1 = cancelData[i-1][3];
			L = cancelData[i][2];
			L1 = cancelData[i-1][2];

		}
		else {
			H = cancelData[0][3];
			H1 = cancelData[0][3];
			L = cancelData[0][2];
			L1 = cancelData[0][2];

		}
		ABSH = (H>H1?(H-H1):(H1-H));
		ABSL = (L>L1?(L-L1):(L1-L));
		t = (ABSH>=ABSL?ABSH:ABSL);
		if((H+L)<=(H1+L1)){
			t1 = 0;
		}else{
			t1 = t;
		}
		if((H+L)>=(H1+L1)){
			t2 = 0;
		}else{
			t2 = t;
		}
		TR.push(t);
		DMZ.push(t1);
		DMF.push(t2);
	}
	for(i=0;i<DMZ.length;i++){
		var sum1 = 0;
		var sum2 = 0;
		var sumZ,sumF;
		if(i<=DMZ.length-N){
			for(j=i;j<i+N;j++){
				sum1 += DMZ[j];
				sum2 += DMF[j];
			}
		}else {
			for (j=i;j<DMZ.length;j++){
				sum1 += DMZ[j];
				sum2 += DMF[j];
			}
		}
		// if(i>=N){
		// 	for (j=i;j>i-N;j--){
		// 		sum1 += DMZ[j];
		// 		sum2 += DMF[j];
		// 	}
		// }else {
		// 	for (j=i;j>=0;j--){
		// 		sum1 += DMZ[j];
		// 		sum2 += DMF[j];
		// 	}
		// }
		sumZ = sum1/(sum1+sum2);
		sumF = sum2/(sum1+sum2);
		DIZ.push(sumZ);
		DIF.push(sumF);
	}
	// console.log(DIZ,DIF)
	for (i=0;i<DIZ.length;i++){
		DDI.push((DIZ[i]-DIF[i])*2);
	}
	for (i=0;i<DDI.length;i++){
		if(i == 0){
			Y = DDI[0];
		}else {
			_Y = ADDI[i-1];
			Y = [M*DDI[i]+(N1-M)*_Y]/N1;
		}
		ADDI.push(Y);
	}
	for (i=0;i<ADDI.length;i++){
		var sum = 0;
		if(i>=M1){
			for (j=i;j>i-M1;j--){
				sum += ADDI[j];
			}
			sum = sum/M1;
		}else {
			for (j=i;j>=0;j--){
				sum += ADDI[j];
			}
			sum = sum/(i+1);
		}
		AD.push(sum);
	}
	result = [DDI,ADDI,AD];
	return result;
};
//DMI计算
indexLibrary.DMI = function(cancelData,N,M){
	/* dataArr：收盘价数组 */
	if(!cancelData){
		return;
	}
	var TR1 = [],TR = [],HD = [],LD = [],DMP = [],DMM = [],DMP1 = [],DMM1 = [],PDI = [],MDI = [],ADX = [],ADX1 = [],ADXR = [],i,j,t,t1,max,max1,max2,low,result;
	//计算TR
	for (i=0;i<cancelData.length;i++){
		if(i!=0){
			t = cancelData[i][3]-cancelData[i-1][1];
			max1 = t>0?t:-t;
			max2 = cancelData[i][3]-cancelData[i][2];
			max = max1>max2?max1:max2;
			t = cancelData[i][2]-cancelData[i-1][1];
			low = t>0?t:-t;
		}else {
			t = cancelData[i][3]-cancelData[i][1];
			max1 = t>0?t:-t;
			max2 = cancelData[i][3]-cancelData[i][2];
			max = max1>max2?max1:max2;
			t = cancelData[i][2]-cancelData[i][1];
			low = t>0?t:-t;
		}
		t = max>low?max:low;
		TR1.push(t);
	}
	for (i=0;i<TR1.length;i++){
		var sum = 0;
		if(i<TR1.length-N){
			for (j=i;j<i+N;j++){
				sum += TR1[j];
			}
		}else {
			for (j=i;j<TR1.length;j++){
				sum += TR1[j];
			}
		}
		TR.push(sum);
	}
	//计算HD,LD
	for (i=0;i<cancelData.length;i++){
		if(i==0){
			t = cancelData[0][3]-cancelData[0][3];
			t1 = cancelData[0][2]-cancelData[0][2];
		}else{
			t = cancelData[i][3]-cancelData[i-1][3];
			t1 = cancelData[i-1][2]-cancelData[i][2];
		}
		HD.push(t);
		LD.push(t1);
	}
	//计算DMP,DMM
	for (i=0;i<HD.length;i++){
		if(HD[i]>0&&HD[i]>LD[i]){
			t = HD[i];
		}else {
			t = 0;
		}
		DMP1.push(t);
		if(LD[i]>0&&LD[i]>HD[i]){
			t = LD[i];
		}else {
			t = 0;
		}
		DMM1.push(t);
	}
	for (i=0;i<DMP1.length;i++){
		var sum = 0;
		var sum1 = 0;
		if(i<DMP1.length-N){
			for (j=i;j<i+N;j++){
				sum += DMP1[j];
				sum1 += DMM1[j];
			}
		}else {
			for (j=i;j<DMP1.length;j++){
				sum += DMP1[j];
				sum1 += DMM1[j];
			}
		}
		DMP.push(sum);
		DMM.push(sum1);
	}
	//计算PDI,MDI
	for (i=0;i<DMM.length;i++){
		t = DMP[i]*100/TR[i];
		t1 = DMM[i]*100/TR[i];
		PDI.push(t);
		MDI.push(t1);
	}
	for (i=0;i<MDI.length;i++){
		t = [(MDI[i]-PDI[i])/(MDI[i]+PDI[i])]*100;
		t = t>0?t:-t;
		ADX1.push(t);
	}
	for (i=0;i<ADX1.length;i++){
		var sum = 0;
		if(i>=M){
			for (j=i;j>i-M;j--){
				sum += ADX1[j];
			}
			sum = sum/M;
		}else {
			for (j=i+1;j>0;j--){
				sum += ADX1[j];
			}
			sum = sum/(i+1);
		}
		ADX.push(sum);
	}
	for (i=0;i<ADX.length;i++){
		if(i<M){
			t = ADX[i]+ADX[0];
		}else {
			t = ADX[i]+ADX[i-M];
		}
		ADXR.push(t/2);
	}
	result = [PDI,MDI,ADX,ADXR];
	return result;
};
indexLibrary.DMIQL = function(cancelData,N,M){
	/* dataArr：收盘价数组 */
	if(!cancelData){
		return;
	}
	var TR1 = [],TR = [],HD = [],LD = [],DMP = [],DMM = [],DMP1 = [],DMM1 = [],PDI = [],MDI = [],ADX = [],ADX1 = [],ADXR = [],i,j,t,t1,max,max1,max2,low,result;
	//计算TR
	for (i=0;i<cancelData.length;i++){
		if(i!=0){
			t = cancelData[i][3]-cancelData[i-1][1];
			max1 = t>0?t:-t;
			max2 = cancelData[i][3]-cancelData[i][2];
			max = max1>max2?max1:max2;
			t = cancelData[i][2]-cancelData[i-1][1];
			low = t>0?t:-t;
		}else {
			t = cancelData[i][3]-cancelData[i][1];
			max1 = t>0?t:-t;
			max2 = cancelData[i][3]-cancelData[i][2];
			max = max1>max2?max1:max2;
			t = cancelData[i][2]-cancelData[i][1];
			low = t>0?t:-t;
		}
		t = max>low?max:low;
		TR1.push(t);
	}
	for (i=0;i<TR1.length;i++){
		if(i>1){
			t = (1*TR1[i]+(N-1)*TR[i-1])/N;
		}else {
			t = TR1[i];
		}
		TR.push(t);
	}
	//计算HD,LD
	for (i=0;i<cancelData.length;i++){
		if(i==0){
			t = cancelData[0][3]-cancelData[0][3];
			t1 = cancelData[0][2]-cancelData[0][2];
		}else{
			t = cancelData[i][3]-cancelData[i-1][3];
			t1 = cancelData[i-1][2]-cancelData[i][2];
		}
		HD.push(t);
		LD.push(t1);
	}
	//计算DMP,DMM
	for (i=0;i<HD.length;i++){
		if(HD[i]>0&&HD[i]>LD[i]){
			t = HD[i];
		}else {
			t = 0;
		}
		DMP1.push(t);
		if(LD[i]>0&&LD[i]>HD[i]){
			t = LD[i];
		}else {
			t = 0;
		}
		DMM1.push(t);
	}
	for (i=0;i<DMP1.length;i++){
		if(i==0){
			t = DMP1[0];
			t1 = DMM1[0];
		}else {
			t = (1*DMP1[i]+(N-1)*DMP[i-1])/N;
			t1 = (1*DMM1[i]+(N-1)*DMM[i-1])/N;
		}
		DMP.push(t);
		DMM.push(t1);
	}
	//计算PDI,MDI
	for (i=0;i<DMM.length;i++){
		t = DMP[i]*100/TR[i];
		t1 = DMM[i]*100/TR[i];
		PDI.push(t);
		MDI.push(t1);
	}
	for (i=0;i<MDI.length;i++){
		t = [(MDI[i]-PDI[i])/(MDI[i]+PDI[i])]*100;
		t = t>0?t:-t;
		if(!t){
			t = 0;
		}
		ADX1.push(t);
	}
	for (i=0;i<ADX1.length;i++){
		if(i==0){
			t = ADX1[0];
		}else {
			t = (1*ADX1[i]+(N-1)*ADX[i-1])/N;
		}
		ADX.push(t);
	}
	for (i=0;i<ADX.length;i++){
		if(i<M){
			t = ADX[i]+ADX[0];
		}else {
			t = ADX[i]+ADX[i-M];
		}
		ADXR.push(t/2);
	}
	result = [PDI,MDI,ADX,ADXR];
	return result;
};
indexLibrary.BBI = function(dataArr,_M1,_M2,_M3,_M4){
	/* dataArr：收盘价数组 */
	if(!dataArr){
		return;
	}
	var M1 = parseInt(_M1),
		M2 = parseInt(_M2),
		M3 = parseInt(_M3),
		M4 = parseInt(_M4);
	var BBI = [],result,i,j;
	for (i=0;i<dataArr.length;i++){
		var baseMA3 = 0,baseMA6 = 0,baseMA12 = 0,baseMA24 = 0,t;
		if(i>=(M1-1)){
			for (j=i;j>=(i-M1+1);j--){
				baseMA3 += dataArr[j];
			}
			baseMA3 = baseMA3/M1;
		}else {
			for (j=i;j>=0;j--){
				baseMA3 += dataArr[i];
			}
			baseMA3 = baseMA3/(i+1);
		}
		if(i>=(M2-1)){
			for (j=i;j>=(i-M2+1);j--){
				baseMA6 += dataArr[j];
			}
			baseMA6 = baseMA6/M2;
		}else {
			for (j=i;j>=0;j--){
				baseMA6 += dataArr[i];
			}
			baseMA6 = baseMA6/(i+1);
		}
		if(i>=(M3-1)){
			for (j=i;j>=(i-M3+1);j--){
				baseMA12 += dataArr[j];
			}
			baseMA12 = baseMA12/M3;
		}else {
			for (j=i;j>=0;j--){
				baseMA12 += dataArr[i];
			}
			baseMA12 = baseMA12/(i+1);
		}
		if(i>=(M4-1)){
			for (j=i;j>=(i-M4+1);j--){
				baseMA24 += dataArr[j];
			}
			baseMA24 = baseMA24/M4;
		}else {
			for (j=i;j>=0;j--){
				baseMA24 += dataArr[i];
			}
			baseMA24 = baseMA24/(i+1);
		}
		t = (baseMA3+baseMA6+baseMA12+baseMA24)/4;
		BBI.push(t);
	}
	result = BBI;
	return result;
};
//移动平均值
indexLibrary.SMA = function(x,n,m){
	var arr = [],_y=null;
	for(var i=0,r=x.length;i<r;i++){
		if(_y == null){
			_y = 50;
		}
		_y = (m*x[i]+(n-m)*_y)/n;
		arr.push(_y);
	}
	return arr;
};
indexLibrary.sum = function(arr){
	return arr.reduce(function(prev, curr, idx, arr){
		return prev + curr;
	});
};
indexLibrary.SortByProps = function(item1, item2, obj) {
	var props = [];
	if(obj){
		props.push(obj);
	}
	var cps = [];  
	var asc = true;
	if (props.length < 1) {
		for (var p in item1) {
			if (item1[p] > item2[p]) {
				cps.push(1);
				break; // 大于时跳出循环。
			} else if (item1[p] === item2[p]) {
				cps.push(0);
			} else {
				cps.push(-1);
				break; // 小于时跳出循环。
			}
		}
	} 
	else {
		for (var i = 0; i < props.length; i++) {
			var prop = props[i];
			for (var o in prop) {
				asc = prop[o] === "ascending";
				if (item1[o] > item2[o]) {
					cps.push(asc ? 1 : -1);
					break; // 大于时跳出循环。
				} else if (item1[o] === item2[o]) {
					cps.push(0);
				} else {
					cps.push(asc ? -1 : 1);
					break; // 小于时跳出循环。
				}
			}
		}
	}        

	// 根据各排序属性比较结果综合判断得出两个比较项的最终大小关系
	for (var j = 0; j < cps.length; j++) {
		if (cps[j] === 1 || cps[j] === -1) {
			return cps[j];
		}
	}
	return false;          
};

//减法  
indexLibrary.Subtr = function(value1,value2){
	if(value1 == "") value1="0";
	if(value2 == "") value2="0";
	var temp1 = 0;
	var temp2 = 0;
	if(value1.indexOf(".") != -1)
	temp1 = value1.length - value1.indexOf(".")-1;
	if(value2.indexOf(".") != -1)
	temp2 = value2.length - value2.indexOf(".")-1; 

	var temp=0;

	if(temp1 > temp2)
	temp = (parseFloat(value1) - parseFloat(value2)).toFixed(temp1);
	else
	temp = (parseFloat(value1)- parseFloat(value2)).toFixed(temp2); 

	return temp;
};
indexLibrary.formatFloat = function (f, digit) {
	var m = Math.pow(10, digit);
	return Math.round(f * m, 10) / m;
};
indexLibrary.clearNoNum = function(value){
	value = value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符   
	value = value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的   
	value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
	value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数   
	if (value.indexOf(".") < 0 && value != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额  
		value = parseFloat(value);
	}
	return value;
};
//小数转换成整数
indexLibrary.floatChangeInt = function(str){
	var a,_str = str.toString();
	a = parseInt(_str.replace('.',''));
	return a;
};
//加密邮箱或手机
indexLibrary.entryptionInfo = function(str){
	return str.substr(0,2) + '****' + str.substr(-3,3);
};
indexLibrary.fullScreen = function() {
	element = document.querySelector("body");
    if(element.requestFullScreen) {  
        element.requestFullScreen();  
    }else if(element.webkitRequestFullScreen ) {  
        element.webkitRequestFullScreen();  
    }else if(element.mozRequestFullScreen) {  
        element.mozRequestFullScreen();  
    }  
};
indexLibrary.exitFullscreen = function() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	}
	else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	}
	else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
};
document.documentElement.addEventListener('touchstart', function (event) {
	if (event.touches.length > 1) {
		event.preventDefault();
	}
}, false);