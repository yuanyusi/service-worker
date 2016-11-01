import * as types from './actionTypes';
import axios from 'axios';
import { pushState } from 'redux-react-router';

const date = (new Date()).toLocaleDateString().replace(/\//g, "-");

function requestData() {
	return {type: types.REQ_DATA}
};

function receiveData(json) {
	return{
		type: types.RECV_DATA,
		data: json
	}
};

function receiveCachedData(json) {
	return{
		type: 'RECV_CACHE_DATA',
		data: json
	}
};

function receiveError(json) {
	return {
		type: types.RECV_ERROR,
		data: json
	}
};

export function _httpGetWrapper(url){
	return function(dispatch) {
		caches.match(url).then(function(response){
		  if(response){
			return response.json();
		  }
		}).then(function(data){
		  console.log('#### Cache Success');
		  if (data)
		  dispatch(receiveCachedData(data._embedded.goals));
		  //updated DOM with success callback
		});
	 
	  fetch(url).then(function(response){
		console.log('#### Network Success');
		dispatch(fetchData(url));
		//updated DOM with success callback
	  })
		.catch(function(response){
			console.log('#### Network Error');
		});
	}
}

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
		if (window.networkstatus){
			axios({
			  method: 'post',
			  url: url,
			  json: true,
			  data: {
				description: description,
				createdAt: new Date()
			  }
			})
			.then(function(response) {
				response.data.createdAt = new Date(response.data.createdAt).toLocaleDateString();
				dispatch(addGoal(response.data));	
			})
			.catch(function(response){
				dispatch(receiveError(response.data));
				dispatch(pushState(null,'/error'));
			})		
		}
		else{	
			var data = {
				_links: "goal" + Math.floor((Math.random() * 100) + 1), 
				createdAt: date,
				description: description, 
				failures: new Array(), 
				successes: new Array(), 
				updatedAt:""
			};
			
			if (typeof localStorage.getItem("goals") !== 'undefined' && localStorage.getItem("goals") !== null){
				var object = JSON.parse(localStorage.getItem("goals"));
				object.goals.push(data);
				window.localStorage.setItem("goals", JSON.stringify(object));
			}
			else {
				var newObject = {"goals":[]};
				newObject.goals.push(data);
				window.localStorage.setItem("goals", JSON.stringify(newObject));	
			}
				
			dispatch(addGoal(data));	
		}
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
		if (window.networkstatus){
			axios({
				method: 'delete',
				url: url + '/' + id,
				data: null,
				withCredentials: true,
				params: {
				}
			})
		}
		else {
			if (id.search(/goal/) == -1) {
				if (typeof localStorage.getItem("deleteGoals") !== 'undefined' && localStorage.getItem("deleteGoals") !== null){
					var ids = localStorage.getItem("deleteGoals").split(',');
					ids.push(id);
					window.localStorage.setItem("deleteGoals", ids);
				}
				else window.localStorage.setItem("deleteGoals", id);				
				
				if (typeof localStorage.getItem("updatedGoals") !== 'undefined' && localStorage.getItem("updatedGoals") !== null){
					var ids = localStorage.getItem("updatedGoals").split(',');
				    for(var i = ids.length; i--;) {
					    if(ids[i] === id) {
					  	  ids.splice(i, 1);
						  break;
					    }
				    }
					if (ids.length !== 0)
						window.localStorage.setItem("updatedGoals", ids)
					else localStorage.removeItem("updatedGoals");
				}				
			}
			else {				
				if (typeof localStorage.getItem("deleteOfflineGoals") !== 'undefined' && localStorage.getItem("deleteOfflineGoals") !== null){
					var offlineId = localStorage.getItem("deleteOfflineGoals").split(',');
					offlineId.push(id);
					window.localStorage.setItem("deleteOfflineGoals", offlineId)
				}
				else window.localStorage.setItem("deleteOfflineGoals", id);
				
				if (typeof localStorage.getItem("updatedOfflineGoals") !== 'undefined' && localStorage.getItem("updatedOfflineGoals") !== null){
					var ids = localStorage.getItem("updatedOfflineGoals").split(',');
				    for(var i = ids.length; i--;) {
					    if(ids[i] === id) {
					  	  ids.splice(i, 1);
						  break;
					    }
				    }
					if (ids.length !== 0)
						window.localStorage.setItem("updatedOfflineGoals", ids)
					else localStorage.removeItem("updatedGoals");
				}	
			}
			localStorage.removeItem(id);
		}			
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

export function successesGoal(url, id, index, emp) {
	return function(dispatch) {
		if (window.networkstatus){
			axios({
				method: 'put',
				url: url + '/data/' + id,
				json: true,
				data: null,
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
		else{
			
			if (id.search(/goal/) == -1) {
				if (typeof localStorage.getItem("updatedGoals") !== 'undefined' && localStorage.getItem("updatedGoals") !== null){
					if (localStorage.getItem("updatedGoals").search(id) == -1){
						var ids = localStorage.getItem("updatedGoals").split(',');
						ids.push(id);
						window.localStorage.setItem("updatedGoals", ids)
					}
				}
				else window.localStorage.setItem("updatedGoals", id);
			}
			else {				
				if (typeof localStorage.getItem("updatedOfflineGoals") !== 'undefined' && localStorage.getItem("updatedOfflineGoals") !== null){
					if (localStorage.getItem("updatedOfflineGoals").search(id) == -1){
						var offlineId = localStorage.getItem("updatedOfflineGoals").split(',');
						offlineId.push(id);
						window.localStorage.setItem("updatedOfflineGoals", offlineId)
					}
				}
				else window.localStorage.setItem("updatedOfflineGoals", id);
			}
			
			emp.successes.push(new Date());
			window.localStorage.setItem(id, JSON.stringify(emp));	
			dispatch(updateOffline(id, index, emp));
		}

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

function updateOffline(id, index, json){
	return{
		type: 'UPDATE_GOAL_OFFLINE',
		id,
		index,
		json
	}
}

export function failuresGoal(url, id, index, emp) {
	return function(dispatch) {
		if (window.networkstatus){
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
		else{
			if (id.search(/goal/) == -1) {
				if (typeof localStorage.getItem("updatedGoals") !== 'undefined' && localStorage.getItem("updatedGoals") !== null){
					if (localStorage.getItem("updatedGoals").search(id) == -1){
						var ids = localStorage.getItem("updatedGoals").split(',');
						ids.push(id);
						window.localStorage.setItem("updatedGoals", ids)
					}
				}
				else window.localStorage.setItem("updatedGoals", id);
			}
			else {				
				if (typeof localStorage.getItem("updatedOfflineGoals") !== 'undefined' && localStorage.getItem("updatedOfflineGoals") !== null){
					if (localStorage.getItem("updatedOfflineGoals").search(id) == -1){
						var offlineId = localStorage.getItem("updatedOfflineGoals").split(',');
						offlineId.push(id);
						window.localStorage.setItem("updatedOfflineGoals", offlineId)
					}
				}
				else window.localStorage.setItem("updatedOfflineGoals", id);
			}	
			emp.failures.push(new Date());
			window.localStorage.setItem(id, JSON.stringify(emp));	
			dispatch(updateOffline(id, index, emp));
		}
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