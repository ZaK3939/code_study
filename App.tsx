import React, { Component } from 'react';
import { Text, View, Image, StatusBar, Platform, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { createAppContainer, createSwitchNavigator, NavigationScreenProp } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';

import { Provider } from 'react-redux'; // ←追記部分
import configureStore from './store'; // ←追記部分

import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen'; // ←追記部分
import AddScreen from './screens/AddScreen';
import ProfileScreen from './screens/ProfileScreen';
import Setting1Screen from './screens/Setting1Screen'; // ←追記部分
import Setting2Screen from './screens/Setting2Screen'; // ←追記部分

import LoadingScreen from './screens/LoadingScreen';
import SignUpScreen from './screens/SignUpScreen';
// import setText from './actions/review_action';
// import firebase from 'firebase';
// import firebaseConfig from './config/firebase';

// firebase.initializeApp(firebaseConfig);

class App extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const headerNavigationOptions = {
			headerStyle: {
				backgroundColor: 'deepskyblue',
				marginTop: Platform.OS === 'android' ? 24 : 0
			},
			headerTitleStyle: { color: 'white' },
			headerTintColor: 'white'
		};

		// `HomeStack`について
		const HomeStack = createStackNavigator({
			home: {
				screen: HomeScreen,
				navigationOptions: {
					...headerNavigationOptions,
					headerTitle: 'Treco', // ←アプリ名は何でも良い
					headerBackTitle: 'Home'
				}
			},
			detail: {
				screen: DetailScreen,
				navigationOptions: {
					...headerNavigationOptions,
					headerTitle: 'Detail'
				}
			}
		});
		// 1階層目以外はタブを隠す
		HomeStack.navigationOptions = ({ navigation }) => {
			return {
				tabBarVisible: navigation.state.index === 0
			};
		};

		// `AddStack`について
		const AddStack = createStackNavigator({
			add: {
				screen: AddScreen,
				navigationOptions: {
					header: null
				}
			}
		});

		// 0階層目以外(つまり全階層)はタブを隠す
		AddStack.navigationOptions = ({ navigation }) => {
			return {
				tabBarVisible: navigation.state.index === -1 // ←0じゃなくて-1
			};
		};

		// `ProfileStack`について
		const ProfileStack = createStackNavigator({
			profile: {
				screen: ProfileScreen,
				navigationOptions: {
					...headerNavigationOptions,
					headerTitle: 'Treco',
					headerBackTitle: 'Profile'
				}
			},
			setting1: {
				screen: Setting1Screen,
				navigationOptions: {
					...headerNavigationOptions,
					headerTitle: 'Setting 1'
					// headerBackTitle: 'Setting 1' は要らない。
				}
			},
			setting2: {
				screen: Setting2Screen,
				navigationOptions: {
					...headerNavigationOptions,
					headerTitle: 'Setting 2'
				}
			}
		});

		// 1階層目以外はタブを隠す
		ProfileStack.navigationOptions = ({ navigation }) => {
			return {
				tabBarVisible: navigation.state.index === 0
			};
		};

		// `HomeStack`, `AddStack`, `ProfileStack`を繋げて`MainTab`に
		const MainTab = createBottomTabNavigator(
			{
				homeStack: {
					screen: HomeStack,
					navigationOptions: {
						tabBarIcon: ({ tintColor }) => (
							<Image
								style={{ height: 25, width: 25, tintColor: tintColor }}
								source={require('./assets/home.png')}
							/>
						),
						title: 'Home'
					}
				},
				addStack: {
					screen: AddStack,
					navigationOptions: {
						tabBarIcon: () => (
							<Image
								style={{ height: 60, width: 60, tintColor: 'deepskyblue' }}
								source={require('./assets/add.png')}
							/>
						),
						title: ''
					}
				},
				profileStack: {
					screen: ProfileStack,
					navigationOptions: {
						tabBarIcon: ({ tintColor }) => (
							<Image
								style={{ height: 25, width: 25, tintColor: tintColor }}
								source={require('./assets/profile.png')}
							/>
						),
						title: 'Profile'
					}
				}
			},
			{
				swipeEnabled: false // Android用
			}
		);
		const NavigatorTab = createAppContainer(
			createSwitchNavigator({
				welcome: { screen: WelcomeScreen },
				main: { screen: MainTab }
			})
		);
		const AuthenticationNavigator = createAppContainer(
			createSwitchNavigator(
				{
					Loading: { screen: LoadingScreen },
					SignUp: { screen: SignUpScreen },
					welcome: { screen: WelcomeScreen },
					main: { screen: MainTab }
				},
				{
					initialRouteName: 'Loading'
				}
			)
		);
		const store = configureStore();
		return (
			<Provider store={store}>
				<View style={styles.container}>
					<StatusBar barStyle='light-content' />
					<AuthenticationNavigator />
					{/* <NavigatorTab /> */}
				</View>
			</Provider> // ←追記部分
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		// ↓この文消さないと`react-navigation`が上手く動かず、画面真っ白になっちゃう
		//alignItems: 'center',
		justifyContent: 'center'
	}
});
const mapStateToProps = (state) => {
	// ←追記部分
	return { state };
};

export default App;
