import {
  LiveStreamMedia as LiveStreamCustomMedia,
  LiveStreamReader,
  Translator,
} from 'acl/live-stream/niconico';

import { PlatformType } from 'domains/common/platform';
import { Status } from 'domains/streaming';

import { Builder } from 'tests/factories';
import { URLFactory } from 'tests/factories/domains/common/uri';
import { ChannelIdentifierFactory } from 'tests/factories/domains/monitoring';
import {
  LiveStreamFactory,
  LiveStreamIdentifierFactory,
  LiveStreamURLFactory,
} from 'tests/factories/domains/streaming';
import { LiveStreamMedia } from 'tests/mock/upstreams/niconico/media/live-stream';

describe('Package translator', () => {
  describe('Translator', () => {
    describe('translate', () => {
      describe('successfully', () => {
        it('should translate returns SuccessResult with valid media', () => {
          const baseURL = 'https://example.com/';

          const platform = PlatformType.NICONICO;
          const identifier = Builder(LiveStreamIdentifierFactory).build({ platform });

          const expected = Builder(LiveStreamFactory).build({
            identifier,
            url: Builder(LiveStreamURLFactory).build({
              value: Builder(URLFactory).build({ value: `${baseURL}${identifier.value}` }),
              channel: Builder(ChannelIdentifierFactory).build({ platform }),
            }),
            status: Status.ENDED,
          });

          const media = new LiveStreamMedia(expected);

          const actual = Translator(baseURL).translate([
            LiveStreamReader.read(media.createSuccessfulContent())._unsafeUnwrap(),
            identifier,
          ]);

          expect(actual.isOk()).toBeTruthy();
          expect(actual._unsafeUnwrap()).toBeSameLiveStream(expected);
        });
      });

      describe('unsuccessfully', () => {
        it('should translate returns ErrorResult with invalid media', () => {
          const baseURL = 'https://example.com/';

          const platform = PlatformType.NICONICO;
          const identifier = Builder(LiveStreamIdentifierFactory).build({ platform });

          // まず正しいメディアを構築
          const validMedia = LiveStreamReader.read(
            new LiveStreamMedia(
              Builder(LiveStreamFactory).build({
                identifier,
                url: Builder(LiveStreamURLFactory).build({
                  value: Builder(URLFactory).build({ value: `${baseURL}${identifier.value}` }),
                  channel: Builder(ChannelIdentifierFactory).build({ platform }),
                }),
                status: Status.ENDED,
              })
            ).createSuccessfulContent()
          )._unsafeUnwrap();

          // 不正なメディア: 終了時刻 < 開始時刻 として検証を失敗させる
          const invalidMedia: LiveStreamCustomMedia = {
            ...validMedia,
            data: {
              ...validMedia.data,
              endAt: new Date(validMedia.data.beginAt.getTime() - 1000),
            },
          };

          const actual = Translator('http://example.com/').translate([invalidMedia, identifier]);

          expect(actual.isErr()).toBeTruthy();

          const error = actual._unsafeUnwrapErr();
          expect(error.type).toBe('validation-error');
        });
      });
    });
  });
});
