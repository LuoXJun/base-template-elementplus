import { getImageWidthName } from '@/utils/getAssets';
import * as Cesium from 'cesium';

export const pointMap = new Map<string, Cesium.Entity>();

/**需要传入text，因为要动态计算宽度*/
export const createBillboard = (text: string) => {
    if (!text) return;

    const height = 100;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = text.length * 14;
    canvas.height = height;

    const bgImg = new Image();
    bgImg.src = getImageWidthName('boardBg.png');

    return new Promise<HTMLCanvasElement>((res) => {
        bgImg.onload = () => {
            //绘制文字
            ctx.textAlign = 'center';
            ctx.font = 'PingFang SC';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText(text, canvas.width / 2, height / 2);

            const icon = new Image();
            icon.src = getImageWidthName('qita.png');

            icon.onload = () => {
                // 绘制图片23 32
                const imgWidth = 26;
                const imgheight = 36;
                ctx.drawImage(
                    bgImg,
                    canvas.width / 2 - imgWidth / 2,
                    height - imgheight - 2,
                    imgWidth,
                    imgheight
                );

                // 中心icon
                const iconWidth = 18;
                const iconheight = 18;
                ctx.drawImage(
                    icon,
                    canvas.width / 2 - iconWidth / 2,
                    height - imgheight + 2,
                    iconWidth,
                    iconheight
                );

                res(canvas);
            };

            icon.onerror = () => {
                throw new Error('图片加载失败');
            };
        };

        bgImg.onerror = () => {
            throw new Error('图片加载失败');
        };
    });
};
