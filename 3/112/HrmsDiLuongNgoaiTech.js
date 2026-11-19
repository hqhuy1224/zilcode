// Tool "Đi lương ngoài TECHCOMBANK": lập bảng chuyển lương liên ngân hàng (đọc diluong_v, ngân hàng khác Techcombank).
var HrmsDiLuongNgoaiTech = {
	SERVICE_ID: 3,   
	NGANHANG: "TECHCOMBANK",

	run: function (p) {
		var now = new Date();
		NUT.w2popup.open({
			title: '📃 Đi lương ngoài TECHCOMBANK',
			width: 380,
			height: 240,
			body: "<table style='margin:auto'>" +
				"<tr><td align='right'>Ngày chuyển</td><td><input id='txt_Ngay' type='date' value='" + now.toISOString().substring(0, 10) + "'/></td></tr>" +
				"<tr><td align='right'>Lần</td><td><input type='number' id='num_Lan' style='width:60px' value='1' min='1'/></td></tr>" +
				"<tr><td align='right'>Nội dung chuyển</td><td><textarea id='txt_NoiDung'>ORIT chuyển tiền</textarea></td></tr></table>",
			actions: {
				"_Cancel": function () { NUT.w2popup.close(); },
				"_Ok": function () { HrmsDiLuongNgoaiTech.xuat(); }
			}
		});
	},

	xuat: function () {
		var me = HrmsDiLuongNgoaiTech;
		var ngay = document.getElementById("txt_Ngay").value;
		var lan = document.getElementById("num_Lan").value;
		var noidung = document.getElementById("txt_NoiDung").value;
		if (!ngay) { NUT.notify("⚠️ Nhập ngày chuyển trước khi thực hiện!", "yellow"); return; }

		NUT.ds.select({
			url: NUT.services[me.SERVICE_ID].url + "data/diluong_v",
			where: [["ngaychuyen", "=", ngay], ["lan", "=", lan], ["nganhang", "<>", me.NGANHANG]]
		}, function (res) {
			if (!(res.success && res.result.length)) { NUT.notify("⚠️ No data to report!", "yellow"); return; }
			var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); };
			var tien = function (v) { return v == null || v === "" || isNaN(v) ? v : Number(v).toLocaleString("vi-VN"); };
			var khongDau = function (s) { return NUT.loaiBoDau ? NUT.loaiBoDau(s || "") : String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D"); };
			var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/DiLuongNgoaiTech.html");
			win.onload = function () {
				this.labThangNam.innerHTML = esc(ngay + "_" + lan);
				this.labNgayBaoCao.innerHTML = (new Date()).toLocaleString("vi-VN");
				for (var i = 0; i < res.result.length; i++) {
					var rec = res.result[i];
					var agri = rec.nganhang == "AGRIBANK";   // Agribank cần thêm địa bàn + chi nhánh
					var row = this.tblData.insertRow();
					row.innerHTML = "<td>ORIT_" + esc(ngay) + "_" + esc(rec.lan) + "</td><td align='right'>" + esc(tien(rec.sotien)) + "</td><td>" + esc(khongDau(rec.hoten)) +
						"</td><td align='center'>" + esc(rec.sotaikhoan) + "</td><td>" + esc(noidung) + "</td><td>" + esc(rec.nganhangck) +
						"</td><td align='right'>" + (agri ? esc(rec.diabannh) : "") + "</td><td>" + (agri ? esc(rec.chinhanhnh) : "") + "</td><td>" + esc(rec.sohoso) + "</td>";
				}
			};
			NUT.w2popup.close();
		});
	}
};