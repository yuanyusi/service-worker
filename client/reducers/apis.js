import * as types from '../actions/actionTypes';

function apis(state = {
	isLoading: false,
	data: [],
	error: false}
, action = null) {
	const i = action.index;
	switch(action.type) {
		case types.RECV_ERROR:
			return Object.assign({}, state, {isLoading: false, data: action.data, error: true});
		case types.RECV_DATA:
			return Object.assign({}, state, {isLoading: false, data: action.data, error: false });
		case types.REQ_DATA:
			return Object.assign({}, state, {isLoading: true, error: false });
		case 'SUCCESS_GOAL':
			return {
				...state,
				data: [
				  ...state.data.slice(0, i),
				  Object.assign({}, state.data[i], action.json),
				  ...state.data.slice(i + 1)
				]
			}
		case 'FAILED_GOAL':
			return {
				...state,
				data: [
				  ...state.data.slice(0, i),
				  Object.assign({}, state.data[i], action.json),
				  ...state.data.slice(i + 1)
				]
			}
		case 'ADD_GOAL':
			return {
			... state,
			data: [
				  ...state.data,
				  Object.assign({}, state.data[i], action.json)
				]
			}
		case 'DELETE_GOAL':
		return {
			... state,
			data: [
			...state.data.slice(0,i),
			...state.data.slice(i + 1)
			]
		}
		default:
			return state;
	}
};

export default apis;