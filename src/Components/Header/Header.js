import React from 'react';

import HeaderModes from './HeaderModes';
import HeaderProjects from './HeaderProjects';
import './Header.css';

function Header({ reloadDataTable }) {
  return (
    <div className="header-modes-projects">
      <HeaderModes reloadDataTable={reloadDataTable} />
      <HeaderProjects class="divProjectList" />
    </div>
  );
}

export default React.memo(Header);
