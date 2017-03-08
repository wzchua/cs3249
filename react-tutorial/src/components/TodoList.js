import React from 'react';

//Component : Title 
//Prop : todoCount
const Title = React.createClass({	
	render: function() {
		  return (
			<div>
			   <div>
				  <h1>to-do ({this.props.todoCount})</h1>
			   </div>
			</div>
		 );
	}
});

//Component: TodoForm
//Prop : addTodo
const TodoForm = React.createClass({
	render: function() {
		let input;
		return (
			    <form onSubmit={(e) => {
					e.preventDefault();
					this.props.addTodo(input.value);
					input.value = '';
				}}>
					<input  ref={node => {input = node;}}/>
					<br />
				</form>
		);
	}
});

const Todo =  React.createClass({
	render: function() {
		 return (
			<li>
				<input type="checkbox" defaultChecked={this.props.todo.isDone} onChange={(e)=>{
					//toggles todo's isDone attibute
					this.props.check(this.props.todo.key, !this.props.todo.isDone);}}/>
				<a href="#" className="list-group-item" onClick={() => {this.props.remove(this.props.todo.key)}}>ID :{this.props.todo.key} / Text : {this.props.todo.text}</a>
			</li>
		);
	}
});

const TodoList = React.createClass({
	render: function() {
		// Map through the todos
		const todoNode = this.props.todos.map((todo) => {
			return (<Todo todo={todo} key={todo.key} remove={this.props.remove} check={this.props.check} />);
		});
		//each button sets a specific filter type
		return (
			<div>
			<button onClick={()=>this.props.setFilter(0)}>All</button>
			<button onClick={()=>this.props.setFilter(1)}>Completed</button>
			<button onClick={()=>this.props.setFilter(2)}>Uncompleted</button>
			<div className="list-group" style={{marginTop:'30px'}}>{todoNode}</div>
			</div>
		);
  }
}); 

// Container Component
// Todo Id
window.id = 0;
// Temporary array for local DB
var todos = new Array();

class TodoApp extends React.Component{
	constructor(props){
		// Pass props to parent class
		super(props);
		// Set initial state
		this.state = {
			data: [],
			filterType: 0 //store the type of filtering as a state
		}
	}
	
	// Lifecycle method
	// When the component is mounted, this method will be called automatically
	// Please have a look at the site as below
	// https://facebook.github.io/react/docs/react-component.html#componentdidmount
	componentDidMount(){
		// Make HTTP reques with Axios
		// Set state with result
		this.setState({data:todos});
	}
	
	// Add todo handler
	addTodo(val){
		// Assemble data
		const todo = {
								text : val,
								key : (new Date()).getTime(),
								isDone: false //unchecked in the checkbox by default
							  }
		// Update data
		todos.push(todo);
		// Set the state value by using the local DB array
		this.setState({data: todos});
	}
  
	// Handle remove
	handleRemove(key){
		// Filter all todos except the one to be removed
		const remainder = this.state.data.filter((todo) => {
			if(todo.key !== key) return todo;
		});
	
		// Replace the local DB array with new DB array excluding the removed item
		todos = remainder;
		// Update state with filter
		this.setState({data: todos});
	}

	//update a state when an item is checked or unchecked
	check(key, isDone) {
		//recreate the list with a filter that only updates the isDone attribute of the selected key
		const newState =  this.state.data.filter((todo)=>{
			if(todo.key === key) {
				todo.isDone = isDone;
			}
			return todo;
		})
		todos = newState; //update DB
		this.setState({data: todos}); //update state
	}

	//update filtering state
	setFilter(type) {
		this.setState({filterType: type});
	}

	//filters todo input list depending on the filterType state. Does not modify state
	filter(stateData) {
		//0: All, 1: Completed, 2: Uncompleted
		const view = stateData.filter((todo)=>{
			if(this.state.filterType == 0) {
				return todo;
			} else if(this.state.filterType == 1 && todo.isDone) {
				return todo;
			} else if(this.state.filterType == 2 && !todo.isDone) {
				return todo;
			}
		});
		//return a filtered list
		return view;
	}
 
	render(){
		// Render JSX
		return (
		<div>
			<Title
				//passing state date to a child as props
				todoCount={this.state.data.length}
			/>
			<TodoForm
				//passing state date to a child as props
				addTodo={this.addTodo.bind(this)}
			/>
			<TodoList 
				//passing state date to a child as props
				todos={this.filter(this.state.data)} //pass a filtered list
				check={this.check.bind(this)}
				setFilter={this.setFilter.bind(this)}
				remove={this.handleRemove.bind(this)}
			/>
		</div>
    );
  }
}

export default TodoApp;