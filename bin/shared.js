/*
 * pagemarks - Self-hosted static bookmarks via GitHub Pages and Jekyll
 * Copyright (c) 2019 the pagemarks contributors
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
 * License, version 3, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/gpl.html>.
 */

exports.date2yaml = function(pDate) {
    const d = pDate.getDate();
    const m = pDate.getMonth() + 1;
    const y = pDate.getFullYear();
    const h = pDate.getHours();
    const min = pDate.getMinutes();
    const s = pDate.getSeconds();
    return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' '
        + (h < 10 ? '0' + h : h) + ':' + (min < 10 ? '0' + min : min) + ':' + (s < 10 ? '0' + s : s);
}
