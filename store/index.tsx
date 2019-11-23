import React from 'react';
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import reducers from '../reducers';
import rootSaga from '../sagas';

const sagaMiddleware = createSagaMiddleware();
const configureStore = () => {
	const middlewares = [ sagaMiddleware ];
	const store = createStore(reducers, {}, applyMiddleware(sagaMiddleware));
	sagaMiddleware.run(rootSaga);
	return store;
};

export default configureStore;
