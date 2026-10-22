export default (context, inject) => {
    inject("arrayByArray", (originalArray, orderArray, key) => {
        const sortedArray = originalArray.sort((a, b) => {
            const aIndex = orderArray.findIndex((item) => item[`${key}`] === a[`${key}`]);
            const bIndex = orderArray.findIndex((item) => item[`${key}`] === b[`${key}`]);

            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex; // Compare orderArray indices for both items
            } else if (aIndex !== -1) {
                return -1; // Put a before b if only a is in orderArray
            } else if (bIndex !== -1) {
                return 1; // Put b before a if only b is in orderArray
            } else {
                return 0; // Maintain original order if neither a nor b is in orderArray
            }
        });
        return sortedArray;
    });
    inject("multiFieldSearch", (value, search, item) => {
        return Object.values(item).some((v) => v && v.toString().toLowerCase().includes(search));
    });
};
