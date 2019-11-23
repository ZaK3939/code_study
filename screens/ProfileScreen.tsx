import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-elements'; // ←追記部分
import { HomeScreenProps } from '../App';

class ProfileScreen extends Component<HomeScreenProps> {
	render() {
		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<Text>This is ProfileScreen</Text>

				<Button // ←追記部分
					title='Go to Setting1Screen'
					onPress={() => this.props.navigation.navigate('setting1')}
				/>
			</View>
		);
	}
}

export default ProfileScreen;
