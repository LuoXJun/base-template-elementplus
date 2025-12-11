/**若浏览器设置了名称，则自动设置名称将会不起作用*/
export const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || '文件';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

/**
 * 直接转blob，可以强制自定义下载名
 * */
export const downloadFileFetch = (url: string, filename: string) => {
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.blob();
        })
        .then((blob) => {
            // 创建Blob URL
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename; // 这里设置下载的文件名

            // 触发下载
            document.body.appendChild(a);
            a.click();

            // 清理
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        })
        .catch((error) => {
            console.error('下载失败:', error);
        });
};
