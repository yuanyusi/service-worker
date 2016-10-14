import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import posts from './posts';
import comments from './comments';
import apis from './apis';

const rootReducer = combineReducers({
	posts, 
	comments, 
	example: apis,
	routing: routerReducer });

export default rootReducer;