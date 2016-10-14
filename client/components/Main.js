import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import NavLink from './modules/navLink'

connect(state => ({example: state.example.data }))

class Main extends React.Component {
	render(){
		return (
			<div>
				<h1> 
					<Link to="/"> Reduxstagram </Link>
				</h1>
				<nav className="navbar navbar-default">
				  <div className="container-fluid">
				    <div className="navbar-header">
				    	<ul className="nav navbar-nav navbar-right">
				    		<li><NavLink to="/goals">Goals</NavLink></li>
				    		<li><NavLink to="/photoGrid">PhotoGrid</NavLink></li>
							<li><NavLink to="/targets">Targets</NavLink></li>
				    	</ul>
				    </div>
				   </div>
				</nav>

				<div>
				{React.cloneElement(this.props.children, this.props)}
				</div>
			</div>
		);
	}
};

export default Main;