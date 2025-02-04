import { loadData } from '@common/load';
import { resolve } from 'path';
import ms from 'ms';

import { cl, select } from '@common/debug-mangos-select';

import { psignrank, useWasmBackendSignRank, clearBackendSignRank } from '..';


const psignrankLogs = select('psignrank');
const psignrankDomainWarns = psignrankLogs("argument out of domain in '%s'");

describe('psignrank (wilcox sign rank)', function () {
    beforeEach(() => {
        cl.clear('psignrank');
    })
    describe('invalid input and edge cases', () => {
        it('x = NaN | n = NaN', () => {
            const nan1 = psignrank(NaN, 2);
            expect(nan1).toBeNaN();
            const nan2 = psignrank(3, NaN);
            expect(nan2).toBeNaN();
        });
        it('n <= 0| n = Inf', () => {
            const nan1 = psignrank(6, -1);
            expect(nan1).toBeNaN();
            const nan2 = psignrank(6, Infinity);
            expect(nan2).toBeNaN();
            expect(psignrankDomainWarns()).toHaveLength(2);
        });
        it('x < 0 or x > n*(n+1)/2', () => {
            const zero1 = psignrank(-1, 4);
            expect(zero1).toBe(0);
            const one1 = psignrank(4 * (4 + 1) / 2 + 1, 4);
            expect(one1).toBe(1);
        });
        it.todo('run over all W+ for n=1 and n=2');
    });
    describe('fidelity', () => {
        it('(non wasm) n = 40, 0 < x < n*(n+1)/2 ', async () => {
            const [x
                , y
            ] = await loadData(resolve(__dirname, 'fixture-generation', 'psign1.csv'), /,/, 1, 2);
            const start = Date.now();
            const actual = x.map((_x, i) => (Math.abs(psignrank(_x, 40) - y[i])));
            console.log(`(no wasm) duration=${ms(Date.now() - start)}`);
            actual.forEach((fy) => {
                expect(fy).toBeLessThan(5e-16)
            });
        });
        it('(wasm acc) n = 40, 0 < x < n*(n+1)/2 ', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'psign1.csv'), /,/, 1, 2);
            useWasmBackendSignRank();
            const start = Date.now();
            const actual = x.map((_x, i) => (Math.abs(psignrank(_x, 40) - y[i])));
            console.log(`(wasm acc) duration=${ms(Date.now() - start)}`);
            actual.forEach((fy) => {
                expect(fy).toBeLessThan(5e-16)
            });
            clearBackendSignRank();
        });
    })
});