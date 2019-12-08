import React, { Component } from 'react';
import { StyleSheet, Text, View, AsyncStorage, Alert } from 'react-native'; // ←追記部分
import { Button } from 'react-native-elements';
import { connect } from 'react-redux'; // ←追記部分

import * as actions from '../actions'; // ←追記部分
class ProfileScreen extends Component {
	onResetButtonPress = async (key) => {
		// 'key'に対応するAsyncStorageの中身をリセット(非同期処理)
		await AsyncStorage.removeItem(key);

		// fetchAllReviews()を実行してHomeScreenを再描画させる
		// これしないと消したはずの評価データがHomeScreen画面上に残ってしまう
		if (key === 'allReviews') {
			// ←追記部分
			this.props.fetchAllReviews();
		}

		Alert.alert('Reset', `'${key}' in AsyncStorage has been removed.`, [ { text: 'OK' } ], { cancelable: false });
	};

	render() {
		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<View style={{ padding: 20 }}>
					<Button title='Go to Setting1Screen' onPress={() => this.props.navigation.navigate('setting1')} />
				</View>

				<View style={{ padding: 20 }}>
					<Button // ←追記部分
						title='Reset welcome page'
						buttonStyle={{ backgroundColor: 'red' }}
						onPress={() => this.onResetButtonPress('isInitialized')}
					/>
				</View>

				<View style={{ padding: 20 }}>
					<Button // ←追記部分
						title='Reset all review data'
						buttonStyle={{ backgroundColor: 'red' }}
						onPress={() => this.onResetButtonPress('allReviews')}
					/>
				</View>
			</View>
		);
	}
}

const mapStateToProps = (state) => {
	// ←追記部分
	return {
		allReviews: state.review.allReviews
	};
};

export default connect(mapStateToProps, actions)(ProfileScreen); // ←追記部分
