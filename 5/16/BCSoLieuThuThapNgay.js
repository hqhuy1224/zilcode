var BCSoLieuThuThapNgay = {
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
			title: '📜 <i>Thu thập theo ngày</i>',
			modal: true,
			width: 360,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Khu vực</td><td>" + cbo.outerHTML + "</td></tr><tr><td>Ngày</td><td><input id='txtNgay' type='date' class='w2ui-input'/></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Close</button><button class="w2ui-btn" id="but_Report" onclick="BCSoLieuThuThapNgay.runReport()">✔️ Report</button>'
		})
	},
	runReport: async function () {
		if (txtNgay.value) {
			NUT.loading(but_Report);
			const Extent = await $arcgis.import("@arcgis/core/geometry/Extent.js");
			const Polygon = await $arcgis.import("@arcgis/core/geometry/Polygon.js");
			var map = NUT.maps[cboKhuVuc.selectedIndex];
			var json = JSON.parse(map.maparea);
			var area = json.rings ? new Polygon(json) : new Extent(json);

			var query = {
				geometry: area,
				where: "last_edited_date>='" + txtNgay.value + " 00:00:00' and last_edited_date<='" + txtNgay.value + " 23:59:59'"
			}
			var query2 = {
				geometry: area,
				where: "last_edited_date<'" + txtNgay.value + " 00:00:00'"
			}

			var total = {};
			for (var key in NUT.map.layers) if (NUT.map.layers.hasOwnProperty(key)) {
				var lyr = NUT.map.layers[key];
				if (lyr.type == "subtype-sublayer") {
					var count = await lyr.queryFeatureCount(query);
					var count2 = await lyr.queryFeatureCount(query2);
					total[lyr.parent.title + lyr.title] = [count,count2];
				}
			}
			var where = [["starttime", "<=", txtNgay.value], ["endtime", ">=", txtNgay.value]];
			where.push(["mapid", "=", cboKhuVuc.value]);
			NUT.ds.select({ url: NUT.services[20].url + "data/nhiemvu", where: where }, function (res) {
				NUT.loading();
				if (res.success) {
					var lookup = {};
					var ids = [];
					for (var i = 0; i < res.result.length; i++) {
						var nv = res.result[i];
						lookup[nv.id] = nv;
						ids.push(nv.id);
					}
					if (ids.length) {
						var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/BCSoLieuThuThapNgay.html");
						win.onload = function () {
							this.labKhuVuc.innerHTML = map.mapname;
							if (txtNgay.value) this.labNgay.innerHTML = "Từ ngày: " + txtNgay.value;
							var that = this;
							NUT.ds.select({ url: NUT.services[20].url + "data/rpt_grpnhiemvuct", where: ["id", "in", ids], orderby: "id" }, function (res2) {
								if (res2.success) {
									var sum = [0, 0, 0, 0];
									var oldid = res2.result[0].id;
									var row = null;
									var stt = 0;
									for (var i = 0; i < res2.result.length; i++) {
										var rec = res2.result[i];
										var nv = lookup[rec.id];
										var tong = total[rec.nhomthietbi + rec.loaithietbi];
										row = that.tblData.insertRow();
										row.innerHTML = "<td align='center'>" + (++stt) + "</td><td>" + nv.title + "</td><td align='center'>" + nv.starttime.substring(0, 10) + " - " + nv.endtime.substring(0, 10) + "</td><td align='center'>" + rec.nhomthietbi + "</td><td align='center'>" + rec.loaithietbi + "</td><td align='center'>" + tong[0] + "</td><td align='center'>" + tong[1] + "</td><td align='center'>" + rec.slthuthap + "</td><td align='center'>" + (rec.sltong - tong[0]) + "</td>";
										sum[0] += tong[0];
										sum[1] += tong[1];
										sum[2] += rec.slthuthap;
										sum[3] += rec.sltong - tong[0];
										if (oldid != rec.id) {
											row = that.tblData.insertRow();
											row.innerHTML = "<th></th><th align='center' colspan='4'>Tổng: </th><th align='center'>" + sum[0] + "</th><th align='center'>" + sum[1] + "</th><th align='center'>" + sum[2] + "</th><th align='center'>" + sum[3] + "</th>";
											oldid = rec.id;
											sum = [0, 0, 0, 0];
											stt = 0;
										}
									}
									row = that.tblData.insertRow();
									row.innerHTML = "<th></th><th align='center' colspan='4'>Tổng: </th><th align='center'>" + sum[0] + "</th><th align='center'>" + sum[1] + "</th><th align='center'>" + sum[2] + "</th><th align='center'>" + sum[3] + "</th>";
								} else NUT.notify("🛑 ERROR: " + res2.result, "red");
							});
						}
					} else NUT.notify("⚠️ No data to report", "yellow"); 
				} else NUT.notify("🛑 ERROR: " + res.result, "red");
			});
		} else NUT.notify("Nhập ngày khi thực hiện!", "yellow");
	}
}