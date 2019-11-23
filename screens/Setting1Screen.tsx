import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import { HomeScreenProps } from '../App';

class Setting1Screen extends Component<HomeScreenProps> {
	render() {
		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<Text>This is Setting1Screen</Text>

				<Button title='Go to Setting2Screen' onPress={() => this.props.navigation.navigate('setting2')} />
			</View>
		);
	}
}

export default Setting1Screen;
