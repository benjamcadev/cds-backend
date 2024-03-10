

 const convertBigintToInt = (result) => {
    return JSON.parse(JSON.stringify(result, (key, value) =>
        typeof value === 'bigint'
            ? Number(value)
            : value // return everything else unchanged
    ));
}



module.exports = {convertBigintToInt};