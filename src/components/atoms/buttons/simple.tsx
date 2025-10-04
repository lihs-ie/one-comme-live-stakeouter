import { ReactNode } from 'react';

import styles from './simple.module.scss';

export type Props = {
  children?: ReactNode;
  onClick?: () => void;
};

export const SimpleButton = (props: Props) => (
  <button onClick={props.onClick} className={styles.container}>
    {props.children}
  </button>
);
