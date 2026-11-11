var ZoomToThua = {
	run: function (p) {
		if (p.records.length) {
			var rec = p.records[0];
			if (rec.SoHieuToBDCu && rec.SoThuTuThuaCu) {
				NUT.AGMap.selectByQuery("VM98_thua", { where: [["soto","=",rec.SoHieuToBDCu],["sothua","=",rec.SoThuTuThuaCu]] }, true);
			} else NUT.notify("⚠️ Thửa đang chọn không có SoHieuToBD/SoThuTuThua/MaXa", "yellow");
		} else NUT.notify("⚠️ Chọn ít nhất một dòng dữ liệu!", "yellow");
	}
}