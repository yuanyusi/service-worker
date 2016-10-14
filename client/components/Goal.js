import React from 'react';

class Goal extends React.Component {
	constructor(props){
		super(props);
	}

	render() {
		const {emp} = this.props;

		return (
			<tr>
				<td>{emp.description}</td>
				<td>{emp.firstName}</td>
				<td>{emp.lastName}</td>
			</tr>
		)
	}
};

export default Goal;