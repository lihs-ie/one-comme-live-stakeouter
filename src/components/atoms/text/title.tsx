import { ReactNode } from 'react';

import styles from './title.module.scss';

export type Props = {
  children: ReactNode;
};

export const Title = (props: Props) => <h3 className={styles.container}>{props.children}</h3>;
