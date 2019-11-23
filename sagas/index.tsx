import { all } from 'redux-saga/effects';
import fetchALL from './fetchallreviews';

export default function* rootSaga() {
	yield all([ ...fetchALL ]);
}
