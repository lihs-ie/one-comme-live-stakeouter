import {
  RGB,
  ServiceCreated,
  ServiceIdentifier,
  ServiceMeta,
  ServiceOptions,
  ServiceUpdated,
  ViewerService,
  ViewerServiceSnapshot,
} from 'domains/viewer';

import { Builder, StringFactory } from 'tests/factories';
import { ImmutableDateFactory } from 'tests/factories/domains/common/date';
import { PlatformTypeFactory } from 'tests/factories/domains/common/platform';
import { URLFactory } from 'tests/factories/domains/common/uri';
import { LiveStreamIdentifierFactory } from 'tests/factories/domains/streaming';
import {
  RGBFactory,
  ServiceIdentifierFactory,
  ServiceOptionsFactory,
  ViewerServiceFactory,
  ViewerServiceSnapshotFactory,
} from 'tests/factories/domains/viewer/service';
import { uuidV4FromSeed } from 'tests/helpers';

import { ValueObjectTest } from '../common/value-object';

describe('Package service', () => {
  describe('ServiceIdentifier', () => {
    ValueObjectTest(
      ServiceIdentifier,
      { value: uuidV4FromSeed(0), platform: Builder(PlatformTypeFactory).build() },
      [{ value: uuidV4FromSeed(1) }, { value: uuidV4FromSeed(2) }],
      [{ value: '' }, { value: 'a'.repeat(65) }, { value: 123 }]
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
        startTime: null,
        viewer: null,
        total: null,
        loggedIn: null,
        loggedName: null,
      },
      [
        { title: null },
        { url: Builder(URLFactory).build() },
        { isLive: true },
        { isLive: false },
        { isReconnecting: true },
        { isReconnecting: false },
        { startTime: 0 },
        { viewer: 100 },
        { total: 42 },
        { loggedIn: true },
        { loggedIn: false },
        { loggedName: 'Alice' },
      ],
      [
        { title: '' },
        { title: Builder(StringFactory(256, 256)).build() },
        { url: 'invalid' },
        { isLive: 'invalid' },
        { isReconnecting: 'invalid' },
        { startTime: -1 },
        { viewer: -1 },
        { total: -1 },
        { loggedIn: 'invalid' },
        { loggedName: '' },
        { loggedName: Builder(StringFactory(256, 256)).build() },
      ]
    );
  });

  describe('ViewerServiceSnapshot', () => {
    ValueObjectTest(
      ViewerServiceSnapshot,
      {
        identifier: Builder(ServiceIdentifierFactory).build(),
        name: Builder(StringFactory(1, 100)).build(),
        url: Builder(URLFactory).build(),
        enabled: true,
        speech: true,
        color: Builder(RGBFactory).build(),
        write: true,
        options: Builder(ServiceOptionsFactory).build(),
      },
      [{ enabled: false }, { speech: false }, { write: false }],
      [
        { name: '' },
        { name: Builder(StringFactory(101, 101)).build() },
        { url: 'invalid' },
        { color: { red: -1, green: 0, blue: 0 } },
        { color: { red: 256, green: 0, blue: 0 } },
        { options: { outputLog: 'invalid' } },
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

      describe('snapshot', () => {
        it('should return ViewerServiceSnapshot', () => {
          const expected = Builder(ViewerServiceSnapshotFactory).build();

          const service = ViewerService({
            identifier: expected.identifier,
            name: expected.name,
            url: expected.url,
            enabled: expected.enabled,
            speech: expected.speech,
            color: expected.color,
            write: expected.write,
            options: expected.options,
          });

          const actual = service.snapshot();

          expect(actual).toEqualValueObject(expected);
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

  describe('ServiceUpdated', () => {
    describe('instantiate', () => {
      it('should return ServiceUpdated event', () => {
        const identifier = uuidV4FromSeed(Math.random());
        const occurredAt = Builder(ImmutableDateFactory).build();
        const before = Builder(ViewerServiceSnapshotFactory).build();

        const event = ServiceUpdated({ identifier, occurredAt, before });

        expect(event.identifier).toBe(identifier);
        expect(occurredAt).toEqualValueObject(event.occurredAt);
        expect(event.before).toEqualValueObject(before);
        expect(event.type).toBe('ServiceUpdated');
      });
    });
  });
});
