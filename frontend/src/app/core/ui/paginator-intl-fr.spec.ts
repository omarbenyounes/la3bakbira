import { FrenchPaginatorIntl } from './paginator-intl-fr';

describe('FrenchPaginatorIntl', () => {
  const intl = new FrenchPaginatorIntl();

  it('describes the current range in French', () => {
    expect(intl.getRangeLabel(0, 20, 45)).toBe('1 – 20 sur 45');
    expect(intl.getRangeLabel(2, 20, 45)).toBe('41 – 45 sur 45');
    expect(intl.getRangeLabel(0, 20, 0)).toBe('0 sur 0');
  });
});
