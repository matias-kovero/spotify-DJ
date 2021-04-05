import React from 'react';
import Toast from 'react-bootstrap/Toast';

/**
 * Toast - appears on top-right corner, will autohide after {delay} ms.
 * @param {Object} props 
 * @param {Boolean} props.show - Should show the toast to the user.
 * @param {Function} props.onClose - A Callback fired when the close button is clicked.
 * @param {Number} props.delay - Delay hiding the toast (ms).
 * @param {String} props.title - Toast Header text.
 * @param {String} props.text - Toast Body text.
 */
export default function ToastElement({ show, onClose, delay, title, text }) {
  return (
    <div style={{ position: 'absolute', top: '1em', right: '1em', zIndex: '1030'}}>
      <Toast onClose={onClose} show={show} delay={delay} autohide>
        <Toast.Header>
          <strong className="mr-auto">{title}</strong>
        </Toast.Header>
        <Toast.Body>{text}</Toast.Body>
      </Toast>
    </div>
  )
}