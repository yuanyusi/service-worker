import React from 'react';
import Goal from './Goal';
import Box from './Box';
import {connect} from 'react-redux';


connect(state => ({data: state.example.data}))
class xGoals extends React.Component {
	constructor(props){
		super(props);
		console.log('Emp enter');
	}
	
	render(){
		return (
		

			<div className='container>
				<table className='table table-bordered table-striped'>
					<thead>
						<tr>
							<th>Description</th>
							<th>First Name</th>
							<th>Last Name</th>
						</tr>
					</thead>
					<tbody>
						{this.props.example.data.map((emp, i) => 
						<Goal {... this.props} key={i} i={i} emp={emp} />)
						}
					</tbody>
				</table>
			</div>
		);
	}
};

export default xGoals;