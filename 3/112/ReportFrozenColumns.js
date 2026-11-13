// Keep employee identity visible while the remaining report columns scroll.
(function () {
    "use strict";

    var style = document.createElement("style");
    style.textContent = "@media screen {" +
        ".report-container .report-frozen-cell { position:sticky !important;" +
        "left:var(--report-frozen-left) !important; z-index:2 !important;" +
        "background:var(--report-frozen-background) !important; }" +
        ".report-container thead .report-frozen-cell { z-index:5 !important; }" +
        ".report-container .report-frozen-edge { box-shadow:2px 0 0 #777; }" +
        "}";
    document.head.appendChild(style);

    function text(cell) {
        return cell.textContent.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ").trim().toLowerCase();
    }

    function background(cell) {
        for (var node = cell; node; node = node.parentElement) {
            var color = window.getComputedStyle(node).backgroundColor;
            if (color !== "transparent" && color !== "rgba(0, 0, 0, 0)") return color;
        }
        return "#fff";
    }

    function freeze(table) {
        if (!table.tHead) return;
        var header;
        var count = 0;
        Array.prototype.some.call(table.tHead.rows, function (row) {
            if (!row.cells.length || text(row.cells[0]) !== "stt") return false;
            for (var i = 0; i < row.cells.length; i++) {
                count += row.cells[i].colSpan;
                if (/^ho (va )?ten\b/.test(text(row.cells[i]))) {
                    header = row;
                    return true;
                }
            }
            count = 0;
            return false;
        });
        if (!header) return;

        var lefts = [];
        var offset = 0;
        // These identity headers each occupy one logical column.
        for (var i = 0; i < count; i++) {
            lefts.push(offset);
            offset += header.cells[i].getBoundingClientRect().width;
        }

        function apply(cell, col) {
            var end = col + cell.colSpan;
            // Leave merged totals/signatures that cross the frozen boundary alone.
            if (col >= count || end > count) return;
            if (!cell.classList.contains("report-frozen-cell")) {
                cell.style.setProperty("--report-frozen-background", background(cell));
                cell.classList.add("report-frozen-cell");
            }
            cell.style.setProperty("--report-frozen-left", lefts[col] + "px");
            cell.classList.toggle("report-frozen-edge", end === count);
        }

        for (var h = 0; h < count; h++) apply(header.cells[h], h);
        Array.prototype.forEach.call(table.tBodies, function (body) {
            var occupied = [];
            Array.prototype.forEach.call(body.rows, function (row, rowIndex) {
                var col = 0;
                Array.prototype.forEach.call(row.cells, function (cell) {
                    while (occupied[col] > rowIndex) col++;
                    apply(cell, col);
                    var span = cell.rowSpan || body.rows.length - rowIndex;
                    for (var j = col; j < col + cell.colSpan; j++) {
                        occupied[j] = rowIndex + span;
                    }
                    col += cell.colSpan;
                });
            });
        });
    }

    function init() {
        document.querySelectorAll(".report-container table").forEach(function (table) {
            var pending = false;
            function schedule() {
                if (pending) return;
                pending = true;
                window.requestAnimationFrame(function () {
                    pending = false;
                    freeze(table);
                });
            }
            // Report data is populated by the opener after the template has loaded.
            new MutationObserver(schedule).observe(table, { childList: true, subtree: true });
            if (window.ResizeObserver) new ResizeObserver(schedule).observe(table);
            window.addEventListener("resize", schedule);
            schedule();
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
