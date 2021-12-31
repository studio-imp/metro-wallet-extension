


//Makes an async call fall asleep for ms time, useful for controlling rate-limits...
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}