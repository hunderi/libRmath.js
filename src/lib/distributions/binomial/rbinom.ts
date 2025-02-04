import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_pow_di } from '@lib/r-func';

import { globalUni } from '@rng/global-rng';

import { qbinom } from './qbinom';


const printer_rbinom = debug('rbinom');
 
export function rbinomOne(size: number, prob: number): number {
    const rng = globalUni();
    // double
    let c = 0;
    let fm = 0;
    let npq = 0;
    let p1 = 0;
    let p2 = 0;
    let p3 = 0;
    let p4 = 0;
    let qn = 0;
    let xl = 0;
    let xll = 0;
    let xlr = 0;
    let xm = 0;
    let xr = 0;
    let psave = -1.0;

    //int
    //let nsave = -1;
    let m = 0;

    //double
    let f: number;
    let f1: number;
    let f2: number;
    let u: number;
    let v: number;
    let w: number;
    let w2: number;
    let x: number;
    let x1: number;
    let x2: number;
    let z: number;
    let z2: number;
    let r: number;
    let al: number;
    let alv: number;
    let amaxp: number;
    let ffm: number;
    let ynorm: number;

    //int
    let i;
    let ix = 0;
    let k;


    if (!isFinite(size)) return ML_ERR_return_NAN2(printer_rbinom, lineInfo4);
    r = Math.round(size);
    if (r !== size) return ML_ERR_return_NAN2(printer_rbinom, lineInfo4);
    if (
        !isFinite(prob) ||
        /* n=0, p=0, p=1 are not errors <TSL>*/
        r < 0 ||
        prob < 0 ||
        prob > 1
    ) {
        return ML_ERR_return_NAN2(printer_rbinom, lineInfo4);
    }
    if (r === 0 || prob === 0) return 0;
    if (prob === 1) return r;

    if (r >= 2147483647 /*INT_MAX*/) {
        /* evade integer overflow,
            and r == INT_MAX gave only even values */
        const _p = rng.random(); //between 0 and 1
        printer_rbinom('Evade overflow:%d > MAX_SAFE_INTEGER', r);
        const retv = qbinom(
            _p,
            r,
            prob,
            /*lower_tail*/ false,
            /*log_p*/ false,
        );
        return retv;
    }
    /* else */
    const n = Math.trunc(r);

    const p = Math.min(prob, 1 - prob);
    const q = 1 - p;
    const np = n * p;
    r = p / q;
    const g = r * (n + 1);

    /* Setup, perform only when parameters change [using static (globals): */

    /* FIXING: Want this thread safe
       -- use as little (thread globals) as possible
    */
    const finis = () => {
        if (psave > 0.5) {
            ix = n - ix;
        }
        return ix;
    }
    const L_np_small = () => {
        //L_np_small:
        /*---------------------- np = n*p < 30 : ------------------------- */
        for (;;) {
            ix = 0;
            f = qn;
            u = rng.random();
            for (;;) {
                if (u < f) {
                    //goto finis;
                    return;
                }
                if (ix > 110) break;
                u -= f;
                ix++;
                f *= g / ix - r;
            }
        }
    };

    //if (prob !== psave || n !== nsave) {
    psave = prob;
    //nsave = Math.trunc(n);
    if (np < 30.0) {
        /* inverse cdf logic for mean less than 30 */
        qn = R_pow_di(q, n);
        L_np_small();
        return finis();
        //goto L_np_small;
    } else {
        ffm = np + p;
        m = Math.trunc(ffm);
        fm = m;
        npq = np * q;
        p1 = Math.trunc(2.195 * Math.sqrt(npq) - 4.6 * q) + 0.5;
        xm = fm + 0.5;
        xl = xm - p1;
        xr = xm + p1;
        c = 0.134 + 20.5 / (15.3 + fm);
        al = (ffm - xl) / (ffm - xl * p);
        xll = al * (1.0 + 0.5 * al);
        al = (xr - ffm) / (xr * q);
        xlr = al * (1.0 + 0.5 * al);
        p2 = p1 * (1.0 + c + c);
        p3 = p2 + c / xll;
        p4 = p3 + c / xlr;
    }
    //}
    /*else if (n === nsave) {
       if (np < 30.0) {
           //goto L_np_small;
           L_np_small();
           return finis();

       }
   }*/

    /*-------------------------- np = n*p >= 30 : ------------------- */
    for (;;) {
        u = rng.random() * p4;
        v = rng.random();
        /* triangular region */
        if (u <= p1) {
            ix = Math.trunc(xm - p1 * v + u);
            return finis();
            //goto finis;
        }
        /* parallelogram region */
        if (u <= p2) {
            x = xl + (u - p1) / c;
            v = v * c + 1.0 - Math.abs(xm - x) / p1;
            if (v > 1.0 || v <= 0) continue;
            ix = Math.trunc(x);
        } else {
            if (u > p3) {
                /* right tail */
                ix = Math.trunc(xr - Math.log(v) / xlr);
                if (ix > n) continue;
                v = v * (u - p3) * xlr;
            } else {
                /* left tail */
                ix = Math.trunc(xl + Math.log(v) / xll);
                if (ix < 0) continue;
                v = v * (u - p2) * xll;
            }
        }
        /* determine appropriate way to perform accept/reject test */
        k = Math.abs(ix - m);
        if (k <= 20 || k >= npq / 2 - 1) {
            /* explicit evaluation */
            f = 1.0;
            if (m < ix) {
                for (i = m + 1; i <= ix; i++) f *= g / i - r;
            } else if (m !== ix) {
                for (i = ix + 1; i <= m; i++) f /= g / i - r;
            }
            if (v <= f) {
                return finis()
                //goto finis;
            }
        } else {
            /* squeezing using upper and lower bounds on Math.log(f(x)) */
            amaxp = (k / npq) * ((k * (k / 3 + 0.625) + 0.1666666666666) / npq + 0.5);
            ynorm = (-k * k) / (2.0 * npq);
            alv = Math.log(v);
            if (alv < ynorm - amaxp) {
                return finis();
                //goto finis;
            }
            if (alv <= ynorm + amaxp) {
                /* stirling's formula to machine accuracy */
                /* for the final acceptance/rejection test */
                x1 = ix + 1;
                f1 = fm + 1.0;
                z = n + 1 - fm;
                w = n - ix + 1.0;
                z2 = z * z;
                x2 = x1 * x1;
                f2 = f1 * f1;
                w2 = w * w;
                if (
                    alv <=
                    xm * Math.log(f1 / x1) +
                    (n - m + 0.5) * Math.log(z / w) +
                    (ix - m) * Math.log((w * p) / (x1 * q)) +
                    (13860.0 - (462.0 - (132.0 - (99.0 - 140.0 / f2) / f2) / f2) / f2) / f1 / 166320.0 +
                    (13860.0 - (462.0 - (132.0 - (99.0 - 140.0 / z2) / z2) / z2) / z2) / z / 166320.0 +
                    (13860.0 - (462.0 - (132.0 - (99.0 - 140.0 / x2) / x2) / x2) / x2) / x1 / 166320.0 +
                    (13860.0 - (462.0 - (132.0 - (99.0 - 140.0 / w2) / w2) / w2) / w2) / w / 166320
                ) {
                    return finis(); // goto finis
                }
            }
        }
    }
    // unreachable code
    // throw new Error(`internal error unreachable code`)
    //L_np_small();
    //return finis();

}
