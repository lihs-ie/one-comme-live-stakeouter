import {
  Translator,
  NicoNicoAdaptor,
  ProgramReader,
  LiveStreamReader,
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
import { Type } from 'tests/mock/upstreams/common';
import { prepare } from 'tests/mock/upstreams/niconico';

describe('Package adaptor', () => {
  const endpoint = 'http://localhost';

  describe('Adaptor', () => {
    describe('findByChannel', () => {
      beforeEach(() => {
        fetchMock.enableMocks();
      });

      afterEach(() => {
        fetchMock.resetMocks();
        fetchMock.disableMocks();
      });

      describe('successfully', () => {
        it('should returns SuccessResult with valid media', async () => {
          const baseURL = 'https://example.com/';
          const userAgent = 'test-agent';

          const identifier = Builder(LiveStreamIdentifierFactory).build();
          const channel = Builder(ChannelIdentifierFactory).build();

          const expected = Builder(LiveStreamFactory).build({
            identifier,
            url: Builder(LiveStreamURLFactory).build({
              value: Builder(URLFactory).build({
                value: `${baseURL}${identifier.value}`,
              }),
              platform: PlatformType.NICONICO,
              channel,
            }),
            status: Status.ENDED,
          });

          prepare(endpoint, upstream => {
            upstream.addProgram(Type.OK, expected);
            upstream.addLiveStream(Type.OK, expected);
          });

          const adaptor = NicoNicoAdaptor(
            endpoint,
            userAgent,
            ProgramReader,
            LiveStreamReader,
            Translator(baseURL)
          );

          const actual = await adaptor.findByChannel(channel);

          expect(actual.isOk()).toBeTruthy();
          expect(actual._unsafeUnwrap()).toBeSameLiveStream(expected);
        });
      });

      describe('unsuccessfully', () => {
        it.each(Object.values(Type).filter(type => type !== Type.OK))(
          'should return ErrorResult when program upstream returns %s response',
          async type => {
            const channel = Builder(ChannelIdentifierFactory).build();
            const identifier = Builder(LiveStreamIdentifierFactory).build();
            const baseURL = 'https://example.com/';
            const userAgent = 'test-agent';

            const liveStream = Builder(LiveStreamFactory).build({
              identifier,
              url: Builder(LiveStreamURLFactory).build({
                value: Builder(URLFactory).build({
                  value: `${baseURL}${identifier.value}`,
                }),
                platform: PlatformType.NICONICO,
                channel,
              }),
              status: Status.ENDED,
            });

            prepare(endpoint, upstream => {
              upstream.addProgram(type, liveStream);
            });

            const adaptor = NicoNicoAdaptor(
              endpoint,
              userAgent,
              ProgramReader,
              LiveStreamReader,
              Translator('http://example.com/')
            );

            const actual = await adaptor.findByChannel(channel);

            expect(actual.isErr()).toBeTruthy();
          }
        );

        it.each(Object.values(Type).filter(type => type !== Type.OK))(
          'should return ErrorResult when live-stream upstream returns %s response',
          async type => {
            const channel = Builder(ChannelIdentifierFactory).build();
            const identifier = Builder(LiveStreamIdentifierFactory).build();
            const baseURL = 'https://example.com/';
            const userAgent = 'test-agent';

            const liveStream = Builder(LiveStreamFactory).build({
              identifier,
              url: Builder(LiveStreamURLFactory).build({
                value: Builder(URLFactory).build({
                  value: `${baseURL}${identifier.value}`,
                }),
                platform: PlatformType.NICONICO,
                channel,
              }),
              status: Status.ENDED,
            });

            prepare(endpoint, upstream => {
              upstream.addProgram(Type.OK, liveStream);
              upstream.addLiveStream(type, liveStream);
            });

            const adaptor = NicoNicoAdaptor(
              endpoint,
              userAgent,
              ProgramReader,
              LiveStreamReader,
              Translator('http://example.com/')
            );

            const actual = await adaptor.findByChannel(channel);

            expect(actual.isErr()).toBeTruthy();
          }
        );
      });
    });
  });
});
