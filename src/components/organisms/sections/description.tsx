import { GearIcon } from 'components/atoms/icons/gear';

import styles from './description.module.scss';

export const DescriptionSection = () => (
  <div className={styles.container}>
    <div className={styles.contents}>
      <div className={styles.icon}>
        <GearIcon />
      </div>

      <div>
        <h2 className={styles.title}>監視チャンネル設定</h2>
        <p className={styles.text}>
          各プラットフォームで監視するチャンネルを設定します。設定したチャンネルでライブ配信が開始されると、自動的にわんコメに配信URLが設定されます。
        </p>
      </div>
    </div>
  </div>
);
