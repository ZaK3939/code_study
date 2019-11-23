import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { AsyncStorage } from 'react-native';
import { FETCH_ALL_REVIEWS } from '../actions/types';

function* fetchAllReviews() {
	// `AsyncStorage`から評価データを読み取る(非同期処理)
	let stringifiedAllReviews = yield AsyncStorage.getItem('allReviews');

	// 取り出した評価データをJavaScript用に変換
	let allReviews = JSON.parse(stringifiedAllReviews);

	// もし読み取った評価データがnullだったら
	if (allReviews == null) {
		// `AsyncStorage`に空の評価データを書き込む(非同期処理)
		allReviews = [];
		yield AsyncStorage.setItem('allReviews', JSON.stringify(allReviews));
	}

	// 非同期処理が終わるまで待って終わったら値を返す
	yield put({ type: FETCH_ALL_REVIEWS, payload: allReviews });
}

function* fetchALL() {
	yield takeEvery('fetch_all_reviews', fetchAllReviews);
}
export default fetchALL;
