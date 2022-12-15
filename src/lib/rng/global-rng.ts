import { IRNG, MessageType } from '@rng/irng';
import { KnuthTAOCP } from './knuth-taocp';
import { KnuthTAOCP2002 } from '@rng/knuth-taocp-2002';
import { LecuyerCMRG } from '@rng/lecuyer-cmrg';
import { MarsagliaMultiCarry } from '@rng/marsaglia-multicarry';
import { MersenneTwister } from '@rng/mersenne-twister';
import { SuperDuper } from '@rng/super-duper';
import { WichmannHill } from '@rng/wichmann-hill';

// normal
import { IRNGNormal } from '@rng/normal/normal-rng';
import { AhrensDieter } from '@rng/normal/ahrens-dieter';
import { BoxMuller } from '@rng/normal/box-muller';
import { BuggyKindermanRamage } from '@rng/normal/buggy-kinderman-ramage';
import { Inversion } from '@rng/normal/inversion';
import { KindermanRamage } from '@rng/normal/kinderman-ramage';

//enums
import { IRNGTypeEnum } from './irng-type';
import { IRNGNormalTypeEnum } from './normal/in01-type';
import { IRNGSampleKindTypeEnum } from './sample-kind-type';


const uniformMap = {
    // uniform
    [IRNGTypeEnum.KNUTH_TAOCP]: KnuthTAOCP,
    [IRNGTypeEnum.KNUTH_TAOCP2002]: KnuthTAOCP2002,
    [IRNGTypeEnum.LECUYER_CMRG]: LecuyerCMRG,
    [IRNGTypeEnum.MARSAGLIA_MULTICARRY]: MarsagliaMultiCarry,
    [IRNGTypeEnum.MERSENNE_TWISTER]: MersenneTwister,
    [IRNGTypeEnum.SUPER_DUPER]: SuperDuper,
    [IRNGTypeEnum.WICHMANN_HILL]: WichmannHill,
}

type UniformMapKey = keyof (typeof uniformMap);

const normalMap = {
    // normal
    [IRNGNormalTypeEnum.AHRENS_DIETER]: AhrensDieter,
    [IRNGNormalTypeEnum.BOX_MULLER]: BoxMuller,
    [IRNGNormalTypeEnum.BUGGY_KINDERMAN_RAMAGE]: BuggyKindermanRamage,
    [IRNGNormalTypeEnum.INVERSION]: Inversion,
    [IRNGNormalTypeEnum.KINDERMAN_RAMAGE]: KindermanRamage
}

type NormalMapKey = keyof (typeof normalMap);

const symRNG = Symbol.for('rngUNIFORM');
const symRNGNormal = Symbol.for('rngNORMAL');
const symSampleKind = Symbol.for('sample.kind');

type EgT = typeof globalThis & {
    [symRNG]: IRNG,
    [symRNGNormal]: IRNGNormal,
    [symSampleKind]: IRNGSampleKindTypeEnum
};

export function globalUni(d?: IRNG): IRNG {
    if (d) {
        (globalThis as EgT)[symRNG] = d;
    }
    return (globalThis as EgT)[symRNG];
}

export function globalNorm(d?: IRNGNormal): IRNGNormal {
    if (d) {
        (globalThis as EgT)[symRNGNormal] = d;
    }
    return (globalThis as EgT)[symRNGNormal];
}

export function globalSampleKind(d?: IRNGSampleKindTypeEnum): IRNGSampleKindTypeEnum {
    if (d) {
        (globalThis as EgT)[symSampleKind] = d;
    }
    return (globalThis as EgT)[symSampleKind];
}

export type RandomGenSet = {
    uniform?: IRNGTypeEnum
    normal?: IRNGNormalTypeEnum
    sampleKind?: IRNGSampleKindTypeEnum
};

/*
export function setSeed(
   seed: number,
   randomSet?: RandomGenSet,
): void {
    let gu = globalUni();
    let no = globalNorm();
    let sk = globalSampleKind();
}
*/
export function RNGKind(opt: RandomGenSet): RandomGenSet {

    let gu = globalUni();
    let no = globalNorm();
    let sk = globalSampleKind();

    function testAndSetUniform(u: UniformMapKey): boolean {
        const tu = uniformMap[u];
        if (tu) {
            // do nothing if it is the same type
            if (tu.kind !== (gu.constructor as unknown as typeof IRNG).kind) { // different so change it
                // it IS bound, (this happens in the constructor of the rng) 
                // eslint-disable-next-line @typescript-eslint/unbound-method
                gu.unregister(MessageType.INIT, no.reset);
                gu = globalUni(new tu());
                no.reset(gu);
            }
            return true;
        }
        return false;
    }

    function testAndSetNormal(n: NormalMapKey): boolean {

        const tn = normalMap[n];
        if (tn) {
            if (tn.kind !== (no.constructor as unknown as typeof IRNGNormal).kind)
            // do nothing if it is the same type
            {
                // it IS bound, above line...
                // eslint-disable-next-line @typescript-eslint/unbound-method
                gu.unregister(MessageType.INIT, no.reset);
                no = globalNorm(new tn());
                no.reset(gu);
            }
            return true;
        }
        return false;
    }

    function testAndSetSampleKind(s: IRNGSampleKindTypeEnum): boolean {
        if (
            s === IRNGSampleKindTypeEnum.REJECTION
            ||
            s === IRNGSampleKindTypeEnum.ROUNDING) {
            if (s !== sk) {
                sk = globalSampleKind(s);
            }
            return true;
        }
        return false;
    }

    if (opt.uniform) {
        testAndSetUniform(opt.uniform as UniformMapKey); // replace it if it is different
    }

    if (opt.normal){
        testAndSetNormal(opt.normal as NormalMapKey);
    }

    if (opt.sampleKind){
        testAndSetSampleKind(opt.sampleKind);
    }
   
    return { 
        uniform: (gu.constructor as unknown as typeof IRNG).kind,
        normal: (no.constructor as unknown as typeof IRNGNormal).kind,
        sampleKind: sk
    };

}


//init
(globalThis as EgT)[symRNG] = new MersenneTwister;
(globalThis as EgT)[symRNGNormal] = new Inversion((globalThis as EgT)[symRNG]);
(globalThis as EgT)[symSampleKind] = IRNGSampleKindTypeEnum.ROUNDING;




