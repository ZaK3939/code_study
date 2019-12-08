import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements'; // ←追記部分

import { ButtonGroup, ListItem } from 'react-native-elements';
import { connect } from 'react-redux'; // ←追記部分
import * as actions from '../actions'; // ←追記部分
import firebase from 'firebase';
const ALL_INDEX = 0;

const GREAT = 'sentiment-very-satisfied';
const GREAT_INDEX = 1;
const GREAT_COLOR = 'red'; // ← 追記部分

const GOOD = 'sentiment-satisfied';
const GOOD_INDEX = 2;
const GOOD_COLOR = 'orange'; // ← 追記部分

const POOR = 'sentiment-dissatisfied';
const POOR_INDEX = 3;
const POOR_COLOR = 'blue'; // ← 追記部分

class HomeScreen extends React.Component {
	constructor(props) {
		// ← おまじないの入力 props
		super(props); // ← おまじないの文 super(props);

		this.state = {
			selectedIndex: ALL_INDEX // ← 変更部分
		};
	}
	handleSignOut = () => {
		firebase.auth().signOut().then((result) => alert('sign out success')).catch((error) => console.error(error));
	};

	componentDidMount() {
		this.props.fetchAllReviews(); // Action creatorを呼ぶ
	}

	// `onPress`からの引数は`selectedReview`という名で受け止める(一旦放置。後で使用)
	onListItemPress = (selectedReview) => {
		// Action creatorを発動する
		this.props.selectDetailReview(selectedReview); // ←追記部分

		// 'detail'に飛ぶ
		this.props.navigation.navigate('detail');
	};

	renderReviews() {
		let reviewRank;

		switch (this.state.selectedIndex) {
			case GREAT_INDEX: // ← 変更部分
				reviewRank = GREAT;
				break;

			case GOOD_INDEX: // ← 変更部分
				reviewRank = GOOD;
				break;

			case POOR_INDEX: // ← 変更部分
				reviewRank = POOR;
				break;

			default:
				break;
		}
		let rankedReviews = [];

		// もし`this.state.selectedIndex`が`ALL_INDEX`だったら、
		if (this.state.selectedIndex === ALL_INDEX) {
			// ←追記部分
			// 丸ごとコピー
			rankedReviews = this.props.allReviews; // ←追記部分
			// もしそうじゃなかったら、
		} else {
			// ←追記部分
			// 繰り返し処理
			for (let i = 0; i < this.props.allReviews.length; i++) {
				if (this.props.allReviews[i].rank === reviewRank) {
					rankedReviews.push(this.props.allReviews[i]);
				}
			}
		} // ←追記部分
		return (
			<ScrollView>
				{rankedReviews.map((review, index) => {
					let reviewColor; // 新たな変数を`let`で用意(場合によって値が変わるため)

					switch (review.rank) { // もし`review`の中の`rank`項目が
						case GREAT:
							reviewColor = GREAT_COLOR; // ← 変更部分
							break;

						case GOOD:
							reviewColor = GOOD_COLOR; // ← 変更部分
							break;

						case POOR:
							reviewColor = POOR_COLOR; // ← 変更部分
							break;

						default:
							// どの条件にも当てはまらなかったら、
							break; // (特に何もせず)抜け出す
					}

					return (
						<ListItem
							key={index}
							leftIcon={{ name: review.rank, color: reviewColor }}
							title={review.country}
							subtitle={`${review.dateFrom} ~ ${review.dateTo}`}
							onPress={() => this.onListItemPress(review)} // ←追記部分
						/>
					);
				})}
			</ScrollView>
		);
	}

	onButtonGroupPress = (selectedIndex) => {
		// ←追記部分
		this.setState({
			selectedIndex: selectedIndex
			// selectedIndex: selectedIndex → selectedIndex と省略しても可
		});
	};
	render() {
		let nGreat = 0; // "Number of Great" の略。値が変更され得るので`let`で宣言
		let nGood = 0; // "Number of Good" の略。値が変更され得るので`let`で宣言
		let nPoor = 0; // "Number of Poor" の略。値が変更され得るので`let`で宣言

		// `i` が0から1ずつ増えていって(`this.props.allReviews.length`-1)になるまでの
		// 計`this.props.allReviews.length`回分繰り返す
		for (let i = 0; i < this.props.allReviews.length; i++) {
			switch (this.props.allReviews[i].rank) { // もし`this.props.allReviews[i]`の`rank`が
				case GREAT: // `GREAT`だったら、
					nGreat++; // `nGreat`を1追加
					break; // 比較を終了して抜け出す

				case GOOD: // `GOOD`だったら、
					nGood++; // `nGood`を1追加
					break; // 比較を終了して抜け出す

				case POOR: // `POOR`だったら、
					nPoor++; // `nPoor`を1追加
					break; // 比較を終了して抜け出す

				default:
					// それ以外だったら、
					break; // (特に何もせず)抜け出す
			}
		}

		const buttonList = [
			`All (${this.props.allReviews.length})`, // ←バッククォート&テンプレート文字列に変更
			`Great (${nGreat})`, // ←バッククォート&テンプレート文字列に変更
			`Good (${nGood})`, // ←バッククォート&テンプレート文字列に変更
			`Poor (${nPoor})` // ←バッククォート&テンプレート文字列に変更
		];

		return (
			<View style={{ flex: 1 }}>
				<TouchableOpacity onPress={this.handleSignOut}>
					<Text>Sign Out</Text>
				</TouchableOpacity>
				<ButtonGroup
					buttons={buttonList}
					selectedIndex={this.state.selectedIndex}
					onPress={this.onButtonGroupPress} // ←追記部分
				/>
				{this.renderReviews()}
			</View>
		);
	}
}

const mapStateToProps = (state) => {
	// `state`を引数として受け取るアロー関数
	return {
		// `state.review.allReviews`を → `this.props.allReviews`にコピー
		allReviews: state.review.allReviews
	};
};

export default connect(mapStateToProps, actions)(HomeScreen);
