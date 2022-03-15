import React, { useEffect } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import AWSSetting from '../renderer/features/settings/AWSSetting';
import ImageSetting from '../renderer/features/settings/ImageSetting';
import { PreferencesContainer } from '../renderer/store/PreferencesContainer';

interface TabPanelProps {
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PreferencesPage = (): React.ReactElement => {
  const [value, setValue] = React.useState(0);
  const preferences = PreferencesContainer.useContainer();

  useEffect(() => {
    preferences.loadPreferences();
  }, [preferences]);

  const handleChange = (_event: unknown, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="preferences">
          <Tab
            label="AWS"
            id="vertical-tab-0"
            aria-controls="vertical-tabpanel-0"
          />
          <Tab
            label="Image"
            id="vertical-tab-1"
            aria-controls="vertical-tabpanel-1"
          />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <AWSSetting />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ImageSetting />
      </TabPanel>
    </Box>
  );
};

export default PreferencesPage;
