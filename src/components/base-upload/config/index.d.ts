import type { UploadUserFile } from 'element-plus';

type TlistType = 'text' | 'picture' | 'picture-card';

declare global {
    interface UploadFile extends UploadUserFile {
        options?: {
            id?: string;
            [key: string]: any;
        };
    }
}
