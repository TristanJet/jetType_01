function startTimer() {
    return Date.now()
}

function endTimer(start) {
    return (Date.now() - start) / 1000 
}

export { startTimer, endTimer };