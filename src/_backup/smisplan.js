import React from 'react';

import {metaData, filters, mainModes} from '../config/data';
import {getData}        from '../utils/api';
import Header           from '../Components/Header/Header';
import HeaderLogin      from '../Components/HeaderLogin/HeaderLogin';
import MainLeftSide     from '../Components/MainLeftSide/MainLeftSide';
import Content          from '../Components/Content/Content';
import Hint             from '../SharedComponents/Hint';
import {storage}        from '../storages/commonStorage';

/* *************************  Main div  ******************************* */
export default class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = { 
            forPrint: false,
        }
        this.setForPrint = this.setForPrint.bind(this)
        // this._dataForPrint = React.createRef();
        this._alertDiv = React.createRef();
        this._divDataTable = React.createRef();
    }

    setForPrint = (forPrint) => { this.setState({forPrint}) }

    reloadDataTable = (dataTableName, func, resetFilter = true) => {
        metaData.dataTableName = dataTableName;
        storage.table.dispatch({type: 'SET_TABLENAME', tableName: dataTableName})

        if (resetFilter) filters.clear();
        if (resetFilter) sessionStorage.removeItem('sort');

        getData(`${dataTableName}_meta`)
            .then(() => { 
                if (typeof func === 'function') func()
                storage.state.dispatch({type: 'SET_DATALOADING', stage: 'meta'})
            })
    }

    componentDidMount(){
        // go to special location
        const hostpath = document.location.host === "localhost:3000" ? "" : "/smisplan";
        if (document.location.pathname !== hostpath) {
            let tableName = document.location.pathname.split(hostpath + '/')[1]
            if( mainModes.indexOf(tableName) !== -1 ) {
                metaData.dataTableName = tableName;
            }
        }

        if ( navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i) ) {
            metaData.mobile = true;
        }

        if ( metaData.mobile ) {
            let root = document.documentElement;
            root.style.setProperty('--font-size-table-title', "16px");
            root.style.setProperty('--font-size-table', "14px");
        }

        getData('developer').then(
            result => { storage.state.dispatch({type: 'SET_DATALOADING', stage: 'root'})},
            error => {console.log(error)}
        );        

        // set dataloading = meta if all meta already loaded
        this.unsubscribeMeta = storage.meta.subscribe(() => {            
            let metaCount = storage.meta.getState().META.count;
            if (metaCount >= mainModes.length) {
                this.reloadDataTable(metaData.dataTableName, () => {}, false);
            }
        });

        // load data if all meta loaded
        this.unsubscribe = storage.state.subscribe(() => {
            let dataLoading = storage.state.getState().STATE.dataLoading;
            if ( dataLoading && dataLoading === 'root' ) {
                for (let mode of mainModes) {
                    getData(`${mode}_meta`).then(() => {storage.meta.dispatch({type: 'INCREASE'})});
                }
            }
            if ( dataLoading && dataLoading === 'meta' ) {
                getData(metaData.dataTableName).then(() => {storage.state.dispatch({type: 'SET_DATALOADING', stage: 'data'})})
            }
        })
    }

    componentWillUnmount(){ 
        this.unsubscribeMeta()
        this.unsubscribe()
    };

    render(){
        return <div id='mainTable' style={{width:"100%", height:"100%"}}>
            <header style={{display:"flex"}}>
                <HeaderLogin
                    reloadDataTable = {this.reloadDataTable}
                    // dataRef         = {this._dataForPrint}
                    dataRef         = {this._divDataTable}
                    changeForPrint  = {this.setForPrint} />
                <div className="divSpacingUp"/>
                <Header history={this.props.history} reloadDataTable = {this.reloadDataTable}/>
            </header>

            <main style={{display:"flex"}} className="divBottom">
                <MainLeftSide />
                <Content ref={this._divDataTable} reloadDataTable={this.reloadDataTable}/>

                <Hint />
            </main>

            {/* <div style={{ display: "none" }}>
                <DataTable ref={this._dataForPrint} noPagination={true}/>
            </div> */}
        </div>
    };
}