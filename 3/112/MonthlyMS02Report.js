var MonthlyMS02Report={
	// Ngày lễ cố định theo dương lịch (ngày-tháng). Các ngày lễ khác (Tết, Giỗ Tổ...) khai báo thêm vào holidays.
	fixedHolidays:["1-1","30-4","1-5","2-9"],
	// Bổ sung theo từng tháng: {"2026-02":[16,17,18,19,20],...}
	holidays:{},
	codes:["KL","KLO","N","NL","S","E"],

	run:function(p){
		MonthlyMS02Report.url = NUT.services[3].url;
		var now=new Date();
		NUT.w2popup.open({
			title: '📜 <i>Monthly MS02-Chấm công Report</i>',
			modal:true,
			width: 360,
			height: 200,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='num_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='num_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td>HABECO</td>"+(n$.user.tag?"<td></td><td>":"<td>Khu vực</td><td>"+NUT.outerCboHTML(NUT.domains[1201].items,"cbo_ThiTruong"))+"</td></tr><tr><td>Vị trí</td><td colspan='3'><select id='cbo_ViTriLv'><option value='' selected>---Tất cả--</option><option value='BA'>BA</option><option value='BA_'>BA_PartTime</option></select></td></tr><tr><td></td><td colspan='3'></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="MonthlyMS02Report.runReport()">✔️ Xuất báo cáo</button>'
		})
	},

	runReport:function(){
		if(!(num_Year.value&&num_Month.value)){
			NUT.notify("Nhập năm, tháng trước khi thực hiện!","yellow");
			return;
		}
		var nam=num_Year.value;
		var thang=num_Month.value;
		var vitrilv=document.getElementById("cbo_ViTriLv").value;
		var cboThiTruong=document.getElementById("cbo_ThiTruong");
		var thiTruongSel=cboThiTruong?String(cboThiTruong.value).trim():"";

		// Bộ lọc: chỉ thêm khi người dùng có chọn (trước đây bị tắt nên chọn thị trường / vị trí không có tác dụng)
		var where=[
			["nam","=",nam],
			["thang","=",thang]
			//["madoitac","=","HABECO"],
			//["dulieu","=",chk_Edit.checked?1:0]
		];
		//if(n$.user.orgs)where.push(["makhuvuc","in",n$.user.orgs]);
		// Lọc thị trường trên dữ liệu trả về, giống DailyCheckInoutReport.
		if(vitrilv=="BA")where.push(["vitrilv","=","BA"]);
		else if(vitrilv)where.push(["vitrilv","like",vitrilv+"*"]);

		var LIMIT=20000;
		NUT.ds.select({
			url:MonthlyMS02Report.url+"data/chamcong_v",
			limit:LIMIT,
			orderby:"sttkv,stt,madiemban",
			where:where
		},function(res){
			if(!res.success){
				NUT.notify("Không đọc được dữ liệu chamcong_v."+(typeof res.result=="string"?" "+res.result:""),"red");
				return;
			}
			var data=res.result||[];
			// chạm giới hạn dòng thì số liệu cuối danh sách bị thiếu: báo ngay thay vì xuất báo cáo thiếu
			if(data.length>=LIMIT){
				NUT.notify("Dữ liệu tháng chạm giới hạn "+LIMIT+" dòng. Hãy chọn thêm vị trí để tránh xuất thiếu dữ liệu.","red");
				return;
			}
			if(thiTruongSel)data=data.filter(function(rec){
				return String(rec.thitruong==null?"":rec.thitruong).trim()===thiTruongSel;
			});
			if(!data.length){
				NUT.notify("Không có dữ liệu báo cáo!","yellow");
				return;
			}
			var win=window.open("site/"+n$.user.siteid+"/"+n$.app.appid+"/Monthlyms02reportba.html?v=20261119.1");
			if(!win){NUT.notify("Trình duyệt đã chặn cửa sổ báo cáo!","yellow");return;}
			win.onload=function(){
				MonthlyMS02Report.render(win,data,parseInt(nam,10),parseInt(thang,10),thiTruongSel);
			};
		});
	},

	isHoliday:function(nam,thang,d){
		var fixed=MonthlyMS02Report.fixedHolidays;
		if(fixed.indexOf(d+"-"+thang)>=0)return true;
		var extra=MonthlyMS02Report.holidays[nam+"-"+(thang<10?"0":"")+thang];
		return !!(extra&&extra.indexOf(d)>=0);
	},

	render:function(win,rows,nam,thang,thiTruongSel){
		var doc=win.document;
		var self=MonthlyMS02Report;
		var esc=function(s){return s==null?"":String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");};
		var fmt=function(v){return v?String(Math.round(v*100)/100):"";};
		var nDays=new Date(nam,thang,0).getDate();
		var codes=self.codes;

		// ---- 1. Gom dữ liệu: mỗi nhân viên một dòng, mỗi ngày một ô ----
		var mgr={};      // makhuvuc -> {TL:..., TF:...}
		var seen={};     // loại dòng trùng do JOIN TL/TF
		var emps=[],empMap={};
		for(var i=0;i<rows.length;i++){
			var rec=rows[i];
			// thu thập quản lý trước khi bỏ dòng trùng (dòng trùng mang tên TL/TF còn lại)
			if(rec.machucvu&&rec.hotenquanly){
				if(!mgr[rec.makhuvuc])mgr[rec.makhuvuc]={};
				mgr[rec.makhuvuc][rec.machucvu]=rec.hotenquanly;
			}
			var key=rec.idchamcong!=null?rec.idchamcong:[rec.manhanvien,rec.ngay,rec.madiemban,rec.lan,rec.ca].join("_");
			if(seen[key])continue;
			seen[key]=1;

			var e=empMap[rec.manhanvien];
			if(!e){
				e={ma:rec.manhanvien,ten:rec.hotenNVTT||rec.hotennvtt||rec.hoten,makhuvuc:rec.makhuvuc,tenkhuvuc:rec.tenkhuvuc,tenthitruong: rec.tenthitruong ,points:[],pt:{},days:[]};
				for(var d=0;d<=31;d++)e.days.push({cong:0,code:""});
				empMap[rec.manhanvien]=e;
				emps.push(e);
			}
			if(rec.madiemban&&!e.pt[rec.madiemban]){
				e.pt[rec.madiemban]=1;
				e.points.push(rec);
			}
			var day=parseInt(rec.ngay,10);
			if(day>=1&&day<=31){
				var x=e.days[day];
				x.cong+=Number(rec.cong)||0;
				if(rec.chamcong&&!x.code)x.code=rec.chamcong;
			}
		}

		// ---- 2. Header ----
		var thitruong=rows[0].thitruong||thiTruongSel||"";
		doc.getElementById("labThangNam").innerHTML="THÁNG "+(thang<10?"0":"")+thang+" NĂM "+nam;
		doc.getElementById("labThiTruong").innerHTML=esc(thitruong);
		doc.getElementById("labNgayThang").innerHTML="Hà Nội, ngày........tháng........năm "+nam;

		// class theo ngày: chủ nhật (xám), lễ (hồng), ngày không tồn tại trong tháng (xám đậm)
		var cls=[""];
		for(var d=1;d<=31;d++){
			var c="";
			if(d>nDays)c="na";
			else if(self.isHoliday(nam,thang,d))c="hol";
			else if(new Date(nam,thang-1,d).getDay()==0)c="sun";
			cls[d]=c;
			var th=doc.getElementById("thd"+d);
			if(th)th.className="d "+c;
		}

		// ---- 3. Dòng nhân viên ----
		var tDay=[],gCnt={},gThuc=0,gQuy=0,gTong=0;
		for(var d=0;d<=31;d++)tDay[d]=0;
		for(var k=0;k<codes.length;k++)gCnt[codes[k]]=0;

		var html="";
		for(var i=0;i<emps.length;i++){
			var e=emps[i];
			var cnt={};
			for(var k=0;k<codes.length;k++)cnt[codes[k]]=0;
			var thucte=0,cells="";
			for(var d=1;d<=31;d++){
				var x=e.days[d];
				var cong=Math.min(1,x.cong); // nhiều điểm bán trong ngày: tối đa 1 công
				var txt="",extra="";
				if(d<=nDays){
					if(cong>0){
						txt=fmt(cong);
						thucte+=cong;
						tDay[d]+=cong;
					}else if(x.code){
						txt=esc(x.code);
						extra=" code";
						if(cnt[x.code]!=null)cnt[x.code]++;
					}
				}
				cells+='<td class="d '+cls[d]+extra+'">'+txt+'</td>';
			}
			var quytru=0; // view chưa có dữ liệu quy trừ
			var tong=thucte+quytru;
			gThuc+=thucte;gQuy+=quytru;gTong+=tong;

			var pts=function(f){
				var a=[];
				for(var p=0;p<e.points.length;p++)a.push(esc(e.points[p][f]));
				return a.join("<br/>");
			};
			var m=mgr[e.makhuvuc]||{};
			var ql=m.TF||m.TL||"";

			html+='<tr data-report-province="'+esc(e.tenthitruong).replace(/"/g,'&quot;')+'" data-province-columns="9">'
				+'<td>'+(i+1)+'</td>'
				+'<td>'+esc(e.tenthitruong)+'</td>'
				+'<td>'+esc(ql)+'</td>'
				+'<td class="l">'+esc(e.ten)+'</td>'
				+'<td>'+pts("loaihinh")+'</td>'
				+'<td class="l">'+pts("tendiemban")+'</td>'
				+'<td>'+pts("sonha")+'</td>'
				+'<td class="l">'+pts("duong")+'</td>'
				+'<td class="l">'+pts("huyen")+'</td>'
				+cells
				+'<td class="green">'+fmt(thucte)+'</td>'
				+'<td class="green">'+fmt(quytru)+'</td>'
				+'<td class="green"><b>'+fmt(tong)+'</b></td>';
			for(var k=0;k<codes.length;k++){
				html+='<td class="red">'+fmt(cnt[codes[k]])+'</td>';
				gCnt[codes[k]]+=cnt[codes[k]];
			}
			html+='<td></td><td></td></tr>';
		}

		// ---- 4. Dòng tổng cộng ----
		html+='<tr class="sumrow"><td colspan="9" class="lbl">Tổng cộng</td>';
		for(var d=1;d<=31;d++)html+='<td class="d '+cls[d]+'">'+(d<=nDays?(Math.round(tDay[d]*100)/100):"")+'</td>';
		html+='<td>'+(Math.round(gThuc*100)/100)+'</td><td>'+(Math.round(gQuy*100)/100)+'</td><td class="yellow">'+(Math.round(gTong*100)/100)+'</td>';
		for(var k=0;k<codes.length;k++)html+='<td class="red">'+gCnt[codes[k]]+'</td>';
		html+='<td></td><td></td></tr>';

		doc.getElementById("tbdData").innerHTML=html;
	}
}
