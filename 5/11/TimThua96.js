var TimThua96 = {
	run: function (p) {
		var items = NUT.domains[1112].items;
		var cbo = document.createElement("select");
		cbo.id = "_cboPhuong";
		cbo.className = "w2ui-input";
		for (var i = 0; i < items.length; i++) {
			var opt = document.createElement("option");
			opt.value = items[i].id;
			opt.innerHTML = items[i].text;
			cbo.add(opt);
		}
		NUT.openDialog({
			title: '🔍 <i>Tìm thửa đất</i>',
			floating: true,
			width: 360,
			height: 240,
			div: "<table style='margin:auto'><caption><b><label for='_radBD96'>BẢN ĐỒ 1996 </label><input type='radio' id='_radBD96' name='BD' checked/><label for='_radBDTT'>BĐ TỔNG THỂ </label><input type='radio' id='_radBDTT' name='BD'/></b></caption><tr><td>Phường/Xã</td><td colspan='3'>" + cbo.outerHTML + "</td></tr><tr><td>Số tờ bản đồ</td><td><input id='_txtSoTo' class='w2ui-input'/></td></tr><tr><td>Số thứ tự thửa</td><td><input id='_txtSoThua' class='w2ui-input'/></td></tr></table>",
			actions: {
				"_Close": function () {
					NUT.w2popup.close();
				},
				"_Ok": function () {
					if (!NUT.AGMap.layers["BD_1996"]) NUT.AGMap.layers["BD_1996"] = new NUT.AGMap.FeatureLayer({ url: "http://qldatdai.matmagoc.com:6080/arcgis/rest/services/DiaChinh/MapServer/0" });
					if (_txtSoTo.value && _txtSoThua.value) {
						
						var where = [["soto","=",_txtSoTo.value],["sothua","=",_txtSoThua.value]];
						if(_cboPhuong.value)where.push(["dvhc","=",_cboPhuong.value]);
						var query={where:where};
						if (_radBD96.checked) query.outSpatialReference = NUT.AGMap.view.spatialReference;

						NUT.AGMap.selectByQuery(_radBD96.checked ? "VM98_thua" : "VM_lab", query,true);
					} else NUT.notify("⚠️ Chọn phường và nhập số tờ, số thửa để tìm!", "yellow");
				}
			}
		})
	}
}