var SysCloneTab={
	run:function(p){
		if(p.records.length){
			var tab=p.records[0];
			NUT.prompt({label:'Clone tab',value:tab.tabname+'_copy'},function(name){
				if(name){
					var ctab=NUT.clone(tab);
					ctab.tabname=name;
					SysCloneTab.cloneTab(ctab);
				}else NUT.notify("⚠️ Enter clone tab's name!", "yellow");
			});
		} else NUT.notify("⚠️ No Tab selected!","yellow");
	},
	
	cloneTab: function (tab) {
		NUT.ds.select({ url: NUT.URL + "n_field", orderby: "fieldid", where: ["tabid", "=", tab.tabid] }, function (res) {
			if (res.success) {
				var fields = res.result;
				delete tab.tabid;
				delete tab.recid;
				NUT.ds.insert({ url: NUT.URL + "n_tab", data: tab, returnid: true }, function (res2) {
					if (res2.success) {
						var id = res2.result[0];
						if (fields.length) {
							for (var i = 0; i < fields.length; i++) {
								delete fields[i].fieldid;
								fields[i].tabid = id;
							}
							NUT.ds.insert({ url: NUT.URL + "n_field", data: fields }, function (res3) {
								if (res3.success) NUT.notify(fields.length + " fields inserted.", "lime");
								else NUT.notify("⛔ ERROR: " + res3.result, "red");
							});
						}
						NUT.notify("Record inserted.", "lime");
					} else NUT.notify("⛔ ERROR: " + res2.result, "red");
				});
				
			} else NUT.notify("⛔ ERROR: " + res.result, "red");
		})
	}
}