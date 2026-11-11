var ThongKeDiem = {
	run: function (p) {
		var a=NUT.createWindowTitle(divTitle,"_divDashbaord");
		var div=a?a.div:document.getElementById("_divDashbaord");
		div.innerHTML="Dashboard here";
	}
}