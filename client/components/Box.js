import React from 'react';
const url = 'http://localhost:8080/api/goals';

class Box extends React.Component {
	constructor(props){
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleSuccesses = this.handleSuccesses.bind(this);
		this.handleFailures = this.handleFailures.bind(this);
		var uid = this.props.emp._links.self.href.slice(0, 100).split('goals/');
		this.id = uid[1];		
	}
   
	handleDelete(e){
		
		e.preventDefault();
		this.props.removeGoal(url, this.id, this.props.i);
	}
	
	handleSuccesses(e){
		
		e.preventDefault();
		this.props.successesGoal(url, this.id, this.props.i);
	}
	
	handleFailures(e){
		
		e.preventDefault();
		this.props.failuresGoal(url, this.id, this.props.i);
	}
	
	
	render() {
		var emp = this.props.emp;
		var d = emp.createdAt.slice(0, 10).split('-');   
        var formatDate = d[1] +'/'+ d[2] +'/'+ d[0]; // 10/30/2010

		return (
<ul className="goals-list content-grid mdl-grid">

  <li id="1" className="mdl-card mdl-shadow--2dp">

   
    <div className="mdl-card__title mdl-color--light-blue-700 mdl-color-text--white">
      <h2>
        <div className="mdl-card__title-text">{emp.description}</div>
        <div className="mdl-card__subtitle-text"><span className="successes">{emp.successes.length}</span> successes, <span  className="failures">{emp.failures.length}</span> failures</div>
      </h2>
    </div>
    <div className="mdl-layout-spacer"></div>

   
    <div className="mdl-card__supporting-text">
      Since {formatDate}		 
			
    </div>

   
    <div className="mdl-card__actions mdl-card--border">
      <button className="mdl-button mdl-js-button mdl-button--primary success" onClick={this.handleSuccesses}><i className="material-icons">trending_up</i></button>
      <button className="mdl-button mdl-js-button mdl-button--primary failure" onClick={this.handleFailures}><i className="material-icons">trending_down</i></button>
      <div className="mdl-layout-spacer"></div>
	  <button className="mdl-button mdl-js-button mdl-button--colored" onClick={this.handleDelete}><i className="material-icons">delete</i></button>
    </div>

  </li>
 
</ul>
		)
	}
};

export default Box;