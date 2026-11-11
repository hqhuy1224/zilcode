var SysImportMapArea = {
	run: function (p) {
		SysImportMapArea.ser = p.parent;
		if (SysImportMapArea.ser && SysImportMapArea.ser.servicetype == "arcgis") {
			NUT.ds.select({ url: NUT.URL + "n_map", select: "itemid,mapname", where: ["serviceid", "=", SysImportMapArea.ser.serviceid] }, function (res) {
				if (res.success) {
					var lookup = {};
					for (var i = 0; i < res.result.length; i++) {
						var rec = res.result[i];
						lookup[rec.item] = rec;
					}
					NUT.map.isWebMap = true;
					NUT.map.generateToken(SysImportMapArea.ser, function (error) {
						if (error) NUT.notify("⛔ ERROR: " + error.message, "red");
						else SysImportMapArea.importMapAreas(lookup);
					});
				} else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		} else NUT.notify("⚠️ No ArcGIS Service selected!", "yellow");
	},
	importMapAreas: async function (lookup) {
		url = SysImportMapArea.ser.url.split("home/item.html?id=");
		NUT.map.get({ url: NUT.URL_PROXY + url[0] + "sharing/rest/content/items/" + url[1] + "/relatedItems?f=json&relationshipType=Map2Area", token: NUT.map.token }, function (res2) {
			if (!res2.error) {
				var fields = [], info = {};
				for (var i = 0; i < res2.relatedItems.length; i++) {
					var rec = res2.relatedItems[i];
					rec.index = i;
					fields.push({ field: rec.id, type: 'checkbox', html: { label: rec.title, column: i % 2, attr: lookup[rec.id] ? "disabled" : "tabindex=0" } });
					if (!lookup[rec.id]) {
						info[rec.id] = rec;
						if (rec.properties.area) NUT.map.get({ url: NUT.URL_PROXY + url[0] + "sharing/rest/content/items/" + rec.id + "/resources/" + rec.properties.area.resource + "?", traceid: rec.id, token: NUT.map.token }, function (res, traceid) {
							if (!res.error) {
								info[traceid].area = res;
							} else NUT.notify("⛔ ERROR: " + res.error.message, "red");
						}); else info[rec.id].area = rec.properties.extent;
					}
				}

				SysImportMapArea.showDlgImport(lookup, fields, info);
			} else NUT.notify("⛔ ERROR: " + res2.error.message, "red");
		});
	},
	showDlgImport: function (lookup, fields, info) {
		var id = "div_SysImportMapArea";
		NUT.w2popup.open({
			title: '_Import',
			width: 900,
			height: 600,
			body: '<div id="' + id + '" class="nut-full"></div>',
			onOpen: function (evt) {
				evt.onComplete = function () {
					var div = document.getElementById(id);
					var opt = {
						name: id,
						fields: fields,
						record: lookup,
						actions: {
							"_Close": function () {
								NUT.w2popup.close();
							},
							"_Import": function () {
								var change = this.getChanges();
								var data = [];
								for (key in change) if (change.hasOwnProperty(key)) {
									if (change[key]) {
										var item = info[key];
										data.push({ mapname: item.title, description: item.snippet, itemid: item.id, seqno:item.index, options: JSON.stringify(item.area), serviceid: SysImportMapArea.ser.serviceid, siteid: n$.user.siteid });
									}
								}
								NUT.ds.insert({ url: NUT.URL + "n_map", data: data }, function (res3) {
									if (res3.success) NUT.notify(data.length + " columns inserted.", "lime");
									else NUT.notify("⛔ ERROR: " + res3.result, "red");
								});
							}
						}
					}

					var form = NUT.w2ui[id];
					if (form) {
						form.fields = fields;
						form.record = lookup;
						form.refresh();
					} else new NUT.w2form(opt).render(div);
				}
			}
		});
	}
}