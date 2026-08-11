import { createVNode, render } from 'vue';
import type { ConfirmOptions } from './messageBox.type';
import confirmBox from './confirmBox.vue';

export function messageBox(options: ConfirmOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const vnode = createVNode(confirmBox, {
            ...options,
            modelValue: true,
            onConfirm: () => {
                return resolve();
            },
            onCancel: () => {
                return reject();
            },
            onClosed: () => {
                render(null, container);
                document.body.removeChild(container);
            }
        });

        render(vnode, container);
    });
}
