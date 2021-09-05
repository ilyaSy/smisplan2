import React from 'react';

import HeaderModes from './HeaderModes';
import HeaderProjects from './HeaderProjects';
import './Header.css';

function Header({ dataTable, projectList, reloadDataTable }) {
  return (
    <div className="header-modes-projects">
      <HeaderModes reloadDataTable={reloadDataTable} />
      <HeaderProjects className="divProjectList" dataTable={dataTable} projectList={projectList} />
    </div>
  );
}

export default React.memo(Header);
