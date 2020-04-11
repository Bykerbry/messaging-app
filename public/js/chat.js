const socket = io()

const $msgForm = document.querySelector('#msg-form')
const $sendBtn = document.querySelector('#send-btn')
const $msgInput = document.querySelector('#msg-input')
const $sendLocationBtn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#msg-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (locationURL) => {
    const html = Mustache.render(locationTemplate, {
        locationURL: locationURL.url,
        createdAt: moment(locationURL.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$msgForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $sendBtn.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', $msgInput.value, (error) => {
        $sendBtn.removeAttribute('disabled')
        $msgInput.value = ''
        $msgInput.focus()
        if (error) {
            return console.log(error);
        }
        console.log('Your msg was delivered');
    })
})

$sendLocationBtn.addEventListener('click', () => {
    $sendLocationBtn.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }, () => {
            console.log('Successfully Shared Location!');
            $sendLocationBtn.removeAttribute('disabled')
        })
    })
})






// document.querySelector('#increment').addEventListener('click', () => {
//     console.log("clicked");
//     socket.emit('increment')
// })

// socket.on('countUpdated', (count) => {
//     console.log('Updated the count', count);
// })