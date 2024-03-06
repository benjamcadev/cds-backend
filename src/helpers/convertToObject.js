

//  const toObject = (result) => {
//     return JSON.parse(JSON.stringify(result, (key, value) =>
//         typeof value === 'bigint'
//             ? Number(value)
//             : value // return everything else unchanged
//     ));
// }

const toObject = (result) => {
    return result, (key, value) =>
        typeof value === 'bigint'
            ? Number(value)
            : value // return everything else unchanged
    ;
}

module.exports = {toObject};