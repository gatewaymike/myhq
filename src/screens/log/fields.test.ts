import { describe, expect, it } from 'vitest';
import { entryHQ } from '../../lib/hq';
import { LIMITS, parseNum, validate } from './fields';

const t = (k: string) => k;

describe('parseNum: typed figures', () => {
  it('reads a decimal comma as a decimal mark', () => {
    expect(parseNum('1,5')).toBe(1.5);
    expect(parseNum('0,8')).toBe(0.8);
    expect(parseNum('1,25')).toBe(1.25);
    expect(parseNum(' 1,5 ')).toBe(1.5);
  });

  it('still reads a thousands comma as a separator', () => {
    expect(parseNum('1,200')).toBe(1200);
    expect(parseNum('1,234.5')).toBe(1234.5);
    expect(parseNum('10,000')).toBe(10000);
  });

  it('leaves plain figures alone', () => {
    expect(parseNum('1.5')).toBe(1.5);
    expect(parseNum('600')).toBe(600);
    expect(parseNum('')).toBeNaN();
    expect(parseNum('abc')).toBeNaN();
  });

  it('500 mL at "1,5" mg/L is 0.94 HQ, not 9.38', () => {
    const hq = entryHQ({ route: 'water', volumeMl: parseNum('500'), concentrationMgL: parseNum('1,5') });
    expect(hq.toFixed(2)).toBe('0.94');
  });

  it('validation follows the parsed figure', () => {
    expect(validate('1,5', LIMITS.concentration, t as never)).toBeNull();
    expect(validate('1200', LIMITS.concentration, t as never)).toBe('log.errorMax');
    expect(validate('0', LIMITS.volume, t as never)).toBe('log.errorPositive');
  });
});
