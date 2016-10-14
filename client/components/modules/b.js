import React from 'react';
import { Link } from 'react-router';

export default React.createClass({
  render() {
    return (
    	<div>
    		<div className="col-xs-3">
    			<div>
					<h2 className="text-info"> React JS </h2>
					<p>
						React is a JavaScript library for creating user interfaces by Facebook and Instagram. Many people choose to think of React as the V in MVC.
					</p>
				</div>
				<div>
					<h2 className="text-info"> JSX </h2>
					<p>
						React components are typically written in JSX, a JavaScript extension syntax allowing quoting of HTML and using HTML tag syntax to render subcomponents.[11] HTML syntax is processed into JavaScript calls of the React library. Developers may also write in pure JavaScript. JSX is similar to another extension syntax created by Facebook for PHP, XHP.
					</p>
				</div>
			</div>
    		<div className="col-xs-3">
				<div>
					<h2 className="text-info"> ES5 </h2>
					<p>
						ECMAScript 2015 is an ECMAScript standard that was ratified in June 2015.
						ES2015 is a significant update to the language, and the first major update to the language since ES5 was standardized in 2009. Implementation of these features in major JavaScript engines is underway now..
					</p>
				</div>
				<div>
					<h2 className="text-info"> Babel </h2>
					<p>
						Babel lets us write code that uses new ES6 features, and then transpiles that code into standard ES5 code that can run in older JavaScript environments.
					</p>
				</div>
			</div>
    		<div className="col-xs-3">
				<div>
					<h2 className="text-info"> Webpack </h2>
					<p>
						Webpack is a module bundler that takes assets such as CSS, images or JavaScript files with lots of dependencies and turns them into something that you can provide to a client web page. It uses loaders that you specify in your configuration file to know how to transpile these assets.
					</p>
				</div>
			</div>
    	</div>
    )
  }
})