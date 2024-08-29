import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Homepage from './homepage';
import Dashboard from '../dashboard/dashboard-main';
import SingleView from '../single-view/single-view-main';


function Main() {

  return (

    <React.Fragment>
      <Routes>
        <Route path="/" exact element={<Homepage />} />
        <Route path="/dashboard" exact element={<Dashboard />} />
        <Route path="/singleview" exact element={<SingleView />} />
      </Routes>
    </React.Fragment>

  );
}

export default Main;