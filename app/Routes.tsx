/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import ImagePage from './containers/ImagePage';

// Lazily load routes and code split with webpack
const LazyCounterPage = React.lazy(() =>
  import(/* webpackChunkName: "CounterPage" */ './containers/CounterPage')
);

const CounterPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);

// Lazily load routes and code split with webpack
const LazySettingPage = React.lazy(() =>
  import(/* webpackChunkName: "SettingPage" */ './containers/SettingPage')
);

const SettingPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazySettingPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.COUNTER} component={CounterPage} />
        <Route path={routes.SETTING} component={SettingPage} />
        <Route path={routes.IMAGES} component={ImagePage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
