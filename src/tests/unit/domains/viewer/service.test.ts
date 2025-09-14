import {
  RGB,
  ServiceCreated,
  ServiceIdentifier,
  ServiceMeta,
  ServiceOptions,
  ViewerService,
} from 'domains/viewer';

import { Builder, StringFactory } from 'tests/factories';
import { ImmutableDateFactory } from 'tests/factories/domains/common/date';
import { URLFactory } from 'tests/factories/domains/common/uri';
import { LiveStreamIdentifierFactory } from 'tests/factories/domains/streaming';
import {
  RGBFactory,
  ServiceIdentifierFactory,
  ServiceOptionsFactory,
  ViewerServiceFactory,
} from 'tests/factories/domains/viewer/service';
import { uuidV4FromSeed } from 'tests/helpers';

import { ValueObjectTest } from '../common/value-object';

describe('Package service', () => {
  describe('ServiceIdentifier', () => {
    ValueObjectTest(
      ServiceIdentifier,
      { value: uuidV4FromSeed(0) },
      [{ value: uuidV4FromSeed(1) }, { value: uuidV4FromSeed(2) }],
      [{ value: 'invalid' }, { value: 123 }]
    );
  });

  describe('RGB', () => {
    ValueObjectTest(
      RGB,
      { red: 0, green: 85, blue: 170 },
      [
        { red: 0, green: 0, blue: 0 },
        { red: 255, green: 255, blue: 255 },
      ],
      [
        { red: -1 },
        { red: 256 },
        { green: -1 },
        { green: 256 },
        { blue: -1 },
        { blue: 256 },
        { red: 'invalid' },
        { green: 'invalid' },
        { blue: 'invalid' },
      ]
    );
  });

  describe('ServiceOptions', () => {
    ValueObjectTest(
      ServiceOptions,
      { outputLog: true },
      [{ outputLog: false }],
      [{ outputLog: 'invalid' }]
    );
  });

  describe('ServiceMeta', () => {
    ValueObjectTest(
      ServiceMeta,
      {
        title: Builder(StringFactory(1, 255)).build(),
        url: null,
        isLive: null,
        isReconnecting: null,
      },
      [
        { title: null },
        { url: Builder(URLFactory).build() },
        { isLive: true },
        { isLive: false },
        { isReconnecting: true },
        { isReconnecting: false },
      ],
      [
        { title: '' },
        { title: Builder(StringFactory(256, 256)).build() },
        { url: 'invalid' },
        { isLive: 'invalid' },
        { isReconnecting: 'invalid' },
      ]
    );
  });

  describe('ViewerService', () => {
    describe('instantiate', () => {
      describe('successfully', () => {
        it('should return ViewerService', () => {
          const identifier = Builder(ServiceIdentifierFactory).build();
          const name = Builder(StringFactory(1, 100)).build();
          const url = Builder(URLFactory).build();
          const enabled = Math.random() > 0.5;
          const speech = Math.random() > 0.5;
          const color = Builder(RGBFactory).build();
          const write = Math.random() > 0.5;
          const options = Builder(ServiceOptionsFactory).build();

          const service = ViewerService({
            identifier,
            name,
            url,
            enabled,
            speech,
            color,
            write,
            options,
          });

          expect(service.identifier).toEqualValueObject(identifier);
          expect(service.name).toBe(name);
          expect(service.url).toEqualValueObject(url);
          expect(service.enabled).toBe(enabled);
          expect(service.speech).toBe(speech);
          expect(service.color).toEqualValueObject(color);
          expect(service.write).toBe(write);
          expect(service.options).toEqualValueObject(options);
        });
      });

      describe('unsuccessfully', () => {
        it.each<Partial<ViewerService>>([
          { name: '' },
          { name: Builder(StringFactory(101, 101)).build() },
        ])('should throws error %s', invalid => {
          const identifier = Builder(ServiceIdentifierFactory).build();
          const name = Builder(StringFactory(1, 100)).build();
          const url = Builder(URLFactory).build();
          const enabled = Math.random() > 0.5;
          const speech = Math.random() > 0.5;
          const color = Builder(RGBFactory).build();
          const write = Math.random() > 0.5;
          const options = Builder(ServiceOptionsFactory).build();

          expect(() =>
            ViewerService({
              identifier,
              name,
              url,
              enabled,
              speech,
              color,
              write,
              options,
              ...invalid,
            })
          ).toThrowError();
        });
      });
    });

    describe('enable', () => {
      it('should return enabled ViewerService', () => {
        const service = Builder(ViewerServiceFactory).build({ enabled: false });

        const actual = service.enable();

        expect(actual.enabled).toBeTruthy();
      });
    });

    describe('disable', () => {
      it('should return disabled ViewerService', () => {
        const service = Builder(ViewerServiceFactory).build({ enabled: true });

        const actual = service.disable();

        expect(actual.enabled).toBeFalsy();
      });
    });
  });

  describe('ServiceCreated', () => {
    describe('instantiate', () => {
      it('should return ServiceCreated event', () => {
        const identifier = uuidV4FromSeed(Math.random());
        const occurredAt = Builder(ImmutableDateFactory).build();
        const service = Builder(ServiceIdentifierFactory).build();
        const stream = Builder(LiveStreamIdentifierFactory).build();

        const event = ServiceCreated({ identifier, occurredAt, service, stream });

        expect(event.identifier).toBe(identifier);
        expect(occurredAt).toEqualValueObject(event.occurredAt);
        expect(event.service).toEqualValueObject(service);
        expect(event.stream).toEqualValueObject(stream);
      });
    });
  });
});
