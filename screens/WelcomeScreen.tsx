import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Image,
	ActivityIndicator, // ←追記部分
	Dimensions,
	AsyncStorage
} from 'react-native';
import { Button } from 'react-native-elements';
import { HomeScreenProps } from '../App';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDE_DATA = [
	{
		title: 'Step: 1',
		text: 'Add your trip memory',
		uri: require('../assets/welcome_screen1.jpg')
	},
	{
		title: 'Step: 2',
		text: 'All tips on the list',
		uri: require('../assets/welcome_screen2.jpg')
	},
	{
		title: 'Step: 3',
		text: 'See the trip detail!',
		uri: require('../assets/welcome_screen3.jpg')
	}
];

class WelcomeScreen extends React.Component {
	constructor(props) {
		// ← おまじないの入力 props
		super(props); // ← おまじないの文 super(props);

		// `state`の`isInitialized`を`null`に初期化
		// `AsyncStorage`の'isInitialized'とはまた別物
		this.state = {
			isInitialized: null
		};
	}
	// ↓`await`を使う関数は文頭に`async`と書く必要がある
	async componentDidMount() {
		// `AsyncStorage`の処理を`await`(待機)してあげる
		// `await`を使うために`const`ではなく`let`にした
		let isInitializedString = await AsyncStorage.getItem('isInitialized');

		if (isInitializedString === 'true') {
			this.setState({ isInitialized: true });
			this.props.navigation.navigate('main');
		} else {
			this.setState({ isInitialized: false });
		}
	}
	onStartButtonPress = async () => {
		await AsyncStorage.setItem('isInitialized', 'true');
		this.props.navigation.navigate('main');
	};

	renderLastButton(index: number) {
		if (index === SLIDE_DATA.length - 1) {
			return (
				<Button
					style={{ padding: 10 }}
					buttonStyle={{ backgroundColor: 'deepskyblue' }}
					title='Let&#39;s get it started!'
					onPress={this.onStartButtonPress}
				/>
			);
		}
	}

	renderSlides() {
		return SLIDE_DATA.map((slide, index) => {
			return (
				<View key={index} style={styles.slideStyle}>
					<View style={styles.containerStyle}>
						<Text style={styles.textStyle}>{slide.title}</Text>
						<Text style={styles.textStyle}>{slide.text}</Text>
					</View>

					<Image style={{ flex: 2 }} resizeMode='contain' source={slide.uri} />

					<View style={styles.containerStyle}>
						{this.renderLastButton(index)}
						<Text style={styles.textStyle}>{index + 1} / 3</Text>
					</View>
				</View>
			);
		});
	}

	render() {
		if (this.state.isInitialized === null) {
			// ←追記部分
			return <ActivityIndicator size='large' />;
		}
		return (
			<ScrollView horizontal pagingEnabled style={{ flex: 1 }}>
				{this.renderSlides()}
			</ScrollView>
		);
	}
}
const styles = StyleSheet.create({
	// ←追記部分
	slideStyle: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: 'skyblue',
		width: SCREEN_WIDTH
	},
	containerStyle: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	textStyle: {
		color: 'white',
		fontSize: 20,
		padding: 5
	}
});

export default WelcomeScreen;
