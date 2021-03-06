import React from 'react';
import { Menu, MenuItem, ListItemIcon, Typography, Divider } from '@material-ui/core';
import ArrowLeft from '@material-ui/icons/ArrowLeft';

import CustomIcon from '../../../SharedComponents/CustomIcon';
import PopupEdit from '../../Popup/PopupEdit/PopupEdit';
import PopupConfirm from '../../Popup/PopupConfirm/PopupConfirm';
import PopupAddLinkedInfo from '../../Popup/PopupAddLinkedInfo/PopupAddLinkedInfo';
import './TblActionMenu.css';

function TblActionMenu(props) {
  const [opened, setOpened] = React.useState(false);
  const [menuEl, setMenuEl] = React.useState(null);
  const [menuElSub, setMenuElSub] = React.useState(null);
  const [menuList, setMenuList] = React.useState([]);
  const [isPopupConfirmOpened, setIsPopupConfirmOpened] = React.useState(false);
  const [isPopupEditOpened, setIsPopupEditOpened] = React.useState(false);
  const [isPopupLinkedOpened, setIsPopupLinkedOpened] = React.useState({});

  const _menuElSub = React.useRef(null);

  // need for correct work of sub menu
  const showBasicElement = () => {
    menuEl.parentElement.style.display = 'flex';
  };
  const hideBasicElement = () => {
    menuEl.parentElement.style.display = '';
    setOpened(false);
  };

  const handleClick = (event) => {
    props.onBeforeClick();

    setIsPopupLinkedOpened({});
    if (isPopupConfirmOpened) setIsPopupConfirmOpened(false);
    if (isPopupEditOpened) setIsPopupEditOpened(false);

    setMenuEl(event.currentTarget);
    setOpened(true);
    setMenuList(props.list);
  };

  const handleClickSub = (event) => {
    showBasicElement();
    setMenuElSub(event.currentTarget);
    _menuElSub.current.style.marginLeft = -1 * `${_menuElSub.current.children[1].offsetWidth + 5}px`;
  };

  const action = (item, args) => {
    setOpened(false);
    item.action(...args);
  };

  const handleOpenPopupEdit = () => setIsPopupEditOpened(true);

  const handleOpenPopupLinked = (type) => setIsPopupLinkedOpened({ [type]: true });

  const handleOpenPopupConfirm = () => setIsPopupConfirmOpened(true);

  const handleClosePopups = (event) => {
    setIsPopupLinkedOpened({});
    setIsPopupConfirmOpened(false);
    setIsPopupEditOpened(false);
    setMenuEl(null);
    setOpened(false);
    if (event) event.stopPropagation();
  };

  const closeEl = () => {
    hideBasicElement();
    setMenuEl(null);
  };

  const closeElSub = () => setMenuElSub(null);

  const handleClickItem = (item, id) => () => {
    setMenuEl(null);
    if (item.id === 'tasks_edit') {
      handleOpenPopupEdit();
    } else if (item.id === 'tasks_delete') {
      handleOpenPopupConfirm();
    } else if (item.id === 'discussion') {
      handleOpenPopupLinked(item.id);
    } else if (item.id === 'question') {
      handleOpenPopupLinked(item.id);
    } else {
      item.action(id);
    }
  };

  return (
    <>
      <CustomIcon class="icn_moreH" tip="???????? ????????????????" action={handleClick} />

      {opened && (
        <Menu
          keepMounted
          anchorEl={menuEl}
          open={!!menuEl}
          onClose={closeEl}
          className="tbl-action-menu"
        >
          {menuList.map((item, index) => (
            <div key={`${index}`}>
              {item.id === 'divider' && <Divider key={`menu-divider-${index}`} />}

              {item.id !== 'divider' && !item.isListOfItems && (
                <MenuItem key={`menu-${item.id}-menuItem`} onClick={handleClickItem(item, props.id)}>
                  <ListItemIcon>
                    {item.id === 'tasks_edit' && (
                      <>
                        <CustomIcon class={`icn_${item.id}`} tip="??????????????????????????" />
                        <PopupEdit
                          isOpened={isPopupEditOpened}
                          onClose={handleClosePopups}
                          id={props.id}
                          action={(...args) => action(item, args)}
                          actionNew={item.actionNew}
                          task={props.task}
                        />
                      </>
                    )}
                    {['discussion', 'question'].includes(item.id) && (
                      <>
                        <CustomIcon class={`icn_${item.id}`} tip={item.value} type="material-ui" />
                        <PopupAddLinkedInfo
                          isOpened={isPopupLinkedOpened[item.id] || false}
                          onClose={handleClosePopups}
                          id={props.id}
                          action={item.action}
                          type={item.type}
                        />
                      </>
                    )}
                    {item.id === 'tasks_delete' && (
                      <>
                        <CustomIcon class={`icn_${item.id}`} tip={item.actionName} />
                        <PopupConfirm
                          isOpened={isPopupConfirmOpened}
                          onClose={handleClosePopups}
                          id={props.id}
                          action={item.action}
                          actionText={`????????: ${props.task?.value}`}
                        />
                      </>
                    )}
                    {!['tasks_edit', 'tasks_delete', 'discussion', 'question'].includes(item.id) ? (
                      <CustomIcon
                        class={`icn_${item.id}`}
                        action={item.actionName}
                        actionName={item.actionName}
                        actionText={props.task?.value}
                        tip={item.value}
                      />
                    ) : null}
                  </ListItemIcon>
                  <Typography variant="inherit" noWrap>
                    {item.value}
                  </Typography>
                </MenuItem>
              )}
              {item.id !== 'divider' && item.isListOfItems && (
                <MenuItem key={`menu-${item.id}-menuItem`} onClick={handleClickSub}>
                  <ListItemIcon>
                    <ArrowLeft fontSize="medium" />
                  </ListItemIcon>
                  <Typography variant="inherit" noWrap>
                    {item.value}
                  </Typography>
                </MenuItem>
              )}
              {item.id !== 'divider' && item.isListOfItems && (
                <Menu
                  keepMounted
                  anchorEl={menuElSub}
                  ref={_menuElSub}
                  key={`menu${item.id}-menuItem-sub`}
                  open={!!menuElSub}
                  onClose={closeElSub}
                >
                  {Object.keys(item.listItems).map((listItem) => (
                    <MenuItem
                      key={`menu${item.id}-menuItem-sub-${listItem}`}
                      onClick={() => {
                        hideBasicElement();
                        setMenuEl(null);
                        setMenuElSub(null);
                        item.action(props.id, listItem);
                      }}
                    >
                      {item.listItems[listItem].value}
                    </MenuItem>
                  ))}
                </Menu>
              )}
            </div>
          ))}
        </Menu>
      )}
    </>
  );
}

export default React.memo(TblActionMenu);
