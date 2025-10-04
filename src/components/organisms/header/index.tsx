import { CommentIcon } from 'components/atoms/icons/comment';

import styles from './index.module.scss';

export const Header = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>
          <div className={styles.icon}>
            <CommentIcon />
          </div>
          <div>
            <h1 className={styles.text}>わんコメ 自動化プラグイン</h1>
            <p className={styles.subtitle}>ライブ配信URL取得の自動化設定</p>
          </div>
        </div>
      </div>
    </div>
  );
};
