import { PlusIcon } from 'lucide-react';
import { ResultAsync } from 'neverthrow';
import { FormEvent, useState } from 'react';

import { CommonError } from 'aspects/error';
import { SimpleButton } from 'components/atoms/buttons/simple';
import { SubmitButton } from 'components/atoms/buttons/submit';
import { TextInput } from 'components/atoms/input/text';
import { PlatformSelector } from 'components/molecules/select/platform';
import { CreateChannelWorkflowCommand } from 'workflows/monitoring/manage';

import { ImmutableSet } from 'domains/common/collections';
import { PlatformType } from 'domains/common/platform';

import styles from './persistence.module.scss';

export type Props = {
  onSubmit: (command: CreateChannelWorkflowCommand) => ResultAsync<void, CommonError>;
  onCancel?: () => void;
  usedPlatforms: ImmutableSet<PlatformType>;
};

const labels: Record<PlatformType, string> = {
  [PlatformType.NICONICO]: 'ニコニコ生放送のユーザーID',
  [PlatformType.YOUTUBE]: 'YouTubeのチャンネルID',
};

export const ChannelForm = (props: Props) => {
  const [platform, setPlatform] = useState<PlatformType | null>(null);
  const [identifier, setIdentifier] = useState('');

  const valid = platform !== null && identifier.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIdentifier(identifier.trim());

    if (valid) {
      props.onSubmit({ identifier: identifier.trim(), platform });
    }

    return;
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <PlusIcon />
        </div>
        <span className={styles.title}>新しい監視チャンネル/配信者</span>
      </div>
      <PlatformSelector
        values={ImmutableSet.fromArray<PlatformType>(Object.values(PlatformType)).subtract(
          props.usedPlatforms.toArray()
        )}
        selected={platform}
        onSelect={setPlatform}
        used={props.usedPlatforms}
      />
      {platform !== null && (
        <>
          <label className={styles.label}>{labels[platform]}</label>
          <TextInput
            value={identifier}
            onChange={setIdentifier}
            placeholder={`${labels[platform]}を入力`}
          />
        </>
      )}
      <div className={styles.buttons}>
        <SubmitButton disabled={!valid}>追加</SubmitButton>
        <SimpleButton
          onClick={() => {
            props.onCancel?.();
            setPlatform(null);
            setIdentifier('');
          }}
        >
          キャンセル
        </SimpleButton>
      </div>
    </form>
  );
};
