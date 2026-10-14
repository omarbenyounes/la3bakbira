import { TndPipe } from './tnd.pipe';

describe('TndPipe', () => {
  const pipe = new TndPipe();

  it('formats dinars with 3 decimals', () => {
    // fr-FR uses a narrow no-break space as thousands separator
    expect(pipe.transform(1499).replace(/\s/g, ' ')).toBe('1 499,000 DT');
    expect(pipe.transform(12.5)).toBe('12,500 DT');
  });

  it('renders nothing for missing values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
