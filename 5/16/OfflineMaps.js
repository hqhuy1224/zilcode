var OfflineMaps = {
	run: function (p) {
		var a = NUT.createWindowTitle("OfflineMaps", divTitle);
		a.innerHTML = "Bản đồ Offline";
		a.div.innerHTML = "";

		(NUT.w2ui['gridDataSet'] || new NUT.w2grid({
			name: 'gridDataSet',
			recid: "id",
			multiSelect: true,
			show: {
				footer: true
			},
			columns: [
				{ field: "id", text: "OID",info:{icon: 'w2ui-icon-search',style: "float:left"},sortable:true },
				{ field: "loaiset", text: "Loại sét",sortable:true},
				{ field: "giatri", text: "Giá trị (kA)", render:"float",sortable:true },
				{ field: "thoigian", text: "Thời gian", render: "datetime",sortable:true },
				{ field: "lat", text: "Kinh độ",sortable:true },
				{ field: "lng", text: "Vĩ độ",sortable:true }
			],
			showBubble(evt) {
				NUT.AGMap.zoomToSelect(SetMonitor.lyr.id);
			},
			onSelect: function (evt) {
				var selid = (evt.detail.clicked ? evt.detail.clicked.recid || evt.detail.clicked.recids : evt.detail.recid);
				NUT.AGMap.selectByOID(SetMonitor.lyr.id, selid);
			}
		})).render(divDataSet);
		
		divDuLieu.style.display = "none";
		(NUT.w2ui['tabMonTabs'] || new NUT.w2tabs({
			name: 'tabMonTabs',
			active: 'tabHienTai',
			tabs: [
				{ id: 'tabHienTai', text: 'Giám sát' },
				{ id: 'tabDuLieu', text: 'Dữ liệu' }
			],
			onClick(evt) {
				if (evt.target == "tabDuLieu") {
					divDuLieu.style.display = "";
					divMonitor.style.display = "none";
				} else {
					divDuLieu.style.display = "none";
					divMonitor.style.display = "";
					SetMonitor.showDashboard();
				}
			}
		})).render(divMonTabs);

		NUT.AGMap.onInit=function(){	
			
			var opt = {
				id:"LYR_SETMONITOR",
				title:"Sét",
				selectable:true,
				popupEnabled:true,
				source: [],
				spatialReference: { wkid: 4326 },
				objectIdField: "id",
				geometryType: "point",
				fields: [
					{ name: "id", alias: "ID", type: "oid" },
					{ name: "loaiset", alias: "Loại sét", type: "string" },
					{ name: "thoigian", alias: "Thời gian", type: "date" },
					{ name: "giatri", alias: "Giá trị (kA)", type: "single" },
					{ name: "lat", alias: "Kinh độ", type: "single" },
					{ name: "lng", alias: "Vĩ độ", type: "single" },
					{ name: "tstamp", alias: "Timestamp", type: "long" }
				],
				popupTemplate: {
					title: "Sét #{id}",
					content: [
						{
							type: "fields",
							fieldInfos: [
								{ fieldName: "loaiset", label: "Loại sét" },
								{ fieldName: "thoigian", label: "Thời gian" },
								{ fieldName: "giatri", label: "Giá trị (kA)" },
								{ fieldName: "lat", label: "Vĩ độ" },
								{ fieldName: "lng", label: "Kinh độ" }
							]
						}
					]
				},
				renderer: {
					type: "unique-value",
					valueExpression: "IIF($feature.tstamp>"+((new Date().getTime())-3600000)+",$feature.loaiset,$feature.loaiset+1)",
					uniqueValueInfos: [
						{
							value: 'CG',
							symbol: {type: "picture-marker",url: "site/5/9/CG.png"},
							label:"Sét xuống đất"
						},
						{
							value: 'CG1',
							symbol: {type: "picture-marker",url: "site/5/9/CG20.png"},
							label:"Sét xuống đất"
						}
					]
				}
			}
			var lyr = new NUT.AGMap.FeatureLayer(opt);
			NUT.AGMap.map.add(lyr);
			NUT.AGMap.layers['LYR_SETMONITOR'] = lyr;
			SetMonitor.lyr=lyr;

			opt = {
				id:"LYR_SETHISTORY",
				title:"Lịch sử sét",
				selectable:true,
				popupEnabled:true,
				source: [],
				spatialReference: { wkid: 4326 },
				objectIdField: "id",
				geometryType: "point",
				fields: [
					{ name: "id", alias: "ID", type: "oid" },
					{ name: "loaiset", alias: "Loại sét", type: "string" },
					{ name: "thoigian", alias: "Thời gian", type: "date" },
					{ name: "giatri", alias: "Giá trị (kA)", type: "single" },
					{ name: "nguyhiem", alias: "Nguy hiểm (<100m)", type: "small-integer" },
					{ name: "hanoi", alias: "Khu vực HN", type: "small-integer" },
					{ name: "lat", alias: "Kinh độ", type: "single" },
					{ name: "lng", alias: "Vĩ độ", type: "single" },
					{ name: "nam", alias: "Năm", type: "small-integer" },
					{ name: "thang", alias: "Tháng", type: "small-integer" },
					{ name: "ngay", alias: "Ngày", type: "small-integer" },
					{ name: "gio", alias: "Giờ", type: "small-integer" },
				],
				
				popupTemplate: {
					title: "Sét #{id}",
					content: [
						{
							type: "fields",
							fieldInfos: [
								{ fieldName: "loaiset", label: "Loại sét" },
								{ fieldName: "thoigian", label: "Thời gian" },
								{ fieldName: "giatri", label: "Giá trị (kA)" },
								{ fieldName: "nguyhiem", label: "Nguy hiểm (<10m)" },
								{ fieldName: "hanoi", label: "Khu vực HN", },
								{ fieldName: "lat", label: "Vĩ độ" },
								{ fieldName: "lng", label: "Kinh độ" }
							]
						}
					]
				},
				renderer: {
					type: "unique-value",
					field: "loaiset",
					uniqueValueInfos: [
						{
							value: 'CG',
							symbol: {type: "picture-marker",url: "site/5/9/CG20.png"},
							label:"Sét xuống đất"
						},
						{
							value: 'CP',
							symbol: {type: "picture-marker",url: "site/5/9/CP20.png"},
							label:"Sét trong mây"
						}
					]
				},
				featureEffect : {
					filter: {where:"nguyhiem=1"},
					includedEffect: "bloom(3)"
				}
			}
			
			lyr= new NUT.AGMap.FeatureLayer(opt);
			NUT.AGMap.map.add(lyr);
			NUT.AGMap.layers['LYR_SETHISTORY'] = lyr;
			SetMonitor.lyrHistory=lyr;
			
			NUT.AGMap.layers["1980c8cfca1-layer-3"].queryFeatures({where:"1=1",returnGeometry:true}).then(function(res){
				SetMonitor.dangerZone=res.features[0].geometry;
				SetMonitor.pullSetData();
				SetMonitor.lyr.featureEffect=SetMonitor.lyrHistory.featureEffect={
					filter: {geometry:SetMonitor.dangerZone},
					includedEffect: "bloom(3)"
				}
			});
			
			setInterval(function () {
				SetMonitor.pullSetData();
			}, 600000);
			
		}
	},
	cboThoiDiem_onChange:function(){
		var where="tstamp between "+cboThoiDiem.value+" and "+SetMonitor.now;
		if(chkHn.checked)where+=" AND lng between " + SetMonitor.X1 + " and " + SetMonitor.X4 + " AND LAT between " + SetMonitor.Y1 + " and " + SetMonitor.Y4;
		SetMonitor.lyr.definitionExpression=where;

		SetMonitor.showDashboard();
	},
	pullSetData: function () {
		SetMonitor.now=Math.round(new Date().getTime()/300000)*300000;//timezone +25200000
		var now=new Date(SetMonitor.now);
		var stamp=now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
		SetMonitor.stamp=stamp;
		var now2=new Date(SetMonitor.now-24*3600000);
		var stamp2=now2.getFullYear()+"-"+(now2.getMonth()+1)+"-"+now2.getDate()+"+"+now2.getHours()+":"+now2.getMinutes()+":"+now2.getSeconds();
		var now3=SetMonitor.now-3600000;
		
		var url=NUT.URL_PROXY+"https://set.evnhanoi.vn/rest/proxy?http://10.2.60.1:8080/cp4/dbserver/LdQuery.php?format=default&s="+stamp2+"&e="+stamp.replace(" ","+")+"&limit=9999&nocloud=checked";
		if(chkHn.checked)url+="&ll=20.510958&ul=21.459775&lg=105.163522&ug=106.078134"
		NUT.loading(divMap);
		NUT.ds.getText({url:url},function(res){
			var graphics=[];
			var lines=res.split("\n");
			for(var i=0;i<lines.length;i++){
				var rec=lines[i].split('\t');
				if(rec.length==8){
					var tg=new Date(rec[0]).getTime();
					var data={id:i,loaiset:"CG",thoigian:tg,lat:parseFloat(rec[1]),lng:parseFloat(rec[2]),giatri:parseFloat(rec[3]),tstamp:tg};
						
					graphics.push({
						geometry: {type: "point",x: data.lng,y: data.lat},
						attributes:data
					});
				}
			}
			var lyr=NUT.AGMap.layers['LYR_SETMONITOR'];
			lyr.queryFeatures({ where: "1=1" }).then(function (res2) {
				lyr.oidOffset = (lyr.oidOffset || 0) + res2.features.length;
				lyr.applyEdits({
					deleteFeatures: res2.features,
					addFeatures: graphics
				});
				lyr.definitionExpression="tstamp between "+now3+" and "+SetMonitor.now;
				NUT.loading();
			});
		});
		
		cboThoiDiem.innerHTML="<option value='"+now3+"'>Trong vòng <1h</option>";
		for (var i = 2; i <=24; i++) {
			var opt = document.createElement("option");
			var khoangtg=SetMonitor.now-i*3600000;
			opt.value = khoangtg;
			opt.innerHTML = new Date(khoangtg).toLocaleString() + " (<"+i+"h)";
			cboThoiDiem.add(opt);
		}
		SetMonitor.showDashboard();
	},
	showDashboard:function () {
		var lyr=SetMonitor.lyr;
		//top 20
		lyr.queryFeatures({where:lyr.definitionExpression,num:20,outFields:["id","loaiset","giatri","thoigian"],orderByFields:["thoigian DESC"]}).then(function (res) {
			if(res.error)NUT.notify(res.error.message,"red");
			else {
				var line20 = ["<h3>20 cú sét gần nhất</h3>"];
				for (var i = 0; i < res.features.length; i++) {
					var s = res.features[i].attributes;
					line20.push((s.loaiset=="CP" ? "⚡Sét " : "➖Sét ") + s.giatri + "kV " + "lúc " + (new Date(s.thoigian).toLocaleString()));
				}
				top20.innerHTML = "<marquee style='height:500px' direction='up' scrollamount='3'>" + line20.join("<br/><br/>") + "</marquee>";
			}
		});
		//CP-CG
		var tk = ["<ul><h3>&nbsp;Thống kê </h3><br/>"];
		var total=0;
		lyr.queryFeatureCount({where:lyr.definitionExpression+" AND loaiset='CG'"}).then(function (res) {
			tk.push("<img width='20' src='site/5/9/CG.png'/>Sét xuống đất: " + res + " cú");
			total+=res;
			lyr.queryFeatureCount({where:lyr.definitionExpression+" AND loaiset='CP'"}).then(function (res2) {
				tk.push("<img width='20' src='site/5/9/CP.png'/>Sét trên mây: " + res2 + " cú");
				thongkeset.innerHTML = tk.join("</li><li>") + "</ul><br/>";
				total+=res2;
				tongcuset.innerHTML = "<h2>Tổng số cú sét</h2><br/><h1 style='color:#007AFF;cursor:pointer' onclick='NUT.w2ui.tabMonTabs.click(\"tabDuLieu\");chkNguyHiem.checked=false;SetMonitor.timDuLieuSet()'>" + total + "</h1>";
			})
		});
		//DANGER
		lyr.queryFeatureCount({where:lyr.definitionExpression,geometry:SetMonitor.dangerZone}).then(function(count){
			setnguyhiem.innerHTML = "<br/><h2>Sét gần đường dây (<100m)</h2><br/><h1 style='color:#007AFF;cursor:pointer' onclick='NUT.w2ui.tabMonTabs.click(\"tabDuLieu\");chkNguyHiem.checked=true;SetMonitor.timDuLieuSet()'>" + count + "</h1>";
		});
			
		var now1=SetMonitor.now-600000;
		var where=(chkHn.checked?" AND lng between " + SetMonitor.X1 + " and " + SetMonitor.X4 + " AND LAT between " + SetMonitor.Y1 + " and " + SetMonitor.Y4:"");
		lyr.queryFeatureCount({where:"tstamp between "+now1+" and "+SetMonitor.now+" "+where}).then(function(res1){
			var now2=SetMonitor.now-1200000;
			lyr.queryFeatureCount({where:"tstamp between "+now2+" and "+now1+" "+where}).then(function(res2){
				var now3=SetMonitor.now-1800000;
				lyr.queryFeatureCount({where:"tstamp between "+now3+" and "+now2+" "+where}).then(function(res3){
					var now4=SetMonitor.now-2400000;
					lyr.queryFeatureCount({where:"tstamp between "+now4+" and "+now3+" "+where}).then(function(res4){
						var now5=SetMonitor.now-3000000;
						lyr.queryFeatureCount({where:"tstamp between "+now5+" and "+now4+" "+where}).then(function(res5){
							var now6=SetMonitor.now-3600000;
							lyr.queryFeatureCount({where:"tstamp between "+now6+" and "+now5+" "+where}).then(function(res6){
								Highcharts.chart(xuhuongset, {
									chart: {
										width: 250,
										height: 250
									},
									credits: {
										enabled: false
									},
									title: {
										text: 'Xu hướng cú sét (1h)'
									},
									yAxis: {
										title: {
											text: 'Số cú sét'
										}
									},
									series: [{
										data: [res6,res5,res4,res3,res2,res1]
									}]
								});
							});
						});
					});
				});
			});
		});
	},
	timDuLieuSet: function () {
		var where = [SetMonitor.lyr.definitionExpression];
		if (cboDangSet.value) where.push("loaiset='" + cboDangSet.value+"'");
		if(txtCuongDo.value)where.push("giatri"+txtCuongDo.value);
		var query={where:where.join(" and "),outFields:["*"]};
		if(chkNguyHiem.checked)query.geometry=SetMonitor.dangerZone;
		SetMonitor.lyr.queryFeatures(query).then(function (res) {
			var records = [];
			for (var i = 0; i < res.features.length; i++) {
				var attr=res.features[i].attributes;
				records.push(attr);
			}
			NUT.w2ui.gridDataSet.records = records;
			NUT.w2ui.gridDataSet.total=records.length
			NUT.w2ui.gridDataSet.refresh();
		});
	}
}