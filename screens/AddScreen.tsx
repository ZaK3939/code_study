import _ from 'lodash'; // ←追記部分
import Geocoder from 'react-native-geocoding'; // ←追記部分
import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Picker,
	DatePickerIOS,
	TouchableOpacity,
	Image,
	Dimensions,
	LayoutAnimation,
	UIManager,
	Platform,
	AsyncStorage // ←追記部分
} from 'react-native';
import { Header, ListItem, Icon, Button } from 'react-native-elements';
import DatePicker from 'react-native-datepicker'; // ←追記部分
import { GoogleAPI } from './APIConfig';
import MapView from 'react-native-maps';
import ImagePicker from 'react-native-image-picker';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { connect } from 'react-redux'; // ←追記部分

import * as actions from '../actions'; // ←追記部分

// 評価ランクに関する定数
const GREAT = 'sentiment-very-satisfied'; // ←追記部分
const GREAT_COLOR = 'red'; // ←追記部分
const GOOD = 'sentiment-satisfied'; // ←追記部分
const GOOD_COLOR = 'orange'; // ←追記部分
const POOR = 'sentiment-dissatisfied'; // ←追記部分
const POOR_COLOR = 'blue'; // ←追記部分

// スマホ画面の横幅の定数
const SCREEN_WIDTH = Dimensions.get('window').width; // ←追記部分

// 地図のズームサイズ
const MAP_ZOOM_RATE = 15.0; // ←追記部分

const INITIAL_STATE = {
	// ←追記部分
	// プルダウンメニューが開いてるか閉じてるか
	countryPickerVisible: false,
	dateFromPickerVisible: false,
	dateToPickerVisible: false,

	// プルダウンメニューで選択された日付データを保存
	chosenDateFrom: new Date().toLocaleString('ja'),
	chosenDateTo: new Date().toLocaleString('ja'),

	// 旅行の評価データ用
	tripDetail: {
		country: 'Select Counrty',
		dateFrom: 'From',
		dateTo: 'To',
		imageURIs: [
			require('../assets/add_image_placeholder.png'),
			require('../assets/add_image_placeholder.png'),
			require('../assets/add_image_placeholder.png')
		],
		rank: ''
	},

	// 地図描画用
	initialRegion: {
		latitude: 35.658581, // 東京タワー
		longitude: 139.745433, // 東京タワー
		latitudeDelta: MAP_ZOOM_RATE,
		longitudeDelta: MAP_ZOOM_RATE * 2.25
	}
};

class AddScreen extends React.Component {
	constructor(props) {
		// ←追記部分
		super(props);

		// `this.state`の中身を`INITIAL_STATE`で初期化
		this.state = INITIAL_STATE;
	}
	// 画面上で何か再描画される度に滑らかなアニメーションを適用する
	componentDidUpdate() {
		// ←追記部分
		UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
		LayoutAnimation.easeInEaseOut();
	}
	// 国選択のプルダウンメニューを描画
	renderCountryPicker() {
		// もし国選択のプルダウンメニューがtrueなら、
		if (this.state.countryPickerVisible === true) {
			// プルダウンメニューを描画
			return (
				<Picker
					// 現在の値がPicker内で最初から選択されてるようにする
					selectedValue={this.state.tripDetail.country}
					// Picker内で選択されてる値が変わったら、
					onValueChange={async (itemValue) => {
						// Google map APIキーをセットする
						Geocoder.init(GoogleAPI); // ←追記部分

						// 国名から緯度経度を取得する
						let result = await Geocoder.from(itemValue); // ←追記部分

						// `this.state.tripDetail.country`に引数の`itemValue`をセットする
						// `this.state.initialRegion`に緯度経度と地図のズーム度合いをセットする
						this.setState({
							...this.state,
							tripDetail: {
								...this.state.tripDetail,
								country: itemValue
							},
							initialRegion: {
								// ←追記部分
								latitude: result.results[0].geometry.location.lat,
								longitude: result.results[0].geometry.location.lng,
								latitudeDelta: MAP_ZOOM_RATE,
								longitudeDelta: MAP_ZOOM_RATE * 2.25
							}
						});
					}}>
					<Picker.Item label={INITIAL_STATE.tripDetail.country} value={INITIAL_STATE.tripDetail.country} />
					<Picker.Item label='China' value='China' />
					<Picker.Item label='UK' value='UK' />
					<Picker.Item label='USA' value='USA' />
				</Picker>
			);
		}
	}
	// 出国日のプルダウンメニューを描画
	renderDateFromPicker() {
		// ←追記部分
		if (this.state.dateFromPickerVisible) {
			switch (Platform.OS) {
				// iOSだったら、
				case 'ios':
					return (
						<DatePickerIOS
							mode='date'
							date={new Date(this.state.chosenDateFrom)}
							onDateChange={(date) => {
								// `date` = "Thu Oct 04 2018 17:00:00 GMT+0900 (JST)"

								// "Thu Oct 04 2018 17:00:00 GMT+0900 (JST)" ---> "2018/10/04 17:00:00"
								const dateString = date.toLocaleString('ja');

								this.setState({
									tripDetail: {
										...this.state.tripDetail,
										dateFrom: dateString.split(' ')[0] // "2018/10/04 17:00:00" ---> "2018/10/04"
									},
									chosenDateFrom: dateString,
									chosenDateTo: dateString // 帰国日の初期選択日付を出国日にセットする
								});
							}}
						/>
					);

				// Androidだったら、
				case 'android':
					return (
						<DatePicker
							mode='date'
							date={new Date(this.state.chosenDateFrom)}
							format='YYYY-MM-DD'
							confirmBtnText='OK'
							cancelBtnText='キャンセル'
							onDateChange={(date) => {
								// `date` = "2018-10-04 17:00"

								// "2018-10-04 17:00" ---> "2018-10-04 17:00:00"
								let dateString = `${date}:00`;

								// "2018-10-04 17:00:00" ---> "2018/10/04 17:00:00"
								dateString = dateString.replace(/-/g, '/');

								this.setState({
									tripDetail: {
										...this.state.tripDetail,
										dateFrom: dateString.split(' ')[0] // "2018/10/04 17:00:00" ---> "2018/10/04"
									},
									chosenDateFrom: dateString,
									chosenDateTo: dateString // 帰国日の初期選択日付を出国日にセットする
								});
							}}
						/>
					);

				// iOSでもAndroidでもなかったら、
				default:
					// 何も描画しない
					return <View />;
			}
		}
	}
	renderDateToPicker() {
		// ←追記部分
		if (this.state.dateToPickerVisible) {
			switch (Platform.OS) {
				// iOSだったら、
				case 'ios':
					return (
						<DatePickerIOS
							mode='date'
							minimumDate={new Date(this.state.chosenDateFrom)} // ←変更点!
							date={new Date(this.state.chosenDateTo)}
							onDateChange={(date) => {
								// `date` = "Thu Oct 04 2018 17:00:00 GMT+0900 (JST)"

								// "Thu Oct 04 2018 17:00:00 GMT+0900 (JST)" ---> "2018/10/04 17:00:00"
								const dateString = date.toLocaleString('ja');

								this.setState({
									tripDetail: {
										...this.state.tripDetail,
										dateTo: dateString.split(' ')[0] // "2018/10/04 17:00:00" ---> "2018/10/04"
									},
									chosenDateTo: dateString
								});
							}}
						/>
					);

				// Androidだったら、
				case 'android':
					return (
						<DatePicker
							mode='date'
							minDate={new Date(this.state.chosenDateFrom)} // ←変更点!
							date={new Date(this.state.chosenDateTo)}
							format='YYYY-MM-DD'
							confirmBtnText='OK'
							cancelBtnText='キャンセル'
							onDateChange={(date) => {
								// `date` = "2018-10-04 17:00"

								// "2018-10-04 17:00" ---> "2018-10-04 17:00:00"
								let dateString = `${date}:00`;

								// "2018-10-04 17:00:00" ---> "2018/10/04 17:00:00"
								dateString = dateString.replace(/-/g, '/');

								this.setState({
									tripDetail: {
										...this.state.tripDetail,
										dateTo: dateString.split(' ')[0] // "2018/10/04 17:00:00" ---> "2018/10/04"
									},
									chosenDateTo: dateString
								});
							}}
						/>
					);

				// iOSでもAndroidでもなかったら、
				default:
					// 何も描画しない
					return <View />;
			}
		}
	}
	// 選択された国の地図を描画
	renderMap() {
		// ←追記部分
		// 国が選択されたとき(国名が`INITIAL_STATE`じゃないとき)かつ
		// 国選択プルダウンメニューが閉じられたら、
		if (
			this.state.tripDetail.country !== INITIAL_STATE.tripDetail.country &&
			this.state.countryPickerVisible === false
		) {
			// 地図を描画する
			return (
				<MapView
					style={{ height: SCREEN_WIDTH }}
					scrollEnabled={false}
					cacheEnabled={Platform.OS === 'android'}
					initialRegion={this.state.initialRegion}
				/>
			);
		}
	}
	// // カメラロールへアクセス
	// onImagePress = async (index) => {
	// 	// ←追記部分
	// 	// スマホ内に保存されてるカメラロールアクセス許可状況を読み取る
	// 	// let cameraRollPermission = await AsyncStorage.getItem('cameraRollPermission');
	// 	// console.log(cameraRollPermission);
	// 	// // もしまだ許可してなかったら、
	// 	// if (cameraRollPermission !== RESULTS.GRANTED) {
	// 	// 	// 許可を取ってみる
	// 	// 	let permission = await check(ios.permission.);
	// 	// 	console.log(permission);
	// 	// 	// もしユーザーが許可しなかったら、
	// 	// 	if (permission !== RESULTS.GRANTED) {
	// 	// 		// 何もしない
	// 	// 		return;
	// 	// 	}

	// 	// 	// (もしユーザーが許可したら、)カメラロールアクセス許可状況をスマホ内に保存する
	// 	// 	await AsyncStorage.setItem('cameraRollPermission', permission);
	// 	// }
	// 	let options = {
	// 		mediaTypes: 'images', // 画像のみ選択可(ビデオは選択不可)
	// 		allowsEditing: true
	// 	};
	// 	// カメラロールを起動する
	// 	let result = await ImagePicker.launchCamera(options, (response) => {
	// 		console.log('Response = ', response);
	// 	});

	// 	// ユーザーが画像選択をキャンセルしなかったら(ちゃんと画像を選んだら)
	// 	if (!result.cancelled) {
	// 		// 新たな配列に今の`this.state.tripDetail.imageURIs`をコピーし、該当の要素だけURIを上書きする
	// 		const newImageURIs = this.state.tripDetail.imageURIs;
	// 		newImageURIs[index] = { uri: result.uri };

	// 		// 上書き済みの新たな配列を`this.state.tripDetail.imageURIs`にセットする
	// 		this.setState({
	// 			...this.state,
	// 			tripDetail: {
	// 				...this.state.tripDetail,
	// 				imageURIs: newImageURIs
	// 			}
	// 		});
	// 	}
	// };

	// // 写真を添付するためのミニウィンドウを描画
	// renderImagePicker() {
	// 	// 国が選択されたとき(国名が`INITIAL_STATE`じゃないとき)かつ
	// 	// 国選択プルダウンメニューが閉じられたら、
	// 	if (
	// 		this.state.tripDetail.country !== INITIAL_STATE.tripDetail.country &&
	// 		this.state.countryPickerVisible === false
	// 	) {
	// 		// 写真を添付するためのミニウィンドウを描画する
	// 		return (
	// 			// 画像を横に並べる
	// 			<View style={{ flexDirection: 'row' }}>
	// 				{this.state.tripDetail.imageURIs.map((imageURI, index) => {
	// 					return (
	// 						<TouchableOpacity // 画像をタッチ可能にする(onPress効果を付与する)
	// 							key={index}
	// 							onPress={() => this.onImagePress(index)}>
	// 							<Image // `imageURIs`の数だけ画像を敷き詰める(サイズは正方形)
	// 								style={{
	// 									width: SCREEN_WIDTH / this.state.tripDetail.imageURIs.length,
	// 									height: SCREEN_WIDTH / this.state.tripDetail.imageURIs.length
	// 								}}
	// 								source={imageURI}
	// 							/>
	// 						</TouchableOpacity>
	// 					);
	// 				})}
	// 			</View>
	// 		);
	// 	}
	// }
	// レビューボタンを描画
	renderReviewButtons() {
		// ←追記部分
		// 国が選択されたとき(国名が`INITIAL_STATE`じゃないとき)かつ
		// 国選択プルダウンメニューが閉じられたら、
		if (
			this.state.tripDetail.country !== INITIAL_STATE.tripDetail.country &&
			this.state.countryPickerVisible === false
		) {
			return (
				<View
					style={{
						flexDirection: 'row', // 横に並べる
						justifyContent: 'center', // 中央揃え
						paddingTop: 10 // 上側に少し余白を持たせる
					}}>
					<Icon
						raised
						size={40}
						name={GREAT}
						// `this.state.tripDetail.rank`がGREATなら赤色、それ以外なら灰色
						color={this.state.tripDetail.rank === GREAT ? GREAT_COLOR : 'gray'}
						// 押されたら`this.state.tripDetail.rank`をGREATにセット
						onPress={() =>
							this.setState({
								...this.state,
								tripDetail: {
									...this.state.tripDetail,
									rank: GREAT
								}
							})}
					/>
					<Icon
						raised
						size={40}
						name={GOOD}
						// `this.state.tripDetail.rank`がGOODならオレンジ色、それ以外なら灰色
						color={this.state.tripDetail.rank === GOOD ? GOOD_COLOR : 'gray'}
						// 押されたら`this.state.tripDetail.rank`をGOODにセット
						onPress={() =>
							this.setState({
								...this.state,
								tripDetail: {
									...this.state.tripDetail,
									rank: GOOD
								}
							})}
					/>
					<Icon
						raised
						size={40}
						name={POOR}
						// `this.state.tripDetail.rank`がPOORなら青色、それ以外なら灰色
						color={this.state.tripDetail.rank === POOR ? POOR_COLOR : 'gray'}
						// 押されたら`this.state.tripDetail.rank`をPOORにセット
						onPress={() =>
							this.setState({
								...this.state,
								tripDetail: {
									...this.state.tripDetail,
									rank: POOR
								}
							})}
					/>
				</View>
			);
		}
	}
	onAddButtonPress = async () => {
		// 添付されてる写真のURIだけ追加して、未添付を表す`require('../assets/add_image_placeholder.png')`は追加しない
		const newImageURIs = [];
		for (let i = 0; i < this.state.tripDetail.imageURIs.length; i++) {
			if (this.state.tripDetail.imageURIs[i] !== require('../assets/add_image_placeholder.png')) {
				newImageURIs.push(this.state.tripDetail.imageURIs[i]);
			}
		}

		// 添付されてる写真のURIだけをもつ`tripDetail`を作る
		const tripDetail = this.state.tripDetail;
		tripDetail.imageURIs = newImageURIs;

		// スマホ内に保存済みの旅行情報を読み取る
		let stringifiedAllReviews = await AsyncStorage.getItem('allReviews');
		let allReviews = JSON.parse(stringifiedAllReviews);

		// もしまだ一つも旅行情報が無ければ、
		if (allReviews === null) {
			// 空の配列をセットする
			allReviews = [];
		}

		// 今回の旅行情報を配列の末尾に追加する
		allReviews.push(tripDetail);

		// 今回の旅行情報が末尾に追加された配列をスマホ内に保存する
		try {
			// 一度トライする
			await AsyncStorage.setItem('allReviews', JSON.stringify(allReviews));
		} catch (e) {
			// もし何かエラーがあったら表示する
			console.warn(e);
		}

		// ここでAction creatorを呼んでHomeScreenを再描画させる
		this.props.fetchAllReviews();

		// `this.state`をリセットする
		this.setState({
			...INITIAL_STATE,
			tripDetail: {
				...INITIAL_STATE.tripDetail,
				imageURIs: [
					require('../assets/add_image_placeholder.png'),
					require('../assets/add_image_placeholder.png'),
					require('../assets/add_image_placeholder.png')
				]
			}
		});

		// HomeScreenに遷移する
		this.props.navigation.navigate('home');
	};

	// 追加ボタンを描画
	renderAddButton() {
		// とりあえず入力は完了しているということにしておく
		let isComplete = true;

		// `this.state.tripDetail`のキーの数だけ繰り返す
		Object.keys(this.state.tripDetail).forEach((key) => {
			// 'imageURIs'以外の`key`で
			// `this.state.tripDetail`の各値が`INITIAL_STATE.tripDetail`と(一つでも)同じだったら、
			if (key !== 'imageURIs' && this.state.tripDetail[key] === INITIAL_STATE.tripDetail[key]) {
				// それはまだ入力が完了していないということ('imageURIs'は必須ではない)
				isComplete = false;
			}
		});

		return (
			<View style={{ padding: 20 }}>
				<Button
					title='Add'
					color='white'
					buttonStyle={{ backgroundColor: 'deepskyblue' }}
					onPress={() => this.onAddButtonPress()} // ←追記部分
					disabled={isComplete === false} // 入力がまだ完了してなければボタンを押せないようにする
				/>
			</View>
		);
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<Header // ←追記部分
					statusBarProps={{ barStyle: 'light-content' }} // ステータスバーの色
					backgroundColor='deepskyblue' // ヘッダーの色
					leftComponent={{
						// 左上のアイコン
						icon: 'close',
						color: 'white',
						onPress: () => {
							// `this.state`を`INITIAL_STATE`にリセット
							this.setState({
								...INITIAL_STATE, // `INITIAL_STATE`の中身をここに展開
								tripDetail: {
									...INITIAL_STATE.tripDetail, // `INITIAL_STATE.tripDetail`の中身をここに展開
									imageURIs: [
										require('../assets/add_image_placeholder.png'),
										require('../assets/add_image_placeholder.png'),
										require('../assets/add_image_placeholder.png')
									]
								}
							});

							// HomeScreenに戻る
							this.props.navigation.navigate('home');
						}
					}}
					centerComponent={{ text: 'Add', style: styles.headerStyle }} // ヘッダータイトル
				/>

				<ScrollView style={{ flex: 1 }}>
					<ListItem
						title='Country: '
						subtitle={
							<View style={styles.listItemStyle}>
								<Text
									style={{
										fontSize: 18,
										// 現在の選択肢`this.state`が`INITIAL_STATE`のままなら灰色、それ以外の選択肢なら黒色
										color:
											this.state.tripDetail.country === INITIAL_STATE.tripDetail.country
												? 'gray'
												: 'black'
									}}>
									{this.state.tripDetail.country}
								</Text>
							</View>
						}
						// プルダウンメニューが開いてれば上矢印、閉じてれば下矢印
						rightIcon={{
							name: this.state.countryPickerVisible === true ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
						}}
						// 項目欄ListItemを押されたら、
						onPress={() =>
							this.setState({
								countryPickerVisible: !this.state.countryPickerVisible, // 国選択のプルダウンメニューの開閉を切り替え
								dateFromPickerVisible: false, // 出国日選択のプルダウンメニューは閉じる
								dateToPickerVisible: false // 帰国日選択のプルダウンメニューは閉じる
							})}
					/>
					{this.renderCountryPicker()}
					<ListItem // ←追記部分
						title='Date: '
						subtitle={
							<View style={styles.listItemStyle}>
								<Text
									style={{
										fontSize: 18,
										// 現在の選択肢`this.state`が`INITIAL_STATE`のままなら灰色、それ以外の選択肢なら黒色
										color:
											this.state.tripDetail.dateFrom === INITIAL_STATE.tripDetail.dateFrom
												? 'gray'
												: 'black'
									}}>
									{this.state.tripDetail.dateFrom}
								</Text>
							</View>
						}
						// プルダウンメニューが開いてれば上矢印、閉じてれば下矢印
						rightIcon={{
							name: this.state.dateFromPickerVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
						}}
						// 項目欄ListItemを押されたら、
						onPress={() =>
							this.setState({
								countryPickerVisible: false, // 国選択のプルダウンメニューは閉じる
								dateFromPickerVisible: !this.state.dateFromPickerVisible, // 出国日選択のプルダウンメニューの開閉を切り替え
								dateToPickerVisible: false // 帰国日選択のプルダウンメニューは閉じる
							})}
					/>
					{this.renderDateFromPicker()}
					<ListItem // ←追記部分
						title='' // ←変更点!
						subtitle={
							<View style={styles.listItemStyle}>
								<Text
									style={{
										fontSize: 18,
										// 現在の選択肢`this.state`が`INITIAL_STATE`のままなら灰色、それ以外の選択肢なら黒色
										color:
											this.state.tripDetail.dateTo === INITIAL_STATE.tripDetail.dateTo
												? 'gray'
												: 'black'
									}}>
									{this.state.tripDetail.dateTo}
								</Text>
							</View>
						}
						// プルダウンメニューが開いてれば上矢印、閉じてれば下矢印
						rightIcon={{
							name: this.state.dateToPickerVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
						}}
						// 項目欄ListItemを押されたら、
						onPress={() =>
							this.setState({
								countryPickerVisible: false, // 国選択のプルダウンメニューは閉じる
								dateFromPickerVisible: false, // 出国日選択のプルダウンメニューは閉じる
								dateToPickerVisible: !this.state.dateToPickerVisible // 帰国日日選択のプルダウンメニューの開閉を切り替え
							})}
					/>
					{this.renderDateToPicker()}
					{this.renderMap()}
					{/* {this.renderImagePicker()} */}
					{this.renderReviewButtons()}
					{this.renderAddButton()}
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	// ←追記部分
	headerStyle: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold'
	},
	listItemStyle: {
		// ←追記部分
		paddingTop: 5,
		paddingLeft: 20
	}
});

const mapStateToProps = (state) => {
	// ←追記部分
	return {
		allReviews: state.review.allReviews
	};
};

export default connect(mapStateToProps, actions)(AddScreen); // ←追記部分
