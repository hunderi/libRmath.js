import { resolve } from 'path';
import { loadData } from '@common/load';


//app
import { gamma } from '..';

describe('gamma', function () {
    it('gamma, range "0" to "0.5703"', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'fixture.R'), /,/, 0, 1);
        const actual = x.map(gamma);
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('value -1,-2  should return NaN', () => {
        const neg1 = gamma(-1);
        const neg2 = gamma(-2);
        expect(neg1).toEqualFloatingPointBinary(NaN);
        expect(neg2).toEqualFloatingPointBinary(NaN);
    });
    it('negative fraction -1.2 and -0.2, 1.2', () => {
        const neg1 = gamma(-1.2);
        const neg2 = gamma(-0.2);
        const neg3 = gamma(1.2);
        expect(neg1).toEqualFloatingPointBinary(4.8509571405220981433);
        expect(neg2).toEqualFloatingPointBinary(-5.8211485686265156403);
        expect(neg3).toEqualFloatingPointBinary(0.9181687423997606512);
    });
    it('force number argument', () => {
        const neg1 = gamma(-1.2);
        expect(neg1).toEqualFloatingPointBinary(4.8509571405220981433);
    });
    it('process float32Array', () => {
        const neg1 = [-4.1, -5.1].map(gamma);
        expect(neg1).toEqualFloatingPointBinary([-0.363973113892433530747, 0.071367277233810505477], 18);
    });
    it('1E-308 should become Infinity', () => {
        expect(gamma(1e-308)).toEqualFloatingPointBinary(Infinity);
    });
    it('-1E-308 should become -1.000000000000000011e+308', () => {
        expect(gamma(-1e-308)).toEqualFloatingPointBinary(-1e308);
    });
    it('5e-309  should become -Infinity', () => {
        expect(gamma(-5e-309)).toEqualFloatingPointBinary(-Infinity);
    });
    it('-1+1E-16  should become -9007199254740992', () => {
        expect(gamma(-1 + 1e-16)).toEqualFloatingPointBinary(-9007199254740992);
    });
    it('-1.0000000000000002 should become 4503599627370495.5', () => {
        expect(gamma(-1.0000000000000002)).toEqualFloatingPointBinary(4503599627370495.5);
    });
    it('overflow x > 171.61447887182298', () => {
        expect(gamma(171.71447887182298)).toEqualFloatingPointBinary(Infinity);
    });
    it('underflow x < -170.5674972726612', () => {
        expect(gamma(-170.6674972726612)).toEqualFloatingPointBinary(0);
    });
    it('2, 4, 5, 6', () => {
        expect([2, 4, 5, 6].map(gamma)).toEqualFloatingPointBinary([1, 6, 24, 120]);
    });
    it('30, 35, 40, 45, 50', () => {
        expect([30, 35, 40, 45, 50].map(gamma)).toEqualFloatingPointBinary([
            8.8417619937397007727e30,
            2.9523279903960411956e38,
            2.0397882081197441588e46,
            2.6582715747884485291e54,
            6.0828186403426752249e62,
        ]);
    });
    it('130, 135, 140, 145, 150', () => {
        expect([130, 135, 140, 145, 150].map(gamma)).toEqualFloatingPointBinary([
            4.9745042224770297777e217,
            1.9929427461617248218e228,
            9.6157231969405526369e238,
            5.5502938327392392576e249,
            3.8089226376305588645e260,
        ]);
    });
    it('-50.5, -1.000000000000004, -55.000000000000004', () => {
        expect([-50.5, -1.000000000000004, -55.000000000000004].map(gamma)).toEqualFloatingPointBinary([
            -1.4499543939077312447e-65,
            2.5019997929836046875e14,
            1.1082563917023920068e-59,
        ]);
        //gamma([55]);
    });
});
