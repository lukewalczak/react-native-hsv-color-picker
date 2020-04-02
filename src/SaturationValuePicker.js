import React, { Component } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import tinycolor from 'tinycolor2';
import normalizeValue from './utils';

export default class SaturationValuePicker extends Component {
  constructor(props) {
    super(props);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const { onPress } = this.props;
        const { saturation, value } = this.computeSatValPress(evt);
        this.dragStartValue = {
          saturation,
          value,
        };

        if (onPress) {
          onPress({
            ...this.computeSatValPress(evt),
            nativeEvent: evt.nativeEvent,
          });
        }

        this.fireDragEvent('onDragStart', gestureState);
      },
      onPanResponderMove: (evt, gestureState) => {
        this.fireDragEvent('onDragMove', gestureState);
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        this.fireDragEvent('onDragEnd', gestureState);
      },
      onPanResponderTerminate: (evt, gestureState) => {
        this.fireDragEvent('onDragTerminate', gestureState);
      },
      onShouldBlockNativeResponder: () => true,
    });
  }

  getCurrentColor() {
    const { hue = 0, saturation = 1, value = 1 } = this.props;
    return tinycolor(`hsv ${hue} ${saturation} ${value}`).toHexString();
  }

  computeSatValDrag(gestureState) {
    const { dx, dy } = gestureState;
    const { size } = this.props;
    const { saturation, value } = this.dragStartValue;
    const diffx = dx / size.width;
    const diffy = dy / size.height;
    return {
      saturation: normalizeValue(saturation + diffx),
      value: normalizeValue(value - diffy),
    };
  }

  computeSatValPress(event) {
    const { nativeEvent } = event;
    const { locationX, locationY } = nativeEvent;
    const { size } = this.props;
    return {
      saturation: normalizeValue(locationX / size.width),
      value: 1 - normalizeValue(locationY / size.height),
    };
  }

  fireDragEvent(eventName, gestureState) {
    const { [eventName]: event } = this.props;
    if (event) {
      event({
        ...this.computeSatValDrag(gestureState),
        gestureState,
      });
    }
  }

  render() {
    const {
      size,
      sliderSize = 24,
      hue = 0,
      value = 1,
      saturation = 1,
      containerStyle = {},
      borderRadius = 0,
    } = this.props;

    return (
      <View
        style={[
          styles.container,
          containerStyle,
          {
            height: size.height + sliderSize,
            width: size.width + sliderSize,
          },
        ]}
        {...this.panResponder.panHandlers}
      >
        <LinearGradient
          style={[styles.gradientContainer, {
            borderRadius,
          }]}
          colors={[
            '#fff',
            tinycolor(`hsl ${hue} 1 0.5`).toHexString(),
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        >
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0)',
              '#000',
            ]}
          >
            <View
              style={{
                height: size.height,
                width: size.width,
              }}
            />
          </LinearGradient>
        </LinearGradient>
        <View
          pointerEvents="none"
          style={[
            styles.slider,
            {
              width: sliderSize,
              height: sliderSize,
              borderRadius: sliderSize / 2,
              borderWidth: sliderSize / 10,
              backgroundColor: this.getCurrentColor(),
              transform: [
                { translateX: size.width * saturation },
                { translateY: size.height * (1 - value) },
              ],
            },
          ]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    overflow: 'hidden',
  },
  slider: {
    top: 0,
    left: 0,
    position: 'absolute',
    borderColor: '#fff',
  },
});
