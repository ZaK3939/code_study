import { SELECT_DETAIL_REVIEW } from './types';

export const selectDetailReview = (selectedReview) => {
	// ←追記ここから
	return { type: SELECT_DETAIL_REVIEW, payload: selectedReview };
}; // ←追記ここまで
