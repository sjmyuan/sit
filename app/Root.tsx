/* eslint react/jsx-props-no-spreading: off */
import React, { useEffect } from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Switch, Route } from 'react-router';
import { useDispatch } from 'react-redux';
import { StylesProvider } from '@material-ui/core';
import routes from './constants/routes.json';
import { loadConfig } from './features/settings/settingsSlice';

// Lazily load routes and code split with webpack
const LazyImagePage = React.lazy(
  () => import(/* webpackChunkName: "ImagePage" */ './components/ImagePage')
);

const ImagePage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyImagePage {...props} />
  </React.Suspense>
);

type Props = {
  history: History;
};

const Root = ({ history }: Props) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadConfig());
  });

  return (
    <StylesProvider injectFirst>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path={routes.HOME} component={ImagePage} />
        </Switch>
      </ConnectedRouter>
    </StylesProvider>
  );
};

export default hot(Root);
