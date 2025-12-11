// 统一社会信用代码 - 支持18位和15位社会信用代码
export const creditREG = /^([0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}|[1-9]\d{14})$/;

//8-12个字符，需同时包含数字，字母和符号
export const passwordREG =
    /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,12}$/;

// 身份证
export const idcardREG =
    /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;

// 手机号
export const phoneREG =
    /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;

// 邮箱
export const emailREG = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

// 大小写字母，数字，特殊字符,8到20位之间
export const passwardReg =
    /^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*)(?=.*[`~!@#$%^&*()_\-+=<>.?:"{}].*).{8,20}$/;

// 根据身份证获取年龄
export function analyzeIDCard(IDCard: string) {
    const age = 0;
    let yearBirth: number, monthBirth: number, dayBirth: number;
    //获取用户身份证号码
    const userCard = IDCard;
    //如果身份证号码为undefind则返回空
    if (!userCard) {
        return age;
    }
    const reg = idcardREG; //验证身份证号码的正则
    if (reg.test(userCard)) {
        if (userCard.length == 15) {
            const org_birthday = userCard.substring(6, 12);
            //获取出生年月日
            yearBirth = parseInt('19' + org_birthday.substring(0, 2));
            monthBirth = parseInt(org_birthday.substring(2, 4));
            dayBirth = parseInt(org_birthday.substring(4, 6));
        } else {
            //获取出生年月日
            yearBirth = parseInt(userCard.substring(6, 10));
            monthBirth = parseInt(userCard.substring(10, 12));
            dayBirth = parseInt(userCard.substring(12, 14));
        }
        //获取当前年月日并计算年龄
        const myDate = new Date();
        const monthNow = myDate.getMonth() + 1;
        const dayNow = myDate.getDate();
        let age = myDate.getFullYear() - yearBirth;
        if (monthNow < monthBirth || (monthNow == monthBirth && dayNow < dayBirth)) {
            age--;
        }
        //返回年龄
        return age;
    } else {
        return 0;
    }
}
