
import { loadData } from '@common/load';
import { cl, /*select*/ } from '@common/debug-mangos-select';
//const dchisqDomainWarns = select('dchisq')("argument out of domain in '%s'");

import { resolve } from 'path';
import { dchisq } from '..';

describe('dchisq', function () {

    beforeEach(()=>{
        cl.clear('dchisq');
    });
    
    it('ranges x ∊ [0, 40, step 0.5] df=13', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dchisq.R'), /\s+/, 1, 2);
        const actual = x.map(_x => dchisq(_x, 13));
        expect(actual).toEqualFloatingPointBinary(y, 16);
    });
    it('ranges x ∊ [0, 40, step 0.5] df=13, log=true', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dchisq2.R'), /\s+/, 1, 2);
        const actual = x.map(_x => dchisq(_x, 13, undefined, true));
        expect(actual).toEqualFloatingPointBinary(y, 44);
    });
});
