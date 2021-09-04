import React from 'react';
import { Menu, MenuItem, ListItemIcon, Typography, Divider } from '@material-ui/core';

import ArrowLeft from '@material-ui/icons/ArrowLeft';

import CustomIcon from '../../SharedComponents/CustomIcon';
import PopupEdit from '../PopupEdit/PopupEdit';
import PopupConfirm from '../PopupConfirm/PopupConfirm';
import PopupAddLinkedInfo from '../PopupAddLinkedInfo/PopupAddLinkedInfo';
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
    _menuElSub.current.style.marginLeft =
      -1 * `${_menuElSub.current.children[1].offsetWidth + 5}px`;
  };

  const action = (item, args) => {
    setOpened(false);
    item.action(...args);
  };

  const handleOpenPopupEdit = () => {
    setIsPopupEditOpened(true);
  };

  const handleOpenPopupLinked = (type) => {
    setIsPopupLinkedOpened({ [type]: true });
  };

  const handleOpenPopupConfirm = () => {
    setIsPopupConfirmOpened(true);
  };

  const handleClosePopups = (event) => {
    setIsPopupLinkedOpened({});
    setIsPopupConfirmOpened(false);
    setIsPopupEditOpened(false);
    setMenuEl(null);
    setOpened(false);
    if (event) event.stopPropagation();
  };

  const handleClickItem = (item, id) => {
    setMenuEl(null);
    switch (item.id) {
      case 'tasks_edit':
        handleOpenPopupEdit();
        break;
      case 'tasks_delete':
        handleOpenPopupConfirm();
        break;
      case 'discussion':
        handleOpenPopupLinked(item.id);
        break;
      case 'question':
        handleOpenPopupLinked(item.id);
        break;
      default:
        item.action(id);
        break;
    }
  };

  return (
    <>
      <CustomIcon class="icn_moreH" tip="Меню действий" action={handleClick} />

      {opened && (
        <Menu
          keepMounted
          anchorEl={menuEl}
          open={Boolean(menuEl)}
          onClose={() => {
            hideBasicElement();
            setMenuEl(null);
          }}
          className="tbl-action-menu"
        >
          {menuList.map((item, index) => (
            <div key={`${index}`}>
              {item.id === 'divider' && <Divider key={`menu-divider-${index}`} />}

              {item.id !== 'divider' && !item.isListOfItems && (
                <MenuItem
                  key={`menu-${item.id}-menuItem`}
                  onClick={() => {
                    handleClickItem(item, props.id);
                  }}
                >
                  <ListItemIcon>
                    {item.id === 'tasks_edit' && (
                      <>
                        <CustomIcon class={`icn_${item.id}`} tip="Редактировать" />
                        <PopupEdit
                          isOpened={isPopupEditOpened}
                          onClose={handleClosePopups}
                          id={props.id}
                          action={(...args) => {
                            action(item, args);
                          }}
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
                          actionText={`Тема: ${props.task?.value}`}
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
                  open={Boolean(menuElSub)}
                  onClose={() => {
                    setMenuElSub(null);
                  }}
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
