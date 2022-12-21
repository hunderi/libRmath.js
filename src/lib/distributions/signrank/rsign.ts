'use strict';
/* This is a conversion from libRmath.so to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { globalUni } from '@rng/global-rng';
import { floor, trunc, round, isNaN, INT_MAX } from '@lib/r-func';


const printer = debug('rsignrank');

export function rsignrankOne(n: number): number {
    const rng = globalUni();
    /* NaNs propagated correctly */
    if (isNaN(n)) {
        return n;
    }
    // added for C language fidelity
    if (n > INT_MAX) return 0;

    n = round(n);

    if (n < 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    if (n === 0) {
        return 0;
    }
    let r = 0.0;
    const k = trunc(n);
    for (let i = 0; i < k /**/;) {
        r += (++i) * floor(rng.random() + 0.5);
    }
    return r;
}
