import * as types from './actionTypes';
import axios from 'axios';
import { pushState } from 'redux-react-router';

function requestData() {
	return {type: types.REQ_DATA}
};

function receiveData(json) {
	return{
		type: types.RECV_DATA,
		data: json
	}
};

function receiveError(json) {
	return {
		type: types.RECV_ERROR,
		data: json
	}
};

export function fetchData(url) {
	return function(dispatch) {
		dispatch(requestData());
		return axios({
			url: url,
			timeout: 20000,
			method: 'get',
			responseType: 'json'
		})
			.then(function(response) {
				dispatch(receiveData(response.data._embedded.goals));
			})
			.catch(function(response){
				dispatch(receiveError(response.data._embedded.goals));
				dispatch(pushState(null,'/error'));
			})
	}
};

export function insertGoal(url, description) {
	return function(dispatch) {
		axios({
		  method: 'post',
		  url: url,
		  json: true,
		  data: {
			description: description
		  }
		})
			.then(function(response) {
				dispatch(addGoal(response.data));	
			})
			.catch(function(response){
				dispatch(receiveError(response.data));
				dispatch(pushState(null,'/error'));
			})
		
	}
};

// add Goal
function addGoal(json){
	return{
		type: 'ADD_GOAL',
		json
	}
}

export function removeGoal(url, id, index) {
	return function(dispatch) {
		
		axios({
			method: 'delete',
			url: url + '/' + id,
			data: null,
			withCredentials: true,
			params: {
			}
		})
		dispatch(deleteGoal(id, index));	
	}
};

// delete Goal
function deleteGoal(id, index){
	return{
		type: 'DELETE_GOAL',
		id,
		index
	}
}

export function successesGoal(url, id, index) {
	return function(dispatch) {
		
		axios({
			method: 'put',
			url: url + '/data/' + id,
			json: true,
			data: null,
		  /*data: {
			updatedAt: new Date(),
		  },*/
			withCredentials: true,
			params: {
				
			}
		})
			.then(function(response) {
				dispatch(successGoal(id, index, response.data));
			})
			.catch(function(response){
				dispatch(receiveError(response.data));
				dispatch(pushState(null,'/error'));
			})
	}
};

// successes
function successGoal(id, index, json){
	return{
		type: 'SUCCESS_GOAL',
		id,
		index,
		json
	}
}

export function failuresGoal(url, id, index) {
	return function(dispatch) {
		
		axios({
			method: 'put',
			url: url + '/failures/' + id,
			data: null,
			withCredentials: true,
			params: {
			}
		})
			.then(function(response) {
				dispatch(failedGoal(id, index, response.data));
			})
			.catch(function(response){
				dispatch(receiveError(response.data));
				dispatch(pushState(null,'/error'));
			})
	}
};

// failures
function failedGoal(id, index, json){
	return{
		type: 'FAILED_GOAL',
		id,
		index,
		json
	}
}


// increment
export function increment(index){
	return{
		type: 'INCREMENT_LIKES',
		index
	}
}

// add comment
export function addComment(postId, author, comment){
	return{
		type: 'ADD_COMMENT',
		postId,
		author,
		comment
	}
}

// remove comment

export function removeComment(postId, i){
	return{
		type: 'REMOVE_COMMENT',	
		i,
		postId
		}
}