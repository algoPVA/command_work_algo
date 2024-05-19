// <<<<<<< master
import styles from './Messages.module.css'

import { useRef, useEffect, useState } from 'react';
import Message from './Message';

export default function(props) {
    const messagesRef = useRef(null);


    useEffect(() => {
        if (messagesRef.current && !(messagesRef.current.scrollHeight - messagesRef.current.scrollTop === messagesRef.current.clientHeight)) { // If not scrolled to the bottom
          messagesRef.current.scrollTo({
            top: messagesRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, [props.messages]);
  

  
    function renderMessages() {
        return props.messages ? props.messages.map((message) => {
            return <Message key={message.id} message={message} user={props.user} currentChat={props.currentChat} />
        }) : <p>Нет сообщений</p>
    }
    return (
        <div  ref={messagesRef} className={styles.messages}>

            {renderMessages()}

        </div>
    )
// =======
// import styles from './ChatPage.module.css'

// export default function(props) {

//     function getAuthorName(user_id) {
//         if (user_id) {
//             let member = props.currentChat.members.find((member) => member.id === user_id)
//             if (!member) {
//                 console.log(`Got user id ${user_id} that is not in ${props.currentChat.members}`)
//                 return "Error"
//             }
//             return member.username
//         }
//         return "Error"
//     }
//     function renderMessages() {
//         return props.messages ? props.messages.map((message) => {
//             return (
//                 <div key={message.id} className={styles.message}>
//                     <div className={styles.messageContent}>{message.message}</div>
//                     <div className={styles.messageTime}>{new Date(message.send_time).toLocaleString()}</div>
//                     <div className={styles.messageAuthor}>{ getAuthorName(message.sender_id)}</div>

//                 </div>
//             )
//         }) : <p>Нет сообщений</p>
//     }
//     return (
//         <>
//             {renderMessages()}
//         </>
//     )
// >>>>>>> master
// }