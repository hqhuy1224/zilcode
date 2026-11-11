var SysWfSend={
	run: function (p) {
		if (p.records.length) {
			SysWfSend.p = p;
			SysWfSend.obj = p.records[0];
			SysWfSend.objid = SysWfSend.obj[p.config.table.columnkey];
			
			if (p.config.workflowid) {
				SysWfSend.wf = NUT.workflows[p.config.workflowid];
				var step0 = SysWfSend.wf[SysWfSend.obj.stepid];

				NUT.ds.select({ url: NUT.URL + "n_wfflow", orderby: "flowid desc", where: [["tostepid", "=", step0.stepid], ["recordid", "=", SysWfSend.objid]] }, function (res) {
					if (res.success) SysWfSend.actionDialog(res.result[0]);
					else NUT.notify(res.result, "red");
				});
			} else NUT.notify("No workflow for table " + p.config.table.tablename, "yellow");
		} else NUT.notify("No record selected!", "yellow");
	},

	actionDialog(flowInfo) {
		var step0 = SysWfSend.wf[SysWfSend.obj.stepid];
		var prevStep = SysWfSend.wf[step0.ins[0]];
		var isApprove = (step0.stepname == "Phê duyệt" || step0.stepname == "Approve")
		var needAccept = (step0.accept && SysWfSend.obj.status != step0.accept && SysWfSend.obj.status != step0.reject);
		var isFinish = (step0.steptype == "bpmn:EndEvent" && !needAccept);
		if (isFinish && SysWfSend.obj.status == step0.reject) {
			NUT.notify("Data is already Finished!", "yellow");
			return;
		}
		var stepItems = [];
		var userItems = [];

		var nextStep = null;
		for (var i = 0; i < step0.outs.length; i++) {
			var out = step0.outs[i];
			var step = SysWfSend.wf[out.id];
			stepItems.push({ id: step.stepid, text: step.stepname });
			if (out.label && eval("SysWfSend.obj." + out.label)) nextStep = step;
		}

		if (!nextStep && step0.outs.length == 1) nextStep = SysWfSend.wf[step0.outs[0].id];
		var record = { priority: 0 }
		if (isApprove) record.userid = flowInfo.fromuserid;
		if (flowInfo && flowInfo.note) record.note = flowInfo.note;
		if (nextStep) {
			userItems = NUT.wfusers[SysWfSend.wf[nextStep.stepid].roleid];
			record.stepid = nextStep.stepid;
		}
		var id = "wfSend_" + SysWfSend.p.config.workflowid;
		var fields = isFinish || needAccept || isApprove ? [{ field: "note", type: "textarea", html: { label: "_Note" } }] : [
			{ field: "stepid", type: "select", required: true, hidden: isFinish, html: { label: "_Next" }, options: { items: stepItems } },
			{ field: "userid", type: "select", hidden: isFinish, html: { label: "_User" } },
			{ field: "note", type: "textarea", html: { label: "_Note" } },
			{ field: "priority", type: "select", html: { label: "_Priority" }, options: { items: [{ id: 0, text: "Normal" }, { id: 1, text: "High" }, { id: 2, text: "Urgent" }] } }
		];
		NUT.openDialog({
			title: (isFinish ? "_Finish" : (needAccept ? "_Accept" : (isApprove?"_Approve":"_Send"))),
			width: 400,
			height: 320,
			div: '<div id="' + id + '" class="nut-full"></div>',
			onOpen(evt) {
				evt.onComplete = function () {
					var opt = {
						name: id,
						fields: fields,
						onChange: function (evt) {
							if (evt.target == "stepid") {
								var step = SysWfSend.wf[this.record.stepid];
								var userItems = NUT.wfusers[step.roleid];
								this.set("userid", { options: { items: userItems } });
								if (step.userid) {
									this.setValue("userid", step.userid == -1 ? n$.user.parentid : step.userid)
								}
							}
						},
						actions:{
							"_Close": function () { NUT.closeDialog() }
						}
					};
					if (step0.ins.length) opt.actions["_Reject"] = function () {
						var record = this.record;
						if (prevStep.reject&&record.note) {
							var callback = function (cancel) {
								if (!cancel) {
									NUT.ds.insert({ url: NUT.URL + "n_wfflow", data: { fromstepid: step0.stepid, fromuserid: n$.user.userid, tostepid: prevStep.stepid, toroleid: prevStep.roleid, touserid: flowInfo.fromuserid, status: (prevStep.reject || prevStep.status), recordid: SysWfSend.objid, tableid: SysWfSend.p.config.tableid, windowid: SysWfSend.p.config.windowid, note: record.note, priority: 2, created: n$.nowTime(), siteid: n$.user.siteid } }, function (res2) {
										if (res2.success) {
											var data = {
												roleid: prevStep.roleid,
												stepid: prevStep.stepid,
												status: prevStep.reject,
												userid: flowInfo.fromuserid
											}
											NUT.ds.update({ url: SysWfSend.p.config.table.urledit, data: data, where: [SysWfSend.p.config.table.columnkey, "=", SysWfSend.objid] }, function (res) {
												if (res.success) {
													NUT.w2ui["grid_" + SysWfSend.p.config.tabid].reload();
													NUT.closeDialog();
													NUT.notify("Data rejected to previous step.", "lime");
												} else NUT.notify(res.result, "red");
											});
										}
									});
								}
							}
							if (step0.execname) NUT.runComponent(step0.execname, { data: SysWfSend.p, step: step0, status: prevStep.reject, callback: callback });
							else callback();
						} else NUT.notify("Nhập lý do để từ chối", "yellow");
					}
					if (step0.outs.length) opt.actions[isApprove?"_Approve":"_Send"] = function () {
						var record = this.record;
						var step = SysWfSend.wf[record.stepid];
						var callback = function (cancel) {
							if (!cancel) NUT.ds.insert({ url: NUT.URL + "n_wfflow", data: { fromstepid: step0.stepid, fromuserid: n$.user.userid, tostepid: record.stepid, toroleid: step.roleid, touserid: record.userid, status: step.status, recordid: SysWfSend.objid, tableid: SysWfSend.p.config.tableid, windowid: step.windowid, note: record.note, priority: record.priority, created: n$.nowTime(), siteid: n$.user.siteid } }, function (res2) {
								if (res2.success) {
									var data = {
										roleid: step.roleid,
										stepid: step.stepid,
										status: step.status,
										userid: (record.userid || 0)
									}
									NUT.ds.update({ url: SysWfSend.p.config.table.urledit, data: data, where: [SysWfSend.p.config.table.columnkey, "=", SysWfSend.objid] }, function (res) {
										if (res.success) {
											NUT.w2ui["grid_" + SysWfSend.p.config.tabid].reload();
											NUT.closeDialog();
											NUT.notify("Data sent to next step.", "lime");
										} else NUT.notify(res.result, "red");
									});
								} else NUT.notify(res2.result, "red");
							});
						}
						if (step0.execname) NUT.runComponent(step0.execname, { data: SysWfSend.p, step: step0, status: step.status, callback: callback });
						else callback();
					}
					var caption = needAccept ? "_Accept" : "_Finish";
					if (needAccept || isFinish) opt.actions[caption] = function () {
						var record = this.record;
						var status = needAccept ? step0.accept : step0.reject
						if (status) {
							var callback = function (cancel) {
								if (!cancel) {
									NUT.ds.insert({ url: NUT.URL + "n_wfflow", data: { fromstepid: step0.stepid, fromuserid: n$.user.userid, tostepid: prevStep.stepid, toroleid: prevStep.roleid, touserid: flowInfo.fromuserid, status: status, recordid: SysWfSend.objid, tableid: SysWfSend.p.config.tableid, windowid: SysWfSend.p.config.windowid, note: record.note, priority: 1, created: n$.nowTime(), siteid: n$.user.siteid } }, function (res2) {
										if (res2.success) {
											NUT.ds.update({ url: SysWfSend.p.config.table.urledit, data: { status: status }, where: [SysWfSend.p.config.table.columnkey, "=", SysWfSend.objid] }, function (res) {
												if (res.success) {
													NUT.w2ui["grid_" + SysWfSend.p.config.tabid].reload();
													NUT.closeDialog();
													NUT.notify("Data is " + caption, "lime");

												} else NUT.notify(res.result, "red");
											});
										}
									});
								}
							}
							if (step0.execname) {
								NUT.runComponent(step0.execname, { data: SysWfSend.p, step: step0, status: status, callback: callback });
							} else callback();
						} else NUT.notify("Accept/Finish status not defined", "yellow");
					}
					var frm = NUT.w2ui[id];
					if (frm) frm.destroy();
					frm=new NUT.w2form(opt);
					frm.record = record;
					frm.render(document.getElementById(id));
					if (nextStep && nextStep.userid) frm.setValue("userid", nextStep.userid == -1 ? n$.user.parentid : nextStep.userid);
					frm.set("userid", { options: { items: userItems } });
				}
			}
		});
	}
}