import { Platform } from "obsidian";
import { CustomFrameSettings, CustomFramesSettings, getId } from "./settings";

export class CustomFrame {

    private readonly settings: CustomFramesSettings;
    private readonly data: CustomFrameSettings;
    private frame: HTMLIFrameElement | any;

    constructor(settings: CustomFramesSettings, data: CustomFrameSettings) {
        this.settings = settings;
        this.data = data;
    }

    create(parent: HTMLElement, url: string = undefined, additionalStyle: string = undefined, urlSuffix: string = undefined): void {
        let style = `padding: ${this.settings.padding}px;`;
        if (additionalStyle)
            style += additionalStyle;
        if (Platform.isDesktopApp && !this.data.forceIframe) {
            let frameDoc = parent.doc;
            this.frame = frameDoc.createElement("webview");
            parent.appendChild(this.frame);
            this.frame.setAttribute("allowpopups", "");
            this.frame.addEventListener("dom-ready", () => {
                this.frame.setZoomFactor(this.data.zoomLevel);
                this.frame.insertCSS(this.data.customCss);
            });
            this.frame.addEventListener("destroyed", () => {
                // recreate the webview if it was moved to a new window
                if (frameDoc != parent.doc) {
                    this.frame.detach();
                    this.create(parent, additionalStyle, urlSuffix);
                }
            });
        } else {
            this.frame = parent.doc.createElement("iframe");
            parent.appendChild(this.frame);
            this.frame.setAttribute("sandbox", "allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation");
            this.frame.setAttribute("allow", "encrypted-media; fullscreen; oversized-images; picture-in-picture; sync-xhr; geolocation;");
            style += `transform: scale(${this.data.zoomLevel}); transform-origin: 0 0;`;
        }
        this.frame.addClass("custom-frames-frame");
        this.frame.addClass(`custom-frames-${getId(this.data)}`);
        this.frame.setAttribute("style", style);

        let src = this.data.url;
        if (url){
            src = url;
        }
        if (urlSuffix) {
            if (!urlSuffix.startsWith("/"))
                src += "/";
            src += urlSuffix;
        }
        this.frame.setAttribute("src", src);
    }

    refresh(): void {
        if (this.frame instanceof HTMLIFrameElement) {
            this.frame.contentWindow.location.reload();
        } else {
            this.frame.reload();
        }
    }

    return(): void {
        if (this.frame instanceof HTMLIFrameElement) {
            this.frame.contentWindow.open(this.data.url);
        } else {
            this.frame.loadURL(this.data.url);
        }
    }

    goBack(): void {
        if (this.frame instanceof HTMLIFrameElement) {
            this.frame.contentWindow.history.back();
        } else {
            this.frame.goBack();
        }
    }

    goForward(): void {
        if (this.frame instanceof HTMLIFrameElement) {
            this.frame.contentWindow.history.forward();
        } else {
            this.frame.goForward();
        }
    }

    toggleDevTools(): void {
        if (!(this.frame instanceof HTMLIFrameElement)) {
            if (!this.frame.isDevToolsOpened()) {
                this.frame.openDevTools();
            } else {
                this.frame.closeDevTools();
            }
        }
    }

    getCurrentUrl(): string {
        return this.frame instanceof HTMLIFrameElement ? this.frame.contentWindow.location.href : this.frame.getURL();
    }

    focus(): void {
        if (this.frame instanceof HTMLIFrameElement) {
            this.frame.contentWindow.focus();
        } else {
            this.frame.focus();
        }
    }
}
