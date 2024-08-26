export function numberWithCommas(x) {
    return x?.toString()?.replace(/(\d)(?=(\d\d)+\d$)/g, "$1,") + (x[1] ? ("." + x[1]) : "");
}