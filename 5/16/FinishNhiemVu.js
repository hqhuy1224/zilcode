
var FinishNhiemVu = {
	run: function (p,callback) {
		if (!p.reject) {//finish
			var nv = p.data.records[0];
			var map = null
			for (var i = 0; i < NUT.maps.length; i++) {
				map = NUT.maps[i];
				if (map.mapid == nv.mapid) break;
			}
			var json = JSON.parse(map.maparea);
			var geom = json.rings ? new NUT.map.Polygon(json) : new NUT.map.Extent(json);
			var data = [];
			var where = [];
			NUT.closeDialog();
			NUT.w2confirm({
				msg: "<table border='1' id='tbl_Finish'><caption><b>KẾT THÚC NHIỆM VỤ?</b></caption><tr><th>Nhóm thiết bị</th><th>Loại thiết bị</th><th>Số lượng cần thu thập</th><th>Số lượng đã hoàn thành</th></tr></table>",
				title: "_Confirm",
				width: 600,
				height: 400,
				callBack: function (awnser) {
					var isOk = awnser == "yes" || awnser == "Yes";
					if (isOk) {
						for (var i = 0; i < data.length; i++)NUT.ds.update({ url: NUT.services[20].url + "data/nhiemvuct", where: where[i],data:data[i] }, function (res) {
							if (res.success) NUT.notify("Nhiệm vụ updated!", "lime");
							else NUT.notify("🛑 ERROR: " + res.result, "red");
						});
					}
					if (callback)callback(!isOk);
				}
			});
			NUT.ds.select({ url: NUT.services[20].url + "data/nhiemvuct", where: ["id", "=", nv.id] }, function (res) {
				if (res.success) {
					var lookup = {};
					for (var i = 0; i < res.result.length; i++) {
						var rec = res.result[i];
						lookup[rec["nhomthietbi"] + rec["loaithietbi"]] = rec;
					}
					FinishNhiemVu.finish(lookup,geom);
				} else NUT.notify("🛑 ERROR: " + res.result, "red");
			});
		} else if (callback) callback();
	},
	finish: async function (lookup,geom) {
		for (var key in NUT.map.layers) if (NUT.map.layers.hasOwnProperty(key)) {
			var lyr = NUT.map.layers[key];
			if (lyr.type == "subtype-sublayer") {
				var ct = lookup[lyr.parent.title + lyr.title];
				if (ct) {
					var count = await lyr.queryFeatureCount({ geometry: geom, where: "MA_PMIS is not null" });
					var row = tbl_Finish.insertRow();
					row.innerHTML = "<td>" + lyr.parent.title + "</td><td>" + lyr.title + "</td><th>" + ct.slthuthap + "</th><th>" + count + "</th>";
				}
			}
		}
	}
}