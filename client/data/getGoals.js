import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import { fetchData} from "../actions"
class GetGoals extends Component {

constructor (props) {
    super(props);
    this.props.dispatch ( fetchData () );
}

render () {
    return (
        <OutputStuffHere data={this.props.users} />
    );
}
};


export default connect( (state) => {
return {
    users: state.users
}
})(GetGoals);