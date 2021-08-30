import React, { Fragment } from 'react';
import {Table, TableHead, TableBody, TableRow, TableCell, TablePagination, TableSortLabel, IconButton, Input}
    from '@material-ui/core';
import {MenuItem, ListItemIcon, Typography} from '@material-ui/core';
// import Draggable               from "react-draggable";
import {Paper, Tooltip}        from '@material-ui/core';
import InputAdornment          from '@material-ui/core/InputAdornment';
import CircularProgress        from '@material-ui/core/CircularProgress';
import Backdrop                from '@material-ui/core/Backdrop';
import FirstPageIcon           from '@material-ui/icons/FirstPage';
import LastPageIcon            from '@material-ui/icons/LastPage';
import KeyboardArrowLeftIcon   from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon  from '@material-ui/icons/KeyboardArrowRight';
import moment from 'moment';

import {dataTable, metaData, filters, filterTasks} from '../config/data';
import {doData, getData}    from '../utils/api';
import storage              from '../storages/commonStorage';
import TblActionMenu        from '../Components/TblActionMenu/TblActionMenu';
import TblHeaderBtnMenu     from '../Components/TblHeaderBtnMenu/TblHeaderBtnMenu';
import PopupEditFullText    from '../Components/PopupEditFullText/PopupEditFullText';
import PopupConfirmChoice   from '../Components/PopupConfirmChoice/PopupConfirmChoice';
import CustomIcon           from '../SharedComponents/CustomIcon';

const desc = (a, b, sort) => {
    let desc = 0;
    for(let field of sort) {
        let orderBy = field.field;
        let val_a = a[orderBy];
        let val_b = b[orderBy];

        if ( metaData.dataTable[orderBy].type === 'select' ) {
            if (val_a !== '' && typeof val_a === "string") val_a = metaData[`${orderBy}List`][val_a].value;
            if (val_b !== '' && typeof val_b === "string") val_b = metaData[`${orderBy}List`][val_b].value;
            if (typeof val_a !== "string") val_a = '';
            if (typeof val_b !== "string") val_b = '';
        }

        desc = 0;
        if (val_b < val_a) desc = -1;
        if (val_b > val_a) desc = 1;
        if (field.order === 'asc') desc *= -1;
        if (desc !== 0) break;
    }
    return desc;
}

const stableSort = (array, cmp) => {    
    const stabilizedThis = array.map((el, index) => [el, index]);

    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    return stabilizedThis.map(el => el[0]);
}

const getSorting = (sort) => {
    return (a, b) => desc(a, b, sort)
}

const getAdditionalCellProps = () => {
    let hasAdditionalCell = false;
    if (metaData.specificParameters.hasSpecNotes    || metaData.specificParameters.hasEditMenu || 
        metaData.specificParameters.hasDeleteButton || metaData.specificParameters.hasDoneButton || 
        metaData.specificParameters.hasSpecAction) {
        hasAdditionalCell = true;
    }

    return {hasAdditionalCell: hasAdditionalCell};
}

class EnhancedTableHead extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isHovered: ''
        }

        let widths = {};
        for (let property in metaData.dataTable) {
            if (metaData.dataTable[property].showInTable) {
                widths[property] = this.getColumnWidth(metaData.dataTable[property]);
            }

            if ( ['datetime', 'date', 'time'].indexOf(metaData.dataTable[property].type) !== -1
                && metaData.dataTable[property].showInTable ) {
                this.state[property] = filters.data[property] !== '' ? filters.data[property]: undefined;
            }
        }
        this.state.widths = widths;
    }

    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    createGroupHandler = property => {
        this.props.onRequestGroup(undefined, this.props.groupBy === property ? '' : property);
    };

    handleDateFilter = (property, value) => {
        let state = {};
        state[property] = value;
        this.setState(state);

        filters.setValue('data', property, value)
        this.props.onFilter(filterTasks());
    }

    getColumnWidth = (headCell) => {
        let width = '';
        let headCellWidth = headCell.value.length*(window.innerWidth <= 1400 ? 8 : 10) + 24;
        if ( headCell.isFilter && !metaData.mobile ) headCellWidth += 30;
        if ( headCell.isGroup && !metaData.mobile ) headCellWidth += 30;
        switch ( headCell.type ) {
            case 'int':
                width = 45 < headCellWidth ? `${headCellWidth}px` : "45px";
                break;

            case 'string':
                if ( !headCell.isInlineEditable && headCell.id !== 'theme' ) {
                    window.innerWidth <= 1400 ?
                        (width = 90 < headCellWidth ? `${headCellWidth}px` : "90px") :
                        (width = 110 < headCellWidth ? `${headCellWidth}px` : "110px");
                }     
                break;
                
            case 'select':
                if ( !headCell.isInlineEditable ) {
                    window.innerWidth <= 1400 ?
                        (width = 105 < headCellWidth ? `${headCellWidth}px` : "105px") :
                        (width = 120 < headCellWidth ? `${headCellWidth}px` : "120px");
                }     
                break;

            case 'multi-select':
                if ( !headCell.isInlineEditable ) {
                    window.innerWidth <= 1400 ?
                        (width = 155 < headCellWidth ? `${headCellWidth}px` : "155px") :
                        (width = 170 < headCellWidth ? `${headCellWidth}px` : "170px");
                }     
                break;

            case 'datetime':
            case 'date':
            case 'time':
                if ( !headCell.isInlineEditable ) {
                    window.innerWidth <= 1400 ?
                        (width = 80 < headCellWidth ? `${headCellWidth}px` : "80px") :
                        (width = 100 < headCellWidth ? `${headCellWidth}px` : "100px");
                }     
                break;
            default:
                width="";
        }
        return width;
    }

    resizeCol = (field, deltaX) => {
        if (deltaX !== 0) {
            console.log(deltaX)
            let fieldIndex = metaData.dataTable[field].tableIndex;
            let prevField = 0;
            for (let field of Object.values(metaData.dataTable).sort((a, b) => {return a.tableIndex > b.tableIndex ? 1 : -1})) {
                if (field.showInTable && field.tableIndex < fieldIndex) prevField = field.id
            }
            let widths = this.state.widths;
            widths[field] = parseInt(widths[field]);
            widths[prevField] = parseInt(widths[prevField]);
            widths[field] = widths[field] - deltaX + "px";
            widths[prevField] = widths[prevField] + deltaX + "px";
            this.setState({widths: widths});
        }
    }

    render () {
        const {hasAdditionalCell} = getAdditionalCellProps(); //, widthAdditionalCell

        const { order, orderBy, groupBy, headCells } = this.props;
        const { isHovered }  = this.state;
        const sort = {}
        this.props.sort.map(f => {return sort[f.field] = f});

        return (
                <TableRow style={{height:"36px", position:"static", backgroundColor: "var(--color-light)"}}>
                {Object.values(headCells)
                    .filter((a) => {return a.showInTable })
                    .sort((a, b) => {return a.tableIndex >= b.tableIndex ? 1 : -1})
                    .map((headCell, index) => {
                        const filterVisibility = isHovered === headCell.id ||
                            (filters.checkFilter(headCell.id) && filters.data[headCell.id] !== '' ) ?
                            'visible' : 'hidden';
                        const groupVisibility = isHovered === headCell.id || (groupBy && groupBy === headCell.id ) ? 'visible' : 'hidden';
                        const paddingLeft = index === 0 ? "10px" : '0px'
                        const minWidth = headCell.id === 'theme' ? "220px" : "";
                        const maxWidth = "";
                        //const width  = this.getColumnWidth(headCell);
                        const width = this.state.widths[headCell.id];
                        const filterList = ['datetime', 'date'].indexOf(headCell.type) !== -1 ? 'datetime' : metaData[`${headCell.id}List`]
                        let groupList = {};
                        if ( headCell.isGroup ) {
                            groupList[headCell.id] = {id: headCell.id, value: headCell.value}
                            if (headCell.type === 'date') {
                                groupList['week'] = {id: 'week', value: 'Неделя'}
                            }                            
                        }

                        return (<TableCell
                            key={headCell.id}
                            align='left'
                            padding='none'
                            className="tableHead"
                            style={{minWidth:minWidth, width:width, maxWidth:maxWidth, paddingLeft:paddingLeft}}
                            onMouseEnter={() => this.setState({isHovered: headCell.id})}
                            onMouseLeave={() => this.setState({isHovered: undefined})}
                            sortDirection={orderBy === headCell.id ? order : false}>

                            <TableSortLabel
                                active={sort[headCell.id] ? true : false}
                                direction={sort[headCell.id] ? sort[headCell.id].order : 'asc'}
                                onClick={this.createSortHandler(headCell.id)}>
                                {headCell.value}
                                {sort[headCell.id] ? ( <span></span> ) : null}
                            </TableSortLabel>

                            { headCell.isGroup && !metaData.mobile &&
                                <div style={{display:"inline-block", visibility:groupVisibility, verticalAlign:"middle"}}>
                                    <TblHeaderBtnMenu class='icn_filter' name={headCell.id} action={this.createGroupHandler}
                                        all={false} type="group"
                                        itemList={groupList}/>
                                </div>
                            }

                            { headCell.isFilter && !metaData.mobile &&
                                <div style={{display:"inline-block", visibility:filterVisibility, verticalAlign:"middle"}}>
                                    <TblHeaderBtnMenu class='icn_filter' name={headCell.id} action={this.props.onFilter}
                                        all={true} type="filter"
                                        itemList={filterList}/>
                                </div>
                            }
                        </TableCell>)
                    }
                )}
                {hasAdditionalCell &&
                <TableCell style={{width:metaData.table ? "53px":"1px", backgroundColor:"var(--color-light)"}} key='action' />}
                </TableRow>
        )
    }
}

export default class DataTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadData:   false,
            backdropLoading:   false,
            hasAddMenu: true,
            page:       0,
            rowsPerPage: 100,
            search:     '',
            sort:       [{field: 'id', order: 'asc'}],
            groupBy:    '',
            groupHide:  {},
            editID:     -1,
            editItem:   '',
            showFullTextID: -1,
            showAddRows:-1,
            data:       dataTable,
            headCells:  metaData.dataTable,
            titleRow:   '',
            secDataList:[],
        }

        this.setData         = this.setData.bind(this);
        this.setPage         = this.setPage.bind(this);
        this.setSearch       = this.setSearch.bind(this);
        this.setSort         = this.setSort.bind(this);
        this.setEditID       = this.setEditID.bind(this);
        this.setEditItem     = this.setEditItem.bind(this);
        this.setShowFullTextID = this.setShowFullTextID.bind(this);
        this.setRowsPerPage  = this.setRowsPerPage.bind(this);
        this.setHeadCells    = this.setHeadCells.bind(this)        
    }

    setData = (data) => {
        this.setEditID(-1);
        this.setState({data})
    }
    setPage = (page) => {
        this.setEditID(-1);
        this.setState({page});
    }
    setOrder        = (order)           => {this.setState({order})}
    setOrderBy      = (orderBy)         => {this.setState({orderBy})}
    setEditID       = (editID)          => {this.setState({editID})}
    setEditItem     = (editItem)        => {this.setState({editItem})}
    setShowFullTextID = (showFullTextID)=> {this.setState({showFullTextID})}
    setRowsPerPage  = (rowsPerPage)     => {this.setState({rowsPerPage})}
    setHeadCells    = (headCells)       => {this.setState({headCells})}

    /* handle search */
    setSearch = () => {
        let search = this["mainTable-search"].value;
        filters.data.commonFieldSearch = search;
        this.setData(filterTasks());
    }

    /* handle change sort order */
    setSort = (field) => {
        let sort = this.state.sort;
        let sortFieldIndex = sort.map(f => {return f.field}).indexOf(field);
        if ( sortFieldIndex !== -1 ) {
            sort[sortFieldIndex].order === 'asc' ? 
                sort[sortFieldIndex].order = 'desc' :
                sort.splice(sortFieldIndex, 1);            
        }
        else {
            sort.push({field: field, order: 'asc'})
        }
        sessionStorage.setItem('sort', JSON.stringify(sort));
        this.setState({sort: sort});
    }

    /* handle sort click */
    handleRequestSort = (event, field) => {
        this.setSort(field)
    };

    /* handle group click */
    handleRequestGroup = (event, field) => {
        const sort = this.state.sort;
        if ( field && field !== '' && sort.field !== field ) {
            field === 'week' ?
                this.setState({sort: [{field: field, order: 'desc'}, {field: 'date', order: 'asc'}, {field: 'time', order: 'asc'}]}) :
                this.setState({sort: [{field: field, order: 'asc'}]})
        }
        this.setState({groupBy: field, byWeek: false});
    };

    /* handle change page click */
    handleChangePage = (event, newPage) => { this.setPage(newPage) };

    /* handle change row per page click */
    handleChangeRowsPerPage = event => {
        this.setRowsPerPage(parseInt(event.target.value, 10));
        this.setPage(0);
    };

    /* set sort/group to default options */
    defaultSort = (order = 'desc', orderBy = 'id') => {
        let sort = [];
        const sortSString = sessionStorage.getItem('sort');
        if (sortSString) {
            const sortObj = JSON.parse(sortSString);
            if (Array.isArray(sortObj)) sort = sortObj
        }
        else {
            orderBy.split(",").map((field, i) => {return sort.push({field: field, order: order.split(",")[i]})})
        }
        
        this.setState({sort: sort,
                    groupBy: "",
                    search: ""});

        if (metaData.specificParameters && metaData.specificParameters.defaultGroupField) {
            this.setState({groupBy: metaData.specificParameters.defaultGroupField})
        }
    }

    /* get array index (main data table) from given main task/theme (etc) ID */
    realID = (id) => {
        return dataTable.map(task => {return task.id}).indexOf(id);
    }

    /* called after OK click in edit dialog */
    editTableRow = (id, rowData) => {        
        let errorResult = false;
        doData("patch", rowData, id, metaData.dataTableName)
            .then(([error]) => {
                if ( error ) {
                    errorResult = true;
                }
                else{
                    let realID = this.realID(id);
                    Object.keys(rowData).map( key => { return dataTable[realID][key] = rowData[key] });
                    this.setData(filterTasks());
                    storage.upd.dispatch({ type: 'UPDATE', update: true});
                }
            })
            .then(() => {
                errorResult ?
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка при изменении'}) :
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'success', message: 'Изменение успешно'});
            });
        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Идёт обновление информации в БД...'})
    }

    /* called if you click 'SAVE AS NEW' button */
    addTableRow = (rowData, updateTable = true) => {
        this.addTableRowArray([rowData], updateTable);
    }

    addTableRowArray = (rowDataArray, updateTable = true) => {
        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Идёт обновление информации в БД...'})
        
        Promise.all(rowDataArray.map(rowData => doData("put", rowData, undefined, metaData.dataTableName)))
            .then(returnDataArray => {
                let error = 0;
                let jsonOk = 1;
                for (let returnData of returnDataArray) {
                    const returnError = returnData[0]
                    const returnJson = returnData[1]
                    if (returnError) error = 1;
                    if (!returnJson || !returnJson.data || !returnJson.data.id) jsonOk = 0;
                }
                
                if ( error ) {
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка при добавлении'})
                }
                else if (jsonOk) {
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'success', message: 'Добавление успешно'})

                    for (let i in rowDataArray) {
                        let rowData = rowDataArray[i]
                        let json = returnDataArray[i][1]

                        rowData.id = json.data.id;
                        rowData.value = rowData[metaData.specificParameters.mainValue]
                        if (metaData[`${metaData.dataTableName}List`]) {
                            metaData[`${metaData.dataTableName}List`][rowData.id] = rowData;
                        }
                        dataTable.push(rowData)
                    }
                    
                    if (updateTable) this.setData(filterTasks());
                }
            });
    }

    //chosenWeek = 0 - this week, 1 - next week, 2 - ...
    copyPreviousWeekDiscussions (selectedWeek, chosenWeek) {
        let weekData = dataTable.filter(row => row.week === selectedWeek)

        const infoArray = [];
        for (const data of weekData) {
            const info = {...data};                 //Don't forget to create REALLY new object
            info.result = '';
            info.status = 'new';
            
            let stWeekDate = new Date();                        // this week start date
            const stWeekDay = stWeekDate.getDay() === 0 ? 7 : stWeekDate.getDay();
            stWeekDate.setDate(stWeekDate.getDate() - stWeekDay + 1);
            const prevDate = new Date(info.date);               // date of discussion
            const prevDay = prevDate.getDay() === 0 ? 7 : prevDate.getDay();
            let newWeekDate = new Date();                       // date of discussion on the next week
            newWeekDate.setDate(stWeekDate.getDate() + prevDay - 1 + 7*chosenWeek);

            let dd = newWeekDate.getDate();     if(dd < 10) dd = `0${dd}`;
            let mm = newWeekDate.getMonth() + 1;if(mm < 10) mm = `0${mm}`;
            let yy = newWeekDate.getFullYear();
            let ww = newWeekDate.getWeek(1);    if(ww < 10) ww = `0${ww}`;

            info.date = `${yy}-${mm}-${dd}`;
            info.week = `${yy}.${ww}`;

            infoArray.push(info);
        }

        this.addTableRowArray(infoArray)
    }

    /* called after OK click in DELETE dialog */
    deleteTableRow = id => {
        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Идёт обновление информации в БД...'})
        let errorResult = false;
        doData("delete", {}, id, metaData.dataTableName)
                .then(([error]) => {
                    if ( error ) {
                        errorResult = true;
                    }
                    else{
                        this.setShowFullTextID(-1)
                        let realID = this.realID(id); 
                        dataTable.splice(realID, 1);
                        this.setData(filterTasks());

                        storage.upd.dispatch({ type: 'UPDATE', update: true});
                    }
                })
                .then(() => {
                    errorResult ?
                        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка при изменении'}) :
                        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'success', message: 'Удаление успешно'});
                });
    }

    /* called after inline edit of something */
    inlineEditOk = id => event => {
        let editProperty = this.state.editItem;
        let realID = this.realID(id);
        let rowData = {};
        Object.keys(dataTable[realID]).map( key => { return rowData[key] = dataTable[realID][key] });
        rowData[editProperty] = this[`edit-${editProperty}-${id}`].value;

        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Идёт обновление информации в БД...'})
        doData("patch", rowData, id, metaData.dataTableName)
            .then(([error]) => {
                if ( error ) {
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка при изменении'})
                }
                else{
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'success', message: 'Изменение успешно'})

                    //dataTable[realID][editProperty] = this[`edit-${editProperty}-${id}`].value;
                    dataTable[realID][editProperty] = rowData[editProperty]
                    this.setData(filterTasks());
                }
            });
    }

    dialogEditOk = (id, editProperty, editPropertyValue) => {
        let realID = this.realID(id);
        let rowData = {};
        Object.keys(dataTable[realID]).map( key => { return rowData[key] = dataTable[realID][key] });
        rowData[editProperty] = editPropertyValue;

        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Идёт обновление информации в БД...'})
        doData("patch", rowData, id, metaData.dataTableName)
            .then(([error]) => {
                if ( error ) {
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка при изменении'})
                }
                else{
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'success', message: 'Изменение успешно'})

                    dataTable[realID][editProperty] = editPropertyValue;
                    this.setData(filterTasks());
                }
            });
    }

    /* called after set task/theme etc status as DONE */
    completeTableRow = id => {
        let realID = this.realID(id);
        let task = {};
        Object.keys(dataTable[realID]).map( key => { return task[key] = dataTable[realID][key] });
        task.status = 'done';

        let today = new Date();
        task.dateEnd = today.toISOString().replace(/(.+)T(.+)/,"$1");

        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Идёт обновление информации в БД...'})
        doData("patch", task, id)
            .then(([error]) => {
                if ( error ) {
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка при изменении'})
                }
                else{
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'success', message: 'Изменение успешно'})                    

                    dataTable[realID].status = task.status;
                    dataTable[realID].dateEnd = task.dateEnd;
                    this.setData(filterTasks());
                }
            });
    }

    setStatusTableRow = (id, status) => {
        let realID = this.realID(id);
        let task = {};
        Object.keys(dataTable[realID]).map( key => { return task[key] = dataTable[realID][key] });
        task.status = status;

        if (status === 'done') {
            let today = new Date();
            task.dateEnd = today.toISOString().replace(/(.+)T(.+)/,"$1");
        }

        console.log(id, status, task);
        return

        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Идёт обновление информации в БД...'})
        doData("patch", task, id)
            .then(([error]) => {
                if ( error ) {
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка при изменении'})
                }
                else{
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'success', message: 'Изменение успешно'})                    

                    dataTable[realID].status = task.status;
                    dataTable[realID].dateEnd = task.dateEnd;
                    this.setData(filterTasks());
                }
            });
    }

    /* handle show full text row */
    showFullText = id => event => {
        this.state.showFullTextID === id ? this.setShowFullTextID(-1) : this.setShowFullTextID(id);
    }

    /* go to linked table (questions, discussion) for given task */
    loadLinked = async (id, loadTableName = 'spec_notes') => {
        let mainTable = metaData.dataTableName;
        storage.table.dispatch({type: "SET_TABLE", tableName:  metaData.dataTableName})
        
        let data = await getData(mainTable, 'direct', {id: id});            

        this.props.reloadDataTable(loadTableName, () => {
            filters.data.idTask = id;
            if (loadTableName === 'spec_notes') filters.perm.idTask = id;
            filters.perm.mainTable = mainTable;
            
            this.setState({titleRow: `${data[0].id} - ${data[0].value}`})
        });
    }

    /* add 'linked' data: question for tasks, discussion for theme, etc */
    addLinkedData = (id, type, infoData) => {
        let realID = this.realID(id);
        let today = new Date();
        let linkedData = {}
        let metaTable = metaData.tables[`${type}_meta`];

        for (let prop in metaTable.dataTable){
            if (metaTable.dataTable[prop].defaultValue) {
                switch (metaTable.dataTable[prop].defaultValue) {
                    case 'date':
                        linkedData[prop] = today.toLocaleDateString().replace(/(\d\d)\.(\d\d)\.(\d\d\d\d)/,"$3-$2-$1");
                        break;
                    case 'time':
                        linkedData[prop] = today.toLocaleTimeString();
                        break;
                    case 'datetime':
                        linkedData[prop] = today.toLocaleDateString().replace(/(\d\d)\.(\d\d)\.(\d\d\d\d)/,"$3-$2-$1") + ' ' + today.toLocaleTimeString();
                        break;
                    case 'empty':
                        linkedData[prop] = undefined;
                        break;
                    default:
                        if ( metaTable.dataTable[prop].defaultValue.search(/object:/) !== -1 ) {
                            let inputData = metaTable.dataTable[prop].defaultValue.split(',');
                            if ( inputData[0].split(':')[1] === 'data' ) {
                                linkedData[prop] = dataTable[realID][ inputData[1].split(':')[1] ]
                            }
                            else if (inputData[0].split(':')[1] === 'meta' ) {
                                linkedData[prop] = metaData[ inputData[1].split(':')[1] ]
                            }
                        }
                        else{
                            linkedData[prop] = metaTable.dataTable[prop].defaultValue;
                        }
                        
                        break;
                }
            }
            else{}
        }

        for( let prop in infoData) {
            linkedData[prop] = infoData[prop]
        }

        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Идёт обновление информации в БД...'})
        doData("put", linkedData, undefined, type)
            .then(([error, json]) => {
                if ( error ) {
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка при добавлении'})
                }
                else if ( json && json.data && json.data.id ) {
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'success', message: 'Добавление успешно'})
                }
                else {
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка при добавлении записи в БД'})
                }
            });

        return false;
    }

    /* create and show sub list data (tasks for theme, etc) */
    loadSecondaryList = async (id, field, dataListName) => {
        if ( this.state.showAddRows === id ) {
            this.setState({showAddRows: -1, secDataList: []});
        }
        else {
            this.setState({showAddRows: id});

            let secDataList = [];
            field = 'taskgroup';
            
            if ( metaData.dataTableName === 'discussion' ) {
                let realID = this.realID(id)
                id = dataTable[realID].idTask;
            }

            let data = await getData(dataListName, 'direct', {[field]: id});
            data.filter(task => {return parseInt(task[field]) === parseInt(id) && task.status !== 'done'})
                .sort((a, b) => {return a.value <= b.value ? -1 : 1})
                .map(info => {return secDataList.push({id: info.id, value: info.value})})
                
            this.setState({secDataList: secDataList.map(task => {return {string: ` ${task.value}`}})});
        }
    }

    /* handle send notifiction */
    sendNotification = (id) => {
        let rowData = {
            id: id,
            mode: "patch",
            feature: metaData.dataTableName,
        }

        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Идёт отправка уведомлений...'})
        doData("notify", rowData, id, 'notification')
            .then(([error]) => {
                error ?
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка при отправке уведомления'}) :
                    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'success', message: 'Уведомление послано успешно'})
            });
    }

    menuActionLoadQuestions = id => {
        return this.loadLinked(id, 'spec_notes');
    }

    menuActionLoadDiscussions = id => {
        return this.loadLinked(id, 'discussion')
    }

    menuActionLoadThemeTasks = id => {
        return this.loadSecondaryList(id, metaData.dataTableName, 'task');
    }

    /* create action menu list (edit/delete/done, etc) */
    actionMenuList = () => {
        let menuList = []
        if ( metaData.specificParameters.hasQuestions ) {
            let action = {
                id: 'spec_notes',
                value: 'Связанные вопросы',
                'action': this.menuActionLoadQuestion,
            };
            menuList.push (action);
            action = {
                id: 'question',
                value: 'Задать вопрос',
                type: 'spec_notes',
                'action': this.addLinkedData,
            };
            menuList.push (action);
            menuList.push ({id: 'divider'});
        }
        if ( metaData.specificParameters.haveDiscussion ) {
            let action = {
                id: 'discussion',
                value: 'Добавить обсуждение',
                type: 'discussion',
                'action': this.addLinkedData
            };
            menuList.push(action);
        }
        if ( metaData.specificParameters.hasGoToDiscussion ) {
            let action = {
                id: 'goToDiscussion',
                value: 'Связанные обсуждения',
                type: 'discussion',
                'action': this.menuActionLoadDiscussions,
            };
            menuList.push(action);
        }
        if ( metaData.specificParameters.hasSublistData ) {
            let action = {
                id: 'secDataList',
                value: 'Связанные задачи',
                'action': this.menuActionLoadThemeTasks
            };
            menuList.push (action);
            menuList.push ({id: 'divider'});
        }
        if ( metaData.specificParameters.hasEditMenu ) {
            let action = {
                id: 'tasks_edit',
                value: 'Редактировать',
                actionName: 'Редактирование',
                'action': this.editTableRow,
                'actionNew': this.addTableRow,
            };
            menuList.push (action);
        }
        // if ( metaData.specificParameters.hasSetStatusMenu ) {
        // if ( true ) {
        //     let action = {
        //         id: 'tasks_status',
        //         value: 'Изменить статус',
        //         actionName: 'Изменить статус',
        //         isListOfItems: true,
        //         listItems: metaData.statusList,
        //         'action': this.setStatusTableRow
        //     };
        //     menuList.push (action);
        // }
        if ( metaData.specificParameters.hasDeleteButton ) {
            let action = {
                id: 'tasks_delete',
                value: 'Удалить',
                actionName: 'Удаление',
                'action': this.deleteTableRow
            };
            menuList.push (action);
        }
        if ( metaData.specificParameters.hasDoneButton ) {
            let action = {
                id: 'tasks_complete',
                value: 'Отметить как выполнена',
                'action': this.completeTableRow
            };
            menuList.push (action);
        }
        if ( metaData.specificParameters.hasNotificationButton ) {
            menuList.push ({id: 'divider'});
            let action = {
                id: 'notification',
                value: 'Отправить уведомление',
                'action': this.sendNotification
            };
            menuList.push (action);
        }

        return menuList;
    }

    getDateGroup = (date) => {
        let weekNum = this.state.byWeek ? moment(date, "YYYY-MM-DD").week() : date;
        return weekNum;
    }

    componentDidMount(){
        this.unsubscribe = storage.state.subscribe(() => {
            let dataLoading = storage.state.getState().STATE.dataLoading;
            if ( dataLoading && dataLoading === 'meta' ) {
                this.setHeadCells(metaData.dataTable);
                this.defaultSort(metaData.specificParameters.defaultSortDirection, metaData.specificParameters.defaultSortField);
            }
            if ( dataLoading && dataLoading === 'data' ) {
                this.setData( filterTasks() )
                this.setState({loadData: true});
            }
        })

        this.unsubscribeData = storage.data.subscribe(() => {
            if ( storage.data.getState().DATA.redraw ) {                
                this.setData( filterTasks() );
                this.setPage( 0 );
            }
        })

        this.unsubscribeTable = storage.table.subscribe(() => {
            this.setState({loadData: false, secDataList : [], titleRow: ''});
        })
    }

    componentWillUnmount(){
        this.unsubscribe();
        this.unsubscribeData();
        this.unsubscribeTable();
    }

    /* create custom pagination buttons like: first, last, etc */
    TablePaginationActions = props => {
        const { count, page, rowsPerPage, onChangePage } = props;
        const countTotal = Math.ceil(count/rowsPerPage);
    
        return (<div style={{width:"350px", textAlign:"end"}}>
            <Tooltip title="Первая страница" placement="bottom" enterDelay={300}>
                <span>
                    <IconButton onClick={(e) => onChangePage(e, 0)} disabled={page === 0} aria-label="Первая" className="paginationSelect">
                        <FirstPageIcon fontSize="small"/>
                    </IconButton>
                </span>
                </Tooltip>
            <Tooltip title="Предыдущая" placement="bottom" enterDelay={300}>
                <span>
                    <IconButton onClick={(e) => onChangePage(e, page-1)} disabled={page === 0} aria-label="Предыдущая" className="paginationSelect">
                        <KeyboardArrowLeftIcon fontSize="small"/>
                    </IconButton>
            </span>
            </Tooltip>
            <Tooltip title="Следующая" placement="bottom" enterDelay={300}>
                <span>
                    <IconButton onClick={(e) => onChangePage(e, page+1)} disabled={page >= countTotal-1} aria-label="Следующая" className="paginationSelect">
                        <KeyboardArrowRightIcon fontSize="small"/>
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Последняя страница" placement="bottom" enterDelay={300}>
                <span>
                    <IconButton onClick={(e) => onChangePage(e, countTotal-1)} disabled={page >= countTotal-1} aria-label="Последняя" className="paginationSelect">
                        <LastPageIcon fontSize="small"/>
                    </IconButton>
                </span>
            </Tooltip>
        </div>);
    }

    render(){
        const {page, order, orderBy, sort, groupBy, headCells} = this.state;
        let {rowsPerPage, data, secDataList} = this.state;
        let groupList = {};
        let {groupHide} = this.state;
        let d = new Date();
        d = d.toLocaleDateString().replace(/(\d+).(\d+).(\d+)/,"$3-$2-$1");

        const weekOptionsChoice = [];
        for (let i = 0; i < 2; i++) {
            const weekObj = {value: i};

            let weekDate = new Date();
            weekDate.setDate(weekDate.getDate() + 7*i);
            const weekStr = `${moment(weekDate, 'YYYY-MM-DD').startOf('week').format('DD MMMM')} - ${moment(weekDate, 'YYYY-MM-DD').endOf('week').format('DD MMMM YYYY')} г`;

            if (i === 0) {
                weekObj.name = `Текущая неделя: ${weekStr}`;
            }
            else if (i === 1) {
                weekObj.name = `Следующая неделя: ${weekStr}`;
            }
            else {
                weekObj.name = `${i}-я неделя: ${weekStr}`;
            }
            
            weekOptionsChoice.push(weekObj);
        }

        // for `noPagination` parameter (print PDF click)
        if (this.props.noPagination) {
            data = filterTasks();
            rowsPerPage = data.length;
        }
       
        if ( this.state.loadData && metaData.dataTableName !== 'calendar' ) {
            const {hasAdditionalCell} = getAdditionalCellProps();
            const fullColsNum = Object.values(metaData.dataTable).filter((a) => {return a.showInTable }).length + (hasAdditionalCell ? 1 : 0);

            return (
                <div>
                  <Paper style={{boxShadow:"unset"}}>
                    {/*затемнение с загрузкой*/}
                    <Backdrop open={this.state.backdropLoading} style={{zIndex: 100}}>
                        <CircularProgress style={{width: '100px', height: '100px'}} />
                    </Backdrop>

                    <div>
                      <Table size='small' stickyHeader style={{tableLayout:"fixed", fontSize: "var(--font-size-table) !important"}}>
                        <TableHead>
                            {/* Table head */}
                            <EnhancedTableHead
                                order={order}
                                sort={sort}
                                orderBy={orderBy}
                                groupBy={groupBy}
                                onRequestSort={this.handleRequestSort}
                                onRequestGroup={this.handleRequestGroup}
                                rowCount={data.length}
                                onFilter={(data) => {this.setData(data); this.setPage(0)}}                                
                                headCells={headCells} />   
                             {/* Search & pagination options row */}
                            {!this.props.noPagination &&
                                <TableRow>
                                    <TableCell colSpan={fullColsNum} style={{top:"36px", backgroundColor:"#FEFEFE"}}>
                                        {/* Search */}
                                        <Input type="text" placeholder="Поиск"
                                            defaultValue={this.state.search}                                            
                                            ref="mainTable-search" inputRef={el => this["mainTable-search"] = el}
                                            inputProps={{
                                                style:{fontSize: "var(--font-size-table)", width:"200px"},
                                            }}
                                            onKeyDown={e => {
                                                if(e.key === 'Enter') return this.setSearch();
                                                if(e.key === 'Escape') {
                                                    this["mainTable-search"].value = "";
                                                    return this.setSearch();
                                                };
                                            }}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <CustomIcon class="icn_search" tip="Найти" action={this.setSearch} />
                                                </InputAdornment>}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <CustomIcon class="icn_clear" tip="Сбросить поиск" action={() => {this["mainTable-search"].value = ""; return this.setSearch();}} />
                                                </InputAdornment>}
                                        />
                                        {/* Pagination */}
                                        <TablePagination                                        
                                            rowsPerPageOptions={[50, 100, 200]}
                                            component="div"
                                            count={data.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onChangePage={this.handleChangePage}                                        
                                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                            labelRowsPerPage='Выводить по'
                                            labelDisplayedRows={({from, to, count}) => `${from}-${to} из ${count}`}
                                            style={{width: "500px", height:"25px", minHeight:"25px", 
                                                paddingTop:"0px", paddingBottom:"0px", 
                                                display:"inline-block", 
                                                marginLeft: "calc(100% - 500px - 265px)",
                                                fontSize:"var(--font-size-table)",}}
                                            backIconButtonProps={{style:{paddingTop:"0px", paddingBottom:"0px"}}}
                                            nextIconButtonProps={{style:{paddingTop:"0px", paddingBottom:"0px"}}}
                                            classes={{toolbar: 'paginationToolbar', select: 'paginationSelect'}}                        
                                            ActionsComponent={this.TablePaginationActions}
                                        />
                                    </TableCell>
                                </TableRow>
                            }
                            {/* Title row (for questions mode) */}
                            {metaData.specificParameters.hasTitleRow && this.state.titleRow !== '' &&
                            <TableRow>
                                <TableCell colSpan={fullColsNum} className="tableRowTitle">{this.state.titleRow}</TableCell>
                            </TableRow>}
                        </TableHead>
    
                        <TableBody>
                            { data.length > 0 ?
                                stableSort(data, getSorting(sort))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                let rowClass = '';
                                if ( row.status === 'new' ) rowClass = 'task_alert';
                                if ( metaData.dataTableName === 'discussion' && row.status === 'new' && row.date >= d ) {
                                    rowClass = '';
                                }
                                if ( row.priority === 'hard') rowClass = 'task_bad';
                                if ( row.status === 'rejected') rowClass = 'task_bad';
                                if ( row.status === 'done' ) rowClass = 'task_good';

                                let showGroupByRow = false;
                                let groupValue = '';
                                let dayName = '';

                                if (groupBy && groupBy !== ''){
                                    let date = '';
                                    if (headCells[groupBy].type === 'date') {
                                        date = moment(row[groupBy], 'YYYY-MM-DD');
                                    }
                                    else if (groupBy === 'week') {
                                        date = moment(row.date, 'YYYY-MM-DD');
                                    }

                                    let groupField = this.getDateGroup(row[groupBy]);
                                    if (!groupList[groupField]) {
                                        groupList[groupField] = 1;
                                        showGroupByRow = true;
                                    }

                                    if (headCells[groupBy].type === 'date') {
                                        dayName = `${date.format('dddd')}
${date.format('DD MMMM')}`;
                                        //dayName = date.format('dddd') + '<br>' + date.format('DD MMMM');
                                        groupValue = date.format('DD MMMM YYYY')
                                    }
                                    else if (groupBy === 'week') {
                                        dayName = `${date.format('dddd')}
${date.format('DD MMMM')}`;
                                        groupValue = date.startOf('week').format('DD MMMM YYYY') + ' - ' + date.endOf('week').format('DD MMMM YYYY');
                                    }
                                    else {
                                        groupValue = metaData[`${groupBy}List`] ? metaData[`${groupBy}List`][row[groupBy]].value : row[groupBy]
                                    }
                                }

                                //big text data, like description, change_all. get Index of cell where Icon for click, value && property name
                                let fullText = {display: false};
                                for ( let property of Object.values(headCells) ){
                                    if ( property.type === 'fulltext' && row[property.id] !== '' && typeof row[property.id] === 'string' ){
                                        fullText.value  = row[property.id]
                                        fullText.title  = property.value
                                        fullText.id     = property.id;
                                        fullText.display = true;
                                        fullText.fullTextIndexCell = property.tableIndex;
                                    }
                                }

                                return (
                                    <Fragment key={`${row.id}`}>
                                        {/* Group row with show/hide icons */}
                                        {groupBy && groupBy !== '' && showGroupByRow ?
                                        <TableRow>
                                            <TableCell colSpan={metaData.dataTableName === 'discussion' ? fullColsNum-2 : fullColsNum} className="tableRowTitle">
                                            <MenuItem colSpan={fullColsNum} style={{paddingTop:"0px", paddingBottom:"0px"}}
                                                onClick={() => { groupHide[this.getDateGroup(row[groupBy])] = !groupHide[this.getDateGroup(row[groupBy])]; return this.setState({groupHide: groupHide})}} >
                                                <ListItemIcon>
                                                    {groupHide[this.getDateGroup(row[groupBy])] ? 
                                                        <CustomIcon class={`icn_arrow_right`}   tip="Показать" 
                                                            action={() => {groupHide[this.getDateGroup(row[groupBy])] = true; return this.setState({groupHide: groupHide})}} /> :
                                                        <CustomIcon class={`icn_arrow_down`}    tip="Свернуть" 
                                                            action={() => {groupHide[this.getDateGroup(row[groupBy])] = false; return this.setState({groupHide: groupHide})}} />}
                                                </ListItemIcon>

                                                <Typography variant="inherit" noWrap style={{fontSize:"var(--font-size-table)"}}>
                                                    {headCells[groupBy].value}: {groupValue}
                                                </Typography>
                                            </MenuItem>
                                            </TableCell>
                                            {metaData.dataTableName === 'discussion' &&
                                            <TableCell colSpan={2} className="tableRowTitle" style={{display: "flex", justifyContent: "center"}}>
                                                <PopupConfirmChoice
                                                    //ref={`copyPreviousWeekDiscussions_${row[groupBy]}`}
                                                    class={`icn_discussionCopy`}
                                                    id={row[groupBy]}
                                                    options={weekOptionsChoice}
                                                    action={(id, week) => {this.copyPreviousWeekDiscussions(id, week)}}
                                                    actionName={'копирование обсуждений недели'}/>
                                            </TableCell>}
                                        </TableRow> : null}
                                        <TableRow
                                            hover
                                            tabIndex={-1}
                                            key={`row-main-${row.id}`}
                                            className={`${rowClass} mainTableRow`}
                                            style={{height:"31px", display: !groupBy || (groupBy && groupList[this.getDateGroup(row[groupBy])] && !groupHide[this.getDateGroup(row[groupBy])]) ? "table-row" : "none"}}>

                                            {Object.values(headCells)
                                                .filter((a) => {return a.showInTable })
                                                .sort((a, b) => {return a.tableIndex >= b.tableIndex ? 1 : -1})
                                                .map((headCell, index) => {
                                                    let property = headCell.id
                                                    let value = groupBy && groupBy !== '' && (headCell.id === groupBy || (headCell.id === 'date' && groupBy === 'week')) ? 
                                                        dayName : row[headCell.id]
                                                    if (headCell.type === 'time') value = value.replace(/(\d\d:\d\d):\d\d/,"$1")
                                                    if (headCell.id === 'mainTable') value = metaData.tables[`${value}_meta`].specificParameters.tableName;
                                                    let id = row.id
                                                    let whiteSpace = '';
                                                    if (["datetime","date","time"].indexOf(headCell.type) !== -1) {
                                                        whiteSpace = 'nowrap';
                                                    }
                                                    if (groupBy && groupBy !== '' && (headCell.id === groupBy || (headCell.id === 'date' && groupBy === 'week'))) {
                                                        whiteSpace = 'pre';
                                                    }

                                                    const paddingLeft = index === 0 ? "10px" : '0px';

                                                    return (
                                                        <TableCell key={`td-${property}-${id}`} className="mainTableCell" align="left" padding="none"
                                                            style={{whiteSpace:whiteSpace, paddingLeft:paddingLeft, fontSize: "var(--font-size-table)"}}>
                                                            {/* String editable cell value */}
                                                            {headCell.isInlineEditable && headCell.type === 'string' &&
                                                            <div ref={`div-${property}-${id}`} style={{display: "flex", alignItems:"center", justifyContent: "space-between"}}>
                                                                {/* text */}
                                                                {(this.state.editID !== id || this.state.editItem !== property) &&
                                                                    <div style={{width:"calc(100% - 80px)"}}>                                                                        
                                                                        {fullText.display && metaData.dataTable[property].hasFullTextLink && 
                                                                            <CustomIcon class='icn_description' tip={`Показать ${fullText.title}`} action={this.showFullText(row.id)}/>}
                                                                        <span>{value}</span>
                                                                    </div>}
        
                                                                {/* edit icon */}
                                                                {this.state.editID !== id &&
                                                                    <div className="showHoverIcon" style={{width:"40px", justifyСontent: "center"}}>
                                                                        <CustomIcon class='icn_tasks_edit' tip={`Изменить: ${metaData.dataTable[property].value}`} action={() => {this.setEditID(id); this.setEditItem(property)}}/>
                                                                    </div>}
        
                                                                {/* edit item textbox */}
                                                                {this.state.editID === id && this.state.editItem === property &&
                                                                    <div style={{width:"calc(100% - 10px)", display:"flex"}}>
                                                                        <Input type="text" autoFocus defaultValue={value}
                                                                            ref={`edit-${property}-${id}`} inputRef={el => this[`edit-${property}-${id}`] = el}
                                                                            inputProps={{
                                                                                style:{fontSize: "var(--font-size-table)"},
                                                                            }}
                                                                            /*edit item ok / cancel buttons*/
                                                                            endAdornment={
                                                                                <InputAdornment position="end">
                                                                                <div style={{alignItems:"center", display:"flex"}}>
                                                                                    <CustomIcon class='icn_ok' action={this.inlineEditOk(id)}/>
                                                                                    <div style={{display:"inline-block",width:"5px"}}></div>
                                                                                    <CustomIcon class='icn_cancel' action={() => {this.setEditID(-1); this.setEditItem('')}}/>
                                                                                </div>
                                                                                </InputAdornment>}
                                                                            fullWidth={true}/>
                                                                    </div>}
                                                            </div>}

                                                            {/* Fulltext editable cell value */}
                                                            { headCell.isInlineEditable && headCell.type === 'fulltext' &&
                                                            <div ref={`div-${property}-${id}`} style={{display: "flex", alignItems:"center", justifyContent: "space-between"}}>
                                                                {/* text */}
                                                                <div style={{width:"calc(100% - 100px)"}}>
                                                                    {fullText.display && metaData.dataTable[property].hasFullTextLink && 
                                                                        <CustomIcon class='icn_description' action={this.showFullText(row.id)}/>}
                                                                    <span>{value}</span>
                                                                </div>

                                                                {/* dialog to edit */}
                                                                {this.state.hoverID === id && (this.state.editID !== id || this.state.editItem !== property ) &&
                                                                    <PopupEditFullText class="icn_tasks_edit" id={row.id} property={property} text={value} action={this.dialogEditOk} />}
                                                            </div>}
                                                            
                                                            {/* None of the other cell values */}
                                                            { !headCell.isInlineEditable && headCell.type !== "multi-select" && (headCell.type !== "select" || typeof metaData[`${property}List`][value] === 'undefined') &&
                                                            <div>
                                                                {fullText.display && metaData.dataTable[property].hasFullTextLink && 
                                                                    <CustomIcon class='icn_description' action={this.showFullText(row.id)}/>}
                                                                    <span>{value}</span>
                                                            </div>}
                                                            
                                                            {/* Select non-editable cell value */}
                                                            { !headCell.isInlineEditable && headCell.type === "select" && typeof metaData[`${property}List`][value] !== 'undefined' &&
                                                            <div>
                                                                {fullText.display && index+1 === fullText.fullTextIndexCell && metaData.dataTable[property].hasFullTextLink && 
                                                                    <CustomIcon class='icn_description'  action={this.showFullText(row.id)}/>}
                                                                {metaData[`${property}List`][value].value}
                                                            </div>}
                                                            
                                                            {/* Multi-select non-editable cell value */}
                                                            { !headCell.isInlineEditable && headCell.type === "multi-select" &&
                                                            <div style={{whiteSpace:"pre-wrap"}}>
                                                                {fullText.display && index+1 === fullText.fullTextIndexCell && metaData.dataTable[property].hasFullTextLink &&                                                                 
                                                                        <CustomIcon class='icn_description'  action={this.showFullText(row.id)}/>}
                                                                    {/* <DescriptionIcon fontSize={fontSize}/>} */}
                                                                {value.split(',').map(d => metaData[`${property}List`][d].value).join(", ")}
                                                            </div>}
                                                        </TableCell>
                                                    )
                                                })}
                                            
                                            {/* Right column with actions menu */}
                                            { hasAdditionalCell &&
                                            <TableCell className="mainTableCell" padding="none" style={{paddingLeft:metaData.mobile ? "10px":""}}>
                                                <div className="showHoverIcon">
                                                    <TblActionMenu id={row.id} task={row} list={this.actionMenuList()}/>
                                                </div>                                                
                                            </TableCell>}
                                        </TableRow>
                                        {/* Full text row - if click to show */}
                                        { this.state.showFullTextID === row.id && fullText.display &&
                                        <TableRow key={`row-${fullText.value}-${row.id}`}>
                                            <TableCell />
                                            <TableCell />
                                            <TableCell colSpan={Object.values(headCells).filter((a) => {return a.showInTable }).length-3}>
                                                <div style={{whiteSpace: "pre-wrap", fontSize: "var(--font-size-table)"}}>{fullText.value}</div>
                                            </TableCell>
                                            <TableCell />
                                            {hasAdditionalCell && <TableCell />}                                        
                                        </TableRow>}
                                        {/* Secondary List: show and hide */}
                                        {this.state.showAddRows === row.id && !groupHide[row[groupBy]] && 
                                            <>
                                            {secDataList.length > 0 ? 
                                                secDataList.map((row, index) => {
                                                    return (
                                                    <TableRow key={`secDataListRow-${index}`}>
                                                        <TableCell colSpan={fullColsNum} style={{paddingLeft:"40px", fontSize:"var(--font-size-table)"}}>
                                                            {row.string}
                                                        </TableCell>
                                                    </TableRow>
                                                )}) : 
                                            <TableRow>
                                                <TableCell colSpan={fullColsNum} style={{paddingLeft:"40px", fontSize:"var(--font-size-table)"}}>
                                                    Данных нет
                                                </TableCell>
                                            </TableRow>}
                                            {/* collapse drop down secondary list */}
                                            <TableRow>                                            
                                                <TableCell colSpan={fullColsNum} style={{padding:'0px'}}>
                                                    <MenuItem style={{paddingTop:"2px", paddingBottom:"2px"}} onClick={() => { this.loadSecondaryList(row.id, 'task')}}>
                                                        <ListItemIcon>
                                                            <CustomIcon class={`icn_secDataListCollapse`}  action={() => { this.loadSecondaryList(row.id, 'task')}} />
                                                        </ListItemIcon>

                                                        <Typography variant="inherit" noWrap style={{fontSize:"var(--font-size-table)"}}>Свернуть</Typography>
                                                    </MenuItem>
                                                </TableCell>
                                            </TableRow>
                                            </>
                                        }
                                    </Fragment>
                                    )
                                }) :
                                <TableRow>
                                    <TableCell colSpan={fullColsNum}>{metaData.specificParameters.tableName}: отсутствуют</TableCell>
                                </TableRow>
                            }
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </div>
            );
        }
        else{
            //storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Идёт загрузка информации...'})

            return <div style={{textAlign:"center",paddingTop:"200px"}}>
                <CircularProgress style={{width:'100px', height:'100px'}}/>
            </div>
        }
    }
}
