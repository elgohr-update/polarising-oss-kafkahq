import React from 'react';
import './App.scss';
import Dashboard from './containers/Dashboard/Dashboard';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import Login from './containers/Login/Login';
import Topic from './containers/Tab/Tabs/TopicList/Topic/Topic';
import NodesList from './containers/NodesList';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/nodes" component={NodesList} />
        <Route path="/:clusterId/:tab" exact component={Dashboard} />
        <Route path="/:clusterId/:tab/:action" exact component={Dashboard} />
        <Redirect from="/:clusterId" exact to="/:clusterId/topic" />
        <Redirect from="/" exact to="/my-cluster/topic" />
      </Switch>
    </Router>
  );
}

export default App;