var InPL03_01 = {
	run: function (p) {
		InPL03_01.url = NUT.services[7].url;
		var items = NUT.domains[1112].items;
		var cbo = document.createElement("select");
		cbo.id = "cboPhuong";
		cbo.className = "w2ui-input";
		for (var i =0; i < items.length;i++) {
			var opt = document.createElement("option");
			opt.value = items[i].id;
			opt.innerHTML = items[i].text;
			cbo.add(opt);
		}
		NUT.openDialog({
			title: '📜 <i>In biểu PL03_01</i>',
			modal: true,
			width: 360,
			height: 180,
			div: "<table style='margin:auto'><caption><i><b>Báo cáo</b></i></caption><tr><td>Phường/Xã *</td><td colspan='3'>" + cbo.outerHTML + "</td></tr><tr><td>Đã chốt</td><td><input id='chkLock' checked type='checkbox'/></td></tr></table>",
			actions: {
				"_Close": function () {
					NUT.w2popup.close();
				},
				"_Ok": function () {
					var where = [];
					if (cboPhuong.value)where.push(["MaXa", "=", cboPhuong.value]);
					if (chkLock.checked) where.push(["LOCK", "=", 1]);

					NUT.ds.select({ url: InPL03_01.url + "data/PL03_01", where: where.length?where:[1,"=",1], limit: 99999 }, function (res) {
						if (res.success && res.result.length) {
							var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/InPL03_01.html");
							win.onload = function () {
								this.labNgayBaoCao.innerHTML = (new Date()).toLocaleString();
								for (var i = 0; i < res.result.length; i++) {
									var rec = res.result[i];
									var row = this.tblData.insertRow();
									row.innerHTML = "<td align='center'>" + (i + 1) + "</td><td>" + (rec.MaXa ||"")+ "</td><td>" + (rec.SoPhatHanh || rec.MaGCN ||"")+ "</td><td>" + (rec.NgayCapGCN ||"")+ "</td><td>" + (rec.SoVaoSo ||"")+ "</td><td>" + (rec.TenToChuc ||"")+ "</td><td>" + (rec.SoDinhDanhToChuc ||"")+ "</td><td>" + (rec.HoTenChu ||"")+ "</td><td>" + (rec.NgaySinh ||"")+ "</td><td>" + (rec.GioiTinh ||"")+ "</td><td>'" + (rec.SoDinhDanhCaNhan ||"")+ "</td><td>" + (rec.DiaChiThuongTru ||"")+ "</td><td>" + (rec.PhapNhan ||"")+ "</td><td>" + (rec.VaiTroPhapNhan ||"")+ "</td><td>" + (rec.TenChuHienTai ||"")+ "</td><td>" + (rec.SoDinhDanhChuHT ||"")+ "</td><td>" + (rec.DiaChiTTChuHT ||"")+ "</td><td>" + (rec.LyDoSuDungHT ||"")+ "</td><td>" + (rec.MaDinhDanhThua ||"")+ "</td><td>" + (rec.SoHieuToBDCu ||"")+ "</td><td>" + (rec.SoThuTuThuaCu ||"")+ "</td><td>" + (rec.SoHieuToBD ||"")+ "</td><td>" + (rec.SoThuTuThua ||"")+ "</td><td>" + (rec.DiaChiThua ||"")+ "</td><td>" + (rec.DienTichThua ||"")+ "</td><td>" + (rec.LoaiDat1 ||"")+ "</td><td>" + (rec.DienTich1 ||"")+ "</td><td>" + (rec.NguonGocSD1 ||"")+ "</td><td>" + (rec.HinhThucSD1 ||"")+ "</td><td>" + (rec.ThoiHanSD1 ||"")+ "</td><td>" + (rec.LoaiDat2 ||"")+ "</td><td>" + (rec.DienTich2 ||"")+ "</td><td>" + (rec.NguonGocSD2 ||"")+ "</td><td>" + (rec.HinhThucSD2 ||"")+ "</td><td>" + (rec.ThoiHanSD2 ||"")+ "</td><td>" + (rec.LoaiDat3 ||"")+ "</td><td>" + (rec.DienTich3 ||"")+ "</td><td>" + (rec.NguonGocSD3 ||"")+ "</td><td>" + (rec.HinhThucSD3 ||"")+ "</td><td>" + (rec.ThoiHanSD3 ||"")+ "</td><td>" + (rec.LoaiTaiSan ||"")+ "</td><td>" + (rec.KhuNhaCCHH ||"")+ "</td><td>" + (rec.NhaChungCu ||"")+ "</td><td>" + (rec.SoCanHo ||"")+ "</td><td>" + (rec.DienTichXD ||"")+ "</td><td>" + (rec.DienTichSan ||"")+ "</td><td>" + (rec.HinhThucSH ||"")+ "</td><td>" + (rec.ThoiHanSH ||"")+ "</td><td>" + (rec.CapHangNha ||"")+ "</td><td>" + (rec.TenFileQuet||"") + "</td>";
								}
							}
						} else NUT.notify("⚠️ No data to report!", "yellow");
					});

				}
			}
		})
	}
}