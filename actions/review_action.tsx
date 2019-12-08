import { FETCH_ALL_REVIEWS, SELECT_DETAIL_REVIEW, Firebaselogin } from './types';
import { AsyncStorage } from 'react-native'; // ←追記部分

export const fetchAllReviews = () => {
	return { type: FETCH_ALL_REVIEWS, payload: allReviewsTmp };
};

export const selectDetailReview = (selectedReview) => {
	// ←追記ここから
	return { type: SELECT_DETAIL_REVIEW, payload: selectedReview };
}; // ←追記ここまで

export const loginWithTwitter = () => {
	console.log(2);
	return { type: Firebaselogin };
};

const GREAT = 'sentiment-very-satisfied'; // ←忘れずに
const GOOD = 'sentiment-satisfied'; // ←忘れずに
const POOR = 'sentiment-dissatisfied'; // ←忘れずに

const allReviewsTmp = [];
