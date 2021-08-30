import React from 'react';
import {IconButton, Tooltip} from '@material-ui/core';

import FilterListIcon       from '@material-ui/icons/FilterList';
import ClearIcon            from '@material-ui/icons/Clear';
import SearchIcon           from '@material-ui/icons/Search';
import SettingsIcon         from '@material-ui/icons/Settings';
import PlaylistAddIcon      from '@material-ui/icons/PlaylistAdd';
import EditIcon             from '@material-ui/icons/Edit';
import DeleteIcon           from '@material-ui/icons/Delete';
import CheckIcon            from '@material-ui/icons/Check';
import CheckCircleIcon      from '@material-ui/icons/CheckCircle';
import CancelIcon           from '@material-ui/icons/Cancel';
import VisibilityIcon       from '@material-ui/icons/Visibility';
import PrintIcon            from '@material-ui/icons/Print';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import DoubleArrowIcon      from '@material-ui/icons/DoubleArrow';
import ChevronLeftIcon      from '@material-ui/icons/ChevronLeft';
import CommentIcon          from '@material-ui/icons/Comment';
import DescriptionIcon      from '@material-ui/icons/Description';
import MenuIcon             from '@material-ui/icons/Menu';
import SpeakerNotesIcon     from '@material-ui/icons/SpeakerNotes';
import FormatIndentDecreaseIcon   from '@material-ui/icons/FormatIndentDecrease';
import AccountTreeIcon      from '@material-ui/icons/AccountTree';
import ArrowRightIcon       from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon        from '@material-ui/icons/ArrowLeft';
import ArrowDropUpIcon      from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon    from '@material-ui/icons/ArrowDropDown';
import ContactSupportIcon   from '@material-ui/icons/ContactSupport';
import MoreHorizIcon        from '@material-ui/icons/MoreHoriz';
import MoreVertIcon         from '@material-ui/icons/MoreVert';
import GroupAddIcon         from '@material-ui/icons/GroupAdd';
import CloudUploadIcon      from '@material-ui/icons/CloudUpload';
import HowToRegIcon         from '@material-ui/icons/HowToReg';
import AssignmentIcon       from '@material-ui/icons/Assignment';
import SaveIcon             from '@material-ui/icons/Save';
import AttachmentIcon       from '@material-ui/icons/Attachment';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import RecordVoiceOverIcon  from '@material-ui/icons/RecordVoiceOver';
import ViewListIcon         from '@material-ui/icons/ViewList';
import AddToPhotosIcon      from '@material-ui/icons/AddToPhotos';

function CustomIcon(props) {
    const size = typeof props.size !== undefined ? props.size : '30px';
    const fontSize = props.fontSize !== undefined ? props.fontSize : 'default';
    const type = props.type ? props.type : "material-ui";

    const style = props.style || {};
    style.padding = "0px";
    if ( props.class === "icn_arrow_left_fill" ) style.left = "-30px";

    let color="default";
    if ( props.class === "icn_ok" ) {}
    if ( props.class === "icn_cancel" ) {
        color="secondary"
    }

    return (
      <>
        {
        type === 'material-ui' &&
        <Tooltip title={props.tip ? props.tip : ''}>
        <IconButton className="icn" style={style} color={color} onClick={typeof props.action === 'function' ? props.action : null}>
            {props.class === "icn_filter"          && <FilterListIcon fontSize={fontSize}/>}
            {props.class === "icn_tasks_add"       && <PlaylistAddIcon fontSize={fontSize}/>}
            {props.class === "icn_tasks_edit"      && <EditIcon fontSize={fontSize}/>}
            {props.class === "icn_tasks_delete"    && <DeleteIcon fontSize={fontSize}/>}
            {props.class === "icn_tasks_complete"  && <CheckIcon fontSize={fontSize}/>}
            {props.class === "icn_ok"              && <CheckCircleIcon style={{color:"green"}} fontSize={fontSize}/>}
            {props.class === "icn_cancel"          && <CancelIcon fontSize={fontSize}/>}
            {props.class === "icn_filterOff"       && <VisibilityIcon fontSize={fontSize}/>}
            {props.class === "icn_print"           && <PrintIcon fontSize={fontSize}/>}
            {props.class === "icn_tasks_daily"     && <FormatListNumberedIcon fontSize={fontSize}/>}
            {props.class === "icn_arrow_right"     && <ArrowRightIcon fontSize={fontSize}/>}
            {props.class === "icn_arrow_left"      && <ArrowLeftIcon fontSize={fontSize}/>}
            {props.class === "icn_arrow_down"      && <ArrowDropDownIcon fontSize={fontSize}/>}
            {props.class === "icn_arrow_up"        && <ArrowDropUpIcon fontSize={fontSize}/>}
            {props.class === "icn_arrow_right_fill"&& <DoubleArrowIcon fontSize={fontSize}/>}
            {props.class === "icn_arrow_left_fill" && <ChevronLeftIcon fontSize={fontSize}/>}
            {props.class === "icn_description"     && <DescriptionIcon fontSize={fontSize}/>}
            {props.class === "icn_comment"         && <CommentIcon fontSize={fontSize}/>}
            {props.class === "icn_settings"        && <SettingsIcon fontSize={fontSize}/>}
            {props.class === "icn_menu"            && <MenuIcon fontSize={fontSize}/>}
            {props.class === "icn_spec_notes"      && <SpeakerNotesIcon fontSize={fontSize}/>}
            {props.class === "icn_group"           && <FormatIndentDecreaseIcon fontSize={fontSize}/>}
            {props.class === "icn_secDataList"     && <AccountTreeIcon fontSize={fontSize}/>}
            {props.class === "icn_secDataListCollapse" && <ArrowDropUpIcon fontSize={fontSize}/>}
            {props.class === "icn_question"        && <ContactSupportIcon fontSize={fontSize}/>}
            {props.class === "icn_moreH"           && <MoreHorizIcon fontSize={fontSize}/>}
            {props.class === "icn_moreV"           && <MoreVertIcon fontSize={fontSize}/>}
            {props.class === "icn_meeeting"        && <GroupAddIcon fontSize={fontSize}/>}
            {props.class === "icn_discussion"      && <HowToRegIcon fontSize={fontSize}/>}
            {props.class === "icn_notification"    && <NotificationsActiveIcon fontSize={fontSize}/>}
            {props.class === "icn_search"          && <SearchIcon fontSize={fontSize}/>}
            {props.class === "icn_clear"           && <ClearIcon fontSize={fontSize}/>}
            {props.class === "icn_download"        && <CloudUploadIcon fontSize={fontSize}/>}
            {props.class === "icn_save"            && <SaveIcon fontSize={fontSize}/>}
            {props.class === "icn_save_doc"        && <AssignmentIcon fontSize={fontSize}/>}
            {props.class === "icn_attachment"      && <AttachmentIcon fontSize={fontSize}/>}
            {props.class === "icn_chief"           && <RecordVoiceOverIcon fontSize={fontSize}/>}
            {props.class === "icn_discussionList"  && <ViewListIcon fontSize={fontSize}/>}
            {props.class === "icn_discussionCopy"  && <AddToPhotosIcon fontSize={fontSize}/>}
        </IconButton>
        </Tooltip>
        }
        {
        type === 'link' &&
        <a href={props.href} target="_blank" title={props.tip ? props.tip : ''} rel="noopener noreferrer">
        <div style={{width:size, height:size, display:'inline-block'}}
          onClick={props.action} className={props.class}>
        </div>
        </a>
        }
        {
        type !== 'link' && type !== 'material-ui' &&
        <div style={{width:size, height:size, display:'inline-block'}}
            onClick={props.action} className={props.class}>
        </div>
        }
      </>
    )
}

export default React.memo(CustomIcon);
