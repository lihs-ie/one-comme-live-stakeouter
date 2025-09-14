import { URL } from 'domains/common/uri';

import { ValueObjectTest } from './value-object';

describe('Package uri', () => {
  describe('URL', () => {
    ValueObjectTest(
      URL,
      { value: 'https://example.com' },
      [
        { value: 'http://example.com/hoge' },
        { value: 'https://example.com/fuga?foo=bar' },
        { value: 'https://example.com/fuga#1' },
        { value: 'https://sub.example.com/' },
      ],
      [{ value: '' }, { value: ' ' }, { value: 'invalid-url' }]
    );
  });
});
