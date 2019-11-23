import Geocoder from 'react-native-geocoding'; // ←追記部分
import React from 'react';
import {
	Text,
	View,
	ScrollView,
	ActivityIndicator,
	Image,
	TouchableOpacity,
	Modal,
	Dimensions,
	Platform // ↑追記部分
} from 'react-native';
import MapView from 'react-native-maps';
import { HomeScreenProps } from '../App';
import { connect } from 'react-redux';

import * as actions from '../actions';

const SCREEN_WIDTH = Dimensions.get('window').width; // ←追記部分
const MAP_ZOOM_RATE = 15.0; // ←追記部分

class DetailScreen extends React.Component {
	constructor(props) {
		// ← おまじないの入力 props
		super(props); // ← おまじないの文 super(props);

		this.state = {
			isMapLoaded: false, // ←追記部分 // 地図読み込み未完了
			initialRegion: {
				latitude: 35.709, // 東京都の緯度
				longitude: 139.732, // 東京都の経度
				latitudeDelta: MAP_ZOOM_RATE, // 緯度方向のズーム度合い
				longitudeDelta: MAP_ZOOM_RATE * 2.25 // 経度方向のズーム度合い(緯度方向の2.25倍)
			},
			// モーダルを表示するか否か
			modalVisible: false, // ←追記部分
			// モーダルに表示する画像の保存場所
			modalImageURI: require('../assets/image_placeholder.png') // ←追記部分
		};
	}
	// 非同期処理が含まれている関数は最初に`async`を付ける
	async componentDidMount() {
		// ←追記ここから
		// Google map APIキーをセット
		Geocoder.init('***APIキーを入力する***');

		// Google map APIを使用して国名から緯度経度へ変換
		// 非同期処理張本人の文頭には`await`を付ける
		let result = await Geocoder.from(this.props.detailReview.country);

		// 変換結果を用いて`this.state`を更新
		this.setState({
			isMapLoaded: true, // 地図読み込み完了
			initialRegion: {
				latitude: result.results[0].geometry.location.lat, // 変換後の緯度
				longitude: result.results[0].geometry.location.lng, // 変換後の経度
				latitudeDelta: MAP_ZOOM_RATE, // 値自体は変わっていないが書く必要あり
				longitudeDelta: MAP_ZOOM_RATE * 2.25 // 値自体は変わっていないが書く必要あり
			}
		});
	} // ←追記ここまで

	renderImages() {
		// 画像が添付されていない場合の代替画像の保存場所(`uri`)
		const imageArray = [
			{ uri: require('../assets/image_placeholder.png') },
			{ uri: require('../assets/image_placeholder.png') },
			{ uri: require('../assets/image_placeholder.png') }
		];

		// 添付されている画像の数だけ繰り返す(最大3回繰り返される)
		for (let i = 0; i < this.props.detailReview.imageURIs.length; i++) {
			// 添付画像の保存場所に更新
			imageArray[i].uri = this.props.detailReview.imageURIs[i];
		}

		return (
			// 縦ではなく横方向に3つ並べる
			<View style={{ flexDirection: 'row' }}>
				{imageArray.map((image, index) => {
					return (
						<TouchableOpacity // ←追記ここから
							key={index} // keyプロパティには一意の値(ここでは`index`)を指定しなければいけない
							onPress={() =>
								this.setState({
									// 画像がタッチされたら
									modalVisible: image.isImage, // 添付画像が`true`であればモーダルを表示し、
									modalImageURI: image.uri // モーダルにその添付画像を表示する
								})}>
							<Image
								// 縦も横も同じサイズ(スマホ画面の横幅÷3)、つまり正方形画像
								style={{ height: SCREEN_WIDTH / 3, width: SCREEN_WIDTH / 3 }}
								// 表示する画像のソース
								source={image.uri}
							/>
						</TouchableOpacity> // ←追記部分
					);
				})}
			</View>
		);
	}

	render() {
		if (this.state.isMapLoaded === false) {
			// ←追記ここから
			return (
				<View style={{ flex: 1, justifyContent: 'center' }}>
					<ActivityIndicator size='large' />
				</View>
			);
		} // ←追記ここまで
		return (
			<View style={{ flex: 1 }}>
				<Modal // ←追記ここから
					visible={this.state.modalVisible} // モーダルを表示するか否か
					animationType='fade' // モーダルを表示する際のアニメーション
					transparent={false}>
					<View style={{ flex: 1, backgroundColor: 'black' }} />
					<TouchableOpacity // ←追記ここから
						// 画面一杯、かつ縦方向横方向共に中央寄せ
						style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
						// タッチされたら、モーダルを非表示にする
						onPress={() => this.setState({ modalVisible: false })}>
						<Image // ←追記ここから
							// 縦も横も同じサイズ(スマホ画面の横幅)、つまり正方形画像
							style={{ height: SCREEN_WIDTH, width: SCREEN_WIDTH }}
							// 表示する画像のソース
							source={this.state.modalImageURI}
						/>
					</TouchableOpacity>
				</Modal>
				<ScrollView>
					<View style={{ alignItems: 'center', padding: 20 }}>
						<Text style={{ fontSize: 30, padding: 5 }}>{this.props.detailReview.country}</Text>
						<Text style={{ padding: 5 }}>
							{this.props.detailReview.dateFrom} ~ {this.props.detailReview.dateTo}
						</Text>
					</View>
					<MapView // ←追記ここから
						style={{ height: SCREEN_WIDTH }} // 高さをスマホ画面横幅と一緒にする(つまり正方形サイズ)
						scrollEnabled={false} // 地図上をスクロールできないようにする
						cacheEnabled={Platform.OS === 'android'} // Androidだけキャッシュをありにする
						initialRegion={this.state.initialRegion} // `this.state`の方の`initialRegion`に合わせる
					/>
					{this.renderImages()}
				</ScrollView>
			</View>
		);
	}
}

const mapStateToProps = (state) => {
	// ←追記ここから
	return {
		detailReview: state.review.detailReview
	};
}; // ←追記ここまで

export default connect(mapStateToProps, actions)(DetailScreen); // ←括弧を忘れずに
