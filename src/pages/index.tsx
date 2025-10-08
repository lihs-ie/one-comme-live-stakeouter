import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '../public/sass/animation.scss';
import '../public/sass/global.scss';

import { SettingIndex } from 'components/templates/setting';
import {
  CreateChannelWorkflow,
  TerminateChannelWorkflow,
  UpdateChannelWorkflow,
  MonitoringChannelWorkflow,
} from 'providers/ui';

import { ImmutableList } from 'domains/common/collections';
import { type Channel } from 'domains/monitoring';

const loadChannels = async (
  setter: React.Dispatch<React.SetStateAction<ImmutableList<Channel>>>
) => {
  await MonitoringChannelWorkflow().map(channels => setter(channels));
};

const Index = () => {
  const [channels, setChannels] = useState<ImmutableList<Channel>>(ImmutableList.empty());

  useEffect(() => {
    void (async () => {
      await loadChannels(setChannels);
    })();
  }, []);

  return (
    <SettingIndex
      channels={channels}
      onCreateChannel={command =>
        CreateChannelWorkflow(command).map(() => loadChannels(setChannels))
      }
      onUpdateChannel={command =>
        UpdateChannelWorkflow(command).map(() => loadChannels(setChannels))
      }
      onTerminateChannel={command =>
        TerminateChannelWorkflow(command).map(() => loadChannels(setChannels))
      }
    />
  );
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <Index />
  </StrictMode>
);
