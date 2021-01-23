import React from 'react';
import {
  makeStyles,
  Theme,
  Tabs,
  Tab,
  Box,
  Typography,
  AppBar,
} from '@material-ui/core';
import AWSSetting from '../features/settings/AWSSetting';
import ImageSetting from '../features/settings/ImageSetting';

interface TabPanelProps {
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component="span">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    maxHeight: '100%',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    flexGrow: 0,
    flexShrink: 0,
  },
  tab: {
    flexGrow: 1,
    margin: 8,
    minHeight: 300,
    maxHeight: 400,
    minWidth: 400,
    overflowY: 'auto',
  },
}));

const SettingPage = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: unknown, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        indicatorColor="primary"
        textColor="primary"
        value={value}
        onChange={handleChange}
        aria-label="Setting Page"
        className={classes.tabs}
      >
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
      <Box className={classes.tab}>
        <TabPanel value={value} index={0}>
          <AWSSetting />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ImageSetting />
        </TabPanel>
      </Box>
    </div>
  );
};

export default SettingPage;
