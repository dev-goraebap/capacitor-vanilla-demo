import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { STORAGE_KEY } from './storage-key';

/**
 * @todo 
 * - 카메라 촬영 또는 앨범에서 이미지 선택을 통해 이미지 데이터를 가져옵니다.
 * - base64 형식으로 인코딩된 이미지 데이터를 image 태그에 표시합니다.
 * 
 * @desc 
 * 카메라 촬영, 앨범 선택의 바텀시트는 네이티브가 아니기 때문에 브라우저에서 표시가 안되지만
 * PWA Element 스크립트에서 해당 작업을 수행합니다.
 * 참조: https://capacitorjs.com/docs/web/pwa-elements
 */
document.getElementById('upload-box').addEventListener('click', async (e) => {
    const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
        promptLabelCancel: 'Cancel'
    });

    const image = document.getElementById('image');
    image.src = `data:image/jpeg;base64,${photo.base64String}`;
    image.style.display = 'block';

    document.getElementById('upload-box').style.display = 'none';
});

/**
 * @todo
 * - 엘리먼트에 저장하고있는 데이터를 가져와 스토리지에 배열 형태로 저장합니다.
 * 
 * @after 저장 후 
 * - 커스텀 이벤트 `reload-list`를 발생시킵니다. -> reload-list 이벤트를 수신하는 컴포넌트가 이후의 작업을 수행합니다.
 * - 햅틱 기능을 실행시킵니다.
 */
document.getElementById('save').addEventListener('click', async (e) => {
    const image = document.getElementById('image').getAttribute('src');
    const description = document.getElementById('description').value;

    if (!image) {
        window.alert('이미지를 선택해주세요.');
        return;
    }

    const { value } = await Preferences.get({ key: STORAGE_KEY });

    if (value) {
        const arr = JSON.parse(value);
        arr.push({ image, description, });
        await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(arr) });
    } else {
        const arr = [
            {
                image,
                description,
            },
        ];
        await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(arr) });
    }

    document.getElementById('image').style.display = 'none';
    document.getElementById('description').value = '';
    document.getElementById('upload-box').style.display = 'flex';

    const body = document.querySelector('body');
    body.dispatchEvent(new CustomEvent('reload-list'));

    await Haptics.impact({ style: ImpactStyle.Medium });
});