var VeVungTim = {
  run: function (p) {
    if (p.records.length) {
      VeVungTim.obj = p.records[0];
      VeVungTim.url = NUT.services[6].url;
      const parent = p.parent || {};

      NUT.w2popup.open({
        title: '📃 <i>Vẽ vùng tìm kiếm</i>',
        modal: true,
        width: 400,
        height: 550,
        body: `
          <div style='padding: 10px'>
            <table style='width:100%'>
              <tr>
                <td style='text-align:right;'>Phương pháp</td>
                <td>
                  <select id='selPhuongPhap' class='w2ui-input'>
                    <option value='1'>Theo trạng thái máy bay</option>
                    <option value='2'>Theo đường bay</option>
                  </select>
                </td>
              </tr>
             <tr>
                <td style='text-align:right;'>Tọa độ LKP(lat,lon)</td>
                <td>
                  <div style="display: flex; gap: 4px; align-items: center;">
                    <input id='txtToaDo' class='w2ui-input' 
                          value='${parent.viTriCuoiCung || ""}' 
                          placeholder='Ví dụ: [[104.038056,21.215]]' 
                          style="flex: 1;" />
                    <button class='w2ui-btn' onclick = 'VeVungTim.ZoomToaDoLKP()'>🔍</button>
                  </div>
                </td>
              </tr>

              <tr>
                <td style='text-align:right;'>Vận tốc bay (km/h)</td>
                <td><input id='txtVanToc' class='w2ui-input' value='${parent.vanToc || ""}' placeholder='Ví dụ: 900'></td>
              </tr>
              <tr>
                <td style='text-align:right;'>Thời gian dự kiến T1 (phút)</td>
                <td><input id='txtTGBD' class='w2ui-input' placeholder='Ví dụ: 5'></td>
              </tr>
              <tr class='rowTrangThai'>
                <td style='text-align:right;'>Thời gian dự kiến T2 (phút)</td>
                <td><input id='txtTGKT' class='w2ui-input' placeholder='Ví dụ: 10'></td>
              </tr>
              <tr class='rowTrangThai'>
                <td style='text-align:right;'>Hướng bay (°)</td>
                <td><input id='txtHuongBay' class='w2ui-input' value='${parent.huongBay || ""}' placeholder='Ví dụ: 45'></td>
              </tr>
              <tr class='rowDuongBay'>
                <td style='text-align:right;'>Đường bay</td>
                <td>
                  <select id='selDuongBay' class='w2ui-input'>
                    <option value=''>-- Chọn đường bay --</option>
                  </select>
                </td>
              </tr>
              <tr class='rowDuongBay'>
                <td style='text-align:right;'>Chọn vùng mở rộng</td>
                <td>
                  <select id='selVungMoRong' class='w2ui-input'>
                    <option value='1'>10NM</option>
                    <option value='2'>15NM</option>
                  </select>
                </td>
              </tr>
              <tr class='rowDuongBay'>
                <td style='text-align:right;'>Chọn hướng bay</td>
                <td>
                  <select id='selHuongBayDuongBay' class='w2ui-input'>
                    <option value='1'>Thuận</option>
                    <option value='2'>Nghịch</option>
                  </select>
                </td>
              </tr>
              <tr class='rowTrangThai'>
                <td style='text-align:right;'>Hệ số an toàn</td>
                <td><input id='txtHsAt' class='w2ui-input' placeholder='Ví dụ: 1.6'></td>
              </tr>
              <tr class='rowTrangThai'>
                <td style='text-align:right;'>Sai số máy bay gặp nạn (NM)</td>
                <td><input id='txtSaiSoGN' class='w2ui-input' placeholder='Ví dụ: 10'></td>
              </tr>
              <tr class='rowTrangThai'>
                <td style='text-align:right;'>Sai số máy bay tìm kiếm (NM)</td>
                <td><input id='txtSaiSoTK' class='w2ui-input'  placeholder='Ví dụ: 10'></td>
              </tr>
            </table>
          </div>
        `,

        actions: {
          _Cancel: function () {
            NUT.w2popup.close();
          },
          _Save: function () {
            if (!VeVungTim.lastConvex || !VeVungTim.lastData) {
              NUT.notify("Chưa có vùng tìm kiếm để lưu!", "yellow");
              return;
            }

            const round6 = (x) => Math.round(x * 1e6) / 1e6;

            const roundPoint = (point) => point.map(round6);
            const roundRings = (rings) => rings.map(roundPoint);

            const convex = VeVungTim.lastConvex;
            const rings = convex.rings?.[0] || [];
            if (!rings.length) {
              NUT.notify("Vùng tìm kiếm không hợp lệ!", "yellow");
              return;
            }

            const d = VeVungTim.lastData || {};
            const obj = VeVungTim.obj || {};

            const data = {
              vungTimKiem: JSON.stringify(roundRings(rings)),
              thoiGianDuKienT1: d.T1 || null,
              thoiGianDuKienT2: d.T2 || null,
              saiSoMayBayGapNan: d.saiSoGN || null,
              saiSoMayBayTimKiem: d.saiSoTK || null,
              heSoAnToan: d.hsAt || null,
              toaDoLKP: d.diemP1 ? JSON.stringify([roundPoint(d.diemP1)]) : null,
              diemDenD1: d.diemP2 ? JSON.stringify([roundPoint(d.diemP2)]) : null,
              diemDenD2: d.diemP3 ? JSON.stringify([roundPoint(d.diemP3)]) : null,
              phuongPhapXacDinh: parseInt(d.phuongPhap) || null,
              duongBay: d.tenDuongBay || null,
              huongBay: d.huongBay || null
            };

            NUT.ds.update({
              url: NUT.services[6].url + "data/KhuVucTimKiem",
              data: data,
              where: ["id", "=", obj.id]
            }, function (res) {
              if (res.success) {
                NUT.notify("Đã lưu vùng tìm kiếm!", "green");
                NUT.w2popup.close();
              } else {
                NUT.notify("Lỗi khi lưu: " + res.result, "red");
                // console.error("Chi tiết lỗi:", res);
              }
            });
          },
          _Draw: function () {
            const toaDoStr = document.getElementById("txtToaDo").value.trim();
            let lat, lon;

            try {
              const parsed = JSON.parse(toaDoStr);

              if (
                Array.isArray(parsed) &&
                parsed.length === 1 &&
                Array.isArray(parsed[0]) &&
                parsed[0].length === 2
              ) {
                lat = parseFloat(parsed[0][0]);
                lon = parseFloat(parsed[0][1]);
                [lon, lat] = [lat, lon];
              } else {
                throw new Error("Tọa độ không đúng định dạng [[lat, lon]]");
              }
            } catch (err) {
              NUT.notify("Tọa độ không đúng định dạng [[lat, lon]]", "yellow");
              return;
            }

            const vanToc = parseFloat(document.getElementById("txtVanToc").value);
            const huongBay = parseFloat(document.getElementById("txtHuongBay").value);
            const hsAt = parseFloat(document.getElementById("txtHsAt").value.trim().replace(",", "."));
            const saiSoGN = parseFloat(document.getElementById("txtSaiSoGN").value) * 1852;
            const saiSoTK = parseFloat(document.getElementById("txtSaiSoTK").value) * 1852;
            const T1 = parseFloat(document.getElementById("txtTGBD").value);
            const T2 = parseFloat(document.getElementById("txtTGKT").value);
            const phuongPhap = document.getElementById("selPhuongPhap").value;
            const tenDuongBay = document.getElementById("selDuongBay").value;


            if (phuongPhap === "1") {
              if ([lat, lon, vanToc, huongBay, hsAt, saiSoGN, saiSoTK, T1, T2].every(x => !isNaN(x))) {
                VeVungTim.veVungTheoTrangThaiMayBay({ lon, lat, vanToc, huongBay, hsAt, saiSoGN, saiSoTK, T1, T2, phuongPhap });
              } else {
                NUT.notify("Vui lòng nhập hợp lệ các giá trị số!", "yellow");
              }
            } else {
              if (tenDuongBay) {
                VeVungTim.VeVungTheoDuongBay({ tenDuongBay, phuongPhap, T1 });
              } else {
                NUT.notify("Vui lòng nhập tên đường bay!", "yellow");
              }
            }

          }

        }
      });
    } else {
      NUT.notify("No record selected!", "yellow");
    }

    setTimeout(() => {
      const sel = document.getElementById("selPhuongPhap");

      const toggleVisibility = () => {
        const val = sel.value;
        document.querySelectorAll(".rowTrangThai").forEach(row => {
          row.style.display = val === "1" ? "" : "none";
        });
        document.querySelectorAll(".rowDuongBay").forEach(row => {
          row.style.display = val === "2" ? "" : "none";
        });
      };

      sel.addEventListener("change", toggleVisibility);
      toggleVisibility();

      const txtTGBD = document.getElementById("txtTGBD");
      const txtVanToc = document.getElementById("txtVanToc");

      txtTGBD.addEventListener("blur", function () {
        const vanToc = parseFloat(txtVanToc.value);

        const T1 = parseFloat(txtTGBD.value);
        if (isNaN(T1) || T1 <= 0) {
          NUT.notify("Thời gian dự kiến không được để trống hoặc phải > 0!", "yellow");
          return;
        }

        let toaDoStr = document.getElementById("txtToaDo").value.trim();

        if (isNaN(vanToc) || vanToc <= 0 || isNaN(T1) || T1 <= 0) {

          return;
        }

        let lon, lat;
        toaDoStr = toaDoStr.replace(/\s+/g, '');
        try {
          const parsed = JSON.parse(toaDoStr);
          if (!Array.isArray(parsed) || parsed.length !== 1 || !Array.isArray(parsed[0]) || parsed[0].length !== 2) {
            throw new Error("Tọa độ phải có định dạng [[lon, lat]]!");
          }
          [lon, lat] = [parseFloat(parsed[0][0]), parseFloat(parsed[0][1])];
        } catch (e) {
          NUT.notify(`Lỗi tọa độ: ${e.message} (Phải nhập dạng [[lon, lat]], ví dụ: [[104.104493,21.281927]])`, "yellow");
          return;
        }

        const radius = vanToc * 16.67 * T1;

        // Tạo điểm WGS84
        const point = new NUT.AGMap.Point({
          longitude: lon,
          latitude: lat,
          spatialReference: { wkid: 4326 }
        });

        let buffer;
        try {
          buffer = NUT.AGMap.geometryEngine.geodesicBuffer(point.clone(), radius, "meters");
        } catch (err) {
          NUT.notify(`Lỗi khi tạo buffer: ${err.message}`, "red");
          return;
        }
        const layer = NUT.AGMap.layers?.["197bec1a1b0-layer-10"];

        const query = layer.createQuery();
        query.geometry = buffer;
        query.spatialRelationship = "intersects";
        query.returnGeometry = false;
        query.outFields = ["tenDuongBay"];

        layer.queryFeatures(query).then(function (res) {
          const selDuongBay = document.getElementById("selDuongBay");
          selDuongBay.innerHTML = `<option value=''>-- Chọn đường bay --</option>`;

          if (!res.features.length) {
            NUT.notify("Không tìm thấy đường bay trong vùng!", "yellow");
            return;
          }

          res.features.forEach(f => {
            const ten = f.attributes?.tenDuongBay;
            if (ten) {
              const opt = document.createElement("option");
              opt.value = ten;
              opt.textContent = ten;
              selDuongBay.appendChild(opt);
            }
          });
        }).catch(err => {
          NUT.notify("Lỗi truy vấn dữ liệu đường bay!", "red");
        });
      });
    }, 100);

  },

  veVungTheoTrangThaiMayBay: function (data) {
    const { lon, lat, vanToc, huongBay, hsAt, saiSoGN, saiSoTK, T1, T2 } = data;

    function toaDoMoi(lon0, lat0, dMet, goc) {
      const R = 6371000;// bán kính trái đất
      const rad = Math.PI / 180;
      const latRad = lat0 * rad;
      const lonRad = lon0 * rad;
      const bearing = goc * rad;
      const dOverR = dMet / R;

      const lat2 = Math.asin(Math.sin(latRad) * Math.cos(dOverR) +
        Math.cos(latRad) * Math.sin(dOverR) * Math.cos(bearing));

      const lon2 = lonRad + Math.atan2(Math.sin(bearing) * Math.sin(dOverR) * Math.cos(latRad),
        Math.cos(dOverR) - Math.sin(latRad) * Math.sin(lat2));

      return [lon2 / rad, lat2 / rad];
    }

    const D1 = vanToc * 16.67 * T1;
    const D2 = vanToc * 16.67 * T2;

    const P1 = [lon, lat];
    const P2 = toaDoMoi(lon, lat, D1, huongBay);
    const P3 = toaDoMoi(lon, lat, D1 + D2, huongBay);

    VeVungTim.lastData = {
      ...data,
      diemP1: P1,
      diemP2: P2,
      diemP3: P3
    };

    const tinhR = X => Math.ceil(hsAt * Math.sqrt(X * X + saiSoTK * saiSoTK));

    const R1 = tinhR(saiSoGN);
    const R2 = tinhR(saiSoGN + 0.1 * D1);
    const R3 = tinhR(saiSoGN + 0.1 * (D1 + D2));

    const centers = [P1, P2, P3];
    const radii = [R1, R2, R3];
    const colors = ["#33ff63aa", "#33ff47aa", "#33ff3daa"];
    const num = 30;
    const allRingPoints = [];

    const TaoRing = (lon0, lat0, radiusM) => {
      const ring = [];
      for (let i = 0; i <= num; i++) {
        const angle = (i / num) * 2 * Math.PI;
        const dx = (radiusM / 111320) * Math.cos(angle) / Math.cos(lat0 * Math.PI / 180);
        const dy = (radiusM / 111320) * Math.sin(angle);
        const point = [lon0 + dx, lat0 + dy];
        ring.push(point);
        allRingPoints.push(point);
      }
      return ring;
    };

    if (NUT.AGMap && NUT.AGMap.Polygon && NUT.AGMap.view) {
      NUT.AGMap.view.graphics.removeAll();

      for (let i = 0; i < centers.length; i++) {
        const ring = TaoRing(centers[i][0], centers[i][1], radii[i]);
        const polygon = new NUT.AGMap.Polygon({ rings: [ring] });

        NUT.AGMap.view.graphics.add({ geometry: polygon, symbol: { type: "simple-fill", color: colors[i], outline: { color: "#00ff11ff", width: 1.5 } } });
        NUT.AGMap.view.graphics.add({ geometry: { type: "point", longitude: centers[i][0], latitude: centers[i][1] }, symbol: { type: "text", text: `P${i + 1}`, color: "black", font: { size: 12, weight: "bold" }, haloColor: "white", haloSize: 1 } });
        NUT.AGMap.view.graphics.add({ geometry: { type: "point", longitude: centers[i][0], latitude: centers[i][1] + (radii[i] / 111320) }, symbol: { type: "text", text: `R = ${radii[i]} m`, color: "black", font: { size: 11 }, haloColor: "white", haloSize: 1 } });
      }

      NUT.AGMap.view.graphics.add({ geometry: { type: "polyline", paths: [P1, P2, P3], spatialReference: { wkid: 4326 } }, symbol: { type: "simple-line", color: "red", width: 2 } });

      const multipoint = new NUT.AGMap.Multipoint({ points: allRingPoints, spatialReference: { wkid: 4326 } });
      const convex = NUT.AGMap.geometryEngine.convexHull(multipoint);
      if (convex) {
        NUT.AGMap.view.graphics.add({ geometry: convex, symbol: { type: "simple-fill", color: "#00ff3788", outline: { color: "#0000ff", width: 2 } } });
        NUT.AGMap.view.goTo({ target: convex.extent.expand(1.5) });
      }
      VeVungTim.lastConvex = convex;
      VeVungTim.lastData = {
        ...data,
        diemP1: P1,
        diemP2: P2,
        diemP3: P3
      };
      VeVungTim.lastGeometry = convex;


    } else {
      NUT.notify("AGMap chưa sẵn sàng!", "yellow");
    }
  },

  VeVungTheoDuongBay: function (data) {
    const { tenDuongBay } = data;
    const txt = id => document.getElementById(id);
    const toaDoStr = txt("txtToaDo")?.value?.trim() ?? "";
    const vanToc = parseFloat(txt("txtVanToc")?.value ?? "0");
    const T1 = parseFloat(txt("txtTGBD")?.value ?? "0");
    const moRongNM = txt("selVungMoRong")?.value === "2" ? 15 : 10;
    const moRong = moRongNM * 1852;
    const huongBayThuan = txt("selHuongBayDuongBay")?.value !== "2";

    // Parse tọa độ
    let lat, lon;
    try {
      const parsed = JSON.parse(toaDoStr);
      if (!Array.isArray(parsed) || parsed.length !== 1 || parsed[0].length !== 2) throw new Error();
      [lon, lat] = [parseFloat(parsed[0][1]), parseFloat(parsed[0][0])];
    } catch {
      return NUT.notify("Tọa độ không đúng định dạng [[lat, lon]]", "yellow");
    }

    const D1 = vanToc * 16.67 * T1;
    const layer = NUT.AGMap?.layers?.["197bec1a1b0-layer-10"];
    if (!layer) return NUT.notify("Không tìm thấy lớp đường bay!", "red");

    layer.queryFeatures({
      where: `tenDuongBay = '${tenDuongBay}'`,
      returnGeometry: true,
      outFields: ["*"],
      outSpatialReference: { wkid: 4326 }
    }).then(({ features }) => {
      if (!features?.length) return NUT.notify("Không tìm thấy đường bay", "yellow");

      const allPaths = features.flatMap(f => f.geometry?.paths ?? []);
      if (!allPaths.length) return NUT.notify("Không có đường bay hợp lệ", "yellow");

      const nearest = NUT.AGMap.geometryEngine.nearestCoordinate(
        { type: "polyline", paths: allPaths, spatialReference: { wkid: 4326 } },
        { type: "point", x: lon, y: lat, spatialReference: { wkid: 4326 } }
      );
      if (!nearest?.coordinate) return NUT.notify("Không tìm được điểm gần nhất!", "red");

      const pointStart = [nearest.coordinate.x, nearest.coordinate.y];

      // Tìm các đoạn liền kề để union
      const visited = new Set();
      const stack = features.filter(f =>
        NUT.AGMap.geometryEngine.intersects(f.geometry, {
          type: "point", x: pointStart[0], y: pointStart[1], spatialReference: { wkid: 4326 }
        })
      );
      const ketQua = [];

      while (stack.length > 0) {
        const current = stack.pop();
        const id = current.attributes?.OBJECTID ?? Math.random();
        if (visited.has(id)) continue;
        visited.add(id);
        ketQua.push(current.geometry);

        const lienKe = features.filter(f => {
          const fid = f.attributes?.OBJECTID;
          if (visited.has(fid)) return false;
          if (f.attributes.tenDuongBay !== tenDuongBay) return false;
          return ["touches", "crosses", "intersects"].some(method =>
            NUT.AGMap.geometryEngine[method](current.geometry, f.geometry)
          );
        });
        stack.push(...lienKe);
      }

      const unioned = NUT.AGMap.geometryEngine.union(ketQua);
      let unionPath = unioned?.paths?.flat() ?? [];
      if (!unionPath.length) return NUT.notify("Không tìm thấy dữ liệu hợp lệ", "red");

      const reverse = DaoPath(unionPath, pointStart);

      // Kiểm tra nếu điểm bắt đầu ở đầu hoặc cuối đường bay
      const indexStart = unionPath.findIndex(p => Math.abs(p[0] - pointStart[0]) < 1e-6 && Math.abs(p[1] - pointStart[1]) < 1e-6);
      if (indexStart === 0 || indexStart === unionPath.length - 1) {
        if ((!huongBayThuan && reverse) || (!huongBayThuan && !reverse)) {
          return NUT.notify("Không thể đảo hướng bay vì điểm trên đường bay nằm ở đầu hoặc cuối đường bay", "yellow");
        }
      }

      // Đảo hướng 
      if (huongBayThuan ? reverse : !reverse) unionPath = unionPath.reverse();


      const pathCat = catPolylineTuDiem(unionPath, pointStart, D1);
      if (!pathCat || pathCat.length < 2) return NUT.notify("Không cắt được đoạn đường bay", "red");

      const polyline4326 = new NUT.AGMap.Polyline({
        paths: [pathCat],
        spatialReference: { wkid: 4326 }
      });

      const finalPolygon = taoVungChuNhat(pathCat, moRong);

      const finalPointEnd = pathCat.at(-1);
      const huongBay = tinhHuongBay(pathCat);

      if (!NUT.AGMap.view) return NUT.notify("AGMap chưa sẵn sàng!", "yellow");

      // Vẽ kết quả
      NUT.AGMap.view.graphics.removeAll();
      [
        {
          geometry: finalPolygon,
          symbol: {
            type: "simple-fill",
            color: "#33ff41aa",
            outline: { color: "#33ff00ff", width: 2 }
          }
        },
        {
          geometry: polyline4326,
          symbol: { type: "simple-line", color: "red", width: 2 }
        },
        {
          geometry: unioned,
          symbol: { type: "simple-line", color: "blue", width: 3 }
        }
      ].forEach(g => NUT.AGMap.view.graphics.add(g));

      NUT.AGMap.view.goTo(finalPolygon.extent.expand(1.5));

      VeVungTim.lastConvex = finalPolygon;
      VeVungTim.lastData = {
        ...data,
        diemP1: pointStart,
        diemP2: finalPointEnd,
        phuongPhap: "2",
        huongBay,
        tenDuongBay
      };
    });

    // ======== HÀM PHỤ ========
    function DaoPath(path, pointStart) {
      const start = NUT.AGMap.webMercatorUtils.geographicToWebMercator({
        type: "point", x: pointStart[0], y: pointStart[1], spatialReference: { wkid: 4326 }
      });
      const first = NUT.AGMap.webMercatorUtils.geographicToWebMercator({
        type: "point", x: path[0][0], y: path[0][1], spatialReference: { wkid: 4326 }
      });
      const last = NUT.AGMap.webMercatorUtils.geographicToWebMercator({
        type: "point", x: path.at(-1)[0], y: path.at(-1)[1], spatialReference: { wkid: 4326 }
      });
      return NUT.AGMap.geometryEngine.distance(last, start, "meters") < NUT.AGMap.geometryEngine.distance(first, start, "meters");
    }


    function catPolylineTuDiem(path, start, doDaiMet) {
      let tong = 0;
      const kq = [[...start]];
      for (let i = 0; i < path.length - 1; i++) {
        const diem1 = i === 0 ? start : path[i];
        const diem2 = path[i + 1];
        const pt1 = NUT.AGMap.webMercatorUtils.geographicToWebMercator({
          type: "point", x: diem1[0], y: diem1[1], spatialReference: { wkid: 4326 }
        });
        const pt2 = NUT.AGMap.webMercatorUtils.geographicToWebMercator({
          type: "point", x: diem2[0], y: diem2[1], spatialReference: { wkid: 4326 }
        });
        const kc = NUT.AGMap.geometryEngine.distance(pt1, pt2, "meters");

        if (tong + kc >= doDaiMet) {
          const tiLe = (doDaiMet - tong) / kc;
          const x = diem1[0] + (diem2[0] - diem1[0]) * tiLe;
          const y = diem1[1] + (diem2[1] - diem1[1]) * tiLe;
          kq.push([x, y]);
          break;
        } else {
          tong += kc;
          kq.push(diem2);
        }
      }
      return kq;
    }


    function tinhHuongBay(path) {
      if (path.length < 2) return 0;
      const [lon1, lat1] = path[0];
      const [lon2, lat2] = path.at(-1);
      const rad = Math.PI / 180;
      const dLon = (lon2 - lon1) * rad;
      const y = Math.sin(dLon) * Math.cos(lat2 * rad);
      const x = Math.cos(lat1 * rad) * Math.sin(lat2 * rad) - Math.sin(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos(dLon);
      return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }

    function taoVungChuNhat(pathCat, moRongMet) {
      const sr3857 = { wkid: 3857 };

      let pts = pathCat.map(([x, y]) =>
        NUT.AGMap.webMercatorUtils.geographicToWebMercator({ type: "point", x, y, spatialReference: { wkid: 4326 } })

      );

      if (pts.length < 2) return null;

      //Mở rộng đầu
      {
        const p0 = pts[0];
        const p1 = pts[1];
        const dx = p0.x - p1.x;
        const dy = p0.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len;
        const uy = dy / len;
        const newStart = {
          x: p0.x + ux * moRongMet,
          y: p0.y + uy * moRongMet
        };
        pts.unshift(newStart);
      }

      //Mở rộng cuối
      {
        const pLast = pts.at(-1);
        const pPrev = pts.at(-2);
        const dx = pLast.x - pPrev.x;
        const dy = pLast.y - pPrev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len;
        const uy = dy / len;
        const newEnd = {
          x: pLast.x + ux * moRongMet,
          y: pLast.y + uy * moRongMet
        };
        pts.push(newEnd);
      }

      const left = [];
      const right = [];

      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len;
        const uy = dy / len;

        // Vector vuông góc
        const vx = -uy;
        const vy = ux;

        // Dịch sang trái/phải
        left.push({ x: p1.x + vx * moRongMet, y: p1.y + vy * moRongMet });
        right.push({ x: p1.x - vx * moRongMet, y: p1.y - vy * moRongMet });
      }

      //điểm cuối cùng
      {
        const p1 = pts.at(-2);
        const p2 = pts.at(-1);

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len;
        const uy = dy / len;
        const vx = -uy;
        const vy = ux;

        left.push({ x: p2.x + vx * moRongMet, y: p2.y + vy * moRongMet });
        right.push({ x: p2.x - vx * moRongMet, y: p2.y - vy * moRongMet });
      }

      const full = [...left, ...right.reverse()];
      const polygon3857 = new NUT.AGMap.Polygon({
        rings: [full.map(p => [p.x, p.y])],
        spatialReference: sr3857
      });

      return NUT.AGMap.webMercatorUtils.webMercatorToGeographic(polygon3857);
    }
  },

  ZoomToaDoLKP: function () {
    var val = JSON.parse(VeVungTim.obj.toaDoLKP);
    NUT.AGMap.zoomToCoords(val, "point");
  }

};
