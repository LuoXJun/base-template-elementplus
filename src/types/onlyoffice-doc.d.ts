type insertImageCType = 'add' | 'change' | 'fill' | 'watermark' | 'slide';
interface insertImageType {
    c: insertImageCType; //'add';
    images: { fileType: string; url: string }[];
}

interface IconnectorDoc {
    executeMethod: (key: string, value: any[]) => void;
    callCommand: (fun: () => void) => void;
}

//  word - 文本文档 (.doc, .docm, .docx, .dot, .dotm, .dotx, .epub, .fb2, .fodt, .htm, .html, .mht, .mhtml, .odt, .ott, .pages, .rtf, .stw, .sxw, .txt, .wps, .wpt, .xml);
// cell - 电子表格 (.csv, .et, .ett, .fods, .numbers, .ods, .ots, .sxc, .xls, .xlsb, .xlsm, .xlsx, .xlt, .xltm, .xltx, .xml);
// slide - 演示文稿 (.dps, .dpt, .fodp, .key, .odp, .otp, .pot, .potm, .potx, .pps, .ppsm, .ppsx, .ppt, .pptm, .pptx, .sxi);
// pdf - 可移植文档格式 (.djvu, .docxf, .oform, .oxps, .pdf, .xps).
// diagram - 图表文档（.vsdm, .vsdx, .vssm, .vssx, .vstm, .vstx).
type documentType = 'word' | 'cell' | 'slide' | 'pdf' | 'diagram';
type useType = 'desktop' | 'web' | 'mobbile';

interface IOnlyOfficeConfig {
    document: {
        /**类型为以上更详细的级别  eg:doc,csv等，注意不是.doc而是doc*/
        fileType: string;
        isForm: boolean;
        info: {
            favorite: boolean;
            folder: string;
            owner: string;
            sharingSettings: {
                permissions: string;
                user: string;
                isLink: boolean;
            }[];

            uploaded: string;
        };
        key: string;
        permissions: {
            chat: boolean;
            comment: boolean;
            commentGroups: {
                edit: string[];
                remove: string[];
                view: string;
            }[];
            copy: boolean;
            deleteCommentAuthorOnly: boolean;
            download: boolean;
            edit: boolean;
            editCommentAuthorOnly: boolean;
            fillForms: boolean;
            modifyContentControl: boolean;
            modifyFilter: boolean;
            print: boolean;
            protect: boolean;
            review: boolean;
            reviewGroups: string[];
            userInfoGroups: string[];
        };
        referenceData: {
            fileKey: string;
            instanceId: string;
        };
        title: string;
        url: string;
    };
    documentType: documentType;
    editorConfig: {
        actionLink: ACTION_DATA;
        callbackUrl: string;
        coEditing: {
            mode: 'fast';
            change: boolean;
        };
        createUrl: string;
        customization: {
            about: boolean;
            anonymous: {
                request: boolean;
                label: string;
            };
            autosave: boolean;
            close: {
                visible: boolean;
                text: string;
            };
            comments: boolean;
            compactHeader: boolean;
            compactToolbar: boolean;
            compatibleFeatures: boolean;
            customer: {
                address: string;
                info: string;
                logo: string;
                logoDark: string;
                mail: string;
                name: string;
                phone: string;
                www: string;
            };
            features: {
                featuresTips: boolean;
                roles: boolean;
                spellcheck: {
                    mode: boolean;
                    change: boolean;
                };
                tabBackground: {
                    mode: 'header';
                    change: boolean;
                };
                tabStyle: {
                    mode: 'fill';
                    change: boolean;
                };
            };
            feedback: {
                url: string;
                visible: boolean;
            };
            font: {
                name: string;
                size: string;
            };
            forcesave: boolean;
            forceWesternFontSize: boolean;
            goback: {
                blank: boolean;
                text: string;
                url: string;
            };
            help: boolean;
            hideNotes: boolean;
            hideRightMenu: boolean;
            hideRulers: boolean;
            integrationMode: 'embed';
            layout: {
                header: {
                    editMode: boolean;
                    save: boolean;
                    user: boolean;
                    users: boolean;
                };
                leftMenu: {
                    mode: boolean;
                    navigation: boolean;
                    spellcheck: boolean;
                };
                rightMenu: {
                    mode: boolean;
                };
                statusBar: {
                    actionStatus: boolean;
                    docLang: boolean;
                    textLang: boolean;
                };
                toolbar: {
                    collaboration: {
                        mailmerge: boolean;
                    };
                    draw: boolean;
                    file: {
                        close: boolean;
                        info: boolean;
                        save: boolean;
                        settings: boolean;
                    };
                    home: {};
                    layout: boolean;
                    plugins: boolean;
                    protect: boolean;
                    references: boolean;
                    save: boolean;
                    view: {
                        navigation: boolean;
                    };
                };
            };
            loaderLogo: string;
            loaderName: string;
            logo: {
                image: string;
                imageDark: string;
                imageLight: string;
                url: string;
                visible: boolean;
            };
            macros: boolean;
            macrosMode: 'warn';
            mentionShare: boolean;
            mobile: {
                forceView: boolean;
                info: boolean;
                standardView: boolean;
            };
            plugins: boolean;
            pointerMode: 'select';
            review: {
                hideReviewDisplay: boolean;
                showReviewChanges: boolean;
                reviewDisplay: 'original';
                trackChanges: boolean;
                hoverMode: boolean;
            };
            showHorizontalScroll: boolean;
            showVerticalScroll: boolean;
            slidePlayerBackground: string;
            submitForm: {
                visible: boolean;
                resultMessage: 'text';
            };
            toolbarHideFileName: boolean;
            uiTheme: 'theme-dark';
            unit: 'cm';
            wordHeadingsColor: string;
            zoom: 100;
        };
        embedded: {
            embedUrl: string;
            fullscreenUrl: string;
            saveUrl: string;
            shareUrl: string;
            toolbarDocked: 'top';
        };
        lang: 'en' | 'zh-CN';
        mode: 'edit';
        plugins: {
            autostart: string[];
            options: Record<string, any>;
            pluginsData: string[];
        };
        recent: {
            folder: string;
            title: string;
            url: string;
        }[];
        region: 'en-US';
        templates: {
            image: string;
            title: string;
            url: string;
        }[];
        user: {
            group: string;
            id: string;
            image: string;
            name: string;
        };
    };
    events: {
        onAppReady: () => void;
        onCollaborativeChanges: () => void;
        onDocumentReady: () => void;
        onDocumentStateChange: (e) => void;
        onDownloadAs: (e) => void;
        onError: () => void;
        onInfo: () => void;
        onMetaChange: () => void;
        onOutdatedVersion: (e) => void;
        onPluginsReady: () => void;
        onRequestClose: () => void;
        onRequestCreateNew: () => void;
        onRequestEditRights: () => void;
        onRequestHistory: () => void;
        onRequestHistoryClose: () => void;
        onRequestHistoryData: () => void;
        onRequestInsertImage: () => void;
        onRequestMailMergeRecipients: () => void;
        onRequestOpen: () => void;
        onRequestReferenceData: () => void;
        onRequestReferenceSource: () => void;
        onRequestRefreshFile: () => void;
        onRequestRename: () => void;
        onRequestRestore: () => void;
        onRequestSaveAs: () => void;
        onRequestSelectDocument: () => void;
        onRequestSelectSpreadsheet: () => void;
        onRequestSendNotify: () => void;
        onRequestSharingSettings: () => void;
        onRequestStartFilling: () => void;
        onRequestUsers: () => void;
        onSubmit: () => void;
        onUserActionRequired: () => void;
        onWarning: () => void;
    };
    height: string;
    token: string;
    type: useType;
    width: string;
}

type DeepPartial<T> = T extends Function
    ? T
    : T extends Map<infer K, infer V>
      ? Map<DeepPartial<K>, DeepPartial<V>>
      : T extends Set<infer U>
        ? Set<DeepPartial<U>>
        : T extends ReadonlyMap<infer K, infer V>
          ? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>
          : T extends ReadonlySet<infer U>
            ? ReadonlySet<DeepPartial<U>>
            : T extends Promise<infer U>
              ? Promise<DeepPartial<U>>
              : T extends Array<infer U>
                ? Array<DeepPartial<U>>
                : T extends object
                  ? { [P in keyof T]?: DeepPartial<T[P]> }
                  : T;
type TpartialIOnlyOfficeConfig = DeepPartial<IOnlyOfficeConfig>;

class DocEditor {
    constructor(el: string, config: TpartialIOnlyOfficeConfig) {}
    // 插入图片
    insertImage: (arg: insertImageType) => void;
    // 获取连接器
    createConnector: () => IconnectorDoc;
    attachMouseEvents: () => any;
    blurFocus: (arg: any) => any;
    createEmbedWorker: () => any;
    denyEditingRights: () => any;
    detachMouseEvents: () => any;
    downloadAs: () => any;
    grabFocus: () => any;
    openDocument: () => any;
    processMailMerge: () => any;
    processRightsChange: () => any;
    processSaveResult: () => any;
    refreshHistory: () => any;
    requestClose: () => any;
    requestRoles: () => any;
    serviceCommand: () => any;
    setActionLink: () => any;
    setEmailAddresses: () => any;
    setFavorite: () => any;
    setHistoryData: () => any;
    setMailMergeRecipients: () => any;
    setReferenceSource: () => any;
    setRequestedDocument: () => any;
    setRequestedSpreadsheet: () => any;
    setRevisedFile: () => any;
    setSharingSettings: () => any;
    setUsers: () => any;
    showSharingSettings: () => any;
    startFilling: () => any;
    refreshFile: (arg: TpartialIOnlyOfficeConfig) => void;
    destroyEditor: () => void;
    on: (type: 'onDocumentSave', callback: (data: any) => void) => void;
}
