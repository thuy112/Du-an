export const isRequired =
    (message = "Vui lòng nhập trường này") =>
    (val) => {
        val = val?.toString() || "";
        val = val.trim();
        return !!val || message;
    };

export const isEmail =
    (message = "Email không hợp lệ") =>
    (val) => {
        if (val === null || val === undefined || val === "") return true; // Tránh lỗi khi field trống
        return /.+@.+\..+/.test(val) || message;
    };

export const isMultiEmail =
    (message = "Email không hợp lệ") =>
    (val) => {
        if (!val) return true; // Hoặc trả về message tùy logic, thường field tùy chọn nên cho qua nếu trống
        const arr = val?.split(";");
        return arr.every((i) => /.+@.+\..+/.test(i.trim())) || message;
    };

export const isPhone =
    (message = "Số điện thoại không hợp lệ") =>
    (val) => {
        if (val === null || val === undefined || val === "") return true; // <--- Thêm dòng này để chặn lỗi null.length
        
        // Regular expression for validating phone numbers (supports various formats)
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
        const strVal = val.toString();

        // Check if the provided value matches the phone regex
        return (phoneRegex.test(val) && strVal.length <= 10) || message;
    };

export const isMaxDigits =
    (max = 12, message = `Không được nhập quá ${max} số`) =>
    (val) => {
        if (val === null || val === undefined || val === "") return true;
        const digitsOnly = val.toString().replace(/\D/g, "");
        return digitsOnly.length <= max || message;
    };

export const isCccd =
    (message = "CCCD phải gồm đúng 12 chữ số") =>
    (val) => {
        if (val === null || val === undefined || val === "") return true;
        return /^\d{12}$/.test(val.toString()) || message;
    };