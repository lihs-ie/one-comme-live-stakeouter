import { ReactNode } from 'react';

import styles from './submit.module.scss';

export type Props = {
  children?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

export const SubmitButton = (props: Props) => {
  const { disabled = false } = props;

  return (
    <button
      onClick={props.onClick}
      disabled={disabled}
      type='submit'
      className={`${styles.container} ${disabled ? styles.disabled : styles.enabled}`}
    >
      {props.children}
    </button>
  );
};
