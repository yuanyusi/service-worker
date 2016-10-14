'use strict';

const React = require('react');
const when = require('../node_modules/rest/node_modules/when'); 
const client = require('../client');
const follow = require('../follow'); // function to hop multiple links by "rel"
const stompClient = require('../websocket-listener');

const root = '/SboxApp/api';

var ReactBootstrap = require('react-bootstrap');
var ModalTrigger = ReactBootstrap.ModalTrigger;
var Button = ReactBootstrap.Button;
//var Modal = ReactBootstrap.Modal;

import {Modal}  from 'react-bootstrap';
import {ModalBody} from 'react-bootstrap/lib/ModalBody';
import {ModalHeader} from 'react-bootstrap/lib/ModalHeader';

class EmployeeApp extends React.Component {

	constructor(props) {
		super(props);
		this.state = {employees: [], attributes: [], page: 1, pageSize: 2, links: {}};
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
		this.refreshCurrentPage = this.refreshCurrentPage.bind(this);
		this.refreshAndGoToLastPage = this.refreshAndGoToLastPage.bind(this);
	}

	loadFromServer(pageSize) {
		follow(client, root, [
				{rel: 'employees', params: {size: pageSize}}]
		).then(employeeCollection => {
			return client({
				method: 'GET',
				path: employeeCollection.entity._links.profile.href,
				headers: {'Accept': 'application/schema+json'}
			}).then(schema => {
				// tag::json-schema-filter[]
				/**
				 * Filter unneeded JSON Schema properties, like uri references and
				 * subtypes ($ref).
				 */
				Object.keys(schema.entity.properties).forEach(function (property) {
					if (schema.entity.properties[property].hasOwnProperty('format') &&
						schema.entity.properties[property].format === 'uri') {
						delete schema.entity.properties[property];
					}
					if (schema.entity.properties[property].hasOwnProperty('$ref')) {
						delete schema.entity.properties[property];
					}
				});

				this.schema = schema.entity;
				this.links = employeeCollection.entity._links;
				return employeeCollection;
				// end::json-schema-filter[]
			});
		}).then(employeeCollection => {
			this.page = employeeCollection.entity.page;
			return employeeCollection.entity._embedded.employees.map(employee =>
					client({
						method: 'GET',
						path: employee._links.self.href
					})
			);
		}).then(employeePromises => {
			return when.all(employeePromises);
		}).done(employees => {
			this.setState({
				page: this.page,
				employees: employees,
				attributes: Object.keys(this.schema.properties),
				pageSize: pageSize,
				links: this.links
			});
		});
	}

	// tag::on-create[]
	onCreate(newEmployee) {
		follow(client, root, ['employees']).done(response => {
			client({
				method: 'POST',
				path: response.entity._links.self.href,
				entity: newEmployee,
				headers: {'Content-Type': 'application/json'}
			})
		})
	}
	// end::on-create[]

	// tag::on-update[]
	onUpdate(employee, updatedEmployee) {
		client({
			method: 'PUT',
			path: employee.entity._links.self.href,
			entity: updatedEmployee,
			headers: {
				'Content-Type': 'application/json',
				'If-Match': employee.headers.Etag
			}
		}).done(response => {
			/* Let the websocket handler update the state */
		}, response => {
			if (response.status.code === 403) {
				alert('ACCESS DENIED: You are not authorized to update ' +
					employee.entity._links.self.href);
			}
			if (response.status.code === 412) {
				alert('DENIED: Unable to update ' + employee.entity._links.self.href +
					'. Your copy is stale.');
			}
		});
	}
	// end::on-update[]

	// tag::on-delete[]
	onDelete(employee) {
		client({method: 'DELETE', path: employee.entity._links.self.href}
		).done(response => {/* let the websocket handle updating the UI */},
		response => {
			if (response.status.code === 403) {
				alert('ACCESS DENIED: You are not authorized to delete ' +
					employee.entity._links.self.href);
			}
		});
	}
	// end::on-delete[]

	onNavigate(navUri) {
		client({
			method: 'GET',
			path: navUri
		}).then(employeeCollection => {
			this.links = employeeCollection.entity._links;
			this.page = employeeCollection.entity.page;

			return employeeCollection.entity._embedded.employees.map(employee =>
					client({
						method: 'GET',
						path: employee._links.self.href
					})
			);
		}).then(employeePromises => {
			return when.all(employeePromises);
		}).done(employees => {
			this.setState({
				page: this.page,
				employees: employees,
				attributes: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
			});
		});
	}

	updatePageSize(pageSize) {
		if (pageSize !== this.state.pageSize) {
			this.loadFromServer(pageSize);
		}
	}

	// tag::websocket-handlers[]
	refreshAndGoToLastPage(message) {
		follow(client, root, [{
			rel: 'employees',
			params: {size: this.state.pageSize}
		}]).done(response => {
			if (response.entity._links.last !== undefined) {
				this.onNavigate(response.entity._links.last.href);
			} else {
				this.onNavigate(response.entity._links.self.href);
			}
		})
	}

	refreshCurrentPage(message) {
		follow(client, root, [{
			rel: 'employees',
			params: {
				size: this.state.pageSize,
				page: this.state.page.number
			}
		}]).then(employeeCollection => {
			this.links = employeeCollection.entity._links;
			this.page = employeeCollection.entity.page;

			return employeeCollection.entity._embedded.employees.map(employee => {
				return client({
					method: 'GET',
					path: employee._links.self.href
				})
			});
		}).then(employeePromises => {
			return when.all(employeePromises);
		}).then(employees => {
			this.setState({
				page: this.page,
				employees: employees,
				attributes: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
			});
		});
	}
	// end::websocket-handlers[]

	// tag::register-handlers[]
	componentDidMount() {
		this.loadFromServer(this.state.pageSize);
		stompClient.register([
			{route: '/topic/newEmployee', callback: this.refreshAndGoToLastPage},
			{route: '/topic/updateEmployee', callback: this.refreshCurrentPage},
			{route: '/topic/deleteEmployee', callback: this.refreshCurrentPage}
		]);
	}
	// end::register-handlers[]

	render() {
		return (
			<div>
			<EmployeeList page={this.state.page}
							  employees={this.state.employees}
							  links={this.state.links}
							  pageSize={this.state.pageSize}
							  attributes={this.state.attributes}
							  onNavigate={this.onNavigate}
							  onUpdate={this.onUpdate}
							  onCreate={this.onCreate}
							  onDelete={this.onDelete}
							  updatePageSize={this.updatePageSize}/>
			</div>
		)
	}
}

class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {showModal: false};
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var newEmployee = {};
		this.props.attributes.forEach(attribute => {
			newEmployee[attribute] = React.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onCreate(newEmployee);
		this.props.attributes.forEach(attribute => {
			React.findDOMNode(this.refs[attribute]).value = ''; // clear out the dialog's inputs
		});
		window.location = "#";
		 this.props.onRequestHide()
	}
	render() {
		var inputs = this.props.attributes.map(attribute =>
		<p key={attribute}>
			<input type="text" placeholder={attribute} ref={attribute} className="field" />
		</p>
		);
		return (
				<div>
		        <Modal {...this.props} title='Create new employee'>
		        <form>
		          <div className='modal-body'>					
						{inputs}
					
		           </div>
		          <div className='modal-footer'>
		            <Button onClick={this.handleSubmit}>Create</Button>
		            <Button onClick={this.props.onRequestHide}>Close</Button>
		          </div>
		          </form>
		        </Modal>
	
			</div>
		)	 
	}
}

class UpdateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var updatedEmployee = {};
		this.props.attributes.forEach(attribute => {
			updatedEmployee[attribute] = React.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onUpdate(this.props.employee, updatedEmployee);
		window.location = "#";
	}

	render() {
		var inputs = this.props.attributes.map(attribute =>
				<p key={this.props.employee.entity[attribute]}>
					<input type="text" placeholder={attribute}
						   defaultValue={this.props.employee.entity[attribute]}
						   ref={attribute} className="field" />
				</p>
		);

		var dialogId = "updateEmployee-" + this.props.employee.entity._links.self.href;

		return (
			<div>
				<a href={"#" + dialogId} className="btn btn-info">Update</a>

				<div id={dialogId} className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Update an employee</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Update</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

}

class EmployeeList extends React.Component {

	constructor(props) {
		debugger;
		super(props);
		this.handleNavFirst = this.handleNavFirst.bind(this);
		this.handleNavPrev = this.handleNavPrev.bind(this);
		this.handleNavNext = this.handleNavNext.bind(this);
		this.handleNavLast = this.handleNavLast.bind(this);
		this.handleInput = this.handleInput.bind(this);
	}

	handleInput(e) {
		e.preventDefault();
		var pageSize = React.findDOMNode(this.refs.pageSize).value;
		if (/^[0-9]+$/.test(pageSize)) {
			this.props.updatePageSize(pageSize);
		} else {
			React.findDOMNode(this.refs.pageSize).value = pageSize.substring(0, pageSize.length - 1);
		}
	}

	handleNavFirst(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.first.href);
	}

	handleNavPrev(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.prev.href);
	}

	handleNavNext(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.next.href);
	}

	handleNavLast(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.last.href);
	}

	render() {
		var overlayTriggerInstance = (
				  <ModalTrigger modal={<CreateDialog attributes={this.props.attributes} onCreate={this.props.onCreate} />}>
				    <Button bsStyle='primary' bsSize='small'>Create</Button>
				  </ModalTrigger>
				);
		
		//<ModalExample />
		
		var pageInfo = this.props.page.hasOwnProperty("number") ?
			<h3>Employees - Page {this.props.page.number + 1} of {this.props.page.totalPages}</h3> : null;

		var employees = this.props.employees.map(employee =>
			<Employee key={employee.entity._links.self.href}
					  employee={employee}
					  attributes={this.props.attributes}
					  onUpdate={this.props.onUpdate}
					  onDelete={this.props.onDelete}/>
		);

		var navLinks = [];
		if ("first" in this.props.links) {
			navLinks.push(<button key="first" onClick={this.handleNavFirst} className="btn">&lt;&lt;</button>);
		}
		if ("prev" in this.props.links) {
			navLinks.push(<button key="prev" onClick={this.handleNavPrev} className="btn">&lt;</button>);
		}
		if ("next" in this.props.links) {
			navLinks.push(<button key="next" onClick={this.handleNavNext} className="btn">&gt;</button>);
		}
		if ("last" in this.props.links) {
			navLinks.push(<button key="last" onClick={this.handleNavLast} className="btn">&gt;&gt;</button>);
		}
		
		return (
			<div>
				{pageInfo}
				<input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
				{navLinks}
				{overlayTriggerInstance}
				<table className="table table-striped table-bordered table-condensed table-responsive table-hover">
				<thead>
					<tr>
						<th>First Name</th>
						<th>Last Name</th>
						<th>Description</th>
						<th>Manager</th>
						<th></th>
						<th></th>
					</tr>
					</thead>
					<tbody>
					{employees}
					</tbody>
				</table>
			</div>
		)
	}
}

// tag::employee[]
class Employee extends React.Component {

	constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete() {
		this.props.onDelete(this.props.employee);
	}

	render() {
		return (
			<tr>
				<td>{this.props.employee.entity.firstName}</td>
				<td>{this.props.employee.entity.lastName}</td>
				<td>{this.props.employee.entity.description}</td>
				<td>{this.props.employee.entity.manager.name}</td>
				<td>
					<UpdateDialog employee={this.props.employee}
								  attributes={this.props.attributes}
								  onUpdate={this.props.onUpdate}/>
				</td>
				<td>
					<button onClick={this.handleDelete} className="btn btn-warning">Delete</button>
				</td>
			</tr>
		)
	}
}
// end::employee[]

//var Modalx = require('react-bootstrap-modal')


class ModalExample extends React.Component {
	constructor(props) {
		super(props);
		this.state = {open:false};
		this.closeModal = this.closeModal.bind(this);
		this.saveAndClose = this.saveAndClose.bind(this);
	}

    closeModal(){ 
    	this.setState({ open: false });
    }
    
    saveAndClose(){
      //api.saveData()
        //.then(() => this.setState({ open: false }))
    	this.setState({open: false });
        
}
  render(){
    return (
      <div>
        <Button
        bsStyle="primary"
        bsSize="small"
        onClick={() => this.setState({ open: true})}
      >
        Launch contained modal
      </Button>
        <Modal 
          show={this.state.open} 
          onHide={this.closeModal}
          aria-labelledby="ModalHeader"
        //	  className='modalClass'
        >
          <Modal.Header closeButton>
            //<Modal.Title id='ModalHeader'>A Title Goes here</Modal.Title>
          </Modal.Header>
          <ModalBody>
            <p>Some Content here</p>
          </ModalBody>
         // <Modal.Footer>
            // If you don't have anything fancy to do you can use  
            // the convenient `Dismiss` component, it will  
            // trigger `onHide` when clicked 
         //   <Modal.Dismiss className='btn btn-default'>Cancel</Modal.Dismiss>
 
            // Or you can create your own dismiss buttons 
        //    <Button className='btn btn-primary' onClick={this.saveAndClose}>
        //      Save
        //    </Button>
        //  </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

//export default EmployeeApp;