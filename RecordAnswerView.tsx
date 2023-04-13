import React, {useRef, useState, useEffect} from 'react';
import {Text, View, Image, StyleSheet} from 'react-native';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import {windowWidth} from '../../../helpers/screenHelper';
import {Camera, CameraType, VideoCodec} from 'expo-camera';
import CountDown from './CountDown';
import {CountDownStyles} from './CountDown.styles';
import {CountDowner} from '../../../components';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{translateX: (-1 * ((windowWidth - 20) * 1.02)) / 2}],
  },
  text: {
    fontSize: 32,
    backgroundColor: '#4A86E8',
    color: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
});

export default function RecordAnswerView(props: any) {
  const {question, onComplete, onRestart} = props;
  const [showCountDown, setShowCountDown] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showRedFlash, setShowRedFlash] = useState(false);
  const [mustRestart, setMustRestart] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const cameraRef = useRef<any>();

  const saveRecording = async () => {
    try {
      await cameraRef?.current?.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.log(error);
    }
  };

  const restartRecording = () => {
    setMustRestart(true);
    cameraRef?.current?.stopRecording();
    onRestart();
  };

  const startRecording = () => {
    setIsRecording(true);
    setMustRestart(false);
    setShowRedFlash(false);
    setShowCountDown(false);
    cameraRef?.current
      ?.recordAsync({
        codec: VideoCodec.H264,
        mute: false,
        videoBitrate: 100 * 1000,
        quality: '480p',
      })
      .then((response: any) => {
        if (!mustRestart) {
          onComplete(response?.uri);
        }
      })
      .catch((error: any) => {
        console.log(error?.message);
      });
  };

  useEffect(() => {
    async function startRecordingEffect(){
      let camera = await Camera.getCameraPermissionsAsync();
      let audio = await Camera.getMicrophonePermissionsAsync();
      console.log(camera);
      console.log(audio);
      startRecording();
    }
    startRecordingEffect();
  }, []);

  return (
    <>
      <View style={{marginHorizontal: 12}}>
        <Text style={{textAlign: 'center', fontSize: 22, marginVertical: 12}}>
          Answer Recorder
        </Text>
        <Camera
          ratio={'4:3'}
          ref={cameraRef}
          type={CameraType.front}
          onCameraReady={() => setIsCameraReady(true)}
          style={{width: windowWidth - 20, height: (windowWidth - 20) * 1.02}}
          />

        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            alignContent: 'center',
            marginTop: 5,
          }}>
          <Text
            style={{
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              textAlign: 'center',
              color: '#E9E9E9',
              backgroundColor: '#333333',
              width: windowWidth / 2,
              padding: 8,
              fontSize: 13,
              marginLeft: 4,
              paddingVertical: 9,
            }}>
            Recommended Answer Time
          </Text>
          {showCountDown ? (
            <Text style={CountDownStyles.textStyle}>
              {question.recommend_answer_duration} Seconds Remaining
            </Text>
          ) : (
            <CountDown
              totalTime={question.recommend_answer_duration}
              onZero={() => {
                if (isRecording) {
                  saveRecording();
                  setShowRedFlash(false);
                  setShowCountDown(false);
                }
              }}
              onFlip={() => {
                setShowRedFlash(!showRedFlash);
              }}
            />
          )}
        </View>
          <>
            <PrimaryButton
              onPress={saveRecording}
              text={'Save'}
              containerStyle={{
                marginTop: 20,
                marginBottom: 8,
                width: windowWidth - 20,
              }}
              fontSize={20}
            />
            <PrimaryButton
              onPress={restartRecording}
              text={'Restart Recording'}
              containerStyle={{
                marginTop: 5,
                marginBottom: 10,
                width: windowWidth - 20,
              }}
              fontSize={10}
              height={32}
            />
          </>
      </View>
      <View
        style={{
          display: showRedFlash ? 'flex' : 'none',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ff000036',
        }}
        pointerEvents={'none'}></View>
    </>
  );
}
