// 通过泛型控制formData的参数
export const createFormData = <T extends Record<string, string | File | Blob>>(
    data: T
): FormData => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
    });

    return formData;
};
