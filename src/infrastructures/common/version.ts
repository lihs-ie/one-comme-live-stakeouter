export interface Version {
  readonly auto: () => Version;
  readonly value: number;
}

export const Version = (value: number = 1): Version => ({
  auto: () => Version(value + 1),
  value,
});
