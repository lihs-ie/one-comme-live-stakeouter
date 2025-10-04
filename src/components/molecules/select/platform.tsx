import { ChevronDown } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { NicoNicoIcon } from 'components/atoms/icons/niconico';
import { YoutubeIcon } from 'components/atoms/icons/youtube';

import { ImmutableSet } from 'domains/common/collections';
import { PlatformType } from 'domains/common/platform';

import styles from './platform.module.scss';

export type Props = {
  values: ImmutableSet<PlatformType>;
  selected: PlatformType | null;
  onSelect: (platform: PlatformType) => void;
  used: ImmutableSet<PlatformType>;
};

const PlatformIcon: Record<PlatformType, ReactNode> = {
  [PlatformType.NICONICO]: <NicoNicoIcon />,
  [PlatformType.YOUTUBE]: <YoutubeIcon />,
} as const;

const PlatformName: Record<PlatformType, string> = {
  [PlatformType.NICONICO]: 'ニコニコ生放送',
  [PlatformType.YOUTUBE]: 'YouTube',
} as const;

export const PlatformSelector = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const usedSet = props.used;
  const choices = props.values.filter(platform => !usedSet.contains(platform));

  return (
    <div className={styles.container}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.button}>
        <div className={styles.buttonContent}>
          {props.selected ? (
            <>
              <div className={styles.icon}>{PlatformIcon[props.selected]}</div>
              <span className={styles.platformName}>{PlatformName[props.selected]}</span>
            </>
          ) : (
            <span className={styles.placeholder}>プラットフォームを選択</span>
          )}
        </div>
        <ChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={`${styles.dropdown} slide-in`}>
          {choices.size() === 0 ? (
            <div className={styles.emptyMessage}>利用可能なプラットフォームがありません</div>
          ) : (
            choices.toArray().map(choice => (
              <button
                key={choice}
                onClick={() => {
                  props.onSelect(choice);
                  setIsOpen(false);
                }}
                className={styles.option}
              >
                <span className={styles.icon}>{PlatformIcon[choice]}</span>
                <span className={styles.optionName}>{PlatformName[choice]}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
