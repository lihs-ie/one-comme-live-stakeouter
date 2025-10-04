import { ReactNode } from 'react';

import { NicoNicoIcon } from 'components/atoms/icons/niconico';
import { YoutubeIcon } from 'components/atoms/icons/youtube';

import { PlatformType } from 'domains/common/platform';

export type Props = {
  type: PlatformType;
};

const icons: Record<PlatformType, ReactNode> = {
  [PlatformType.NICONICO]: <NicoNicoIcon />,
  [PlatformType.YOUTUBE]: <YoutubeIcon />,
} as const;

export const PlatformIcon = (props: Props) => icons[props.type];
