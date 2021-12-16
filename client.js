import io from 'socket.io-client'
import React, {useEffect, useRef, useState} from "react";
import ReactDOM from 'react-dom'
import s from './style.css';

const socket = io("http://localhost:3000", {
    transports: ["websocket", "polling"]
});

const username = prompt('Введите свое имя');

const App = () => {
    const [users, setUsers] = useState([]);
    const [textingUser, setTextingUser] = useState([]);
    const [message, setMessage] = useState([]);
    const [allMessages, setAllMessaged] = useState('');
    const [myUser, setMyUser] = useState({})

    useEffect(() => {
        socket.on('connect', () => {
            socket.emit('username', username)
        })

        socket.on('users', users => {
            setUsers(users)
            setMyUser(users.filter(user => user.name === username)[0])
        })

        socket.on('connected', user => setUsers(users => [...users, user]))

        socket.on('message', message => setAllMessaged(allMessages => [...allMessages, message]))

        socket.on('disconnected', id => setUsers(users => users.filter(user => user.id !== id)))

        socket.on('getAllMessages', messages => setAllMessaged(messages))

        socket.on('getTypingUsers', users => setTextingUser(users))

    }, [])

    const sendMessage = (e) => {
        e.preventDefault()
        if (message) {
            socket.emit('send', message)
            setMessage('')
        }
    }

    const userIsTyping = (bool) => {
        socket.emit('typing', {user: myUser, typing: bool})
    }

    const lastMessageEl = useRef(null)
    useEffect(() => {
        lastMessageEl.current && lastMessageEl.current.scrollIntoView()
    }, [allMessages])
    return (
        <div className={'wrapper'}>
            <div className="container">
                {users.length &&
                <div className={'header'}>
                    Сейчас онлайн:
                    {users.map(user => <p key={user.id}
                                          className={myUser.id === user.id ? 'yourUser' : undefined}>{user.name}</p>)}
                </div>}
                <div className={'content'}>
                    <div className={'inner'}>
                        {allMessages && allMessages.map((message, i) => {
                            return (
                                <div key={message.date}
                                     className={(message.user.name === myUser.name) ? 'myMessage' : undefined}
                                     ref={(i === allMessages.length - 1 ? lastMessageEl : null)}>
                                    <div className={'message'}>
                                        <span className="messageName">
                                            {message.user.name}
                                        </span>
                                        <span className="messageText">{message.text}</span>
                                        <span
                                            className="messageDate">{new Date(message.date).toLocaleTimeString().substr(0, 5)}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <form className={'form'} onSubmit={sendMessage}>
                        <div className={'typing'}>
                            {textingUser.length ?
                                <div> {textingUser.map((item, i) =>
                                    <span key={item.id}>{item?.name + (i === textingUser.length ? ', ' : ' ')}</span>)}
                                    печатает...
                                </div>
                                :
                                <span/>
                            }
                        </div>
                        <div className={'inputWrapper'}>
                            <input type="text" onChange={e => setMessage(e.target.value)}
                                   value={message}
                                   onKeyUp={() => userIsTyping(true)}
                                   onBlur={() => userIsTyping(false)}
                            />
                            <button type='submit'/>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    )
}

ReactDOM.render(<App/>, document.getElementById('root'))
