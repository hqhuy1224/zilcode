

var BCSoLieuThuThapTheoPhienLV = {
	run: function (p) {

		var cbo = document.createElement("select");
		cbo.id = "cboKhuVuc";
		cbo.className = "w2ui-input";
		for (var i = 0; i < NUT.maps.length; i++) {
			var opt = document.createElement("option");
			var map = NUT.maps[i];
			opt.value = map.mapid;
			opt.innerHTML = map.mapname;
			cbo.add(opt);
		}

		NUT.w2popup.open({
			title: '📜 <i>Phiên làm việc</i>',
			modal:true,
			width: 360,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Khu vực</td><td>" + cbo.outerHTML +"</td></tr><tr><td>Từ ngày</td><td><input id='txtNgay' type='date' class='w2ui-input'/></td></tr><tr><td>Đến ngày</td><td><input id='txtNgay2' type='date' class='w2ui-input'/></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Close</button><button class="w2ui-btn" id="but_Report" onclick="BCSoLieuThuThapTheoPhienLV.runReport()">✔️ Report</button>'
		})
	},
	runReport:async function(){
		if (txtNgay.value || txtNgay2.value) {
			NUT.loading(but_Report);
			const Extent = await $arcgis.import("@arcgis/core/geometry/Extent.js");
			const Polygon = await $arcgis.import("@arcgis/core/geometry/Polygon.js");

			var map = NUT.maps[cboKhuVuc.selectedIndex];
			var json = JSON.parse(map.maparea);
			var area = json.rings ? new Polygon(json) : new Extent(json);

			var query = {
				outStatistics:[{
					onStatisticField: "objectid", 
					outStatisticFieldName: "count",
					statisticType: "count"
				}],
				groupByFieldsForStatistics: ["last_edited_user"],
				orderByFields: ["last_edited_user"],
				geometry: area,
				where: (txtNgay.value && txtNgay2.value ? "last_edited_date between '" + txtNgay.value + "' and '" + txtNgay2.value + "'" : (txtNgay.value ? "last_edited_date >= '" + txtNgay.value + "'" : "last_edited_date <= '" + txtNgay2.value + "'"))
			}

			var lookup = {};
			var total = 0;
			for (var key in NUT.map.layers) if (NUT.map.layers.hasOwnProperty(key)) {
				var lyr = NUT.map.layers[key];
				if (lyr.type == "subtype-group") {
					var res = await lyr.queryFeatures(query);
					var count2 = await lyr.queryFeatureCount({ geometry: area });
					if (res.error) NUT.notify("🛑 ERROR: " + res.error.message, "red");
					else {
						for (var i = 0; i < res.features.length; i++) {
							var attr = res.features[i].attributes;
							var user = attr["last_edited_user"];
							var count = attr["count"];
							if (lookup[user] === undefined) lookup[user] = count;
							else lookup[user] += count;
						}
						total += count2;
					}
				}
			}
			NUT.loading();
			var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/BCSoLieuThuThapTheoPhienLV.html");
			win.onload = function () {
				this.labKhuVuc.innerHTML = map.mapname;
				if (txtNgay.value) this.labNgay.innerHTML = "Từ ngày: "+txtNgay.value;
				if (txtNgay2.value) this.labNgay2.innerHTML = "Đến ngày: "+txtNgay2.value;
				var stt = 0;
				var sum = 0;
				var row0 = null;
				for (var key in lookup) if (lookup.hasOwnProperty(key)) {
					var row = this.tblData.insertRow();
					if (stt == 0) row0 = row;
					row.innerHTML = "<td align='center'>" + (++stt) + "</td><td>" + key + "</td><td align='center'>" + lookup[key] + "</td>";
					
					sum += lookup[key];
				}
				if (row0) {
					row0.innerHTML += "<td align='center' rowspan='" + stt + "'>" + (total - sum) +"</td><td align='center' rowspan='"+stt+"'>"+total+"</td>";
				}
			}

		} else NUT.notify("Nhập từ ngày/đến ngày trước khi thực hiện!","yellow");
	}
}