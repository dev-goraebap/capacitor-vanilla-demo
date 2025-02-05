import { Directory, Filesystem } from "@capacitor/filesystem";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Preferences } from "@capacitor/preferences";
import { Share } from "@capacitor/share";

import { STORAGE_KEY } from "../storage-key";

/**
 * @info 사진첩 목록 컴포넌트
 */
window.customElements.define(
    "ui-photos",
    class extends HTMLElement {
        constructor() {
            super();

            const root = this.attachShadow({ mode: "open" });

            root.innerHTML = /*html*/`
            <div part="list" id="list">
                <h2>Stored Photos</h2>
                <div id="delete-button" part="btn">Delete Photos</div>
            </div>
            `;
        }

        /**
         * @desc 컴포넌트가 연결될 때 실행되는 라이프사이클 메서드
         * - 초기 리스트를 생성
         * - "reload-list" 이벤트를 감지하여 리스트를 다시 생성
         * - 삭제 버튼 클릭 시 저장된 데이터를 제거하고 리스트를 초기화
         */
        async connectedCallback() {
            this.createList();

            const body = document.querySelector("body");
            body.addEventListener("reload-list", (event) => {
                this.removeItems();
                this.createList();
            });

            const deleteBtn = this.shadowRoot.getElementById("delete-button");
            deleteBtn.addEventListener("click", async () => {
                await Preferences.remove({ key: STORAGE_KEY });
                this.removeItems();
            });
        }

        /**
         * @desc 리스트의 모든 항목을 제거하는 메서드
         * - shadow DOM 내에서 ID가 "items"인 모든 요소를 선택하여 삭제
         * (items 요소가 ID인건 불편하지만 일단 마무리..)
         * - 삭제 후 햅틱 피드백을 제공
         */
        removeItems() {
            const items = this.shadowRoot.querySelectorAll("#items");
            if (items) {
                for (let i of items) {
                    i.remove();
                }
            }

            Haptics.impact({ style: ImpactStyle.Heavy });
        }

        /**
         * @desc 저장된 데이터를 불러와 리스트를 생성하는 메서드
         * - Preferences에서 STORAGE_KEY에 저장된 데이터를 가져옴
         * - 데이터를 파싱하여 리스트(`list` 요소)에 동적으로 항목을 추가
         * - 각 항목은 클릭 시 `shouldShare(item)` 메서드를 호출하도록 설정
         * - 항목(`div`)에는 이미지와 설명이 포함되며, ID와 클래스를 설정
         */
        async createList() {
            const { value } = await Preferences.get({ key: STORAGE_KEY });

            if (value) {
                const arr = JSON.parse(value);
                const list = this.shadowRoot.getElementById("list");

                arr.map((item) => {
                    const el = document.createElement("div");
                    el.onclick = () => this.shouldShare(item);
                    el.setAttribute("part", "item");
                    el.id = "items";
                    el.setAttribute("class", "list-item");
                    const img = document.createElement("img");
                    img.src = item.image;
                    img.setAttribute("part", "image");

                    el.innerHTML = `<div">${item.description}</div>`;
                    el.appendChild(img);

                    list.appendChild(el);
                });
            }
        }

        /**
         * @desc 선택한 항목을 공유하는 메서드
         * - 현재 시간을 기반으로 파일명을 생성
         * - 이미지 데이터를 파일로 저장 (캐시 디렉토리에 저장)
         * - 저장된 파일의 URI를 가져옴
         * - 공유 다이얼로그를 열어 사용자가 이미지를 공유할 수 있도록 함
         *
         * @param {Object} item - 공유할 항목 (이미지와 설명 포함)
         */
        shouldShare = async (item) => {
            const fileName = `${new Date().getTime()}.png`;

            await Filesystem.writeFile({
                path: fileName,
                data: item.image,
                directory: Directory.Cache,
            });
            const uriResult = await Filesystem.getUri({
                directory: Directory.Cache,
                path: fileName,
            });

            await Share.share({
                title: "Share this",
                text: item.description,
                url: uriResult.uri,
                dialogTitle: "Share your image",
            });
        };
    }
);