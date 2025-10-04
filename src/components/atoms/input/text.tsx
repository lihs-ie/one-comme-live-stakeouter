import styles from './text.module.scss';

export type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const TextInput = (props: Props) => (
  <input
    className={styles.container}
    type='text'
    value={props.value}
    onChange={event => props.onChange(event.target.value)}
    placeholder={props.placeholder}
  />
);
