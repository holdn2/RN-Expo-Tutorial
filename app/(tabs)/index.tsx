import Button from "@/components/Button";
import CircleButton from "@/components/CircleButton";
import EmojiList from "@/components/EmojiList";
import EmojiPicker from "@/components/EmojiPicker";
import EmojiSticker from "@/components/EmojiSticker";
import IconButton from "@/components/IconButton";
import ImageViewer from "@/components/ImageViewer";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useRef, useState } from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { captureRef } from "react-native-view-shot";

const PlaceholderImage = require("@/assets/images/background-image.png");

export default function Index() {
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const imageRef = useRef<View>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji, setPickedEmoji] = useState<
    ImageSourcePropType | undefined
  >(undefined);

  if (status === null) {
    requestPermission();
  }

  const pickImageAsync = async () => {
    // ImagePicker.launchImageLibraryAsync 메서드는 디바이스의 갤러리 등의
    // media 라이브러리에서 이미지나 비디오를 선택할 수 있게 해준다.
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // images, videos 등 타입을 선택할 수 있음.
      allowsEditing: true, // true로 설정하면 이미지를 선택할 때 유저가 이미지를 자를 수 있다.
      aspect: [8, 11], // 원하는 비율로 조정 가능. 사용자가 비율 정하고 싶을 때는 다른 라이브러리 사용해야 함.
      // iOS는 aspect 적용이 안될 수 있음. 다른 라이브러리 사용해야 할듯.
      quality: 1, // 이미지 압축 품질. 0.5면 절반 압축
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
      // console.log(result);
    } else {
      alert("You did not select any image.");
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    try {
      // captureRef와 saveToLibraryAsync를 이용해서 imageRef로 지정된 View 내부 요소들 스크린샷을 저장할 수 있다.
      const localUri = await captureRef(imageRef, {
        height: 440,
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(localUri);
      if (localUri) {
        alert("Saved!");
      }
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        {/* collapsable 을 false로 하면 해당 컴포넌트 안의 요소들만 스크린샷으로 찍을 수 있다. */}
        <View ref={imageRef} collapsable={false}>
          <ImageViewer
            imgSource={PlaceholderImage}
            selectedImage={selectedImage}
          />
          {pickedEmoji && (
            <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />
          )}
        </View>
      </View>
      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <IconButton icon="refresh" label="Reset" onPress={onReset} />
            <CircleButton onPress={onAddSticker} />
            <IconButton
              icon="save-alt"
              label="Save"
              onPress={onSaveImageAsync}
            />
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button
            theme="primary"
            label="Choose a photo"
            onPress={pickImageAsync}
          />
          <Button
            label="Use this photo"
            onPress={() => setShowAppOptions(true)}
          />
        </View>
      )}
      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
      </EmojiPicker>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
  optionsContainer: {
    position: "absolute",
    bottom: 80,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
});

// ImagePicker.launchImageLibraryAsync의 result에는 아래와 같은 반환값을 가진다.
// Android
// {
//   "assets": [
//     {
//       "assetId": null,
//       "base64": null,
//       "duration": null,
//       "exif": null,
//       "fileName": "ea574eaa-f332-44a7-85b7-99704c22b402.jpeg",
//       "fileSize": 4513577,
//       "height": 4570,
//       "mimeType": "image/jpeg",
//       "rotation": null,
//       "type": "image",
//       "uri": "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FStickerSmash-13f21121-fc9d-4ec6-bf89-bf7d6165eb69/ImagePicker/ea574eaa-f332-44a7-85b7-99704c22b402.jpeg",
//       "width": 2854
//     }
//   ],
//   "canceled": false
// }

// iOS
// {
//   "assets": [
//     {
//       "assetId": "99D53A1F-FEEF-40E1-8BB3-7DD55A43C8B7/L0/001",
//       "base64": null,
//       "duration": null,
//       "exif": null,
//       "fileName": "IMG_0004.JPG",
//       "fileSize": 2548364,
//       "height": 1669,
//       "mimeType": "image/jpeg",
//       "type": "image",
//       "uri": "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FStickerSmash-13f21121-fc9d-4ec6-bf89-bf7d6165eb69/ImagePicker/ea574eaa-f332-44a7-85b7-99704c22b402.jpeg",
//       "width": 1668
//     }
//   ],
//   "canceled": false
// }

// web
// {
//   "assets": [
//     {
//       "fileName": "some-image.png",
//       "height": 720,
//       "mimeType": "image/png",
//       "uri": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAA"
//     }
//   ],
//   "canceled": false
// }
