import { createSwitchNavigator, createAppContainer } from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import LoadingScreen from '../screens/LoadingScreen';
import SignUpScreen from '../screens/SignUpScreen';

// 参考
// https://reactnavigation.org/docs/en/stack-navigator.html#routeconfigs
const AuthenticationNavigator = createAppContainer(
	createSwitchNavigator(
		{
			Loading: { screen: LoadingScreen },
			SignUp: { screen: SignUpScreen },
			Home: { screen: HomeScreen }
		},
		{
			initialRouteName: 'Loading'
		}
	)
);

export default AuthenticationNavigator;
