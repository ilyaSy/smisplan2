(this.webpackJsonpsmisplan2=this.webpackJsonpsmisplan2||[]).push([[6],{369:function(e,t,a){"use strict";a.d(t,"a",(function(){return f}));var n=a(87),i=a(20),l=a(25),r=a(26),o=a(27),s=a(0),c=a.n(s),u=a(17),p=a.n(u),d=a(387),m=a(377),f=function(e){Object(r.a)(a,e);var t=Object(o.a)(a);function a(e){var n;return Object(i.a)(this,a),(n=t.call(this,e)).handleChange=function(e){e&&""!==e&&"null"!==e&&Array.isArray(e)?(n.setState({valueErr:!1}),n.setState({value:e}),"function"===typeof n.props.setValue&&n.props.setValue(e.map((function(e){return e.value})).join(","))):e&&""!==e&&"null"!==e?(n.setState({valueErr:!1}),n.setState({value:e}),"function"===typeof n.props.setValue&&n.props.setValue(e.value)):(n.setState({value:e}),"function"===typeof n.props.setValue&&n.props.setValue(""))},n.setFocus=function(){n.refs[n.props.refName].focus()},n.filterValues=function(e,t){var a=n.optionsCounter<n.maxOptions;t&&""!==t&&(new RegExp(t,"i").test(e.label)||(a=!1));return a&&n.optionsCounter++,n.optionsCounter!==n.props.options.length&&n.optionsCounter!==n.maxOptions||(n.optionsCounter=0),a},n.state={value:n.props.defaultValue?n.props.defaultValue:n.props.isMulti?[]:"",valueErr:!1,offsetTop:0},n.maxOptions=n.props.maxOptions?n.props.maxOptions:60,n.optionsCounter=0,n}return Object(l.a)(a,[{key:"componentDidMount",value:function(){this.setState({offsetTop:p.a.findDOMNode(this).offsetTop})}},{key:"render",value:function(){var e=this,t={input:function(e){return Object(n.a)(Object(n.a)({},e),{},{height:"25px",fontFamily:"var(--font-main)",marginTop:"-0.75px",fontSize:"15px",backgroundColor:"transparent"})},control:function(t,a){return Object(n.a)(Object(n.a)({},t),{},{minHeight:"25px",height:"fit-content",fontFamily:"var(--font-main)",fontSize:"15px",backgroundColor:"transparent",border:"0px",borderRadius:"0px",borderBottom:e.state.valueErr||a.selectProps.menuIsOpen?"2px solid":"1px solid",borderColor:e.state.valueErr?"#f44336 !important":a.selectProps.menuIsOpen?"#3f51b5 !important":"rgba(0, 0, 0, 0.42) !important",boxShadow:"none","&:hover":{borderBottom:(a.selectProps.menuIsOpen,"2px solid"),borderColor:e.state.valueErr?"#f44336":a.selectProps.menuIsOpen?"#3f51b5":"black"}})},placeholder:function(t,a){return Object(n.a)(Object(n.a)({},t),{},{height:"25px",fontFamily:"var(--font-main)",fontSize:"15px",color:e.state.valueErr?"#f44336":a.selectProps.menuIsOpen?"#3f51b5":"",backgroundColor:"transparent"})},option:function(e){return Object(n.a)(Object(n.a)({},e),{},{fontFamily:"var(--font-main)",fontSize:"15px",marginTop:"-3px",color:"rgba(0, 0, 0, 0.87)"})},valueContainer:function(e){return Object(n.a)(Object(n.a)({},e),{},{minHeight:"24px",height:"fit-content",marginTop:"-5px",paddingLeft:"0px",marginLeft:"-2px"})},indicatorsContainer:function(e){return Object(n.a)(Object(n.a)({},e),{},{minHeight:"25px !important",padding:"0px !important"})},clearIndicator:function(e){return Object(n.a)(Object(n.a)({},e),{},{padding:"0px 5px 0px 5px !important"})},dropdownIndicator:function(e){return Object(n.a)(Object(n.a)({},e),{},{padding:"0px 5px 0px 5px !important"})}};return c.a.createElement("div",{style:this.props.style},!this.props.isCreatable&&c.a.createElement(d.a,{allowCreate:this.props.allowCreate,ref:this.selectRef,options:this.props.options,styles:t,menuPlacement:this.props.bottom||this.state.offsetTop<250?"bottom":"top",value:this.state.value,placeholder:this.props.label,defaultValue:this.props.defaultValue,defaultInputValue:this.props.defaultInputValue,onChange:this.handleChange,onMenuOpen:function(){return e.optionsCounter=0},noOptionsMessage:function(){return"\u041d\u0435\u0442 \u043f\u043e\u0434\u0445\u043e\u0434\u044f\u0449\u0438\u0445 \u0432\u0430\u0440\u0438\u0430\u043d\u0442\u043e\u0432"},isClearable:!0,isSearchable:!0,required:!0,isMulti:!!this.props.isMulti,style:{width:"200px"},filterOption:this.filterValues}),this.props.isCreatable&&c.a.createElement(m.a,{allowCreate:this.props.allowCreate,ref:this.selectRef,options:this.props.options,styles:t,menuPlacement:this.props.bottom||this.state.offsetTop<250?"bottom":"top",value:this.state.value,placeholder:this.props.label,defaultValue:this.props.defaultValue,defaultInputValue:this.props.defaultInputValue,onChange:this.handleChange,onMenuOpen:function(){return e.optionsCounter=0},noOptionsMessage:function(){return"\u041d\u0435\u0442 \u043f\u043e\u0434\u0445\u043e\u0434\u044f\u0449\u0438\u0445 \u0432\u0430\u0440\u0438\u0430\u043d\u0442\u043e\u0432"},isClearable:!0,isSearchable:!0,required:!0,isMulti:!!this.props.isMulti,style:{width:"200px"},filterOption:this.filterValues}))}}]),a}(s.Component)},427:function(e,t,a){},429:function(e,t,a){},430:function(e,t,a){},431:function(e,t,a){},445:function(e,t,a){"use strict";a.r(t);var n=a(96),i=a(62),l=a(21),r=a(0),o=a.n(r),s=a(194),c=a(339),u=a(342),p=a(340),d=a(50),m=a(152),f=a.n(m),b=a(15),h=a(20),v=a(25),y=a(18),E=a(26),O=a(27),g=a(31),k=a(285),x=a(350),T=a(286),C=a(346),j=a(198),S=a(287),_=a(291),w=a(115),N=a(95),V=a(289),D=a(102),I=a.n(D),M=a(97),P=a.n(M),F=a(131),R=a.n(F),Y=a(428),A=a.n(Y),W=a(150),H=a.n(W),L=a(153),z=a.n(L),B=a(36),K=a(448),U=a(345),q=a(441),J=a(134),$=(a(204),a(2)),G=a(19),Q=a(7),X=a(369),Z=a(409),ee=a(426);var te=a(98),ae=(a(427),function(e){Object(E.a)(a,e);var t=Object(O.a)(a);function a(e){var r;if(Object(h.a)(this,a),(r=t.call(this,e)).setOpenConfirm=function(e){r.setState({openConfirm:e})},r.setOpen=function(e){if(r.setState({open:e}),e){var t=function(e){if(!$.e.dataTable[e].isEditable||-1===["select","multi-select"].indexOf($.e.dataTable[e].type))return"continue";r.task[e]=$.a[r.realId][e];var t=$.e.dataTable[e].vocabulary?$.e.dataTable[e].vocabulary:e;$.e["".concat(t,"List")]||Object(G.c)(t,"direct").then((function(e){var a={};e.map((function(e){return a[e.id]=e})),r.setState(Object(n.a)({},"".concat(t,"List"),a))}))};for(var a in $.e.dataTable)t(a)}else r.props.onClose()},r.handleDateTimeChange=function(e){return function(t){r.setState(Object(n.a)({},e,t))}},r.handleOk=function(){var e=$.a.map((function(e){return e.id})).indexOf(r.props.id),t=$.a[e],a={};for(var n in $.e.dataTable)"specificParameters"!==n&&"undefined"!==n&&("mainTable"!==n?(a[n]=r.state[n]?r.state[n]:r[n]?r[n].value:null,-1!==["datetime","date","time"].indexOf($.e.dataTable[n].type)&&(a[n]=te.a.toDateTimeStr($.e.dataTable[n].type,r.state[n]))):a[n]=t[n]);var i=!1;for(var l in a){var o=$.e.dataTable[l],s="int"===o.type?parseInt(a[l]):a[l];if("int"!==o.type&&s!==t[l]){i=!0;break}}"discussion"===$.e.dataTableName&&(a.participants.split(",").includes(a.responsible)||(a.participants=a.responsible+","+a.participants)),i?r.props.action(r.props.id,a):console.log("\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439 \u0432\u043d\u0435\u0441\u0435\u043d\u043e \u043d\u0435 \u0431\u044b\u043b\u043e"),r.setOpen(!1)},r.handleSaveAsNew=function(){var e=$.a.map((function(e){return e.id})).indexOf(r.props.id),t=$.a[e],a={};for(var n in $.e.dataTable)"specificParameters"!==n&&"undefined"!==n&&(a[n]=r.state[n]?r.state[n]:r[n]?r[n].value:null,"mainTable"===n&&(a[n]=t[n]),-1!==["datetime","date","time"].indexOf($.e.dataTable[n].type)&&(a[n]=te.a.toDateTimeStr($.e.dataTable[n].type,r.state[n])));a.week&&(a.week=parseFloat(new te.a(a.date).getYearWeekStr())),t.date===a.date&&t.time===a.time?(r.setOpenConfirm(!0),r.setState({confirmMessage:"(\u0434\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043c\u044f \u043d\u0435 \u0431\u044b\u043b\u0438 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u044b!)"})):(r.props.actionNew(a),r.setOpen(!1))},r.confirmSaveAsNew=function(){var e=$.a.map((function(e){return e.id})).indexOf(r.props.id),t=$.a[e],a={};for(var n in $.e.dataTable)"specificParameters"!==n&&"undefined"!==n&&(a[n]=r.state[n]?r.state[n]:r[n]?r[n].value:null,"mainTable"===n&&(a[n]=t[n]),-1!==["datetime","date","time"].indexOf($.e.dataTable[n].type)&&(a[n]=te.a.toDateTimeStr($.e.dataTable[n].type,r.state[n])));a.week&&(a.week=parseFloat(new te.a(a.date).getYearWeekStr())),r.props.actionNew(a),r.setOpen(!1)},r.handleUpload=function(e,t){Q.a.alert.dispatch({type:"SHOW_ALERT",status:"warn",message:"\u0424\u0430\u0439\u043b \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044f..."}),Object(G.b)(e.target.files[0]).then((function(e){var a=Object(l.a)(e,2),o=a[0];if(a[1])Q.a.alert.dispatch({type:"SHOW_ALERT",status:"fail",message:"\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0435"});else{Q.a.alert.dispatch({type:"SHOW_ALERT",status:"success",message:"\u0424\u0430\u0439\u043b \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e, \u0441\u0441\u044b\u043b\u043a\u0430 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0430"});var s="http://"+window.location.host+"/smisplan-docs/"+o.fileName;r[t].value=r[t].value+"\n"+s;var c=[];r.state["".concat(t,"FilesAttached")]&&c.push.apply(c,Object(i.a)(r.state["".concat(t,"FilesAttached")])),c.push(s),r.setState(Object(n.a)({},"".concat(t,"FilesAttached"),c))}}))},r.openUrl=function(e){return window.open(e,"_blank","")},r.filterValidKeys=function(e){return"specificParameters"!==e&&"undefined"!==e},r.sortValidKeys=function(e,t){return $.e.dataTable[e].tableIndex>=$.e.dataTable[t].tableIndex?1:-1},r.state={openConfirm:!1,confirmMessage:"",printPDF:!1,tasksList:[]},r._dataRef=o.a.createRef(),r.setOpen=r.setOpen.bind(Object(y.a)(r)),r.props.id)for(var s in r.realId=$.a.map((function(e){return e.id})).indexOf(r.props.id),r.task=$.a[r.realId],$.e.dataTable){-1!==["datetime","date"].indexOf($.e.dataTable[s].type)?r.state[s]=r.task[s]&&""!==r.task[s]?r.task[s]:null:-1!==["time"].indexOf($.e.dataTable[s].type)?r.state[s]=r.task[s]&&""!==r.task[s]?"2000-01-01T".concat(r.task[s]):null:-1!==["select","multi-select"].indexOf($.e.dataTable[s].type)&&(r.state[s]=r.task[s]);var c=[];/\b(http:.+?)(txt|docx?|xlsx?|pptx?|pdf|png|bmp|img|jpg|jpeg)\b/im.test(r.task[s])&&(c.push(r.task[s].match(/\b(http:.+?)(txt|doc|docx|ppt|pptx|xls|xlsx|pdf|png|bpm|img|jpg|jpeg)\b/gi)),r.state["".concat(s,"FilesAttached")]=c[0])}return r}return Object(v.a)(a,[{key:"render",value:function(){var e=this,t=[].concat(Object.keys($.e.dataTable).filter(this.filterValidKeys).filter((function(e){return $.e.dataTable[e].isEditable})).sort(this.sortValidKeys),Object.keys($.e.dataTable).filter(this.filterValidKeys).filter((function(e){return!$.e.dataTable[e].isEditable})).sort(this.sortValidKeys));return this.task&&o.a.createElement(k.a,{open:this.props.isOpened,onClose:this.props.onClose,"aria-labelledby":"dialog-title",fullWidth:!0,classes:{paper:"dialog-edit"}},o.a.createElement("div",{className:"popup-edit__header"},o.a.createElement(x.a,{id:"dialog-title"},"\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435"),o.a.createElement("div",{className:"popup-edit__print-doc"},o.a.createElement(H.a,{trigger:function(){return o.a.createElement(_.a,{title:"\u041f\u0435\u0447\u0430\u0442\u0430\u0442\u044c"},o.a.createElement(w.a,{className:"icn",style:{padding:"0px"}},o.a.createElement(I.a,{fontSize:"large"})))},content:function(){return e.setState({printPDF:!0}),e._dataRef.current},onAfterPrint:function(){e.setState({printPDF:!1})}}),"discussion"===$.e.dataTableName&&o.a.createElement(b.a,{class:"icn_save",tip:"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043a\u0430\u043a \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 MS Word",fontSize:"large",action:function(){return function(e){Q.a.alert.dispatch({type:"SHOW_ALERT",status:"warn",message:"\u0418\u0434\u0451\u0442 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430..."});var t=new Z.Document,a=[];try{var n,i=Object(g.a)(e);try{for(i.s();!(n=i.n()).done;){var l=n.value;a.push(new Z.Paragraph({children:[new Z.TextRun({text:"".concat(l),size:"24",font:"Arial"})]}))}}catch(r){i.e(r)}finally{i.f()}t.addSection({children:a}),Z.Packer.toBlob(t).then((function(e){Object(ee.saveAs)(e,"SMISPlan document.docx"),Q.a.alert.dispatch({type:"SHOW_ALERT",status:"success",message:"\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d \u0438 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d"})}))}catch(r){Q.a.alert.dispatch({type:"SHOW_ALERT",status:"fail",message:"\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u0438 \u0438/\u0438\u043b\u0438 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0438"}),console.log("\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0438 \u0438/\u0438\u043b\u0438 \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u0438 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430: ".concat(r))}return!0}(function(e,t){var a=["\u041f\u043b\u0430\u043d\u0438\u0440\u043e\u0432\u0449\u0438\u043a \u0437\u0430\u0434\u0430\u0447",$.e.specificParameters.tableName,""],n=[];Object.keys($.e.dataTable).filter((function(e){return"specificParameters"!==e&&"undefined"!==e&&$.e.dataTable[e].isEditable})).sort((function(e,t){return $.e.dataTable[e].tableIndex>=$.e.dataTable[t].tableIndex?1:-1})).map((function(e){return n.push(e)})),Object.keys($.e.dataTable).filter((function(e){return"specificParameters"!==e&&"undefined"!==e&&!$.e.dataTable[e].isEditable})).sort((function(e,t){return $.e.dataTable[e].tableIndex>=$.e.dataTable[t].tableIndex?1:-1})).map((function(e){return n.push(e)}));for(var i=0,l=n;i<l.length;i++){var r=l[i],o=$.e.dataTable[r],s=$.e.dataTable[r].vocabulary?$.e["".concat($.e.dataTable[r].vocabulary,"List")]:$.e["".concat(r,"List")],c=e[r]?e[r]:"";if("mainTable"===r&&$.e.tables["".concat(c,"_meta")].specificParameters&&(c=$.e.tables["".concat(c,"_meta")].specificParameters.tableName),-1!==["select","multi-select"].indexOf($.e.dataTable[r].type)&&""!==c){var u=c;c="";var p,d=Object(g.a)(u.split(","));try{for(d.s();!(p=d.n()).done;){var m,f,b=p.value;c+=""===c?(null===(m=s[b])||void 0===m?void 0:m.value)||b:",".concat((null===(f=s[b])||void 0===f?void 0:f.value)||b)}}catch(v){d.e(v)}finally{d.f()}}a.push("".concat(o.value,":   ").concat(c))}if("discussion"===$.e.dataTableName){var h=t;a.push(""),h.length>0?(a.push("\u041d\u0435\u0437\u0430\u043a\u0440\u044b\u0442\u044b\u0435 \u0437\u0430\u0434\u0430\u0447\u0438:"),h.map((function(e){return a.push(e)}))):a.push("\u041d\u0435\u0437\u0430\u043a\u0440\u044b\u0442\u044b\u0435 \u0437\u0430\u0434\u0430\u0447\u0438: \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442")}return a}(e.task,e.state.tasksList),$.e)}}))),o.a.createElement(T.a,{ref:this._dataRef},t.map((function(t,a){var i=$.e.dataTable[t],l=$.e.dataTable[t].vocabulary?$.e.dataTable[t].vocabulary:t,r=$.e["".concat(l,"List")]?$.e["".concat(l,"List")]:e.state["".concat(l,"List")],s=e.task[t];return"mainTable"===t&&$.e.tables["".concat(s,"_meta")].specificParameters&&(s=$.e.tables["".concat(s,"_meta")].specificParameters.tableName),o.a.createElement("div",{key:"dialogEdit-".concat(t,"-main")},o.a.createElement("div",{key:"dialogEdit-".concat(t,"-subMain"),className:"popup-edit__row"},o.a.createElement("div",{style:{width:"200px",fontSize:"14px",color:i.isEditable?"":"var(--font-color-disabled)"}},i.value),i.isEditable&&("multi-select"===i.type||"select"===i.type)&&r&&o.a.createElement(X.a,{style:{width:"100%",minHeight:"30px",marginTop:"5px"},options:Object.keys(r).sort((function(e,t){return r[e].value>=r[t].value?1:-1})).map((function(e){return{value:e,label:r[e].value}})),bottom:!0,ref:t,inputRef:function(a){return e[t]=a},refName:t,defaultValue:e.task[t]?e.task[t].split(",").map((function(e){return r[e]?{value:e,label:r[e].value}:{value:e,label:e}})):null,setValue:function(a){return e.setState(Object(n.a)({},t,a))},label:"\u0412\u044b\u0431\u0440\u0430\u0442\u044c...",isMulti:"multi-select"===i.type,isCreatable:i.isSelectCreatable}),i.isEditable&&-1!==["string","int","fulltext"].indexOf(i.type)&&o.a.createElement(C.a,{defaultValue:e.task[t],fullWidth:!0,multiline:!0,onKeyDown:function(e){e.stopPropagation()},inputRef:function(a){return e[t]=a},inputProps:{style:{fontSize:"14px",fontFamily:"var(--font-main)",maxHeight:e.state.printPDF?"2000px":"200px",overflow:"unset !important"}},endAdornment:i.hasFileUploader&&!e.state.printPDF&&o.a.createElement("div",{className:"popup-edit__upload-file"},o.a.createElement(V.a,{position:"end"},o.a.createElement("input",{id:"editDialog-fileUploader",type:"file",style:{display:"none"},multiple:!0,onChange:function(a){return e.handleUpload(a,t)}}),o.a.createElement("label",{htmlFor:"editDialog-fileUploader"},o.a.createElement(_.a,{title:"\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c"},o.a.createElement(w.a,{color:"default",component:"span"},o.a.createElement(z.a,null))))))}),i.isEditable&&"datetime"===i.type&&o.a.createElement(B.a,{utils:J.a},o.a.createElement(K.a,{format:"YYYY-MM-DD HH:mm",ampm:!1,minutesStep:5,margin:"normal",onChange:e.handleDateTimeChange(t),value:e.state[t],inputRef:function(a){return e[t]=a},fullWidth:!0})),i.isEditable&&"date"===i.type&&o.a.createElement(B.a,{utils:J.a},o.a.createElement(U.a,{format:"YYYY-MM-DD",margin:"normal",onChange:e.handleDateTimeChange(t),value:e.state[t],inputRef:function(a){return e[t]=a},fullWidth:!0})),i.isEditable&&"time"===i.type&&o.a.createElement(B.a,{utils:J.a},o.a.createElement(q.a,{format:"HH:mm",ampm:!1,minutesStep:5,margin:"normal",onChange:e.handleDateTimeChange(t),value:e.state[t],inputRef:function(a){return e[t]=a},fullWidth:!0})),!i.isEditable&&o.a.createElement(j.a,{defaultValue:s,inputProps:{style:{fontSize:"14px",fontFamily:"var(--font-main)"}},inputRef:function(a){return e[t]=a},fullWidth:!0,disabled:!0})),e.state["".concat(t,"FilesAttached")]&&e.state["".concat(t,"FilesAttached")].length>0&&o.a.createElement("div",{className:"popup-edit__attached-file"},e.state["".concat(t,"FilesAttached")].map((function(t,a){return o.a.createElement(b.a,{class:"icn_attachment",tip:"\u041e\u0442\u043a\u0440\u044b\u0442\u044c: ".concat(t.replace(/^.+\/(.+)$/,"$1")),type:"material-ui",fontSize:"large",action:function(){return e.openUrl(t)},key:"".concat(t,"_").concat(a)})}))))}))),o.a.createElement(S.a,{className:"popup-edit__actions"},o.a.createElement(N.a,{variant:"outlined",onClick:this.handleOk,color:"primary",className:"MuiButton-outlinedOk",startIcon:o.a.createElement(P.a,null)},"\u041f\u0440\u0438\u043d\u044f\u0442\u044c \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f"),$.e.specificParameters.hasEditMenuSaveAsNew&&o.a.createElement(N.a,{variant:"outlined",onClick:this.handleSaveAsNew,color:"default",className:"MuiButton-outlinedDefault",startIcon:o.a.createElement(A.a,null)},"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043a\u0430\u043a \u043d\u043e\u0432\u0443\u044e"),o.a.createElement(N.a,{variant:"outlined",onClick:this.props.onClose,color:"secondary",startIcon:o.a.createElement(R.a,null)},"\u0417\u0430\u043a\u0440\u044b\u0442\u044c"),o.a.createElement(k.a,{open:this.state.openConfirm,onClose:function(){return e.setOpenConfirm(!1)},"aria-labelledby":"dialog-title",fullWidth:!0},o.a.createElement(x.a,{id:"dialog-title"},"\u0412\u044b \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u0442\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435 ",this.state.confirmMessage," ?"),o.a.createElement(S.a,{className:"popup-edit__actions"},o.a.createElement(N.a,{variant:"outlined",onClick:this.confirmSaveAsNew,color:"primary",className:"MuiButton-outlinedOk",startIcon:o.a.createElement(P.a,null)},"\u0414\u0430"),o.a.createElement(N.a,{variant:"outlined",onClick:function(){e.setOpenConfirm(!1)},color:"secondary",startIcon:o.a.createElement(R.a,null)},"\u041e\u0442\u043c\u0435\u043d\u0430")))))}}]),a}(o.a.Component));a(429);function ne(e){return o.a.createElement(k.a,{open:e.isOpened,onClose:e.onClose,"aria-labelledby":"dialog-title",fullWidth:!0},o.a.createElement(x.a,{id:"dialog-title"},"\u0412\u044b \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u0442\u0435 ",e.actionName," ?"),o.a.createElement(T.a,null,e.actionText&&o.a.createElement("div",{className:"popup-confirm__content"},e.actionText),o.a.createElement("span",{className:"popup-confirm__content"},"\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043d\u0435\u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c!")),o.a.createElement(S.a,{className:"popup-confirm__actions"},o.a.createElement(N.a,{variant:"outlined",onClick:function(){e.action(e.id),e.onClose()},color:"primary",className:"MuiButton-outlinedOk",startIcon:o.a.createElement(P.a,null)},"\u0414\u0430"),o.a.createElement(N.a,{variant:"outlined",onClick:e.onClose,color:"secondary",startIcon:o.a.createElement(R.a,null)},"\u041e\u0442\u043c\u0435\u043d\u0430")))}var ie=a(137),le=(a(430),function(e,t){var a=void 0;if("string"===typeof t)a=t,"time"===e&&(a=t.split("T")[1]);else if("object"===typeof t&&t&&t._isAMomentObject)switch(e){case"date":a=t.format("YYYY-MM-DD");break;case"time":a=t.format("HH:mm:00");break;case"datetime":a=t.format("YYYY-MM-DD HH:mm:00");break;default:a=void 0}return a}),re=function(e){Object(E.a)(a,e);var t=Object(O.a)(a);function a(e){var i;Object(h.a)(this,a),(i=t.call(this,e)).handleDateTimeChange=function(e){return function(t){i.setState(Object(n.a)({},e,t))}},i.handleOk=function(){var e={};for(var t in i.state.fields)e[t]="";var a=0,n=i.props.type,l=$.e.tables["".concat(n,"_meta")];for(var r in e)e[r]=i.state[r]?i.state[r]:i[r]?i[r].value:null,-1!==["datetime","date","time"].indexOf(l.dataTable[r].type)&&(e[r]=le(l.dataTable[r].type,i.state[r])),"week"===r||e[r]&&""!==e[r]||a++;l.dataTable.week&&(e.week=new te.a(e.date).getYearWeekStr()),a?i.setState({emptyDataError:!0}):(i.setState({emptyDataError:!1}),i.props.action(i.props.id,i.props.type,e),i.props.onClose())},i.state={open:i.props.isOpened,emptyDataError:!1};var l=i.props.type,r={},o=$.e.tables["".concat(l,"_meta")],s=$.a.map((function(e){return e.id})).indexOf(i.props.id);for(var c in o.dataTable)"id"!==c&&""===o.dataTable[c].defaultValue&&(r[c]={type:o.dataTable[c].type,value:o.dataTable[c].value},o.dataTable[c].initialValue&&(r[c].initialValue=Object(ie.a)(s,c,o.dataTable,"initialValue")),-1!==["select","multi-select"].indexOf(o.dataTable[c].type)&&(r[c].list=o.dataTable[c].vocabulary?o.dataTable[c].vocabulary:c));for(var u in i.state.fields=r,r)r[u].initialValue?i.state[u]=r[u].initialValue:-1!==["datetime","date","time"].indexOf(r[u].type)?i.state[u]=null:i.state[u]=void 0;return i}return Object(v.a)(a,[{key:"render",value:function(){var e=this,t=this.state.fields;return o.a.createElement(k.a,{open:this.props.isOpened,onClose:function(){e.setState({emptyDataError:!1}),e.props.onClose()},"aria-labelledby":"dialog-title",fullWidth:!0,style:{overflow:"visible"},classes:{paper:"dialog-linked-data"}},o.a.createElement(x.a,{id:"dialog-title"},o.a.createElement("div",{className:"popup-add-linked-info__title"},o.a.createElement("div",null,this.props.title?this.props.title:"\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u0438"),o.a.createElement(N.a,{variant:"outlined",onClick:this.props.onClose,color:"secondary",startIcon:o.a.createElement(R.a,null)},"\u0417\u0430\u043a\u0440\u044b\u0442\u044c"))),o.a.createElement(T.a,null,this.state.emptyDataError&&o.a.createElement("div",{className:"popup-add-linked-info__err-no-data"},"\u0414\u0430\u043d\u043d\u044b\u0435 \u0434\u043e\u043b\u0436\u043d\u044b \u0431\u044b\u0442\u044c \u043f\u043e\u043b\u043d\u043e\u0441\u0442\u044c\u044e \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u044b"),Object.keys(t).filter((function(e){return"week"!==e})).sort((function(e,a){return t[e].value>=t[a].value?1:-1})).map((function(a){var i=t[a],l=$.e["".concat(i.list,"List")];return o.a.createElement("div",{key:a,className:"popup-add-linked-info__row"},o.a.createElement("div",{className:"popup-add-linked-info__value"},i.value),("select"===i.type||"multi-select"===i.type)&&o.a.createElement(X.a,{style:{width:"100%",minHeight:"30px",marginTop:"5px"},options:Object.keys(l).sort((function(e,t){return l[e].value>=l[t].value?1:-1})).map((function(e){return{value:e,label:l[e].value}})),defaultValue:t[a].initialValue?t[a].initialValue.split(",").map((function(e){return{value:e,label:l[e].value}})):null,ref:a,inputRef:function(t){return e[a]=t},setValue:function(t){return e.setState(Object(n.a)({},a,t))},label:"\u0412\u044b\u0431\u0440\u0430\u0442\u044c...",isMulti:"multi-select"===i.type}),-1!==["fulltext","string","id"].indexOf(i.type)&&o.a.createElement(j.a,{defaultValue:t[a].initialValue,inputRef:function(t){return e[a]=t},fullWidth:!0,multiline:"fulltext"===i.type}),"date"===i.type&&o.a.createElement(B.a,{utils:J.a},o.a.createElement(U.a,{format:"YYYY-MM-DD",margin:"normal",onChange:e.handleDateTimeChange(a,i.type),value:e.state[a],inputRef:function(t){return e[a]=t},fullWidth:!0})),"time"===i.type&&o.a.createElement(B.a,{utils:J.a},o.a.createElement(q.a,{format:"HH:mm",margin:"normal",ampm:!1,minutesStep:5,onChange:e.handleDateTimeChange(a),value:e.state[a],inputRef:function(t){return e[a]=t},fullWidth:!0})),"datetime"===i.type&&o.a.createElement(B.a,{utils:J.a},o.a.createElement(K.a,{format:"YYYY-MM-DD HH:mm",ampm:!1,minutesStep:5,margin:"normal",onChange:e.handleDateTimeChange(a,i.type),value:e.state[a],inputRef:function(t){return e[a]=t},fullWidth:!0})))}))),o.a.createElement(S.a,{className:"popup-add-linked-info__actions"},o.a.createElement(N.a,{variant:"outlined",onClick:this.handleOk,color:"primary",className:"MuiButton-outlinedOk",startIcon:o.a.createElement(P.a,null)},"\u041f\u0440\u0438\u043d\u044f\u0442\u044c")))}}]),a}(o.a.Component);a(431);t.default=o.a.memo((function(e){var t=o.a.useState(!1),a=Object(l.a)(t,2),r=a[0],m=a[1],h=o.a.useState(null),v=Object(l.a)(h,2),y=v[0],E=v[1],O=o.a.useState(null),g=Object(l.a)(O,2),k=g[0],x=g[1],T=o.a.useState([]),C=Object(l.a)(T,2),j=C[0],S=C[1],_=o.a.useState(!1),w=Object(l.a)(_,2),N=w[0],V=w[1],D=o.a.useState(!1),I=Object(l.a)(D,2),M=I[0],P=I[1],F=o.a.useState({}),R=Object(l.a)(F,2),Y=R[0],A=R[1],W=o.a.useRef(null),H=function(){y.parentElement.style.display="",m(!1)},L=function(e){y.parentElement.style.display="flex",x(e.currentTarget),W.current.style.marginLeft=-1*W.current.children[1].offsetWidth+5+"px"},z=function(e,t){m(!1),e.action.apply(e,Object(i.a)(t))},B=function(){P(!0)},K=function(e){A(Object(n.a)({},e,!0))},U=function(){V(!0)},q=function(e){A({}),V(!1),P(!1),E(null),m(!1),e&&e.stopPropagation()};return o.a.createElement(o.a.Fragment,null,o.a.createElement(b.a,{class:"icn_moreH",tip:"\u041c\u0435\u043d\u044e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439",action:function(t){A({}),N&&V(!1),M&&P(!1),E(t.currentTarget),m(!0),S(e.list)}}),r&&o.a.createElement(s.a,{keepMounted:!0,anchorEl:y,open:Boolean(y),onClose:function(){H(),E(null)},className:"tbl-action-menu"},j.map((function(t,a){var n,i;return o.a.createElement("div",{key:"".concat(a)},"divider"===t.id&&o.a.createElement(u.a,{key:"menu-divider-".concat(a)}),"divider"!==t.id&&!t.isListOfItems&&o.a.createElement(c.a,{key:"menu-".concat(t.id,"-menuItem"),onClick:function(){!function(e,t){switch(E(null),e.id){case"tasks_edit":B();break;case"tasks_delete":U();break;case"discussion":case"question":K(e.id);break;default:e.action(t)}}(t,e.id)}},o.a.createElement(p.a,null,"tasks_edit"===t.id?o.a.createElement(o.a.Fragment,null,o.a.createElement(b.a,{class:"icn_".concat(t.id),tip:"\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c"}),o.a.createElement(ae,{isOpened:M,onClose:q,id:e.id,action:function(){for(var e=arguments.length,a=new Array(e),n=0;n<e;n++)a[n]=arguments[n];z(t,a)},actionNew:t.actionNew,task:e.task})):-1!==["discussion","question"].indexOf(t.id)?o.a.createElement(o.a.Fragment,null,o.a.createElement(b.a,{class:"icn_".concat(t.id),tip:t.value,type:"material-ui"}),o.a.createElement(re,{isOpened:Y[t.id]||!1,onClose:q,id:e.id,action:t.action,type:t.type})):"tasks_delete"===t.id?o.a.createElement(o.a.Fragment,null,o.a.createElement(b.a,{class:"icn_".concat(t.id),tip:t.actionName}),o.a.createElement(ne,{isOpened:N,onClose:q,id:e.id,action:t.action,actionText:"\u0422\u0435\u043c\u0430: ".concat(null===(n=e.task)||void 0===n?void 0:n.value)})):t.id?o.a.createElement(b.a,{class:"icn_".concat(t.id),action:t.actionName,actionName:t.actionName,actionText:null===(i=e.task)||void 0===i?void 0:i.value,tip:t.value}):null),o.a.createElement(d.a,{variant:"inherit",noWrap:!0},t.value)),"divider"!==t.id&&t.isListOfItems&&o.a.createElement(c.a,{key:"menu-".concat(t.id,"-menuItem"),onClick:L},o.a.createElement(p.a,null,o.a.createElement(f.a,{fontSize:"default"})),o.a.createElement(d.a,{variant:"inherit",noWrap:!0},t.value)),"divider"!==t.id&&t.isListOfItems&&o.a.createElement(s.a,{keepMounted:!0,anchorEl:k,ref:W,key:"menu".concat(t.id,"-menuItem-sub"),open:Boolean(k),onClose:function(){x(null)}},Object.keys(t.listItems).map((function(a){return o.a.createElement(c.a,{key:"menu".concat(t.id,"-menuItem-sub-").concat(a),onClick:function(){H(),E(null),x(null),t.action(e.id,a)}},t.listItems[a].value)}))))}))))}))}}]);
//# sourceMappingURL=6.97c55762.chunk.js.map