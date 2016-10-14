// let's go!
import React from 'react';
import { render } from 'react-dom';

// Import css
import css from './styles/style.styl';

// Import Components
import App from './components/App';
import Single from './components/Single';
import PhotoGrid from './components/PhotoGrid';
import Goals from './components/Goals';
import Targets from './components/Targets';

// import react router deps
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { reduxReactRouter, routerStateReducer, ReduxRouter } from 'redux-react-router';
import store, { history } from './store';

const router = (
	<Provider store={store}>
		<Router history={history}>
			<Route path="/" component={App}>
				<IndexRoute component={Goals}> </IndexRoute>
				<Route path="/view/:postId" component={Single}></Route>
				<Route path="goals" component={Goals}></Route>
				<Route path="photoGrid" component={PhotoGrid}></Route>
				<Route path="targets" component={Targets}></Route>
			</Route>
		</Router>
	</Provider>
)

render(router, document.getElementById('root'));
