import { call, put, takeLatest } from 'redux-saga/effects';
import { AsyncStorage, NativeModules } from 'react-native';
import firebase, { providerTwitter, TwitterKeys } from '../config/firebase';
import { FETCH_ALL_REVIEWS, Firebaselogin } from '../actions/types';

/**
* 起動するActionを監視するメソッド
* @param {object} action                      Viewが発火したAction Object（createFetchApiAction）
* @param {object} action.payload              渡されたパラメータ
*/
const { RNTwitterSignIn } = NativeModules;

export function* fetchAllReviews() {
	try {
		// // const isLatestVersion = yield call(checkAppVersion);
		// yield put({ type: GET_SESSION, payload: SESSION });
		let stringifiedAllReviews = yield call(getSession);
		let allReviews = JSON.parse(stringifiedAllReviews);
		// もし読み取った評価データがnullだったら
		if (allReviews == null) {
			// `AsyncStorage`に空の評価データを書き込む(非同期処理)
			allReviews = [];
			yield call(setSession(allReviews));
		}
		yield put({ type: FETCH_ALL_REVIEWS, payload: allReviews });
	} catch (e) {
		console.log(11);
	}
}

export function* loginWithTwitter() {
	try {
		// firebase
		// 	.auth()
		// 	.signInWithPopup(provider)
		// 	.then((user) => {
		// 		console.log('connected to firebase');
		// 	}

		RNTwitterSignIn.init(TwitterKeys.TWITTER_CONSUMER_KEY, TwitterKeys.TWITTER_CONSUMER_SECRET);
		// also includes: name, userID & userName
		const { authToken, authTokenSecret } = yield call(RNTwitterSignIn.logIn());
		const credential = providerTwitter.credential(authToken, authTokenSecret);
		const firebaseUserCredential = yield call(firebase.auth().signInWithCredential(credential));
		console.warn(JSON.stringify(firebaseUserCredential.user.toJSON()));
	} catch (error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// The email of the user's account used.
		var email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		var credential = error.credential;
		// ...
	}
}
// 		firebase.auth().signInWithRedirect(provider);
// 		// firebase.auth().getRedirectResult().then((result) => {
// 		// 	console.log(result);
// 		// 	//TODO: ex. storeに送信, DB保存,...
// 		// });
// 		yield put({ type: Firebaselogin });
// 		console.log(222);
// 	} catch (error) {
// 		console.log(error);
// 	}
// }
/**
* API Actionを監視する
*/
export function* watchInitialCheck() {
	yield takeLatest(FETCH_ALL_REVIEWS, fetchAllReviews);
}

export function* loginWithTwitterCheck() {
	yield takeLatest(Firebaselogin, loginWithTwitter);
}

/*
 * ローカル関数部分
*/
const getSession = () => {
	return AsyncStorage.getItem('allReviews');
};

const setSession = (allReviews) => {
	AsyncStorage.setItem('allReviews', JSON.stringify(allReviews));
};
