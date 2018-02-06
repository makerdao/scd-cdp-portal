import React from 'react';
import ReactModal from 'react-modal';

const VideoModal = (props) => {
  const style = {
    overlay: {
      backgroundColor : 'rgba(0, 0, 0, 0.5)'
    },
    content: {
      border: 1,
      borderStyle: 'solid',
      borderRadius: '4px',
      borderColor: '#d2d6de',
      bottom: 'auto',
      height: 'auto',  // set height
      maxHeight: '95%',
      left: '50%',
      padding: '2rem',
      position: 'fixed',
      right: 'auto',
      top: '50%', // start from center
      transform: 'translate(-50%,-50%)', // adjust top "up" based on height
      width: '90%',
      maxWidth: '1000px',
      overflow: 'hidden'
    }
  };

  return (
    <ReactModal
        isOpen={ (!props.termsModal.announcement && !props.termsModal.terms && props.termsModal.video) || props.modal.show }
        contentLabel="Action Modal"
        style={ style } >
      <a href="#action" className="close" onClick={ props.handleCloseVideoModal }>X</a>
      <div style={{ marginTop: '25px' }}>
        <div className="video-container">
          <iframe src="" frameBorder="0" title="Dai Stablecoin Dashboard from MakerDAO" allowFullScreen></iframe>
        </div>
      </div>
    </ReactModal>
  )
}

export default VideoModal;
