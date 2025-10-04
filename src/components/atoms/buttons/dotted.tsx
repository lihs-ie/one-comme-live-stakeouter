import { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './dotted.module.scss';

export type Props = {
  children?: ReactNode;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  onClick: () => void;
};

export const DottedButton = (props: Props) => (
  <button className={styles.container} type={props.type} onClick={props.onClick}>
    {props.children}
  </button>
);
