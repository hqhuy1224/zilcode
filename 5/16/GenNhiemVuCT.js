
var GenNhiemVuCT = {
	run: function (p) {
		var nv = p.parent;
		if (nv && nv.mapid) {
			NUT.confirm('Tạo nhiệm vụ chi tiết. Chi tiết cũ sẽ bị xóa?', function (awnser) {
				if (awnser == "Yes" || awnser == "yes") {
					var map = null
					for (var i = 0; i < NUT.maps.length; i++) {
						map = NUT.maps[i];
						if (map.mapid == nv.mapid) break;
					}
					var json = JSON.parse(map.maparea);
					var geom = json.rings ? new NUT.map.Polygon(json) : new NUT.map.Extent(json);
					NUT.ds.delete({ url: NUT.services[20].url + "data/nhiemvuct", where: ["id", "=", nv.id] }, function (res) {
						if (res.success) {
							GenNhiemVuCT.genct(nv, geom);

							setTimeout(function () {
								NUT.w2ui["grid_" + p.config.tabid].reload();
							}, 5000);
						} else NUT.notify("🛑 ERROR: " + res.result, "red");
					});
				}
			});
		} else NUT.notify("⚠️ Chọn nhiệm vụ có bản đồ!", "yellow");
	},
	genct: async function (nv, geom) {
		var url = NUT.services[20].url + "data/nhiemvuct";
		
		for (var key in NUT.map.layers) if (NUT.map.layers.hasOwnProperty(key)) {
			var lyr = NUT.map.layers[key];
			if (lyr.type == "subtype-sublayer") {
				var count = await lyr.queryFeatureCount({ geometry: geom });
				if (count) {
					var count2 = await lyr.queryFeatureCount({ geometry: geom, where: "MA_PMIS is null" });
					var data = { id: nv.id, sltong: count, slthuthap: count2, nhomthietbi: lyr.parent.title, loaithietbi: lyr.title };
					NUT.ds.insert({ url: url, data: data }, function (res2) {
						if (res2.success) NUT.notify("Records inserted.", "lime");
						else NUT.notify("🛑 ERROR: " + res2.result, "red");
					});
				}
			}
		}
	}
}