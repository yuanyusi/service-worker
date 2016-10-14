// a reducer takes in two things
// 1. the action (info about what happened)
// 2. copy of current state
import * as types from '../actions/actionTypes';

function goals(state =  [], action){
	 const i = action.index;
	switch(action.type){
		case 'ADD_GOAL':
		// return the new state with the new comment
		return [...state,{
			description: action.description,
		}];
		case 'DELETE_GOAL':
		return [
			...state.slice(0,action.i),
			...state.slice(action.i + 1)
		]
		case 'SUCCESS_GOAL':
        return [
          ...state.data.slice(0,i), // before the one we are updating
          {...state.data[i], total: state.data[i].successes.length},
          ...state.data.slice(i + 1), // after the one we are updating
        ]
		case 'FAILED_GOAL':
        return [
          ...state.slice(0,i), // before the one we are updating
          {...state[i], likes: state[i].failures.length},
          ...state.slice(i - 1), // after the one we are updating
        ]
	/*	case types.RECV_ERROR:
			return Object.assign({}, state, {isLoading: false, data: action.data, error: true});
		case types.RECV_DATA:
			return Object.assign({}, state, {isLoading: false, data: action.data, error: false });
		case types.REQ_DATA:
			return Object.assign({}, state, {isLoading: true, error: false });
*/
		default:
			return state;
	}
}
/*
function receiveGoals(state = [], action){
	switch(action.type){
		case types.RECV_ERROR:
			return Object.assign({}, state, {isLoading: false, data: action.data, error: true});
		case types.RECV_DATA:
			return Object.assign({}, state, {isLoading: false, data: action.data, error: false });
		case types.REQ_DATA:
			return Object.assign({}, state, {isLoading: true, error: false });
		default:
			return state;
	}
}

function goals(state = [], action){
	if(typeof action.description !== 'undefined'){
		return {
			// take the current state
			...state,
			// overwrite this post with a new one
			[action.description]: postGoals(state[action.description], action)
		}		
	}
	return state;
}*/

export default goals