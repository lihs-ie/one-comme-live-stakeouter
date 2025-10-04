import { PlatformType } from 'domains/common/platform';

export type Props = {
  type: PlatformType;
};

const names: Record<PlatformType, string> = {
  [PlatformType.YOUTUBE]: 'YouTube',
  [PlatformType.NICONICO]: 'ニコニコ生放送',
};

export const PlatformText = (props: Props) => <>{names[props.type]}</>;
