/**
 * @info 공용 네비게이션바 컴포넌트
 */
window.customElements.define(
    'ui-navbar',
    class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = /*html*/`
            <style>
                :host {
                    position: relative;
                    display: block;
                    background-color: #333;
                    padding: 15px !important;
                    background-color: var(--nav-bg);
                    position: fixed;
                    width: 100%;
                    top: env(safe-area-inset-top);
                }
                .nav {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    color: white;
                }
                #title {
                    
                }
                #start {
                    position: absolute;
                    left: 15px;
                }
                #end {
                    position: absolute;
                    right: 15px;
                }
            </style>
            <div class="nav">
                <div id="start"><slot name="start"></slot></div>
                <div id="title"><slot name="title"></slot></div>
                <div id="end"><slot name="end"></slot></div>
            </div>
            `;
        }
    }
);