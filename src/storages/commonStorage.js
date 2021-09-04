import { createStore, combineReducers } from 'redux';

// reducers
function ALERT(state = {}, action) {
  switch (action.type) {
    case 'SHOW_ALERT':
      state.alert = { status: action.status, message: action.message };
      return state;
    case 'HIDE_ALERT':
      delete state.alert;
      return state;
    default:
      return state;
  }
}

function STATE(state = {}, action) {
  switch (action.type) {
    case 'SET_DATALOADING':
      state.dataLoading = action.stage; // chain: root, meta, data => clear
      return state;
    case 'UNSET_DATALOADING':
      delete state.dataLoading;
      return state;
    default:
      return state;
  }
}

function TABLE(state = {}, action) {
  switch (action.type) {
    case 'SET_TABLENAME':
      state.tableName = action.tableName;
      return state;
    default:
      return state;
  }
}

function META(state = {}, action) {
  switch (action.type) {
    case 'INCREASE':
      state.count++;
      return state;
    case 'ZERO':
      state.count = 0;
      return state;
    default:
      return state;
  }
}

function DATA(state = {}, action) {
  switch (action.type) {
    case 'REDRAW':
      state.redraw = action.redraw;
      return state;
    default:
      return state;
  }
}

function UPD(state = {}, action) {
  switch (action.type) {
    case 'UPDATE':
      state.update = action.update;
      return state;
    default:
      return state;
  }
}

const storage = {
  state: createStore(combineReducers({ STATE })),
  alert: createStore(combineReducers({ ALERT })),
  data: createStore(combineReducers({ DATA })),
  upd: createStore(combineReducers({ UPD })),
  meta: createStore(combineReducers({ META }), { META: { count: 0 } }),
  table: createStore(combineReducers({ TABLE })),
};

export default storage;
