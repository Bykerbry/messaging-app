const generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (location) => {
    return {
        url: `https://google.com/maps?q=${location.lat},${location.lng}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}