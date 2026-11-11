

var BCSoLieuThuThapTheoNhiemVu = {
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
			title: '📜 <i>Phân công công việc</i>',
			modal:true,
			width: 360,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Khu vực</td><td>" + cbo.outerHTML +"</td></tr><tr><td>Từ ngày</td><td><input id='txtNgay' type='date' class='w2ui-input'/></td></tr><tr><td>Đến ngày</td><td><input id='txtNgay2' type='date' class='w2ui-input'/></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Close</button><button class="w2ui-btn" id="but_Report" onclick="BCSoLieuThuThapTheoNhiemVu.runReport()">✔️ Report</button>'
		})
	},
	runReport:async function(){
		if (txtNgay.value || txtNgay2.value) {
			NUT.loading(but_Report);
			var where = ["mapid", "=", cboKhuVuc.value];
			if (txtNgay.value) where.push(["starttime", ">=", txtNgay.value]);
			if (txtNgay2.value) where.push(["endtime", "<=", txtNgay2.value]);

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
						var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/BCSoLieuThuThapTheoNhiemVu.html");
						win.onload = function () {
							this.labKhuVuc.innerHTML = "mapname";
							if (txtNgay.value) this.labNgay.innerHTML = "Từ ngày: " + txtNgay.value;
							if (txtNgay2.value) this.labNgay2.innerHTML = "Đến ngày: " + txtNgay2.value;
							var stt = 0;
							var that = this;

							NUT.ds.select({ url: NUT.services[20].url + "data/rpt_sumnhiemvuct", where: ["id", "in", ids] }, function (res) {
								if (res.success) {
									for (var i = 0; i < res.result.length; i++) {
										var rec = res.result[i];
										var nv = lookup[rec.id];

										var row = that.tblData.insertRow();
										row.innerHTML = "<td align='center'>" + (++stt) + "</td><td>" + nv.title + "</td><td align='center'>" + nv.starttime.substring(0, 10) + " ~ " + nv.endtime.substring(0, 10) + "</td><td align='center'>" + rec.slthuthap + "</td><td align='center'>" + rec.slhoanthanh + "</td><td align='center'>" + (rec.slthuthap - rec.slhoanthanh) + "</td>";

									}
								} else NUT.notify("🛑 ERROR: " + res.result, "red");
							});

						}
					} else NUT.notify("⚠️ No data to report", "yellow");

				} else NUT.notify("🛑 ERROR: " + res.result, "red");
			});
			

		} else NUT.notify("Nhập từ ngày/đến ngày trước khi thực hiện!","yellow");
	}
}