import { all } from 'redux-saga/effects';
import { watchInitialCheck, loginWithTwitterCheck } from './fetchallreviews';

export default function* rootSaga() {
	yield all([ watchInitialCheck(), loginWithTwitterCheck() ]);
}
