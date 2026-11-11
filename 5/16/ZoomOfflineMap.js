
var ZoomOfflineMap = {
	run: function (p) {
		var nv = p.records[0]
		if (nv && nv.mapid) {
			var map=null
			for (var i = 0; i < NUT.maps.length; i++) {
				map = NUT.maps[i];
				if (map.mapid == nv.mapid) break;
			}
			var json = JSON.parse(map.maparea);
			var geom = json.rings ? new NUT.map.Polygon(json) : new NUT.map.Extent(json);
			NUT.map.zoomToGeometry(geom);
		} else NUT.notify("⚠️ Chọn nhiệm vụ có bản đồ!", "yellow");
	}
}